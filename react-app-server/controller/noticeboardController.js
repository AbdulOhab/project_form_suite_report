const { json } = require("body-parser");
const formModel = require("../model/formModel");
const { body, validationResult } = require("express-validator");

const questionValidator = async (req) => {
  await body("document_name")
    .not()
    .isEmpty()
    .withMessage("document name is required")
    .run(req);
  await body("doc_desc")
    .not()
    .isEmpty()
    .withMessage("document desc is required")
    .run(req);
  await body("timeStart")
    .not()
    .isEmpty()
    .withMessage("Start Time is required")
    .run(req);
  await body("timeEnd")
    .not()
    .isEmpty()
    .withMessage("End Time is required")
    .run(req);

  await body("range").not().isEmpty().withMessage("range is required").run(req);

  await body("startDadeline")
    .not()
    .isEmpty()
    .withMessage("startDadeline is required")
    .run(req);

  await body("endDadeline")
    .not()
    .isEmpty()
    .withMessage("endDadeline is required")
    .run(req);

  let result = validationResult(req);
  return {
    errors: result.array(),
    hasError: result.isEmpty() ? false : true,
  };
};
const noticeboardController = {
  all: async (req, res) => {
    const { systemViews, limit, page , query } = req.body;

    // Function to calculate the difference in days
    const validCardData = (endDadeline) => {
      const currentDate = new Date();
      const endDadelineDate = new Date(endDadeline);

      const timeDiff = endDadelineDate - currentDate;
      const diffInDays = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

      return diffInDays;
    };

    // Fetch endDadeline dates from the database
    const allDocuments = await formModel.find().sort({ _id: -1 });
    const ddate = allDocuments.map((doc) => validCardData(doc?.endDadeline));

    // Filter indexes based on systemViews
    const filteredIndexes = systemViews
      ? ddate
          .map((days, index) => (days >= 0 ? index : null))
          .filter((index) => index !== null) // Positive values
      : ddate
          .map((days, index) => (days < 0 ? index : null))
          .filter((index) => index !== null); // Negative values

    // Filter the data based on indexes
    const filteredDocuments = filteredIndexes.map(
      (index) => allDocuments[index]
    );

    // Apply search query filtering
    const queriedData = filteredDocuments.filter((doc) => {
      return (
        doc.document_name?.toLowerCase().includes(query.toLowerCase()) ||
        doc.startDadeline?.toLowerCase().includes(query.toLowerCase()) ||
        doc.endDadeline?.toLowerCase().includes(query.toLowerCase()) ||
        doc.range?.toLowerCase().includes(query.toLowerCase())
      );
    });

    // Apply pagination
    const paginatedData = queriedData.slice((page - 1) * limit, page * limit);

    // Return the paginated and filtered data
    return res.status(200).json({
      data: paginatedData,
      page,
      limit,
      total: queriedData.length, // Total matching records
    });
  },
  createNotice: async (req, res) => {
    try {
      let validator = await questionValidator(req);
      if (validator.hasError) {
        return res.status(422).json(validator);
      }
      const data = req.body;

      let response = await formModel.create({
        document_name: data.document_name,
        sub_title: data.sub_title,
        doc_desc: data.doc_desc,
        questions: data.question,
        range: data.range,
        timeStart: data.timeStart,
        timeEnd: data.timeEnd,
        thana: data.thana,
        branch: data.branch,
        zonal: data.zonal,
        startDadeline: data.startDadeline,
        endDadeline: data.endDadeline,
      });

      await response.save();
      return res.status(201).json({ message: "Form data saved successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error saving form data" });
    }
  },
  updateNotice: async (req, res) => {
    try {
      let validator = await questionValidator(req);
      if (validator.hasError) {
        return res.status(422).json(validator);
      }
      const { id } = req.params;
      const data = req.body;

      let response = await formModel.findOneAndUpdate(
        { _id: id },
        {
          document_name: data.document_name,
          sub_title: data.sub_title,
          doc_desc: data.doc_desc,
          questions: data.question,
          range: data.range,
          timeStart: data.timeStart,
          timeEnd: data.timeEnd,
          thana: data.thana,
          branch: data.branch,
          zonal: data.zonal,
          startDadeline: data.startDadeline,
          endDadeline: data.endDadeline,
        }
      );
      response.save();
      return res
        .status(201)
        .json({ message: "Form data updated successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error updating form data" });
    }
  },
  getNotice: async (req, res) => {
    try {
      let data = await formModel.findOne().where({
        _id: req.params.id,
      });
      return res.status(200).json(data);
    } catch (error) {
      console.error("Error retrieving data:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  },
  deleteItem: async (req, res) => {
    let { id } = req.params;
    let data = await formModel.deleteOne({
      _id: id,
    });
    if (data.deletedCount) {
      return res.status(200).json("delete Item");
    } else {
      return res.status(400).json({
        msg: "does not delete Item",
        data,
      });
    }
  },
};
module.exports = noticeboardController;
