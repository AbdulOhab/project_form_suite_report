const mongoose = require("mongoose");
const dbConnector = require("../../config/dbConnector");
const bcrypt = require("bcryptjs");
const thanaModel = require("../thanaModel");

const PASSWORD = "1122";

/**
 * Branch Users - 15 total (3 per zonal)
 *
 * Zonal 201 -> Branch 301, 302, 303
 * Zonal 202 -> Branch 304, 305, 306
 * Zonal 203 -> Branch 307, 308, 309
 * Zonal 204 -> Branch 310, 311, 312
 * Zonal 205 -> Branch 313, 314, 315
 */
const branchUsers = [
  // Zonal 201
  { userId: 301, userName: "Branch User 1",  email: "branch1@instance.com",  branchCode: 301, zonalCode: 201 },
  { userId: 302, userName: "Branch User 2",  email: "branch2@instance.com",  branchCode: 302, zonalCode: 201 },
  { userId: 303, userName: "Branch User 3",  email: "branch3@instance.com",  branchCode: 303, zonalCode: 201 },
  // Zonal 202
  { userId: 304, userName: "Branch User 4",  email: "branch4@instance.com",  branchCode: 304, zonalCode: 202 },
  { userId: 305, userName: "Branch User 5",  email: "branch5@instance.com",  branchCode: 305, zonalCode: 202 },
  { userId: 306, userName: "Branch User 6",  email: "branch6@instance.com",  branchCode: 306, zonalCode: 202 },
  // Zonal 203
  { userId: 307, userName: "Branch User 7",  email: "branch7@instance.com",  branchCode: 307, zonalCode: 203 },
  { userId: 308, userName: "Branch User 8",  email: "branch8@instance.com",  branchCode: 308, zonalCode: 203 },
  { userId: 309, userName: "Branch User 9",  email: "branch9@instance.com",  branchCode: 309, zonalCode: 203 },
  // Zonal 204
  { userId: 310, userName: "Branch User 10", email: "branch10@instance.com", branchCode: 310, zonalCode: 204 },
  { userId: 311, userName: "Branch User 11", email: "branch11@instance.com", branchCode: 311, zonalCode: 204 },
  { userId: 312, userName: "Branch User 12", email: "branch12@instance.com", branchCode: 312, zonalCode: 204 },
  // Zonal 205
  { userId: 313, userName: "Branch User 13", email: "branch13@instance.com", branchCode: 313, zonalCode: 205 },
  { userId: 314, userName: "Branch User 14", email: "branch14@instance.com", branchCode: 314, zonalCode: 205 },
  { userId: 315, userName: "Branch User 15", email: "branch15@instance.com", branchCode: 315, zonalCode: 205 },
];

const branchSeeder = async () => {
  try {
    await mongoose.connect(dbConnector);

    const hashedPassword = await bcrypt.hash(PASSWORD, 10);

    // Remove old branch users
    await thanaModel.deleteMany({ userRole: "branch" });

    // Create branch users
    for (const user of branchUsers) {
      await thanaModel.create({
        ...user,
        password: hashedPassword,
        userRole: "branch",
      });
    }

    console.log(`${branchUsers.length} Branch users created successfully`);
    console.log(`  Login -> userId: 301-315, password: ${PASSWORD}`);
  } catch (error) {
    console.error("Branch seed error:", error.message);
  } finally {
    await mongoose.connection.close();
  }
};

module.exports = branchSeeder;

// Run directly: node model/seeders/branchSeeder.js
if (require.main === module) {
  branchSeeder();
}
