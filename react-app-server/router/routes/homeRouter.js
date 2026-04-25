const express = require("express");
const router = express.Router();

router.get("/", (req, res, next) => {
  res.json("home");
});

router.get("/about", (req, res, next) => {
  res.json("home");
});



// router.get("/login", (req, res, next) => {
//   res.json("login");
// });

module.exports = () => router;
