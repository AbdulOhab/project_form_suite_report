const thanaModel = require("../model/thanaModel");

const dsashboardController = {
  getAllUsers: async (req, res, next) => {
    const thanaUsers = await thanaModel.find({
      userRole: "thana",
    });

    return res.status(200).json(thanaUsers);
  },

  getAllZonalUsers: async (req, res, next) => {
    const zonalUsers = await thanaModel.find({
      userRole: "zonal",
    });

    return res.status(200).json(zonalUsers);
  },
  getAllBranchUsers: async (req, res, next) => {
    const branchUsers = await thanaModel.find({
      userRole: "branch",
    });

    return res.status(200).json(branchUsers);
  },
  getAllAdminUsers: async (req, res, next) => {
    const adminUsers = await thanaModel.find({
      userRole: "admin",
    });

    return res.status(200).json(adminUsers);
  },
  //  getAllUsersSubmitData: async (req, res, next) => {

  //     let data = await formModel.findOne().where({
  //       // noticeId:
  //     })

  //     // const response = await answerModel.find().where({ noticeId: hexString });
  //     // return res.status(200).json(response);
  //   },
};

module.exports = dsashboardController;
