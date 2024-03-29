import express from "express";
import { HttpError } from "../utils/errors.js";
import User from "../models/user.js";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

import * as dotenv from "dotenv";
import { getCurrentUser } from "../utils/auth.js";

dotenv.config();
const { NODE_ENV, JWT_SECRET, GOOGLE_OAUTH_CLIENT_ID, ADMIN_EMAIL } =
  process.env;

const authRouter = express.Router();

authRouter.post("/", async (req, res) => {
  const token = (req.get("Authorization") || "Bearer ").split("Bearer ")[1];
  const { strategy } = req.body;

  if (!token) {
    throw new HttpError("Missing authorization token.", 400);
  }

  if (strategy === "google") {
    const client = new OAuth2Client(GOOGLE_OAUTH_CLIENT_ID);

    const ticket = await client.verifyIdToken({
      idToken: token,
      // The CLIENT_ID of the app that accesses the backend
      audience: GOOGLE_OAUTH_CLIENT_ID,
      // Or, if multiple clients access the backend:
      //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const { sub, email, given_name, family_name, picture } =
      ticket.getPayload();

    const [user, wasJustCreated] = await User.findOrCreate({
      where: {
        email,
      },
      defaults: {
        strategyId: sub,
        strategy: "google",
        email,
        givenName: given_name,
        familyName: family_name,
        photoUrl: picture,
      },
    });

    // Success

    if (ADMIN_EMAIL && user.get().email === ADMIN_EMAIL) {
      user.isAdmin = true;
      await user.save();
    }

    res.cookie(
      "authToken",
      jwt.sign(
        { id: user.id, strategy: { name: "google", token: token } },
        JWT_SECRET,
        { algorithm: "RS256" }
      ),
      {
        httpOnly: true,
        secure: NODE_ENV !== "development",
        sameSite: true,
        signed: true,
      }
    );

    res.json({ message: "Login successful!" });
    return;
  }

  throw new HttpError(400, "Authentication failed. Try again later.");
});

authRouter.post("/signup", async (req, res) => {
  const { email, password } = req.body;
  const details = {};

  if (password.length < 8) {
    details.password = "Invalid password (8+ characters required).";
  }

  if (!email.match(/.+@.+/)) {
    details.email = "Please enter a valid email address.";
  }

  if (await User.findOne({ where: { email } })) {
    details.email = "Email is already in use.";
  }

  if (Object.keys(details).length) {
    throw new HttpError("", 400, details);
  }

  const user = (
    await User.create({
      email,
      passwordHash: await bcrypt.hash(password, 10),
    })
  ).get();

  res.cookie(
    "authToken",
    jwt.sign({ id: user.id }, JWT_SECRET, {
      expiresIn: "30 days",
      algorithm: "RS256",
    }),
    {
      httpOnly: true,
      secure: NODE_ENV !== "development",
      sameSite: true,
      signed: true,
    }
  );

  res.json({
    message: "Signup successful!",
  });
});

authRouter.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const details = {};

  if (!email) {
    details.email = "Please enter an email address.";
  }

  if (!password) {
    details.password = "Please enter a password.";
  }

  if (Object.keys(details).length) {
    throw new HttpError("", 400, details);
  }

  // NOTE: Must use raw: true to read the password hash
  const user = await User.findOne({ where: { email }, plain: true, raw: true });

  if (!user) {
    details.email = "No account found with that email.";
  }

  if (Object.keys(details).length) {
    throw new HttpError("", 400, details);
  }

  if (user.strategy === "google") {
    throw new HttpError(
      "That email has already been used to sign in with Google. Sign in with Google to continue.",
      400,
      details
    );
  }

  if (!(await bcrypt.compare(password, user.passwordHash))) {
    throw new HttpError("Invalid email/password", 400);
  }

  res.cookie(
    "authToken",
    jwt.sign({ id: user.id }, JWT_SECRET, {
      expiresIn: "30 days",
      algorithm: "RS256",
    }),
    {
      httpOnly: true,
      secure: NODE_ENV !== "development",
      sameSite: "strict",
      signed: true,
    }
  );

  res.json({
    message: "Login successful!",
  });
});

authRouter.get("/current-user", async (req, res) => {
  res.json({ user: await getCurrentUser(req) });
});

authRouter.get("/logout", async (req, res) => {
  res.clearCookie("authToken");
  res.json({});
});

export default authRouter;
