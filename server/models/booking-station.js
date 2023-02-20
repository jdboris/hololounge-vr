import { DataTypes } from "sequelize";
import sequelize from "../utils/db.js";
import Booking from "./booking.js";
import ExperiencePrice from "./experience-price.js";
import Experience from "./experience.js";

const BookingStation = sequelize.define("booking_stations", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
});

BookingStation.belongsTo(ExperiencePrice, {
  as: "experiencePrice",
});

export default BookingStation;
