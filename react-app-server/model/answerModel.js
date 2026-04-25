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
        required: true,
      },
      zonalCode: {
        type: Number,
        required: true,
      },
      branchCode: {
        type: Number,
        required: true,
      },
      submitId: {
        type: Number,
        required: true,
      },

      answers: [],
    },
    { timestamps: true }
  )
);
