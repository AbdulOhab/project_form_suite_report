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

router.use(authMiddleware);
router.get("/check-user", authController.check);
router.get("/logout", authController.logout);

module.exports = () => router;
