const express = require("express");
const sumsDataController = require("../../controller/sumsDataController");

const router = express.Router();

router.get("/sums-zonal-data/:qId", sumsDataController.sumsZonalData);

router.get("/sums-branch-data/:qId", sumsDataController.sumsBranchData);
router.get(
  "/sums-total-days-branch-data/:qId/:zId/:bId",
  sumsDataController.sumsTotalDaysBranchData
);
router.get(
  "/sums-day-by-day-zonal-data/:qId/:zId",
  sumsDataController.sumsDayByDayZonalData
);
router.get("/sums-zonal-data-by-branch/:qId/:zId",
  sumsDataController.sumsZonalDataByBranch
)
router.get(
  "/sums-thana-by-branch-data/:qId/:bId",
  sumsDataController.sumsThanaByBranchesDada
);

router.get("/sums-thana-data/:qId", sumsDataController.sumsThanaData);
router.get(
  "/sums-Totol-day-thana-data/:qId/:zId/:bId/:tId",
  sumsDataController.sumsTotalDaysThanaData
);

module.exports = () => router;
