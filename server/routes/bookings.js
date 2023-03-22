import { addMinutes, subMinutes } from "date-fns";
import express from "express";
import { col, fn, literal, Op } from "sequelize";
import Booking from "../models/booking.js";
import sequelize from "../utils/db.js";
import { HttpError } from "../utils/errors.js";
import {
  checkIn,
  login,
  startBookingStationTime,
} from "../utils/springboard.js";

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

          // // Where duration...
          "$bookingStations.experiencePrice.duration$": {
            // ...is less than the time between this booking start and the current time.
            [Op.gt]: fn(
              "TIMESTAMPDIFF",
              literal("MINUTE"),
              col("startTime"),
              new Date()
            ),
          },
        },
        { createdAt: { [Op.gt]: subMinutes(new Date(), 5) } },
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
      // Where duration...
      "$bookingStations.experiencePrice.duration$": {
        // ...is greater than the time since startTime.
        [Op.gte]: fn(
          "TIMESTAMPDIFF",
          literal("MINUTE"),
          col("startTime"),
          new Date()
        ),
      },
    },

    order: [["startTime", "ASC"]],
  });

  if (!bookings || !bookings.length) {
    throw new HttpError("No upcoming reservations found under that name.", 404);
  }

  const soonBookings = bookings.filter(
    (b) => b.startTime < addMinutes(new Date(), 5)
  );

  if (!soonBookings.length) {
    throw new HttpError(
      `You may not check in more than 5 minutes before your reservation. (Your next reservation is at {startTime})`,
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
