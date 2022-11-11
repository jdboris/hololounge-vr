import express from "express";
import path from "path";
const app = express();

// appPath: The path to the
const [appPath, staticPath] = process.argv.slice(2);

if (!appPath) {
  console.error(
    `Error: Expected path to client app as argument 1, received: ${appPath}`
  );
  process.exit(1);
}

if (!staticPath) {
  console.error(
    `Error: Expected path to static files as argument 2, received: ${staticPath}`
  );
  process.exit(1);
}

const absoluteAppPath = path.resolve(process.cwd(), appPath);
const absoluteStaticPath = path.resolve(process.cwd(), staticPath);

// Serve the static files from the React app
app.use(express.static(absoluteStaticPath));

// TODO:
// API routes here...

// Default to React app
app.get("*", (req, res) => {
  res.sendFile(`${absoluteAppPath}/index.html`);
});

const port = process.env.PORT || 5000;
app.listen(port);

console.log("App is listening on port " + port);
console.log(`Serving app from '${absoluteAppPath}'`);
console.log(`Serving static files from '${absoluteStaticPath}'`);
