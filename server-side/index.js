require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const formData = require("express-form-data");

const allRouter = require("./router/allRouter");
const dbConnector = require("./config/dbConnector");

const server = express();
const port = process.env.PORT || 5053;

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

// 5. Routes
server.use(allRouter());

// 6. Connect to MongoDB and Start the Server
mongoose.connect(dbConnector).then((a) => {
  console.log(`Connected to MongoDB ${a.connections[0].name}`);
  server.listen(port, () => {
    console.log(`App is listening on http://localhost:${port}`);
  });
});

module.exports.server = server;
