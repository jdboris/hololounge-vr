import sequelize from "../utils/db.js";
import { DataTypes } from "sequelize";

const User = sequelize.define("users", {
  strategyId: {
    type: DataTypes.STRING,
    unique: "strategyId",
  },
  strategy: {
    type: DataTypes.STRING,
    values: ["google"],
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: "email",
  },
  passwordHash: {
    type: DataTypes.STRING,
    get() {
      // NOTE: Prevent ever reading the password hash by accident.
      return undefined;
    },
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
  isAdmin: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
});

export default User;
