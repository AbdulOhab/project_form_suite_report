const express = require("express");
const answerController = require("../../controller/answerController");
const router = express.Router();

router.post(`/create-answer/:id`, answerController.createAnswer),
  router.get("/get-answer/:id", answerController.getAnswer),
  router.get("/get-question/:id", answerController.getQuestion),
  router.post("/update-answer/:id", answerController.update),
  // router.get("/delete-answer/:id", answerController.deleteItem),
  router.get("/notice-answer/branch", answerController.allData),
  (module.exports = () => router);
