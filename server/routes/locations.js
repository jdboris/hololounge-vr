import { setMinutes, subMinutes } from "date-fns";
import express from "express";
import { Op } from "sequelize";
import Booking from "../models/booking.js";

const locationRouter = express.Router();

locationRouter.get("/:locationId/bookings", async (req, res) => {
  const { locationId } = req.params;

  const locations = await Booking.findAll({
    where: {
      locationId,
      [Op.or]: [
        { isComplete: true },
        { createdAt: { [Op.gt]: subMinutes(new Date(), 5) } },
      ],
    },
    include: [
      "location",
      {
        association: "bookingStations",
        include: [{ association: "experiencePrice", include: ["experience"] }],
      },
    ],
    attributes: {
      exclude: ["createdAt", "updatedAt", "deletedAt", "locationId"],
    },
    order: [["startTime", "ASC"]],
  });

  res.json(locations);
});

export default locationRouter;
