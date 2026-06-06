// const { validationResult } = require("express-validator");
const answerModel = require("../model/answerModel");
const formModel = require("../model/formModel");

module.exports = {
  createAnswer: async (req, res) => {
    let data = req.body;
    // console.log(data);

    await answerModel
      .create({
        document_name: data.document_name,
        doc_desc: data.doc_desc,
        noticeId: data.noticeId,
        thanaCode: data.thanaCode,
        submitId: data.submitId,
        branchCode: data.branchCode,
        zonalCode: data.zonalCode,
        reportDate: data.reportDate,
        answers: data.answers,
      })
      .then(() => {
        return res.status(200).json("answer inserted successfully");
      })
      .catch((error) => {
        console.log(error);
        return res.status(500).json("Error inserting answer");
      });
  },
  getAnswer: async (req, res, next) => {
    const { id } = req.params;
    let data = await answerModel.findOne({ _id: id });
    if (!data) {
      return res.status(404).json({ message: "Answer not found" });
    } else {
      return res.status(200).json(data);
    }
  },
  getQuestion: async (req, res, next) => {
    const { id } = req.params;
    let question = await formModel.findOne({ _id: id });
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    } else {
      return res.status(200).json(question);
    }
  },

  update: async (req, res, next) => {
    const { id } = req.params;
    const data = req.body;
    const response = await answerModel.findOneAndUpdate(
      { _id: id },
      {
        document_name: data.document_name,
        doc_desc: data.doc_desc,
        noticeId: data.noticeId,
        thanaCode: data.thanaCode,
        branchCode: data.branchCode,
        zonalCode: data.zonalCode,
        answers: data.answers,
      }
    );

    response
      .save()
      .then(() => {
        return res.status(200).json("answer updated successfully");
      })
      .catch((error) => {
        console.error(error);
        return res.status(500).json("Error updating answer");
      });
  },

  allData: async (req, res) => {
    let data = await answerModel.find().sort({ _id: -1 });
    // console.log(data);
    if (!data) {
      return res.status(404).json({ message: "No data found" });
    } else {
      return res.status(200).json(data);
    }
  },
};
