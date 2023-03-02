import cookieParser from "cookie-parser";
import * as dotenv from "dotenv";
import express from "express";
import path from "path";
import nocache from "nocache";
import { ValidationError } from "sequelize";
import checkoutRouter from "./routes/checkout.js";
import authRouter from "./routes/auth.js";
import squareBookingRouter from "./routes/square-bookings.js";
import gameRouter from "./routes/games.js";
import locationRouter from "./routes/locations.js";
import tagRouter from "./routes/tags.js";
import db from "./utils/db.js";
import { HttpError } from "./utils/errors.js";

import { dirname } from "path";
import { fileURLToPath } from "url";
import bookingRouter from "./routes/bookings.js";

import "./models/booking-station.js";
import "./models/booking.js";
import "./models/experience-price.js";
import "./models/experience.js";
import "./models/game.js";
import "./models/location.js";
import "./models/station.js";
import "./models/tag.js";
import "./models/user.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config();
const { CLIENT_APP_PATH, NODE_ENV, PORT, ALTER_DB } = process.env;

const app = express();

try {
  // for await (const [key, model] of Object.entries(db.models)) {
  //   await db.query(`SET FOREIGN_KEY_CHECKS = 0;`);
  //   await db.query(
  //     `ALTER TABLE ${key} CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
  //   );
  //   await db.query(`SET FOREIGN_KEY_CHECKS = 1;`);
  // }

  if (ALTER_DB == "True") {
    // NOTE: Workaround for duplicating foreign keys bug in sequelize
    // https://github.com/sequelize/sequelize/pull/14570
    const results = (
      await db.query(`
        SELECT concat('alter table \`',table_schema,'\`.\`',table_name,'\` DROP FOREIGN KEY ',constraint_name,';') AS query
        FROM information_schema.table_constraints
        WHERE constraint_type='FOREIGN KEY';
      `)
    )[0];

    for await (const { query } of results) {
      await db.query(query);
    }
  }

  // NOTE: Must sync after importing all the models (i.e. through routes)
  await db.sync({ alter: ALTER_DB == "True" });
} catch (error) {
  console.error("Unable to sync squelize:", error);
}

if (!CLIENT_APP_PATH) {
  console.error(
    `Error: Expected CLIENT_APP_PATH environment variable to be path to client app, received: ${CLIENT_APP_PATH}.`
  );
  process.exit(1);
}

app.use(cookieParser(process.env.COOKIE_SECRET));
// API Routes
// NOTE: Must use this route BEFORE express.json() middleware
app.use("/api/square", express.raw({ type: "*/*" }), squareBookingRouter);
app.use(express.json());
app.use("/api/auth", authRouter);
app.use("/api/tags", tagRouter);
app.use("/api/checkout", checkoutRouter);
app.use("/api/games", gameRouter);
app.use("/api/locations", locationRouter);
app.use("/api/bookings", bookingRouter);

app.use(nocache());

if (NODE_ENV !== "development") {
  // Serve the static files from the React app
  app.use(
    express.static(path.resolve(__dirname, CLIENT_APP_PATH), {
      lastModified: false,
      etag: false,
    })
  );
}

app.get(/.*/, (req, res) => {
  if (NODE_ENV === "development") {
    res.sendFile(`${path.resolve(__dirname)}/env-error.html`, {
      lastModified: false,
      etag: false,
    });
    return;
  }

  res.sendFile(`${path.resolve(__dirname, CLIENT_APP_PATH)}/index.html`, {
    // NOTE: Disable theses headers to allow App Engine's own caching to work correctly
    // Source: https://stackoverflow.com/a/64848707
    lastModified: false,
    etag: false,
  });
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
