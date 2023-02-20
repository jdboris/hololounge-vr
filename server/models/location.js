import { DataTypes } from "sequelize";
import sequelize from "../utils/db.js";

const NAME_MIN_LENGTH = 1;
const NAME_MAX_LENGTH = 100;
const Location = sequelize.define("locations", {
  id: {
    // NOTE: Must match location ID from Springboard
    type: DataTypes.UUID,
    primaryKey: true,
  },
  idInSquare: {
    type: DataTypes.STRING(255),
    unique: "unique_location_id_in_square",
    allowNull: false,
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

export default Location;
