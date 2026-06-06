const mongoose = require("mongoose");
const dbConnector = require("../../config/dbConnector");

const thanaModel = require("../thanaModel");
const zonalModel = require("../zonalModel");
const branchModel = require("../branchModel");
const adminModel = require("../adminModel");
const checkModel = require("../checkModel");

const wipeAll = async () => {
  try {
    await mongoose.connect(dbConnector);
    console.log("Connected to MongoDB\n");

    console.log("============================================");
    console.log("         WIPE ALL DATA");
    console.log("============================================\n");

    // Count before wipe
    const counts = {
      users: await thanaModel.countDocuments({}),
      admins: await adminModel.countDocuments({}),
      zonals: await zonalModel.countDocuments({}),
      branches: await branchModel.countDocuments({}),
      checker: await checkModel.countDocuments({}),
    };

    console.log("  Documents found:");
    console.log(`    Users   : ${counts.users}`);
    console.log(`    Admins  : ${counts.admins}`);
    console.log(`    Zonals  : ${counts.zonals}`);
    console.log(`    Branches: ${counts.branches}`);
    console.log(`    Checker : ${counts.checker}`);
    console.log(`    TOTAL   : ${Object.values(counts).reduce((a, b) => a + b, 0)}\n`);

    // Wipe all collections
    console.log("  Wiping...");
    await thanaModel.deleteMany({});
    await adminModel.deleteMany({});
    await zonalModel.deleteMany({});
    await branchModel.deleteMany({});
    await checkModel.deleteMany({});

    console.log("\n  All collections wiped successfully!");
    console.log("============================================\n");
  } catch (error) {
    console.error("\nWIPE ERROR:", error.message);
  } finally {
    await mongoose.connection.close();
    console.log("MongoDB connection closed.");
  }
};

module.exports = wipeAll;

// Run directly: node model/seeders/wipeAllSeeder.js
if (require.main === module) {
  wipeAll();
}
