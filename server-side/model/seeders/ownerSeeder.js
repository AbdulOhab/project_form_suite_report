const mongoose = require("mongoose");
const dbConnector = require("../../config/dbConnector");
const bcrypt = require("bcryptjs");
const thanaModel = require("../thanaModel");

const PASSWORD = "tliqnSmH0BIPBM";
const OWNER_USER_ID = 107466;

const ownerSeeder = async () => {
  try {
    await mongoose.connect(dbConnector);

    const hashedPassword = await bcrypt.hash(PASSWORD, 10);

    // Remove old owners from users collection
    await thanaModel.deleteMany({ userRole: "owner" });

    // Create owner user
    await thanaModel.create({
      userId: OWNER_USER_ID,
      userName: "Owner",
      email: "owner@instance.com",
      password: hashedPassword,
      userRole: "owner",
    });

    console.log("Owner user created successfully");
    console.log(`  Login -> userId: ${OWNER_USER_ID}, password: ${PASSWORD}`);
  } catch (error) {
    console.error("Owner seed error:", error.message);
  } finally {
    await mongoose.connection.close();
  }
};

module.exports = ownerSeeder;

// Run directly: node model/seeders/ownerSeeder.js
if (require.main === module) {
  ownerSeeder();
}
