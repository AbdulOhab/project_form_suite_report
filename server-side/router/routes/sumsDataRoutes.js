const express = require("express");
const sumsDataController = require("../../controller/sumsDataController");
const authMiddleware = require("../../middleware/authMiddleware");
const { requireRole } = require("../../middleware/roleMiddleware");
const router = express.Router();

// Sums controllers return all data without role-based filtering — admin only
router.get("/sums-zonal-data/:qId", authMiddleware, requireRole("admin", "owner"), sumsDataController.sumsZonalData);
router.get("/sums-branch-data/:qId", authMiddleware, requireRole("admin", "owner"), sumsDataController.sumsBranchData);
router.get("/sums-total-days-branch-data/:qId/:zId/:bId", authMiddleware, requireRole("admin", "owner"), sumsDataController.sumsTotalDaysBranchData);
router.get("/sums-day-by-day-zonal-data/:qId/:zId", authMiddleware, requireRole("admin", "owner"), sumsDataController.sumsDayByDayZonalData);
router.get("/sums-zonal-data-by-branch/:qId/:zId", authMiddleware, requireRole("admin", "owner"), sumsDataController.sumsZonalDataByBranch);
router.get("/sums-thana-by-branch-data/:qId/:bId", authMiddleware, requireRole("admin", "owner"), sumsDataController.sumsThanaByBranchesDada);
router.get("/sums-thana-data/:qId", authMiddleware, requireRole("admin", "owner"), sumsDataController.sumsThanaData);
router.get("/sums-Totol-day-thana-data/:qId/:zId/:bId/:tId", authMiddleware, requireRole("admin", "owner"), sumsDataController.sumsTotalDaysThanaData);

module.exports = () => router;
