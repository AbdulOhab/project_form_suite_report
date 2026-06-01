const mongoose = require("mongoose");
const dbConnector = require("../../config/dbConnector");
const bcrypt = require("bcrypt");
const fs = require("fs");
const path = require("path");

// ALL users go into thanaModel ("users" collection)
// because authController.js only searches thanaModel for login
const thanaModel = require("../thanaModel");

const PASSWORD = "1122";
const SALT_ROUNDS = 10;

// ============================================
// HIERARCHY STRUCTURE:
// ============================================
// 3 Admin   (userId: 110011, 110012, 110013)
// 5 Zonal   (userId/zonalCode: 201-205)
// 15 Branch (userId/branchCode: 301-315, 3 per zonal)
// 45 Thana  (userId/thanaCode: 401-445, 3 per branch)
// ============================================

const generateUsers = async () => {
  const hashedPassword = await bcrypt.hash(PASSWORD, SALT_ROUNDS);

  // --- 3 Admins ---
  const admins = [
    { userId: 110011, userName: "Admin User 1", email: "admin1@instance.com", password: hashedPassword, userRole: "admin" },
    { userId: 110012, userName: "Admin User 2", email: "admin2@instance.com", password: hashedPassword, userRole: "admin" },
    { userId: 110013, userName: "Admin User 3", email: "admin3@instance.com", password: hashedPassword, userRole: "admin" },
  ];

  // --- 5 Zonal Users ---
  const zonals = [];
  for (let z = 1; z <= 5; z++) {
    const zonalCode = 200 + z;
    zonals.push({
      userId: zonalCode,
      userName: `Zonal User ${z}`,
      email: `zonal${z}@instance.com`,
      password: hashedPassword,
      userRole: "zonal",
      zonalCode: zonalCode,
    });
  }

  // --- 15 Branch Users (3 per Zonal) ---
  const branches = [];
  let branchCount = 0;
  for (let z = 1; z <= 5; z++) {
    const zonalCode = 200 + z;
    for (let b = 1; b <= 3; b++) {
      branchCount++;
      const branchCode = 300 + branchCount;
      branches.push({
        userId: branchCode,
        userName: `Branch User ${branchCount}`,
        email: `branch${branchCount}@instance.com`,
        password: hashedPassword,
        userRole: "branch",
        branchCode: branchCode,
        zonalCode: zonalCode,
      });
    }
  }

  // --- 45 Thana Users (3 per Branch) ---
  const thanas = [];
  let thanaCount = 0;
  for (let i = 0; i < branches.length; i++) {
    const { branchCode, zonalCode } = branches[i];
    for (let t = 1; t <= 3; t++) {
      thanaCount++;
      const thanaCode = 400 + thanaCount;
      thanas.push({
        userId: thanaCode,
        userName: `Thana User ${thanaCount}`,
        email: `thana${thanaCount}@instance.com`,
        password: hashedPassword,
        thanaCode: thanaCode,
        branchCode: branchCode,
        zonalCode: zonalCode,
        userRole: "thana",
      });
    }
  }

  return { admins, zonals, branches, thanas };
};

