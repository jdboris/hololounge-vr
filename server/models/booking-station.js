import { DataTypes } from "sequelize";
import sequelize from "../utils/db.js";
import ExperiencePrice from "./experience-price.js";
import Location from "./location.js";

const BookingStation = sequelize.define("booking_stations", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },

  idInSpringboard: {
    type: DataTypes.INTEGER,
    unique: "unique_booking_station_id_in_springboard",
  },

  experiencePriceId: {
    type: DataTypes.UUID,
    unique: "unique_booking_station_experience_price_id_in_springboard",
  },

  startTime: {
    type: DataTypes.DATE,
    allowNull: false,

    validate: {
      notNull: {
        msg: `End time is a required field.`,
      },
      notEmpty: {
        msg: `End time is a required field.`,
      },
    },
  },

  endTime: {
    type: DataTypes.DATE,
    allowNull: false,

    validate: {
      notNull: {
        msg: `End time is a required field.`,
      },
      notEmpty: {
        msg: `End time is a required field.`,
      },
    },
  },
});

BookingStation.belongsTo(ExperiencePrice, {
  as: "experiencePrice",
});

BookingStation.belongsTo(Location, {
  as: "location",
});

export default BookingStation;
