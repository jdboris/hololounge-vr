import express from "express";
import Booking from "../models/booking.js";

const locationRouter = express.Router();

locationRouter.get("/:locationId/bookings", async (req, res) => {
  const { locationId } = req.params;

  res.json(
    await Booking.findAll({
      where: { locationId },
      include: ["stations"],
      attributes: { exclude: ["createdAt", "updatedAt", "deletedAt"] },
      order: [["startTime", "ASC"]],
    })
  );
});

export default locationRouter;
