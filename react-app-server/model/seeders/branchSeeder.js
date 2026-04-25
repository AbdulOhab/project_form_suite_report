const mongoose = require("mongoose");
const dbConnector = require("../../config/dbConnector");

const bcrypt = require("bcrypt");
const branchModel = require("../branchModel");
const branchDatabase = require("../../branchDatabase");

module.exports = async () => {
  try {
    // Connect to the MongoDB database
    await mongoose.connect(dbConnector);

    // Delete all documents from the branchModel collection
    await branchModel.deleteMany({});
    console.log("Deleting existing branch documents...");

    // Loop to create new branch documents
    console.log("Creating new branch documents...");
    for (const element of branchDatabase) {
      const userEmail = element.email;
      const hashedPassword = await bcrypt.hash(element.password, 10);

      await branchModel.create({
        userName: element.userName,
        email: userEmail,
        password: hashedPassword,
        userRole: element.userRole,
        branchCode: element.branchCode,
        zonalCode: element.zonalCode,
      });
    }

    console.log("Branches created successfully.");
  } catch (error) {
    console.error("Error creating branches:", error);
  } finally {
    // Close the MongoDB connection
    await mongoose.connection.close();
    console.log("MongoDB connection closed.");
  }
};
