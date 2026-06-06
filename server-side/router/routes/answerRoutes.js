const express = require("express");
const answerController = require("../../controller/answerController");
const authMiddleware = require("../../middleware/authMiddleware");
const { requireRole } = require("../../middleware/roleMiddleware");
const router = express.Router();

router.post(`/create-answer/:id`, authMiddleware, requireRole("thana", "branch"), answerController.createAnswer);
router.get("/get-answer/:id", authMiddleware, requireRole("thana", "branch"), answerController.getAnswer);
router.get("/get-question/:id", authMiddleware, requireRole("thana", "branch"), answerController.getQuestion);
router.post("/update-answer/:id", authMiddleware, requireRole("thana", "branch"), answerController.update);
router.get("/notice-answer/branch", authMiddleware, requireRole("branch", "zonal", "admin"), answerController.allData);

module.exports = () => router;
