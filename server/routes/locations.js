import express from "express";
import Booking from "../models/booking.js";
import Location from "../models/location.js";

const locationRouter = express.Router();

locationRouter.get("/:locationId/bookings", async (req, res) => {
  const { locationId } = req.params;

  res.json(await Booking.findAll({ where: { locationId } }));
});

export default locationRouter;
