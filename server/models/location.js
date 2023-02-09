import sequelize from "../utils/db.js";
import { DataTypes } from "sequelize";
import Booking from "./booking.js";

const NAME_MIN_LENGTH = 1;
const NAME_MAX_LENGTH = 100;

const Location = sequelize.define("locations", {
  // PREREQUISITE: Must run Location.removeAttribute("id") first, in a separate sync
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

// Location.removeAttribute("id");

export default Location;
