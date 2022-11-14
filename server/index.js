import express from "express";
import path from "path";
import * as dotenv from "dotenv";
import db from "./db/db.js";

dotenv.config();

const app = express();

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

// TODO:
// API routes here...

// Default to React app
app.get("*", (req, res) => {
  if (NODE_ENV === "development") {
    res.sendFile(`${path.resolve(process.cwd())}/env-error.html`);
    return;
  }

  res.sendFile(`${path.resolve(process.cwd(), CLIENT_APP_PATH)}/index.html`);
});

const port = PORT || 5000;
app.listen(port);

console.log("Listening on port " + port);

if (NODE_ENV !== "development") {
  console.log(`Serving client app from '${CLIENT_APP_PATH}'`);
} else {
  console.log("Run client app separately...");
}
