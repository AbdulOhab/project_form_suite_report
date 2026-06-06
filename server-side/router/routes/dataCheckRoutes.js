const express = require("express");
const dataCheckController = require("../../controller/dataCheckController");
const authMiddleware = require("../../middleware/authMiddleware");
const { requireRole } = require("../../middleware/roleMiddleware");
const router = express.Router();

// Thana routes
router.get(`/thana/data-checkout/:id`, authMiddleware, requireRole("thana"), dataCheckController.thanaData);
router.get(`/thana/find-data-checkout/:id/:currentDay`, authMiddleware, requireRole("thana"), dataCheckController.findDataCheckout);

// Branch routes
router.get(`/branch/data-checkout/:dayId/:noticeId`, authMiddleware, requireRole("branch"), dataCheckController.branchData);
router.get(`/branch/data-interface/:id`, authMiddleware, requireRole("branch"), dataCheckController.branchDataInterface);

// Zonal routes
router.get(`/zonal/data-checkout/:dayId/:noticeId`, authMiddleware, requireRole("zonal"), dataCheckController.zonalData);
router.get(`/zonal/data-interface/:id`, authMiddleware, requireRole("zonal"), dataCheckController.zonalDataInterface);
router.get(`/zonal/zonal-data-daycount/:dayId/:branchId/:noticeId`, authMiddleware, requireRole("zonal"), dataCheckController.zonalDayCountData);

// Admin routes
router.get(`/admin/data-interface/:id`, authMiddleware, requireRole("admin"), dataCheckController.adminDataInterface);
router.get(`/admin/data-checkout/:dayId/:noticeId`, authMiddleware, requireRole("admin"), dataCheckController.adminZonalData);
router.get(`/admin/branch/data-checkout/:dayId/:zonalId/:noticeId`, authMiddleware, requireRole("admin"), dataCheckController.adminBranchData);
router.get(`/admin/thana-data-daycount/:dayId/:zonalId/:branchId/:noticeId`, authMiddleware, requireRole("admin"), dataCheckController.adminThanaDayCountData);
router.get(`/admin/get-all-branches/:noticeId/:dayId`, authMiddleware, requireRole("admin"), dataCheckController.getAllBranches);

module.exports = () => router;
