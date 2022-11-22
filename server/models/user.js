import sequelize from "../db/db.js";
import { DataTypes } from "sequelize";
import * as dotenv from "dotenv";

dotenv.config();
const { NODE_ENV } = process.env;

const User = sequelize.define("users", {
  strategyId: {
    type: DataTypes.STRING,
    unique: "strategyId",
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: "email",
  },
  passwordHash: {
    type: DataTypes.STRING,
  },
  givenName: {
    type: DataTypes.STRING,
  },
  familyName: {
    type: DataTypes.STRING,
  },
  photoUrl: {
    type: DataTypes.STRING,
  },
});

try {
  if (NODE_ENV === "development") {
    await User.sync({ alter: true });
  } else {
    await User.sync();
  }
} catch (error) {
  console.error("Unable to create 'users' table :", error);
}

export default User;
