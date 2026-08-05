const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const authController = require("../../controller/authController");
const authMiddleware = require("../../middleware/authMiddleware");
const formData = require("express-form-data");

router.post(
  "/submit",
  formData.parse(),
  [
    body("userId").not().isEmpty().withMessage("User id is empty"),
    body("password").not().isEmpty().withMessage("password is empty"),
  ],
  authController.form_submit
);

router.get("/check-user", authMiddleware, authController.check);
router.get("/logout", authMiddleware, authController.logout);

module.exports = () => router;
