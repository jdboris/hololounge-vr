import express from "express";
import { HttpError } from "../utils.js";

import * as dotenv from "dotenv";
import { getCurrentUser } from "../api/auth.js";
import Tag from "../models/tag.js";
import { ValidationError } from "sequelize";

dotenv.config();
const { NODE_ENV } = process.env;

const tagRouter = express.Router();

tagRouter.post("/", async (req, res) => {
  const user = await getCurrentUser(req);
  if (!user.isAdmin) {
    throw new HttpError("", 403);
  }

  const tag = (await Tag.create(req.body)).get();

  res.json({ message: `Tag "${tag.name}" created.`, tag });
});

export default tagRouter;
