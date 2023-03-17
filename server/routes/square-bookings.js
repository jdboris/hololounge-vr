import { createHmac } from "crypto";
import { addMinutes, formatISO } from "date-fns";
import * as dotenv from "dotenv";
import express from "express";
import BookingDto from "../dtos/booking.js";
import BookingStation from "../models/booking-station.js";
import Booking from "../models/booking.js";
import { HttpError } from "../utils/errors.js";
import sequelize from "../utils/db.js";
import { createBooking, login } from "../utils/springboard.js";

dotenv.config();

const { NODE_ENV, ADMIN_EMAIL } = process.env;

const SQUARE_TERMINAL_WEBHOOK_SIGNATURE_KEY =
  NODE_ENV == "production"
    ? process.env.SQUARE_TERMINAL_WEBHOOK_SIGNATURE_KEY
    : process.env.SANDBOX_SQUARE_TERMINAL_WEBHOOK_SIGNATURE_KEY;

const SQUARE_PAYMENT_WEBHOOK_SIGNATURE_KEY =
  NODE_ENV == "production"
    ? process.env.SQUARE_PAYMENT_WEBHOOK_SIGNATURE_KEY
    : process.env.SANDBOX_SQUARE_PAYMENT_WEBHOOK_SIGNATURE_KEY;

const squareBookingRouter = express.Router();

// NOTE Square requires using the raw body text to validate the request
squareBookingRouter.post("/payment-updated", async (req, res) => {
  await handleRequest(req, res, "payment.updated");
});

// NOTE Square requires using the raw body text to validate the request
squareBookingRouter.post("/terminal-checkout-updated", async (req, res) => {
  await handleRequest(req, res, "terminal.checkout.updated");
});

async function handleRequest(req, res, type) {
  req.body = req.body.toString();
  const bodyText = req.body;
  req.body = JSON.parse(req.body);

  const hmac = createHmac(
    "sha1",
    type == "terminal.checkout.updated"
      ? SQUARE_TERMINAL_WEBHOOK_SIGNATURE_KEY
      : SQUARE_PAYMENT_WEBHOOK_SIGNATURE_KEY
  );
  const requestUrl = `https://${req.get("host")}${req.originalUrl}`;
  hmac.update(requestUrl + bodyText);
  const hash = hmac.digest("base64");

  if (
    process.env.NODE_ENV == "production" &&
    hash !== req.headers["x-square-signature"]
  ) {
    // We have an invalid webhook event.
    // Logging and stopping processing.
    console.error(
      `Mismatched request signature in Square webhook request, ${hash} !== ${req.headers["x-square-signature"]}`
    );
    throw new Error(`Mismatched request signature in Square webhook request`);
  }

  const {
    data: {
      object: { payment, checkout },
    },
  } = req.body;

  if (type != "payment.updated" && type != "terminal.checkout.updated") {
    res.json({ success: true });
    return;
  }

  const orderId =
    (type == "payment.updated" && payment.order_id) ||
    (type == "terminal.checkout.updated" && checkout.id);

  if (!orderId) {
    throw new Error("Webhook request type valid, but no provided ID.");
  }

  if ((payment || checkout).status == "CANCELED") {
    res.json({ success: true });
    Booking.update(
      {
        isCanceled: true,
      },
      {
        where: {
          squareOrderId: orderId,
        },
      }
    );
    return;
  }

  if ((payment || checkout).status != "COMPLETED") {
    res.json({ success: true });
    return;
  }

  // NOTE: Catch ANY ERROR then REFUND/CANCEL
  try {
    res.json({ success: true });
    const bookings = await Booking.findAll({
      // plain: true,
      where: { squareOrderId: orderId },
      include: [
        {
          association: "bookingStations",
          include: [
            "location",
            { association: "experiencePrice", include: ["experience"] },
          ],
        },
      ],
    });

    if (!bookings.length) {
      // throw Error(
      //   `No Booking records found for provided order ID "${orderId}".`
      // );
      return;
    }

    /**
     * @type {{bookings: { id: string, idInSpringboard: string, isComplete: boolean }[], bookingStations: {bookingStationId: number, idInSpringboard: string}[]}}
     */
    const updateData = {};

    const token = await login();

    for await (const booking of bookings) {
      if (booking.isComplete) {
        continue;
      }

      /**
       * @type BookingDto
       */
      const {
        bookingStations,
        startTime,
        birthday,
        firstName,
        lastName,
        email,
        phone,
      } = booking;

      for await (const {
        location,
        stationId,
        experiencePrice,
        id: bookingStationId,
      } of bookingStations) {
        const data = await createBooking(booking, token);

        // NOTE: Store the data to update all at once later...
        updateData.bookings = [
          ...(updateData.bookings || []),
          { id: booking.id, idInSpringboard: data.id, isComplete: true },
        ];

        updateData.bookingStations = [
          ...(updateData.bookingStations || []),
          {
            bookingStationId,
            idInSpringboard: data.bookingStationTimes.find(
              (bst) => bst.station.id == stationId
            ).id,
          },
        ];
      }
    }

    // NOTE: Update all data at once to avoid partial booking completion
    const transaction = await sequelize.transaction();

    try {
      await Promise.all([
        ...updateData.bookings.map(({ id, idInSpringboard, isComplete }) =>
          Booking.update({ idInSpringboard, isComplete }, { where: { id } })
        ),

        ...updateData.bookingStations.map(
          ({ idInSpringboard, bookingStationId }) =>
            BookingStation.update(
              {
                idInSpringboard,
              },
              { where: { id: bookingStationId } }
            )
        ),
      ]);

      await transaction.commit();
    } catch (error) {
      console.error(error);
      await transaction.rollback();
    }
  } catch (error) {
    console.error(error);
    // TODO: REFUND/CANCEL THE PAYMENT
  }
}

export default squareBookingRouter;
