const express = require("express");
const dsashboardController = require("../../controller/dashboardController");
const router = express.Router();

router.get("/dashboard", dsashboardController.all);
router.get("/thana-users", dsashboardController.getAllUsers);
router.get("/zonal-users", dsashboardController.getAllZonalUsers);
router.get("/branch-users", dsashboardController.getAllBranchUsers);
router.get("/admin-users", dsashboardController.getAllAdminUsers);
// router.get("/branch/users-all-submit-data", dsashboardController.getAllUsersSubmitData);

module.exports = () => router;
