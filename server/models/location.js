import sequelize from "../utils/db.js";
import { DataTypes, Sequelize } from "sequelize";
import Booking from "./booking.js";

const NAME_MIN_LENGTH = 1;
const NAME_MAX_LENGTH = 100;

const Location = sequelize.define("locations", {
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

// NOTE: Required to work around bug that causes sequelize to ignore `id` definition in Model
await sequelize.getQueryInterface().changeColumn("locations", "id", {
  type: DataTypes.UUID,
});

export default Location;
