import { DataTypes } from "sequelize";
import sequelize from "../utils/db.js";

const ExperiencePrice = sequelize.define("experience_prices", {
  id: {
    // NOTE: Must match experience ID from Springboard
    type: DataTypes.UUID,
    primaryKey: true,
  },

  /**
   * @type {string} Referred to in Square as "`catalog_object_id`". This will be the ID of a "`Variation`" of an `Item` in Square. This field is unique here, meaning `ExperiencePrice`'s should coincide with `Variation`'s.
   */
  idInSquare: {
    // NOTE: Must match experience ID from Springboard
    type: DataTypes.STRING(255),
    unique: "unique_experience_price_id_in_square",
    allowNull: false,
  },

  /**
   * @type {number} In minutes,
   */
  duration: {
    type: DataTypes.INTEGER,
    allowNull: false,

    validate: {
      notNull: {
        msg: `Duration is a required field.`,
      },
      notEmpty: {
        msg: `Duration is a required field.`,
      },
    },
  },

  price: {
    type: DataTypes.DECIMAL,
    allowNull: false,

    validate: {
      notNull: {
        msg: `Price is a required field.`,
      },
      notEmpty: {
        msg: `Price is a required field.`,
      },
    },
  },
});

export default ExperiencePrice;
