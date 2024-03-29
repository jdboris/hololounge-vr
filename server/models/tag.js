import { DataTypes } from "sequelize";
import sequelize from "../utils/db.js";

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
        msg: `Tag is a required field.`,
      },
      notEmpty: {
        msg: `Tag is a required field.`,
      },
      // isLowercase: {
      //   msg: `Tag must be all lowercase.`,
      // },
      // is: {
      //   args: /^[a-z-/]+$/,
      //   msg: "Tag may only contain letters and '-', or '/'.",
      // },
    },
  },
});

export default Tag;
