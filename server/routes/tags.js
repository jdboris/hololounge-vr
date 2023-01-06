import express from "express";
import { HttpError } from "../utils.js";

import { getCurrentUser } from "../api/auth.js";
import Tag from "../models/tag.js";

const tagRouter = express.Router();

tagRouter.get("/", async (req, res) => {
  res.json({ tags: await Tag.findAll({ order: [["name", "ASC"]] }) });
});

tagRouter.post("/", async (req, res) => {
  const user = await getCurrentUser(req);
  if (!user.isAdmin) {
    throw new HttpError("", 403);
  }

  const tag = (await Tag.create(req.body)).get();

  res.json({ message: `Tag "${tag.name}" created.`, tag });
});

export default tagRouter;
