const express = require("express");
const dsashboardController = require("../../controller/dashboardController");
const authMiddleware = require("../../middleware/authMiddleware");
const { requireRole } = require("../../middleware/roleMiddleware");
const router = express.Router();

router.get("/dashboard", authMiddleware, requireRole("admin"), dsashboardController.all);
router.get("/thana-users", authMiddleware, requireRole("admin"), dsashboardController.getAllUsers);
router.get("/zonal-users", authMiddleware, requireRole("admin"), dsashboardController.getAllZonalUsers);
router.get("/branch-users", authMiddleware, requireRole("admin"), dsashboardController.getAllBranchUsers);
router.get("/admin-users", authMiddleware, requireRole("admin"), dsashboardController.getAllAdminUsers);

module.exports = () => router;
