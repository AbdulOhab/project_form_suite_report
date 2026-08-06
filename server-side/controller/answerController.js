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

    const existing = await answerModel.findById(id).exec();
    if (!existing) {
      return res.status(404).json({ message: "Answer not found" });
    }

    const notice = await formModel.findById(existing.noticeId).exec();

    // Notice deadlines (timeStart/timeEnd) are defined in Bangladesh time
    // (UTC+6, no DST). The server/container clock may run in a different
    // timezone (e.g. UTC in production), so shift both "now" and
    // "createdAt" into Bangladesh wall-clock before reading date/time
    // fields, using UTC getters on the shifted instant to stay
    // independent of the host's local timezone.
    const BD_OFFSET_MS = 6 * 60 * 60 * 1000;
    const toBangladeshTime = (date) => new Date(date.getTime() + BD_OFFSET_MS);

    const createdAt = toBangladeshTime(new Date(existing.createdAt));
    const today = toBangladeshTime(new Date());
    const isSameDay =
      createdAt.getUTCFullYear() === today.getUTCFullYear() &&
      createdAt.getUTCMonth() === today.getUTCMonth() &&
      createdAt.getUTCDate() === today.getUTCDate();

    // Branch gets a 2-hour grace window after timeEnd to edit submissions.
    const EDIT_GRACE_MINUTES = 120;
    const isWithinTimeWindow = (start, end) => {
      if (!start || !end) return true;
      const [startH, startM] = start.split(":").map(Number);
      const [endH, endM] = end.split(":").map(Number);
      const now = today;
      const nowMinutes = now.getUTCHours() * 60 + now.getUTCMinutes();
      const startMinutes = startH * 60 + startM;
      const endMinutes = endH * 60 + endM + EDIT_GRACE_MINUTES;
      if (startMinutes <= endMinutes) {
        return nowMinutes >= startMinutes && nowMinutes <= endMinutes;
      }
      return nowMinutes >= startMinutes || nowMinutes <= endMinutes;
    };

    if (!isSameDay || !isWithinTimeWindow(notice?.timeStart, notice?.timeEnd)) {
      return res.status(403).json({ message: "নির্ধারিত দিনের বাইরে এডিট করা যাবে না" });
    }

    await answerModel
      .findOneAndUpdate(
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
      )
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
