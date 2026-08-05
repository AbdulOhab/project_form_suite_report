const express = require("express");
const fs = require("fs");
const path = require("path");
const usersController = require("../../controller/usersController");
const authMiddleware = require("../../middleware/authMiddleware");
const { requireRole } = require("../../middleware/roleMiddleware");
const router = express.Router();
const multer = require("multer");

// "./uploads/" is relative to process.cwd(), not this file — and multer
// throws ENOENT on the first write if the directory doesn't already exist
// (it won't after a fresh clone, since git doesn't track empty dirs).
const uploadDir = path.join(__dirname, "../../uploads");
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });

// All user management is admin-only
const requireAdmin = [authMiddleware, requireRole("admin", "owner")];

router.get("/download-users-csv", requireAdmin, usersController.downloadUsersCsv);
router.post("/upload-user-file", requireAdmin, upload.single("csvFile"), usersController.uploadUser);

router.post("/create-thana-users", requireAdmin, usersController.createThana);
router.post("/update-thana-users/:id", requireAdmin, usersController.updateThana);
router.post("/update-thana-password/:id", requireAdmin, usersController.updateThanaPassword);
router.get("/get-thana-users/:branchId", requireAdmin, usersController.getThana);
router.post("/delete-thana-users/:id", requireAdmin, usersController.deleteThana);

router.post("/create-branch-users", requireAdmin, usersController.createBranch);
router.post("/update-branch-users/:id", requireAdmin, usersController.updateBranch);
router.post("/update-branch-password/:id", requireAdmin, usersController.updateBranchPassword);
router.post("/get-thana-users-for-update/:id", requireAdmin, usersController.getThanaUsersUpdate);
router.post("/get-branch-users/:id", requireAdmin, usersController.getBranch);
router.post("/delete-branch-users/:id", requireAdmin, usersController.deleteBranch);

router.post("/create-zonal-users", requireAdmin, usersController.createZonal);
router.post("/update-zonal-users/:id", requireAdmin, usersController.updateZonal);
router.post("/update-zonal-password/:id", requireAdmin, usersController.updateZonalPassword);
router.get("/get-zonal-users/:id", requireAdmin, usersController.getZonal);
router.get("/get-branch-users-by-zonal/:zonalId", requireAdmin, usersController.getBranchByZonal);
router.post("/delete-zonal-users/:id", requireAdmin, usersController.deleteZonal);

router.post("/create-admin-users", requireAdmin, usersController.createAdmin);
router.post("/update-admin-users/:id", requireAdmin, usersController.updateAdmin);
router.post("/update-admin-password/:id", requireAdmin, usersController.updateAdminPassword);
router.post("/get-admin-users/:id", requireAdmin, usersController.getAdmin);
router.post("/delete-admin-users/:id", requireAdmin, usersController.deleteAdmin);

module.exports = () => router;
