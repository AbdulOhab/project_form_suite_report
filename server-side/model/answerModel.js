const { Timestamp } = require("mongodb");
const { default: mongoose } = require("mongoose");

module.exports = mongoose.model(
  "answer_models_2024",
  mongoose.Schema(
    {
      document_name: {
        type: String,
        required: true,
      },
      doc_desc: {
        type: String,
        required: true,
      },
      noticeId: {
        type: String,
        required: true,
      },
      thanaCode: {
        type: Number,
      },
      zonalCode: {
        type: Number,
      },
      branchCode: {
        type: Number,
      },
      submitId: {
        type: Number,
      },
      reportDate: {
        type: String,
      },

      answers: [],
    },
    { timestamps: true }
  )
);
