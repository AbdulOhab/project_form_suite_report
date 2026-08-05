const express = require("express");
const dsashboardController = require("../../controller/dashboardController");
const authMiddleware = require("../../middleware/authMiddleware");
const { requireRole } = require("../../middleware/roleMiddleware");
const router = express.Router();

router.get("/thana-users", authMiddleware, requireRole("admin", "owner"), dsashboardController.getAllUsers);
router.get("/zonal-users", authMiddleware, requireRole("admin", "owner"), dsashboardController.getAllZonalUsers);
router.get("/branch-users", authMiddleware, requireRole("admin", "owner"), dsashboardController.getAllBranchUsers);
router.get("/admin-users", authMiddleware, requireRole("admin", "owner"), dsashboardController.getAllAdminUsers);

module.exports = () => router;
