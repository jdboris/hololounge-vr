import express from "express";
import path from "path";
import * as dotenv from "dotenv";
import authRouter from "./api/auth.js";
import { HttpError } from "./utils.js";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";

const app = express();

app.use(bodyParser.json());
app.use(cookieParser(process.env.COOKIE_SECRET));

dotenv.config();
const { CLIENT_APP_PATH, NODE_ENV, PORT } = process.env;

if (!CLIENT_APP_PATH) {
  console.error(
    `Error: Expected CLIENT_APP_PATH environment variable to be path to client app, received: ${CLIENT_APP_PATH}.`
  );
  process.exit(1);
}

if (NODE_ENV !== "development") {
  // Serve the static files from the React app
  app.use(express.static(CLIENT_APP_PATH));
}

// API Routes
app.use("/api/auth", authRouter);

// Default to React app
app.get("*", (req, res) => {
  if (NODE_ENV === "development") {
    res.sendFile(`${path.resolve(process.cwd())}/env-error.html`);
    return;
  }

  res.sendFile(`${path.resolve(process.cwd(), CLIENT_APP_PATH)}/index.html`);
});

// Error handler
app.use((err, req, res, next) => {
  if (!(err instanceof HttpError)) {
    console.error(err);
    res.status(500).json(
      // Generic error message.
      {
        ...err,
        message: "Something went wrong. Try again later.",
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
