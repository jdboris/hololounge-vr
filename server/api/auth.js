import jwt from "jsonwebtoken";
import User from "../models/user.js";

import * as dotenv from "dotenv";

dotenv.config();
const { JWT_SECRET } = process.env;

export async function getCurrentUser(req) {
  const { authToken } = req.signedCookies;

  if (!authToken) {
    return null;
  }

  return {
    ...(await User.findByPk(jwt.verify(authToken, JWT_SECRET).id, {
      raw: true,
    })),
  };
}
