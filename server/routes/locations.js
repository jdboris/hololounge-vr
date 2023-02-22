import { subMinutes } from "date-fns";
import express from "express";
import { Op } from "sequelize";
import Booking from "../models/booking.js";
import Location from "../models/location.js";

const locationRouter = express.Router();

locationRouter.get("/", async (req, res) => {
  const locations = await Location.findAll({
    include: [
      "stations",
      { association: "experiences", include: ["experiencePrices"] },
    ],
    attributes: {
      exclude: ["createdAt", "updatedAt", "deletedAt"],
    },
    order: [["name", "ASC"]],
  });

  res.json(locations);
});

export default locationRouter;
