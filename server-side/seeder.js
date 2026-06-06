const adminSeeder = require("./model/seeders/adminSeeder");
const zonalSeeder = require("./model/seeders/zonalSeeder");
const branchSeeder = require("./model/seeders/branchSeeder");
const masterSeeder = require("./model/seeders/masterSeeder");
const noticeSeeder = require("./model/seeders/noticeSeeder");
const seederChecker = require("./model/seeders/seederChecker");
const wipeAllSeeder = require("./model/seeders/wipeAllSeeder");

const command = process.argv[2];

const run = async () => {
  switch (command) {
    case "admin":
      await adminSeeder();
      break;
    case "zonal":
      await zonalSeeder();
      break;
    case "branch":
      await branchSeeder();
      break;
    case "seed":
      await masterSeeder();
      break;
    case "notice":
      await noticeSeeder();
      break;
    case "check":
      await seederChecker();
      break;
    case "wipe":
      await wipeAllSeeder();
      break;
    default:
      console.log("============================================");
      console.log("   Instance Report - Seeder Commands");
      console.log("============================================");
      console.log("");
      console.log("  Usage: node seeder.js <command>");
      console.log("");
      console.log("  Commands:");
      console.log("    seed     - Seed ALL users (3 admin + 5 zonal + 15 branch + 45 thana)");
      console.log("    admin    - Seed admin users only");
      console.log("    zonal    - Seed zonal users only");
      console.log("    branch   - Seed branch users only");
      console.log("    notice   - Seed sample notices (clears existing notices)");
      console.log("    check    - Verify seeded data");
      console.log("    wipe     - Delete ALL data from database");
      console.log("");
      console.log("  Examples:");
      console.log("    node seeder.js seed");
      console.log("    node seeder.js check");
      console.log("    node seeder.js wipe");
      console.log("");
      console.log("============================================");
  }
};

run();
