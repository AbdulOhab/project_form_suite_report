const mongoose = require("mongoose");

const zonalSchema = new mongoose.Schema({
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
    default: "zonal",
  },
  zonalCode: {
    type: Number,
    required: true,
  },
});

module.exports = mongoose.model("Zonal", zonalSchema);
