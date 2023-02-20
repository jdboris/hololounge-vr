import { DataTypes } from "sequelize";
import sequelize from "../utils/db.js";
import ExperiencePrice from "./experience-price.js";

const NAME_MIN_LENGTH = 1;
const NAME_MAX_LENGTH = 25;

const Experience = sequelize.define("experiences", {
  id: {
    // NOTE: Must match experience ID from Springboard
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

ExperiencePrice.belongsTo(Experience, { as: "experience" });

export default Experience;
