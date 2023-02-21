import { DataTypes } from "sequelize";
import sequelize from "../utils/db.js";
import Tag from "./tag.js";

const MIN_TITLE_LENGTH = 1;
const MAX_TITLE_LENGTH = 255;

const MIN_URL_LENGTH = 1;
const MAX_URL_LENGTH = 1024;

const MIN_PLAYER_MIN = 1;
const MIN_PLAYER_MAX = 1;

const MIN_SUMMARY_LENGTH = 50;
const MAX_SUMMARY_LENGTH = 1024;

const Game = sequelize.define("games", {
  title: {
    type: DataTypes.STRING(MAX_TITLE_LENGTH),
    allowNull: false,

    validate: {
      len: {
        args: [MIN_TITLE_LENGTH, MAX_TITLE_LENGTH],
        msg: `Must be ${MIN_TITLE_LENGTH}-${MAX_TITLE_LENGTH} characters.`,
      },
      notNull: {
        msg: `Title is a required field.`,
      },
      notEmpty: {
        msg: `Title is a required field.`,
      },
    },
  },
  posterUrl: {
    type: DataTypes.STRING(MAX_URL_LENGTH),
    allowNull: false,

    validate: {
      len: {
        args: [MIN_URL_LENGTH, MAX_URL_LENGTH],
        msg: `Must be ${MIN_URL_LENGTH}-${MAX_URL_LENGTH} characters.`,
      },
      notNull: {
        msg: `Poster URL is a required field.`,
      },
      notEmpty: {
        msg: `Poster URL is a required field.`,
      },
      isUrl: {
        msg: "Must be a valid URL.",
      },
    },
  },
  trailerUrl: {
    type: DataTypes.STRING,
    allowNull: false,

    validate: {
      len: {
        args: [MIN_URL_LENGTH, MAX_URL_LENGTH],
        msg: `Must be ${MIN_URL_LENGTH}-${MAX_URL_LENGTH} characters.`,
      },
      notNull: {
        msg: `Trailer URL is a required field.`,
      },
      notEmpty: {
        msg: `Trailer URL is a required field.`,
      },
      isUrl: {
        msg: "Must be a valid URL.",
      },
    },
  },
  summary: {
    type: DataTypes.STRING(1024),
    allowNull: false,

    validate: {
      len: {
        args: [MIN_SUMMARY_LENGTH, MAX_SUMMARY_LENGTH],
        msg: `Must be ${MIN_SUMMARY_LENGTH}-${MAX_SUMMARY_LENGTH} characters.`,
      },
      notNull: {
        msg: `Summary is a required field.`,
      },
      notEmpty: {
        msg: `Summary is a required field.`,
      },
    },
  },
  playerMinimum: {
    type: DataTypes.INTEGER,
    allowNull: false,

    validate: {
      min: {
        args: [MIN_PLAYER_MIN],
        msg: `Must be at least ${MIN_PLAYER_MIN}.`,
      },
      notNull: {
        msg: `Player Minimum is a required field.`,
      },
      notEmpty: {
        msg: `Player Minimum is a required field.`,
      },
    },
  },
  playerMaximum: {
    type: DataTypes.INTEGER,
    allowNull: false,

    validate: {
      min: {
        args: [MIN_PLAYER_MAX],
        msg: `Must be at least ${MIN_PLAYER_MAX}.`,
      },
      notNull: {
        msg: `Player Maximum is a required field.`,
      },
      notEmpty: {
        msg: `Player Maximum is a required field.`,
      },
    },
  },
  hasLocalMultiplayer: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  hasOnlineMultiplayer: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
});

Tag.belongsToMany(Game, {
  as: "games",
  through: "game_tags",
});
Game.belongsToMany(Tag, {
  as: "tags",
  through: "game_tags",
});

export default Game;
