const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({
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
    default: "admin",
  },
  userCode: {
    type: Number,
    required: true,
  },
});

module.exports = mongoose.model("Admin", adminSchema);
