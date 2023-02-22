import { subMinutes } from "date-fns";
import express from "express";
import { Op } from "sequelize";
import Booking from "../models/booking.js";

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

bookingRouter.post("/:bookingId/checkin", async (req, res) => {
  const { bookingId } = req.params;
  const token = await login();

  const booking = await checkIn(bookingId, token);

  for await (const bookingStationTime of booking.bookingStationTimes) {
    console.log(await startBookingStationTime(bookingStationTime, token));
  }

  res.json({ success: true });
});

export default bookingRouter;
