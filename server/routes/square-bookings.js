import { addMinutes, formatISO } from "date-fns";
import * as dotenv from "dotenv";
import express from "express";
import BookingDto from "../dtos/booking.js";
import Booking from "../models/booking.js";
import Location from "../models/location.js";
import Station from "../models/station.js";
import { HttpError } from "../utils/errors.js";
import { createHmac } from "crypto";

dotenv.config();
const { SQUARE_WEBHOOK_SIGNATURE_KEY, WIDGET_ID, PAYMENT_GATEWAY_ID } =
  process.env;

const squareBookingRouter = express.Router();

// NOTE Square requires using the raw body text to validate the request
squareBookingRouter.post("/", async (req, res) => {
  req.body = req.body.toString();
  const bodyText = req.body;
  req.body = JSON.parse(req.body);

  const hmac = createHmac("sha1", SQUARE_WEBHOOK_SIGNATURE_KEY);
  const requestUrl = `https://${req.get("host")}${req.originalUrl}`;
  hmac.update(requestUrl + bodyText);
  const hash = hmac.digest("base64");

  // if (hash !== req.headers["x-square-signature"]) {
  //   // We have an invalid webhook event.
  //   // Logging and stopping processing.
  //   console.error(
  //     `Mismatched request signature in Square webhook request, ${hash} !== ${req.headers["x-square-signature"]}`
  //   );
  //   throw new Error(`Mismatched request signature in Square webhook request`);
  // }

  const {
    type,
    data: {
      object: {
        payment: { status, order_id: orderId },
      },
    },
  } = req.body;

  if (type != "payment.updated" || status != "COMPLETED") {
    res.json({ success: true });
    return;
  }

  // NOTE: Catch ANY ERROR
  try {
    // console.log(JSON.stringify({ ...req.body }));
    console.log("PAYMENT COMPLETE!");

    res.json({ success: true });
    const booking = await Booking.findOne({
      plain: true,
      where: { squareOrderId: orderId },
      include: [
        "location",
        {
          association: "bookingStations",
          include: [
            { association: "experiencePrice", include: ["experience"] },
          ],
        },
      ],
    });

    if (!booking) {
      throw Error("Booking record not found.");
    }

    /**
     * @type BookingDto
     */
    const {
      location,
      bookingStations,
      startTime,
      birthday,
      firstName,
      lastName,
      email,
      phone,
    } = booking;

    const body = JSON.stringify({
      widgetId: WIDGET_ID,
      booking: {
        title: "HoloLounge VR Reservation",
        agree: true,
        // e.g. "2023-02-08T01:00:00+09:00"
        startTime: formatISO(startTime),
        // e.g. "1989-12-31T15:00:00Z"
        birthday: birthday.toISOString(),
        location: { id: location.id },
        bookingStationTimes: bookingStations.map(
          ({ stationId, experiencePrice }) => ({
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
            endTime: addMinutes(new Date(startTime), experiencePrice.duration),
          })
        ),
        guests: [
          {
            firstName,
            lastName,
            email,
            phone,
          },
        ],
        numberOfPlayers: 1,
      },
      payment: { gateway: PAYMENT_GATEWAY_ID },
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

    booking.isComplete = true;
    booking.idInSpringboard = data.id;
    await booking.save();
  } catch (error) {
    console.error(error);
    // TODO: REFUND/CANCEL THE PAYMENT
  }
});

export default squareBookingRouter;
