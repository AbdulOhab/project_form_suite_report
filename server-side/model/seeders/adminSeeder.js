const mongoose = require("mongoose");
const dbConnector = require("../../config/dbConnector");
const bcrypt = require("bcryptjs");
const thanaModel = require("../thanaModel");

const PASSWORD = "1122";

const adminSeeder = async () => {
  try {
    await mongoose.connect(dbConnector);

    const hashedPassword = await bcrypt.hash(PASSWORD, 10);

    // Remove old admins from users collection
    await thanaModel.deleteMany({ userRole: "admin" });

    // Create admin user
    await thanaModel.create({
      userId: 110012,
      userName: "Admin User",
      email: "admin@instance.com",
      password: hashedPassword,
      userRole: "admin",
    });

    console.log("Admin user created successfully");
    console.log(`  Login -> userId: 110011, password: ${PASSWORD}`);
  } catch (error) {
    console.error("Admin seed error:", error.message);
  } finally {
    await mongoose.connection.close();
  }
};

module.exports = adminSeeder;

// Run directly: node model/seeders/adminSeeder.js
if (require.main === module) {
  adminSeeder();
}
