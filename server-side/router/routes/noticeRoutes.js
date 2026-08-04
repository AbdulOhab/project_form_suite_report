const express = require("express");
const noticeboardController = require("../../controller/noticeboardController");
const authMiddleware = require("../../middleware/authMiddleware");
const { requireRole } = require("../../middleware/roleMiddleware");
const router = express.Router();

// Admin manages notices
router.post(`/create-notice/:id`, authMiddleware, requireRole("admin", "owner"), noticeboardController.createNotice);
router.post("/update-notice/:id", authMiddleware, requireRole("admin", "owner"), noticeboardController.updateNotice);
router.post("/delete-notice/:id", authMiddleware, requireRole("admin", "owner"), noticeboardController.deleteItem);

// All authenticated users view notices
router.get("/get-notice/:id", authMiddleware, noticeboardController.getNotice);
router.post("/all-notice", authMiddleware, noticeboardController.all);

module.exports = () => router;
