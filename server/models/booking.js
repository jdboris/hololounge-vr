import sequelize from "../utils/db.js";
import { DataTypes, Sequelize } from "sequelize";
import Location from "./location.js";

const NAME_MAX_LENGTH = 50;
const PHONE_MAX_LENGTH = 25;

const Booking = sequelize.define("bookings", {
  id: {
    // NOTE: Must match booking ID from Springboard
    type: DataTypes.UUID,
    primaryKey: true,
  },

  startTime: {
    type: DataTypes.DATE,
    allowNull: false,

    validate: {
      notNull: {
        msg: `Start date is a required field.`,
      },
      notEmpty: {
        msg: `Start date is a required field.`,
      },
    },
  },

  birthday: {
    type: DataTypes.DATE,
    allowNull: false,

    validate: {
      notNull: {
        msg: `Date of Birth is a required field.`,
      },
      notEmpty: {
        msg: `Date of Birth date is a required field.`,
      },
    },
  },

  lastName: {
    type: DataTypes.STRING(NAME_MAX_LENGTH),
    allowNull: false,

    validate: {
      len: {
        args: [1, NAME_MAX_LENGTH],
        msg: `Must be ${1}-${NAME_MAX_LENGTH} characters.`,
      },
      notNull: {
        msg: `Last Name is a required field.`,
      },
      notEmpty: {
        msg: `Last Name is a required field.`,
      },
    },
  },

  firstName: {
    type: DataTypes.STRING(NAME_MAX_LENGTH),
    allowNull: false,

    validate: {
      len: {
        args: [1, NAME_MAX_LENGTH],
        msg: `Must be ${1}-${NAME_MAX_LENGTH} characters.`,
      },
      notNull: {
        msg: `First Name is a required field.`,
      },
      notEmpty: {
        msg: `First Name is a required field.`,
      },
    },
  },

  email: {
    type: DataTypes.STRING(254),
    allowNull: false,

    validate: {
      notNull: {
        msg: `Email is a required field.`,
      },
      notEmpty: {
        msg: `Email is a required field.`,
      },
      isEmail: {
        msg: `Email must be a valid email address.`,
      },
    },
  },

  phone: {
    type: DataTypes.STRING(PHONE_MAX_LENGTH),
    allowNull: false,

    validate: {
      len: {
        args: [1, PHONE_MAX_LENGTH],
        msg: `Must be ${1}-${PHONE_MAX_LENGTH} characters.`,
      },
      notNull: {
        msg: `Phone number is a required field.`,
      },
      notEmpty: {
        msg: `Phone number is a required field.`,
      },
    },
  },
});

// NOTE: Required to work around bug that causes sequelize to ignore `id` definition in Model
await sequelize.getQueryInterface().changeColumn("bookings", "id", {
  type: DataTypes.UUID,
});

Booking.belongsTo(Location, { as: "location" });

export default Booking;
