import { addMinutes, subMinutes } from "date-fns";
import express from "express";
import { col, fn, literal, Op } from "sequelize";
import Booking from "../models/booking.js";
import { HttpError } from "../utils/errors.js";
import { list } from "../utils/localization.js";
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
      [Op.or]: [
        // Either already complete or "pending" (recent)
        { isComplete: true },
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
  const { firstName, lastName } = req.body;

  if (!firstName || !lastName) {
    throw new HttpError("Please enter a first and last name.", 400);
  }

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
      firstName,
      lastName,
      // If there will still be time left in the reservation
      "$bookingStations.experiencePrice.duration$": {
        [Op.gte]: fn(
          // Time since start
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
      `You may not check in more than 5 minutes before your reservation. (Your next reservation is at ${bookings[0].startTime.toLocaleString(
        "ja-JP",
        {
          dateStyle: "medium",
          timeStyle: "short",
          hourCycle: "h23",
        }
      )})`,
      400
    );
  }

  // NOTE: Assuming all the bookings start at the same time, because
  //       soonBookings only includes bookings that start in the next 5 minutes.
  res.json({
    message: `Check-in complete! Your experience(s) at ${list([
      ...new Set(
        soonBookings.map(({ stations }) => stations.map((s) => s.name)).flat()
      ),
    ])} ${
      soonBookings[0].startTime < new Date() ? "started" : "will start"
    } at ${soonBookings[0].startTime.toLocaleString("ja-JP", {
      dateStyle: "medium",
      timeStyle: "short",
      hourCycle: "h23",
    })}`,
    bookings,
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

    booking.isCheckedIn = true;
    await booking.save();

    const { bookingStationTimes } = await checkIn(
      booking.idInSpringboard,
      token
    );

    for await (const bookingStationTime of bookingStationTimes) {
      await startBookingStationTime(bookingStationTime, token);
    }
  }

  res.json({ success: true });
});

export default bookingRouter;
