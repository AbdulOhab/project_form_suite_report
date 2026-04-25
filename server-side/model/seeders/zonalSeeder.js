const mongoose = require("mongoose");
const dbConnector = require("../../config/dbConnector");

const bcrypt = require("bcrypt");
const zonalModel = require("../zonalModel");
const zonalDatabase = require("../../zonalDatabase");

module.exports = async () => {
  try {
    // Connect to the MongoDB database
    await mongoose.connect(dbConnector);

    // Delete all documents from the zonalModel collection
    console.log("Delete previous ZonalModel collection");
    await zonalModel.deleteMany({});
    console.log("zonal email creating start");
    // Loop to create new user documents
    for (const element of zonalDatabase) {
      const userEmail = element.email;
      const hashedPassword = await bcrypt.hash(element.password, 10);

      await zonalModel.create({
        userName: element.userName,
        email: userEmail,
        password: hashedPassword,
        userRole: element.userRole,
        zonalCode: element.zonalCode,
      });
    }

    console.log("zonal Users created successfully.");
  } catch (error) {
    console.error("Error creating users:", error);
  } finally {
    // Close the MongoDB connection
    await mongoose.connection.close();
  }
};
