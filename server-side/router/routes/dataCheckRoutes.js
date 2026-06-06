const express = require("express");
const dataCheckController = require("../../controller/dataCheckController");
const authMiddleware = require("../../middleware/authMiddleware");
const router = express.Router();

router.get(`/thana/data-checkout/:id`, authMiddleware, dataCheckController.thanaData),
  router.get(
    `/thana/find-data-checkout/:id/:currentDay`,
    dataCheckController.findDataCheckout
  ),
  router.get(
    `/branch/data-checkout/:dayId/:noticeId`,
    dataCheckController.branchData
  ),
  router.get(
    `/branch/data-interface/:id`,
    dataCheckController.branchDataInterface
  ),
  router.get(
    `/zonal/data-checkout/:dayId/:noticeId`,
    dataCheckController.zonalData
  ),
  router.get(
    `/zonal/data-interface/:id`,
    dataCheckController.zonalDataInterface
  ),
  router.get(
    `/zonal/zonal-data-daycount/:dayId/:branchId/:noticeId`,
    dataCheckController.zonalDayCountData
  ),
  router.get(
    `/admin/data-interface/:id`,
    dataCheckController.adminDataInterface
  ),
  router.get(
    `/admin/data-checkout/:dayId/:noticeId`,
    dataCheckController.adminZonalData
  ),
  router.get(
    `/admin/branch/data-checkout/:dayId/:zonalId/:noticeId`,
    dataCheckController.adminBranchData
  ),
  router.get(
    `/admin/thana-data-daycount/:dayId/:zonalId/:branchId/:noticeId`,
    dataCheckController.adminThanaDayCountData
  ),
  router.get(
    `/admin/get-all-branches/:noticeId/:dayId`,
    dataCheckController.getAllBranches
  ),
  (module.exports = () => router);
