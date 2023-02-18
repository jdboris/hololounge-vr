import { DataTypes } from "sequelize";
import sequelize from "../utils/db.js";
import Booking from "./booking.js";

const NAME_MIN_LENGTH = 1;
const NAME_MAX_LENGTH = 10;

const Station = sequelize.define("stations", {
  id: {
    // NOTE: Must match location ID from Springboard
    type: DataTypes.UUID,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(NAME_MAX_LENGTH),
    allowNull: false,

    validate: {
      len: {
        args: [NAME_MIN_LENGTH, NAME_MAX_LENGTH],
        msg: `Must be ${NAME_MIN_LENGTH}-${NAME_MAX_LENGTH} characters.`,
      },
      notNull: {
        msg: `Name is a required field.`,
      },
      notEmpty: {
        msg: `Name is a required field.`,
      },
    },
  },
});

Station.belongsToMany(Booking, {
  as: "bookings",
  through: "booking_stations",
});
Booking.belongsToMany(Station, {
  as: "stations",
  through: "booking_stations",
});

export default Station;
