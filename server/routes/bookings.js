import { formatISO } from "date-fns";
import * as dotenv from "dotenv";
import express from "express";
import BookingDto from "../dtos/booking.js";
import Booking from "../models/booking.js";
import Location from "../models/location.js";
import Station from "../models/stations.js";
import { HttpError } from "../utils/errors.js";

dotenv.config();
const { WIDGET_ID, EXPERIENCE_ID, TIER_ID, LOCATION_ID, PAYMENT_GATEWAY_ID } =
  process.env;

const bookingRouter = express.Router();

bookingRouter.post("/", async (req, res) => {
  try {
    // Instantiate a DTO for parsing/validation
    req.body = new BookingDto(req.body);
  } catch (error) {
    throw new HttpError(error.message, 400, error.details);
  }

  /**
   * @type BookingDto
   */
  const {
    startTime,
    duration,
    stations,
    birthday,
    firstName,
    lastName,
    email,
    phone,
  } = req.body;

  const endTime = new Date(startTime);
  endTime.setMinutes(endTime.getMinutes() + duration);

  const body = JSON.stringify({
    widgetId: WIDGET_ID,
    booking: {
      title: "HoloLounge VR Reservation",
      agree: true,
      // e.g. "2023-02-08T01:00:00+09:00"
      startTime: formatISO(startTime),
      // e.g. "1989-12-31T15:00:00Z"
      birthday: birthday.toISOString(),
      location: { id: LOCATION_ID },
      bookingStationTimes: stations.map((station) => ({
        experience: { id: EXPERIENCE_ID },
        station: { id: station.id },
        tier: { id: TIER_ID },
        // NOTE: Must multiply amounts by 100 because of Springboard bug
        amountDue: 0,
        amountPaid: 0,
        discount: null,
        coupon: null,
        startedAt: null,
        endTime,
      })),
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

  // Create the location, to sync with Springboard
  const location = await Location.findOrCreate({
    where: { id: data.locationId },
    defaults: { id: data.locationId, name: data.location.title },
  });

  const booking = await Booking.create({
    id: data.id,
    startTime: data.startTime,
    duration: duration,
    birthday: data.host.birthday,
    lastName: data.host.last_name,
    firstName: data.host.first_name,
    email: data.host.email,
    phone: data.host.phone,
    locationId: data.locationId,
  });

  await booking.setStations(
    stations.map((station) => station.id),
    { through: "stations" }
  );

  res.json({
    message: "Booking complete! You'll receive a confirmation email shortly.",
  });
});

export default bookingRouter;
