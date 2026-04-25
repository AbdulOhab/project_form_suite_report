const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const authController = require("../../controller/authController");
const authMiddleware = require("../../middleware/authMiddleware");

router.post(
  "/submit",
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
