import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import * as dotenv from "dotenv";
import express from "express";
import path from "path";
import { ValidationError } from "sequelize";
import authRouter from "./routes/auth.js";
import bookingRouter from "./routes/bookings.js";
import gameRouter from "./routes/games.js";
import locationRouter from "./routes/locations.js";
import tagRouter from "./routes/tags.js";
import db from "./utils/db.js";
import { HttpError } from "./utils/errors.js";

import { dirname } from "path";
import { fileURLToPath } from "url";
import Booking from "./models/booking.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();

app.use(bodyParser.json());
app.use(cookieParser(process.env.COOKIE_SECRET));

dotenv.config();
const { CLIENT_APP_PATH, NODE_ENV, PORT, ALTER_DB } = process.env;

try {
  // NOTE: Must sync AFTER importing all the models
  if (NODE_ENV === "development") {
    await db.sync({ alter: true });
  } else {
    await db.sync({ alter: ALTER_DB == "True" });
  }
} catch (error) {
  console.error("Unable to sync squelize:", error);
}

if (!CLIENT_APP_PATH) {
  console.error(
    `Error: Expected CLIENT_APP_PATH environment variable to be path to client app, received: ${CLIENT_APP_PATH}.`
  );
  process.exit(1);
}

// API Routes
app.use("/api/auth", authRouter);
app.use("/api/tags", tagRouter);
app.use("/api/games", gameRouter);
app.use("/api/bookings", bookingRouter);
app.use("/api/locations", locationRouter);

if (NODE_ENV !== "development") {
  // Serve the static files from the React app
  app.use(express.static(path.resolve(__dirname, CLIENT_APP_PATH)));
}

app.get(/.*/, (req, res) => {
  if (NODE_ENV === "development") {
    res.sendFile(`${path.resolve(__dirname)}/env-error.html`);
    return;
  }

  res.sendFile(`${path.resolve(__dirname, CLIENT_APP_PATH)}/index.html`);
});

// Error handler
app.use((err, req, res, next) => {
  if (err instanceof ValidationError) {
    res.status(400).json({
      error: {
        details: err.errors.reduce(
          (details, error) => ({
            ...details,
            [error.path]: error.message,
          }),
          {}
        ),
      },
    });
    return;
  }

  if (!(err instanceof HttpError)) {
    console.error(err);
    res.status(500).json(
      // Generic error message.
      {
        error: {
          ...err,
          message: "Something went wrong. Try again later.",
        },
      }
    );
    return;
  }

  res.status(err.status).json(
    // Manually copy the message property to include it in the JSON string
    { error: { ...err, message: err.message } }
  );
});

const port = PORT || 5000;
app.listen(port, () => {
  console.log("Listening on port " + port);
});

if (NODE_ENV !== "development") {
  console.log(`Serving client app from '${CLIENT_APP_PATH}'`);
} else {
  console.log("NOTE: Run client app separately...");
}
