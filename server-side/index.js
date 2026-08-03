require("dotenv").config();

const path = require("path");
const fs = require("fs");
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const formData = require("express-form-data");

const allRouter = require("./router/allRouter");
const dbConnector = require("./config/dbConnector");

const server = express();
const port = process.env.PORT || 5053;

// Stopgap safety net: most route handlers in this codebase are unguarded
// `async` functions with no try/catch, so a thrown error (e.g. an invalid
// Mongo ObjectId) becomes an unhandled rejection that crashes the whole
// process by default — taking the API down for every user over one bad
// request. Logging and staying up is strictly better than that until each
// route gets proper validation/error handling.
process.on("unhandledRejection", (reason) => {
  console.error("Unhandled rejection (request failed, server staying up):", reason);
});
process.on("uncaughtException", (err) => {
  console.error("Uncaught exception (request failed, server staying up):", err);
});

// 1. Configure CORS options
const corsOptions = {
  origin: process.env.CORS_ORIGIN || "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Origin",
    "X-Requested-With",
    "Content-Type",
    "Accept",
    "Authorization",
  ],
  credentials: true,
};

// 2. Use CORS middleware with the specified options
server.use(cors(corsOptions));

// 3. Handle preflight requests for all routes
server.options("*", cors(corsOptions));

// 4. Additional Middleware
server.set("json spaces", 4);
server.use(express.json());
server.use(bodyParser.json());
server.use(
  bodyParser.urlencoded({
    extended: false,
  })
);

// 5. Serve the React production build (same origin as the API).
//    Set CLIENT_BUILD_PATH to the built SPA; when present, "/" serves the
//    SPA's index.html instead of the API home route.
const clientBuildPath = process.env.CLIENT_BUILD_PATH
  ? path.resolve(process.env.CLIENT_BUILD_PATH)
  : path.join(__dirname, "public");
server.use(express.static(clientBuildPath));

// 6. Routes
server.use(allRouter());

// 7. SPA fallback: BrowserRouter needs the server to hand back index.html for
//    any client-side route (direct link, refresh) that isn't an API route or
//    a static asset. In dev the SPA runs on its own port (3000), so this is a
//    no-op there since no built index.html exists at clientBuildPath.
server.get("*", (req, res, next) => {
  const indexHtml = path.join(clientBuildPath, "index.html");
  if (!fs.existsSync(indexHtml)) return next();
  res.sendFile(indexHtml);
});

// 8. Connect to MongoDB and Start the Server
mongoose.connect(dbConnector).then((a) => {
  console.log(`Connected to MongoDB ${a.connections[0].name}`);
  server.listen(port, () => {
    console.log(`App is listening on http://localhost:${port}`);
  });
});

module.exports.server = server;
