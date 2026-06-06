const mongoose = require("mongoose");

module.exports = mongoose.model(
  "users",
  mongoose.Schema({
    userId: Number,
    userName: String,
    email: String,
    password: String,
    thanaCode: Number,
    branchCode: Number,
    zonalCode: Number,
    userRole: String,
  })
);
