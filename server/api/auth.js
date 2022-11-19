import express from "express";
import { HttpError } from "../utils.js";
import User from "../models/user.js";
import { OAuth2Client } from "google-auth-library";
// import jwt from "jsonwebtoken";

import * as dotenv from "dotenv";

dotenv.config();
const { GOOGLE_OAUTH_CLIENT_ID } = process.env;

const authRouter = express.Router();

authRouter.post("/", async (req, res) => {
  const token = (req.get("Authorization") || "Bearer ").split("Bearer ")[1];
  const { strategy } = req.body;

  if (!token) {
    new HttpError("Missing authorization token.", 400);
  }

  // const data = jwt.verify(token, GOOGLE_OAUTH_CLIENT_SECRET, {});
  // console.log("data: ", data);

  if (strategy === "google") {
    const client = new OAuth2Client(GOOGLE_OAUTH_CLIENT_ID);

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: GOOGLE_OAUTH_CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
      // Or, if multiple clients access the backend:
      //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const { sub, email, given_name, family_name, picture } =
      ticket.getPayload();

    const result = await User.findOrCreate({
      where: {
        strategyId: sub,
      },
      defaults: {
        strategyId: sub,
        email,
        givenName: given_name,
        familyName: family_name,
        photoUrl: picture,
      },
    });
  }

  res.send(JSON.stringify({ message: "Login successful!" }));
});

export default authRouter;
