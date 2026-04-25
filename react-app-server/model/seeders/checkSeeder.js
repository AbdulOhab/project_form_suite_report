const mongoose = require("mongoose");
const dbConnector = require("../../config/dbConnector");

const bcrypt = require("bcrypt");
const branchModel = require("../branchModel");
const branchDatabase = require("../../branchDatabase");
const checkModel = require("../checkModel");

module.exports = async () => {
  try {
    // Connect to the MongoDB database
    await mongoose.connect(dbConnector);

    // Delete all documents from the branchModel collection
    await checkModel.deleteMany({});
    console.log("Deleting existing check documents...");

    // Loop to create new branch documents
    console.log("Creating new check documents...");
    for (const element of branchDatabase) {
      const userEmail = element.email;
      const hashedPassword = await bcrypt.hash(element.password, 10);

      await checkModel.create({
        userName: element.userName,
        email: userEmail,
        password: hashedPassword,
        userRole: element.userRole,
        branchCode: element.branchCode,
        zonalCode: element.zonalCode,
      });
    }

    console.log("check users created successfully.");
  } catch (error) {
    console.error("Error creating checker users:", error);
  } finally {
    // Close the MongoDB connection
    await mongoose.connection.close();
    console.log("MongoDB connection closed.");
  }
};
