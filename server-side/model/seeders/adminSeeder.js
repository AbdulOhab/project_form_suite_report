const mongoose = require("mongoose");
const dbConnector = require("../../config/dbConnector");
var bcrypt = require("bcryptjs");
const adminModel = require("../adminModel");

module.exports = () =>
  mongoose.connect(dbConnector).then(async () => {
console.log('Delete previous admin user');
    await adminModel.deleteMany({});
    console.log('start create new Admin user');
    const email1 = "my@gmail.com";
    const password1 = "1122";
    const password2 = await bcrypt.hash(password1, 10);
    const role = "admin";
    await adminModel.deleteMany({});
    await adminModel.create({
      email: email1,
      password: password2,
      userRole: role,
      userCode: 101,
    });

    console.log("admin user is created");
  });