const generateCredentialsFile = (admins, zonals, branches, thanas) => {
  let content = "";
  content += "============================================\n";
  content += "   INSTANCE REPORT - USER CREDENTIALS\n";
  content += `   Generated: ${new Date().toLocaleString()}\n`;
  content += `   Password (all users): ${PASSWORD}\n`;
  content += "============================================\n\n";

  // Login info - how to login for each role
  content += "============================================\n";
  content += "   LOGIN INFO (use userId + password)\n";
  content += "============================================\n\n";

  // Admins
  content += "--- ADMINS (3) ---\n";
  content += "Role  | UserId  | Name            | Email                   | Password\n";
  content += "------|---------|-----------------|-------------------------|----------\n";
  for (const admin of admins) {
    content += `Admin | ${String(admin.userId).padEnd(7)} | ${admin.userName.padEnd(15)} | ${admin.email.padEnd(23)} | ${PASSWORD}\n`;
  }
  content += "\n";

  // Zonals
  content += "--- ZONAL USERS (5) ---\n";
  content += "Role  | UserId | Name            | Email                 | Password\n";
  content += "------|--------|-----------------|-----------------------|----------\n";
  for (const zonal of zonals) {
    content += `Zonal | ${String(zonal.userId).padEnd(6)} | ${zonal.userName.padEnd(15)} | ${zonal.email.padEnd(21)} | ${PASSWORD}\n`;
  }
  content += "\n";

  // Branches
  content += "--- BRANCH USERS (15) ---\n";
  content += "Role   | UserId | BranchCode | ZonalCode | Name              | Email                 | Password\n";
  content += "-------|--------|------------|-----------|-------------------|-----------------------|----------\n";
  for (const branch of branches) {
    content += `Branch | ${String(branch.userId).padEnd(6)} | ${String(branch.branchCode).padEnd(10)} | ${String(branch.zonalCode).padEnd(9)} | ${branch.userName.padEnd(17)} | ${branch.email.padEnd(21)} | ${PASSWORD}\n`;
  }
  content += "\n";

  // Thanas
  content += "--- THANA USERS (45) ---\n";
  content += "Role  | UserId | ThanaCode | BranchCode | ZonalCode | Name             | Email              | Password\n";
  content += "------|--------|-----------|------------|-----------|------------------|--------------------|----------\n";
  for (const thana of thanas) {
    content += `Thana | ${String(thana.userId).padEnd(6)} | ${String(thana.thanaCode).padEnd(9)} | ${String(thana.branchCode).padEnd(10)} | ${String(thana.zonalCode).padEnd(9)} | ${thana.userName.padEnd(16)} | ${thana.email.padEnd(18)} | ${PASSWORD}\n`;
  }
  content += "\n";

  // Hierarchy tree
  content += "============================================\n";
  content += "   HIERARCHY TREE\n";
  content += "============================================\n";
  for (const admin of admins) {
    content += `Admin ${admin.userId} - ${admin.userName} (${admin.email})\n`;
  }
  content += "\n";
  for (const zonal of zonals) {
    content += `  Zonal ${zonal.zonalCode} - ${zonal.userName} (login: ${zonal.userId})\n`;
    const zonalBranches = branches.filter((b) => b.zonalCode === zonal.zonalCode);
    for (const branch of zonalBranches) {
      content += `    |__ Branch ${branch.branchCode} - ${branch.userName} (login: ${branch.userId})\n`;
      const branchThanas = thanas.filter((t) => t.branchCode === branch.branchCode);
      for (const thana of branchThanas) {
        content += `        |__ Thana ${thana.thanaCode} - ${thana.userName} (login: ${thana.userId})\n`;
      }
    }
  }

  content += "\n============================================\n";
  content += `  Total Users: ${admins.length + zonals.length + branches.length + thanas.length}\n`;
  content += "============================================\n";

  // Write to file
  const filePath = path.join(__dirname, "SEED_CREDENTIALS.txt");
  fs.writeFileSync(filePath, content, "utf-8");
  console.log(`\n  Credentials saved to: ${filePath}`);
};

const seedAll = async () => {
  try {
    await mongoose.connect(dbConnector);
    console.log("Connected to MongoDB\n");

    // Generate all users
    const { admins, zonals, branches, thanas } = await generateUsers();
    const allUsers = [...admins, ...zonals, ...branches, ...thanas];

    // Clear the users collection
    console.log("[1/3] Clearing users collection...");
    await thanaModel.deleteMany({});

    // Seed all users into thanaModel
    console.log("[2/3] Creating all users in thanaModel...");
    for (const user of allUsers) {
      await thanaModel.create(user);
    }
    console.log(`      -> ${allUsers.length} users created`);

    // Generate credentials text file
    console.log("[3/3] Generating credentials file...");
    generateCredentialsFile(admins, zonals, branches, thanas);

    // Summary Table
    console.log("\n============================================");
    console.log("         SEED COMPLETE - SUMMARY");
    console.log("============================================");
    console.log(`  Admins  : ${admins.length}  (login: 110011, 110012, 110013)`);
    console.log(`  Zonals  : ${zonals.length}  (login: 201-205)`);
    console.log(`  Branches: ${branches.length} (login: 301-315)`);
    console.log(`  Thanas  : ${thanas.length} (login: 401-445)`);
    console.log(`  TOTAL   : ${allUsers.length}`);
    console.log("============================================");
    console.log(`  Password (all users): ${PASSWORD}`);
    console.log("============================================");
  } catch (error) {
    console.error("\nSEED ERROR:", error.message);
  } finally {
    await mongoose.connection.close();
    console.log("\nMongoDB connection closed.");
  }
};

module.exports = seedAll;

// Run directly: node model/seeders/masterSeeder.js
if (require.main === module) {
  seedAll();
}
