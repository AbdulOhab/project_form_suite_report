const mongoose = require("mongoose");
const dbConnector = require("../../config/dbConnector");

const bcrypt = require("bcrypt");
const thanaModel = require("../thanaModel");
const userDatabase = require("../../userDatabase");

module.exports = async () => {
  try {
    // Connect to the MongoDB database
    await mongoose.connect(dbConnector);

    // Delete all documents from the thanaModel collection
    console.log('Delete all documents');
    await thanaModel.deleteMany({});

    // Loop to create new user documents
    console.log('Start creating new thana users');
    for (const element of userDatabase) {
      const userEmail = element.email;
      const hashedPassword = await bcrypt.hash(element.password, 10);

      await thanaModel.create({
        userName: element.userName,
        email: userEmail,
        password: hashedPassword,
        thanaCode: element.thanaCode,
        branchCode: element.branchCode,
        zonalCode: element.zonalCode,
        userRole: element.userRole,
      });
    }

    console.log("Users created successfully.");
  } catch (error) {
    console.error("Error creating users:", error);
  } finally {
    // Close the MongoDB connection
    await mongoose.connection.close();
  }
};
