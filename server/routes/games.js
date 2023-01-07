import express from "express";
import { HttpError } from "../utils.js";

import { getCurrentUser } from "../api/auth.js";
import Game from "../models/game.js";

const gameRouter = express.Router();

gameRouter.get("/", async (req, res) => {
  res.json({
    games: await Game.findAll({ order: [["title", "ASC"]], include: "tags" }),
  });
});

gameRouter.post("/", async (req, res) => {
  const user = await getCurrentUser(req);
  if (!user.isAdmin) {
    throw new HttpError("", 403);
  }

  const game = (await Game.create(req.body)).get();

  res.json({ message: `Game "${game.title}" created.`, game });
});

export default gameRouter;
