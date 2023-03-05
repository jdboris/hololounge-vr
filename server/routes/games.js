import express from "express";
import { HttpError } from "../utils/errors.js";

import { getCurrentUser } from "../utils/auth.js";
import Game from "../models/game.js";
import { Op } from "sequelize";

const gameRouter = express.Router();

gameRouter.get("/", async (req, res) => {
  res.json({
    games: await Game.findAll({
      order: [["title", "ASC"]],
      include: "tags",
    }),
  });
});

gameRouter.get("/featured", async (req, res) => {
  res.json({
    games: await Game.findAll({
      where: {
        sortOrder: {
          [Op.ne]: null,
        },
      },
      order: [
        ["sortOrder", "ASC"],
        ["title", "ASC"],
      ],
      include: "tags",
    }),
  });
});

gameRouter.post("/", async (req, res) => {
  const user = await getCurrentUser(req);
  if (!user) {
    throw new HttpError("", 401);
  }
  if (!user.isAdmin) {
    throw new HttpError("", 403);
  }

  const game = await Game.create(req.body);
  await game.setTags(
    req.body.tags.map((tag) => tag.id),
    { through: "tags" }
  );

  res.json({ message: `Game "${game.title}" created.`, game: game.get() });
});

gameRouter.put("/", async (req, res) => {
  const user = await getCurrentUser(req);
  if (!user) {
    throw new HttpError("", 401);
  }
  if (!user.isAdmin) {
    throw new HttpError("", 403);
  }

  await Game.update(req.body, {
    where: { id: req.body.id },
  });

  const game = await Game.findByPk(req.body.id);
  await game.setTags(
    req.body.tags.map((tag) => tag.id),
    { through: "tags" }
  );

  res.json({ message: `Game "${game.title}" updated.`, game: game.get() });
});

export default gameRouter;
