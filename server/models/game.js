import sequelize from "../db/db.js";
import { DataTypes } from "sequelize";
import * as dotenv from "dotenv";
import Tag from "./tag.js";

dotenv.config();
const { NODE_ENV } = process.env;

const Game = sequelize.define("games", {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  posterUrl: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  trailerUrl: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  summary: {
    type: DataTypes.STRING(1024),
    allowNull: false,
  },
});

Game.hasMany(Tag, { as: "tags" });

try {
  if (NODE_ENV === "development") {
    await Game.sync({ alter: true });
  } else {
    await Game.sync();
  }
} catch (error) {
  console.error("Unable to create 'games' table :", error);
}

export default Game;
