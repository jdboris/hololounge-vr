import { addMinutes, subMinutes } from "date-fns";
import express from "express";
import { Op } from "sequelize";
import Booking from "../models/booking.js";
import BookingStation from "../models/booking-station.js";
import sequelize from "../utils/db.js";
import { HttpError } from "../utils/errors.js";
import {
  checkIn,
  login,
  startBookingStationTime,
} from "../utils/springboard.js";

import * as dotenv from "dotenv";
import BookingDto from "../dtos/booking.js";
import { getCurrentUser } from "../utils/auth.js";
import BookingStationDto from "../dtos/booking-station.js";

dotenv.config();
const BOOKING_MARGIN = Number(process.env.BOOKING_MARGIN);

const bookingRouter = express.Router();

// Get all upcoming bookings
bookingRouter.get("/upcoming", async (req, res) => {
  const bookings = await Booking.findAll({
    where: {
      isCanceled: false,
      [Op.or]: [
        // Either already complete or "pending" (recent)
        {
          isComplete: true,

          // // start      now
          // //   v         v
          // //   [-------------------]

          // // duration: 60
          // // now - start: 30
          // // 60 > 30?

          // // Where duration...
          // "$bookingStations.experiencePrice.duration$": {
          //   // ...is greater than (now - start).
          //   [Op.gt]: fn(
          //     "TIMESTAMPDIFF",
          //     literal("MINUTE"),
          //     col("bookings.startTime"),
          //     new Date()
          //   ),
          // },

          // Where it ends in the future...
          "$bookingStations.endTime$": {
            [Op.gte]: new Date(),
          },
        },
        { createdAt: { [Op.gt]: subMinutes(new Date(), BOOKING_MARGIN) } },
      ],
    },
    include: [
      {
        association: "bookingStations",
        include: [
          "location",
          { association: "experiencePrice", include: ["experience"] },
        ],
      },
    ],
    attributes: {
      exclude: ["createdAt", "updatedAt", "deletedAt", "locationId"],
    },
    order: [["startTime", "ASC"]],
  });

  res.json(bookings);
});

bookingRouter.put("/booking-stations/:bookingStationId", async (req, res) => {
  const user = await getCurrentUser(req);
  if (!user) {
    throw new HttpError("", 401);
  }
  if (!user.isAdmin) {
    throw new HttpError("", 403);
  }

  const { bookingStationId } = req.params;

  try {
    // Instantiate a DTO for parsing/validation
    req.body = new BookingStationDto(req.body);
  } catch (error) {
    throw new HttpError(error.message, 400, error.details);
  }

  await BookingStation.update(req.body, { where: { id: bookingStationId } });

  res.json({ message: "Booking updated successfully!" });
});

// Check if there's a soon upcoming booking under the provided name
bookingRouter.post("/check-in", async (req, res) => {
  const { firstName, lastName, phone } = req.body;

  if ((!firstName || !lastName) && !phone) {
    throw new HttpError("Enter your full name or phone number.", 400);
  }

  // Bookings that still have time left
  const bookings = await Booking.findAll({
    include: [
      "stations",
      {
        association: "bookingStations",
        include: [
          "location",
          { association: "experiencePrice", include: ["experience"] },
        ],
      },
    ],
    where: {
      isComplete: true,
      [Op.or]: {
        [Op.and]: {
          firstName,
          lastName,
        },
        phone,
      },

      // // Where duration...
      // "$bookingStations.experiencePrice.duration$": {
      //   // ...is greater than (now - start).
      //   [Op.gte]: fn(
      //     "TIMESTAMPDIFF",
      //     literal("MINUTE"),
      //     col("startTime"),
      //     new Date()
      //   ),
      // },

      // Where it ends in the future...
      "$bookingStations.endTime$": {
        [Op.gte]: new Date(),
      },
    },

    order: [["startTime", "ASC"]],
  });

  if (!bookings || !bookings.length) {
    throw new HttpError("No upcoming reservations found under that name.", 404);
  }

  const soonBookings = bookings.filter(
    (b) => b.startTime < addMinutes(new Date(), BOOKING_MARGIN)
  );

  if (!soonBookings.length) {
    throw new HttpError(
      `You may not check in more than ${BOOKING_MARGIN} minutes before your reservation. (Your next reservation is at {startTime})`,
      400,
      { bookings }
    );
  }

  res.json({
    message: `Check-in complete! You are now checked in at these stations. Your experience(s) will start automatically.`,
    bookings: soonBookings,
  });
});

bookingRouter.post("/start", async (req, res) => {
  const { bookings } = req.body;

  const token = await login();

  for await (const { id } of bookings) {
    const booking = await Booking.findOne({
      include: [
        "stations",
        {
          association: "bookingStations",
          include: [
            "location",
            { association: "experiencePrice", include: ["experience"] },
          ],
        },
      ],
      where: {
        id,
      },

      order: [["startTime", "ASC"]],
    });

    if (!booking) {
      throw new HttpError(`Booking with ID "${id}" not found.`, 404);
    }

    if (Date.parse(booking.startTime) > new Date()) {
      throw new HttpError(
        `It is not time to start booking with ID "${id}" yet.`,
        400
      );
    }

    const { bookingStationTimes } = await checkIn(
      booking.idInSpringboard,
      token
    );

    for await (const bookingStationTime of bookingStationTimes) {
      await startBookingStationTime(bookingStationTime, token);
    }
  }

  // NOTE: Update all data at once to avoid partial check-in completion
  const transaction = await sequelize.transaction();

  try {
    await Promise.all(
      bookings.map(({ id }) =>
        Booking.update({ isCheckedIn: true }, { where: { id } })
      )
    );

    await transaction.commit();
  } catch (error) {
    console.error(error);
    await transaction.rollback();
  }

  res.json({ success: true });
});

export default bookingRouter;
