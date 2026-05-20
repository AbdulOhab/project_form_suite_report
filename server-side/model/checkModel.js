const mongoose = require("mongoose");

const checkSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  userRole: {
    type: String,
    default: "checker",
  },
  branchCode: {
    type: Number,
    required: true,
  },
  zonalCode: {
    type: Number,
    required: true,
  },
});

module.exports = mongoose.model("Checker", checkSchema);
