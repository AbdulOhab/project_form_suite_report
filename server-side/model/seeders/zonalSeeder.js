const mongoose = require("mongoose");
const dbConnector = require("../../config/dbConnector");
const bcrypt = require("bcryptjs");
const thanaModel = require("../thanaModel");

const PASSWORD = "1122";

/**
 * Zonal Users - 5 total
 *
 * Zonal 201, 202, 203, 204, 205
 */
const zonalUsers = [
  { userId: 201, userName: "Zonal User 1", email: "zonal1@instance.com", zonalCode: 201 },
  { userId: 202, userName: "Zonal User 2", email: "zonal2@instance.com", zonalCode: 202 },
  { userId: 203, userName: "Zonal User 3", email: "zonal3@instance.com", zonalCode: 203 },
  { userId: 204, userName: "Zonal User 4", email: "zonal4@instance.com", zonalCode: 204 },
  { userId: 205, userName: "Zonal User 5", email: "zonal5@instance.com", zonalCode: 205 },
];

const zonalSeeder = async () => {
  try {
    await mongoose.connect(dbConnector);

    const hashedPassword = await bcrypt.hash(PASSWORD, 10);

    // Remove old zonal users
    await thanaModel.deleteMany({ userRole: "zonal" });

    // Create zonal users
    for (const user of zonalUsers) {
      await thanaModel.create({
        ...user,
        password: hashedPassword,
        userRole: "zonal",
      });
    }

    console.log(`${zonalUsers.length} Zonal users created successfully`);
    console.log(`  Login -> userId: 201-205, password: ${PASSWORD}`);
  } catch (error) {
    console.error("Zonal seed error:", error.message);
  } finally {
    await mongoose.connection.close();
  }
};

module.exports = zonalSeeder;

// Run directly: node model/seeders/zonalSeeder.js
if (require.main === module) {
  zonalSeeder();
}
