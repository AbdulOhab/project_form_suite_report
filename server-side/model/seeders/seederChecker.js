const mongoose = require("mongoose");
const dbConnector = require("../../config/dbConnector");

const thanaModel = require("../thanaModel");
const zonalModel = require("../zonalModel");
const branchModel = require("../branchModel");
const adminModel = require("../adminModel");

const checkSeed = async () => {
  try {
    await mongoose.connect(dbConnector);
    console.log("Connected to MongoDB\n");

    console.log("============================================");
    console.log("         SEEDER CHECKER - RESULTS");
    console.log("============================================\n");

    // Count each collection
    const adminCount = await adminModel.countDocuments({});
    const zonalCount = await zonalModel.countDocuments({});
    const branchCount = await branchModel.countDocuments({});
    const thanaCount = await thanaModel.countDocuments({});

    // Expected values
    const expected = { admin: 3, zonal: 5, branch: 15, thana: 45 };
    const actual = { admin: adminCount, zonal: zonalCount, branch: branchCount, thana: thanaCount };

    // Status check
    const status = (role) => actual[role] === expected[role] ? "OK" : "MISMATCH";

    console.log("  Role     | Expected | Actual | Status");
    console.log("  ---------|----------|--------|--------");
    console.log(`  Admin    |    ${expected.admin}     |   ${actual.admin}    | ${status("admin")}`);
    console.log(`  Zonal    |    ${expected.zonal}     |   ${actual.zonal}    | ${status("zonal")}`);
    console.log(`  Branch   |   ${expected.branch}    |  ${actual.branch}   | ${status("branch")}`);
    console.log(`  Thana    |   ${expected.thana}    |  ${actual.thana}   | ${status("thana")}`);
    console.log(`  ---------|----------|--------|`);
    console.log(`  TOTAL    |   ${Object.values(expected).reduce((a, b) => a + b, 0)}    |  ${Object.values(actual).reduce((a, b) => a + b, 0)}   |`);

    const allMatch = Object.keys(expected).every((k) => actual[k] === expected[k]);
    console.log("\n  Result:", allMatch ? "ALL GOOD - Seed data is complete!" : "WARNING - Some counts don't match!");

    // Verify hierarchy integrity
    console.log("\n============================================");
    console.log("         HIERARCHY INTEGRITY CHECK");
    console.log("============================================\n");

    // Check: each branch should have a valid zonalCode
    const branches = await branchModel.find({});
    const zonalCodes = (await zonalModel.find({})).map((z) => z.zonalCode);
    const orphanBranches = branches.filter((b) => !zonalCodes.includes(b.zonalCode));

    if (orphanBranches.length === 0) {
      console.log("  [OK] All branches linked to valid zonals");
    } else {
      console.log(`  [ERROR] ${orphanBranches.length} branches have invalid zonalCode:`);
      orphanBranches.forEach((b) => console.log(`    - Branch ${b.branchCode} -> zonalCode ${b.zonalCode} (not found)`));
    }

    // Check: each thana should have valid branchCode + zonalCode
    const thanas = await thanaModel.find({});
    const branchCodes = branches.map((b) => b.branchCode);
    const orphanThanas = thanas.filter((t) => !branchCodes.includes(t.branchCode));

    if (orphanThanas.length === 0) {
      console.log("  [OK] All thanas linked to valid branches");
    } else {
      console.log(`  [ERROR] ${orphanThanas.length} thanas have invalid branchCode:`);
      orphanThanas.forEach((t) => console.log(`    - Thana ${t.thanaCode} -> branchCode ${t.branchCode} (not found)`));
    }

    // Check: no duplicate codes
    const allThanaCodes = thanas.map((t) => t.thanaCode);
    const dupThana = allThanaCodes.filter((c, i) => allThanaCodes.indexOf(c) !== i);
    if (dupThana.length === 0) {
      console.log("  [OK] No duplicate thanaCodes");
    } else {
      console.log(`  [ERROR] Duplicate thanaCodes: ${dupThana}`);
    }

    const allBranchCodes = branchCodes;
    const dupBranch = allBranchCodes.filter((c, i) => allBranchCodes.indexOf(c) !== i);
    if (dupBranch.length === 0) {
      console.log("  [OK] No duplicate branchCodes");
    } else {
      console.log(`  [ERROR] Duplicate branchCodes: ${dupBranch}`);
    }

    const allZonalCodes = zonalCodes;
    const dupZonal = allZonalCodes.filter((c, i) => allZonalCodes.indexOf(c) !== i);
    if (dupZonal.length === 0) {
      console.log("  [OK] No duplicate zonalCodes");
    } else {
      console.log(`  [ERROR] Duplicate zonalCodes: ${dupZonal}`);
    }

    // Per-zonal breakdown
    console.log("\n============================================");
    console.log("         PER-ZONAL BREAKDOWN");
    console.log("============================================\n");

    for (const zonalCode of zonalCodes.sort((a, b) => a - b)) {
      const zonalBranches = await branchModel.countDocuments({ zonalCode });
      const zonalThanas = await thanaModel.countDocuments({ zonalCode });
      console.log(`  Zonal ${zonalCode}: ${zonalBranches} branches, ${zonalThanas} thanas`);
    }

    console.log("\n============================================");
    console.log(allMatch && orphanBranches.length === 0 && orphanThanas.length === 0
      ? "  CHECK PASSED - Everything looks good!"
      : "  CHECK FAILED - Fix the errors above before proceeding!");
    console.log("============================================\n");

  } catch (error) {
    console.error("\nCHECK ERROR:", error.message);
  } finally {
    await mongoose.connection.close();
    console.log("MongoDB connection closed.");
  }
};

module.exports = checkSeed;

// Run directly: node model/seeders/seederChecker.js
if (require.main === module) {
  checkSeed();
}
