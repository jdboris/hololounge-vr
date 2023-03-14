import { createHmac } from "crypto";
import { addMinutes, formatISO } from "date-fns";
import * as dotenv from "dotenv";
import express from "express";
import BookingDto from "../dtos/booking.js";
import BookingStation from "../models/booking-station.js";
import Booking from "../models/booking.js";
import { HttpError } from "../utils/errors.js";
import sequelize from "../utils/db.js";

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
        const body = JSON.stringify({
          widgetId: location.widgetId,
          booking: {
            title: "HoloLounge VR Reservation",
            agree: true,
            // e.g. "2023-02-08T01:00:00+09:00"
            startTime: formatISO(startTime),
            // e.g. "1989-12-31T15:00:00Z"
            birthday: birthday.toISOString(),
            location: { id: location.id },
            bookingStationTimes: [
              {
                experience: { id: experiencePrice.experience.id },
                station: { id: stationId },
                tier: { id: experiencePrice.id },
                // NOTE: Set amounts to 0 so emails to customer don't say there's an outstanding balance
                // NOTE: If you DO provide amounts, you must multiply amounts by 100 because of Springboard bug
                amountDue: 0,
                amountPaid: 0,
                discount: null,
                coupon: null,
                startedAt: null,
                endTime: addMinutes(
                  new Date(startTime),
                  experiencePrice.duration
                ),
              },
            ],
            guests: [
              {
                firstName,
                lastName,
                // NOTE: Give Springboard the admin email to bypass their booking confirmation emails
                ADMIN_EMAIL,
                phone,
              },
            ],
            numberOfPlayers: 1,
          },
          payment: { gateway: location.paymentGatewayId },
        });

        const response = await fetch(
          `https://api.springboardvr.com/v1/public/booking`,
          {
            method: "POST",
            headers: {
              authority: "api.springboardvr.com",
              method: "POST",
              path: "/v1/public/booking",
              scheme: "https",
              accept: "application/json",
              "accept-encoding": "gzip, deflate, br",
              "accept-language": "en-US,en;q=0.9,ja;q=0.8",
              "content-length": body.length,
              "content-type": "application/json",
              dnt: "1",
              origin: "https://customer.springboardvr.com",
              referer: "https://customer.springboardvr.com/",
              "sec-ch-ua":
                '"Not_A Brand";v="99", "Google Chrome";v="109", "Chromium";v="109"',
              "sec-ch-ua-mobile": "?0",
              "sec-ch-ua-platform": '"Windows"',
              "sec-fetch-dest": "empty",
              "sec-fetch-mode": "cors",
              "sec-fetch-site": "same-site",
              "user-agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36",
            },
            body,
          }
        );

        if (!response.ok) {
          const { error, code } = await response.json();
          throw new HttpError(error, code);
        }

        const data = await response.json();

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
              (bst) =>
                bst.stationId == stationId &&
                Date.parse(bst.startTime) == startTime.getTime()
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
