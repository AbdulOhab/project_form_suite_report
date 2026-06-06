const express = require("express");
const usersController = require("../../controller/usersController");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const csv = require("csvtojson");

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });

router.get("/download-users-csv", usersController.downloadUsersCsv);

router.post(
  "/upload-user-file",
  upload.single("csvFile"),
  usersController.uploadUser
);
router.post("/create-thana-users", usersController.createThana);
router.post("/update-thana-users/:id", usersController.updateThana);
router.post("/update-thana-password/:id", usersController.updateThanaPassword);
router.get("/get-thana-users/:branchId", usersController.getThana);
router.post("/delete-thana-users/:id", usersController.deleteThana);

router.post("/create-branch-users", usersController.createBranch);
router.post("/update-branch-users/:id", usersController.updateBranch);
router.post(
  "/update-branch-password/:id",
  usersController.updateBranchPassword
);
router.post(
  "/get-thana-users-for-update/:id",
  usersController.getThanaUsersUpdate
);
router.post("/get-branch-users/:id", usersController.getBranch);
router.post("/delete-branch-users/:id", usersController.deleteBranch);

router.post("/create-zonal-users", usersController.createZonal);
router.post("/update-zonal-users/:id", usersController.updateZonal);
router.post("/update-zonal-password/:id", usersController.updateZonalPassword);
router.get("/get-zonal-users/:id", usersController.getZonal);
router.get(
  "/get-branch-users-by-zonal/:zonalId",
  usersController.getBranchByZonal
);
router.post("/delete-zonal-users/:id", usersController.deleteZonal);

router.post("/create-admin-users", usersController.createAdmin);
router.post("/update-admin-users/:id", usersController.updateAdmin);
router.post("/update-admin-password/:id", usersController.updateAdminPassword);
router.post("/get-admin-users/:id", usersController.getAdmin);
router.post("/delete-admin-users/:id", usersController.deleteAdmin);

module.exports = () => router;
