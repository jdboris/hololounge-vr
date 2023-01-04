import sequelize from "../db/db.js";
import { DataTypes } from "sequelize";
import * as dotenv from "dotenv";

dotenv.config();
const { NODE_ENV } = process.env;

const MIN_NAME_LENGTH = 3;
const MAX_NAME_LENGTH = 50;

const Tag = sequelize.define("tags", {
  name: {
    type: DataTypes.STRING(MAX_NAME_LENGTH),
    allowNull: false,
    unique: { name: "unique_tag_name", msg: "Tag already exists." },

    validate: {
      len: {
        args: [MIN_NAME_LENGTH, MAX_NAME_LENGTH],
        msg: `Tag must be ${MIN_NAME_LENGTH}-${MAX_NAME_LENGTH} characters.`,
      },
      notNull: {
        msg: `Tag must be ${MIN_NAME_LENGTH}-${MAX_NAME_LENGTH} characters.`,
      },
      isLowercase: {
        msg: `Tag must be all lowercase.`,
      },
      is: {
        args: /^[a-z-/]+$/,
        msg: "Tag may only contain letters and '-', or '/'.",
      },
    },
  },
});

try {
  if (NODE_ENV === "development") {
    await Tag.sync({ alter: true });
  } else {
    await Tag.sync();
  }
} catch (error) {
  console.error("Unable to create 'tags' table :", error);
}

export default Tag;
