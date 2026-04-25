const express = require("express");
const noticeboardController = require("../../controller/noticeboardController");

const router = express.Router();

router.post(`/create-notice/:id`, noticeboardController.createNotice),
  router.get("/get-notice/:id", noticeboardController.getNotice),
  router.post("/update-notice/:id", noticeboardController.updateNotice),
  router.post("/delete-notice/:id", noticeboardController.deleteItem),
  router.post("/all-notice", noticeboardController.all),
  (module.exports = () => router);
