const thanaModel = require("../model/thanaModel");
const bcrypt = require("bcrypt");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const csv = require("csvtojson");

module.exports = {
  uploadUser: async (req, res) => {
    try {
      if (!req.files) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      let jsonArray = await csv().fromFile(req.files?.csvFile?.path);
      
      // Hash passwords in parallel using Promise.all
      jsonArray = await Promise.all(
        jsonArray.map(async (record) => {
          const hashedPassword = await bcrypt.hash(record.password, 10);
          return { ...record, password: hashedPassword };
        })
      );

      // Insert data into the database
      await thanaModel.insertMany(jsonArray);
      return res.status(200).json("Added successfully");
    } catch (error) {
      console.error("Error processing file:", error);
      return res.status(500).json({ error: "Error processing file" });
    }
  },

  createThana: async (req, res) => {
    const { userId, password, userName, thanaCode, branchCode, zonalCode } =
      req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const user_id = await thanaModel.findOne({ userId });
    const user_name = await thanaModel.findOne({ userName });
    const branch_code = await thanaModel.findOne({ branchCode, zonalCode });
    const zonal_code = await thanaModel.findOne({ zonalCode });
    if (user_name) {
      return res.status(400).json("User Name Already Exists");
    } else if (user_id) {
      return res.status(400).json("User ID Already Exists");
    } else if (!branch_code) {
      return res.status(400).json("Branch Code && Zonal Code Does Not Match");
    } else if (!zonal_code) {
      return res.status(400).json("Zonal Code Does Not Exists");
    } else if (zonal_code && branch_code) {
      let thana = await thanaModel.create({
        userId,
        password: hashedPassword,
        userName,
        thanaCode,
        branchCode,
        zonalCode,
        userRole: "thana",
      });
      thana.save();
      return res.status(200).json(" User created successfully");
    } else {
      return res.status(400).json("Some error occurred!!!");
    }
  },
  getThana: async (req, res) => {
    const { branchId } = req.params;
    const thana = await thanaModel
      .find({
        branchCode: branchId,
        userRole: "thana",
      })
      .exec();
    const branchName = await thanaModel
      .findOne({
        branchCode: branchId,
        userRole: "branch",
      })
      .select("userName -_id")
      .exec();
    return res.status(200).json({ thana, branchName });
  },

  getThanaUsersUpdate: async (req, res) => {
    const { id } = req.params;
    const thana = await thanaModel.findOne({ _id: id, userRole: "thana" });
    return res.status(200).json(thana);
  },
  updateThana: async (req, res) => {
    const { id } = req.params;

    let data = await thanaModel.findOne({ _id: id });

    const { userId, userName, thanaCode, branchCode, zonalCode } = req.body;
    if (
      data.userId === userId &&
      data.userName === userName &&
      data.thanaCode === thanaCode &&
      data.branchCode === branchCode &&
      data.zonalCode === zonalCode
    ) {
      return res.status(400).json("No change in data");
    }
    let user_id = await thanaModel.findOne({ userId });
    const user_name = await thanaModel.findOne({ userName });
    const thana_code = await thanaModel.findOne({ thanaCode });
    const branch_code = await thanaModel.findOne({ branchCode });
    const zonal_code = await thanaModel.findOne({ zonalCode });

    if (!user_id || data.userId === userId) {
      if (!user_name || data.userName === userName) {
        if (thana_code || data.thanaCode === thanaCode || !thana_code) {
          if (branch_code || data.branchCode === branchCode) {
            if (zonal_code || data.zonalCode === zonalCode) {
              await thanaModel
                .findOneAndUpdate(
                  {
                    _id: id,
                  },
                  { userId, userName, branchCode, zonalCode },
                  { new: true }
                )
                .then(() => {
                  return res.status(200).json("Updated data successfully");
                })
                .catch((err) => {
                  return res.status(500).json({ error: err.message });
                });
            } else {
              return res.status(400).json("Zonal Code Not found");
            }
          } else {
            return res.status(400).json("Branch Code not found");
          }
        } else {
          return res.status(400).json("Thana Code have something wrong");
        }
      } else {
        return res.status(400).json("User Name Already Exists");
      }
    } else {
      return res.status(400).json("User ID Already Exists");
    }
  },

  updateThanaPassword: async (req, res) => {
    const { id } = req.params;

    let data = await thanaModel.findOne({ _id: id });

    if (data) {
      const { password1, password2 } = req.body;

      if (password1 === password2) {
        const hashedPassword = await bcrypt.hash(password1, 10);
        (data.password = hashedPassword), data.save();

        return res.status(200).json("Updated data successfully");
      } else {
        return res.status(400).json("Password does not match");
      }
    } else {
      return res.status(400).json("User not found");
    }
  },

  deleteThana: async (req, res) => {
    let { id } = req.params;
    let data = await thanaModel.deleteOne({
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

  createBranch: async (req, res) => {
    const { userId, password, userName, branchCode, zonalCode } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user_id = await thanaModel.findOne({ userId });
    const user_name = await thanaModel.findOne({ userName });
    const branch_code = await thanaModel.findOne({ branchCode });
    const zonal_code = await thanaModel.findOne({ zonalCode });
    if (user_name) {
      return res.status(400).json("User Name Already Exists");
    } else if (user_id) {
      return res.status(400).json("User ID Already Exists");
    } else if (branch_code) {
      return res.status(400).json("Branch Code Already Exists");
    } else if (zonal_code) {
      let thana = await thanaModel.create({
        userId,
        password: hashedPassword,
        userName,
        branchCode,
        zonalCode,
        userRole: "branch",
      });
      thana.save();
      return res.status(200).json("Branch user created successfully");
    } else {
      return res.status(400).json("Some error occurred!!!");
    }
  },
  getBranch: async (req, res) => {
    const { id } = req.params;
    const branch = await thanaModel.findOne({ _id: id, userRole: "branch" });
    return res.status(200).json(branch);
  },
  updateBranch: async (req, res) => {
    const { id } = req.params;

    let data = await thanaModel.findOne({ _id: id, userRole: "branch" });
    const { userId, userName, branchCode, zonalCode } = req.body;
    const user_id = await thanaModel.findOne({ userId });
    const user_name = await thanaModel.findOne({ userName });
    const branch_code = await thanaModel.findOne({ branchCode });
    const zonal_code = await thanaModel.findOne({ zonalCode });

    if (
      userId === data.userId &&
      userName === data.userName &&
      branchCode === data.branchCode &&
      zonalCode === data.zonalCode
    ) {
      return res.status(400).json("Data never changed");
    }

    if (!user_id || data.userId === userId) {
      if (!user_name || data.userName === userName) {
        if (branch_code || data.branchCode === branchCode) {
          if (!zonal_code || data.zonalCode === zonalCode) {
            await thanaModel
              .findOneAndUpdate(
                {
                  _id: id,
                },
                { userId, userName, branchCode, zonalCode },
                { new: true }
              )
              .then(() => {
                return res.status(200).json("Updated data successfully");
              })
              .catch((err) => {
                return res.status(500).json({ error: err.message });
              });
          } else {
            return res.status(400).json("Zonal Code Not found");
          }
        } else {
          return res.status(400).json("Branch Code Already Exists");
        }
      } else {
        return res.status(400).json("Branch Name Already Exists");
      }
    } else {
      return res.status(400).json("User ID Already Exists");
    }
  },
  updateBranchPassword: async (req, res) => {
    const { id } = req.params;

    let data = await thanaModel.findOne({ _id: id, userRole: "branch" });

    if (data) {
      const { password1, password2 } = req.body;

      if (password1 === password2) {
        const hashedPassword = await bcrypt.hash(password1, 10);

        (data.password = hashedPassword), data.save();

        return res.status(200).json("Updated data successfully");
      } else {
        return res.status(400).json("Password does not match");
      }
    } else {
      return res.status(400).json("User not found");
    }
  },

  deleteBranch: async (req, res) => {
    let { id } = req.params;
    let data = await thanaModel.deleteOne({
      _id: id,
      userRole: "branch",
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

  createZonal: async (req, res) => {
    const { userId, password, userName, zonalCode } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const zonal_code = await thanaModel.findOne({ zonalCode });
    const user_name = await thanaModel.findOne({ userName });
    const user_id = await thanaModel.findOne({ userId });
    if (zonal_code) {
      return res.status(400).json("Zonal Code Already Exists");
    } else if (user_name) {
      return res.status(400).json("User Name Already Exists");
    } else if (user_id) {
      return res.status(400).json("User ID Already Exists");
    } else {
      let thana = await new thanaModel({
        userId,
        password: hashedPassword,
        userName,
        zonalCode,
        userRole: "zonal",
      });
      thana
        .save()
        .then(() => {
          return res.status(200).json("Zonal user created successfully");
        })
        .catch((error) => {
          return res.status(500).json({ error: error.message });
        });
    }
  },
  getZonal: async (req, res) => {
    const { id } = req.params;
    const thana = await thanaModel.findOne({ _id: id, userRole: "zonal" });
    return res.status(200).json(thana);
  },
  getBranchByZonal: async (req, res) => {
    const { zonalId } = req.params;
    const branch = await thanaModel
      .find({
        zonalCode: zonalId,
        userRole: "branch",
      })
      .exec();
    const zonalName = await thanaModel
      .findOne({
        zonalCode: zonalId,
        userRole: "zonal",
      })
      .select("userName -_id")
      .exec();

    return res.status(200).json({ branch, zonalName });
  },

  updateZonal: async (req, res) => {
    const { id } = req.params;

    let data = await thanaModel.findOne({ _id: id, userRole: "zonal" });
    const { userId, userName, zonalCode } = req.body;
    if (
      data.userId === userId &&
      data.userName === userName &&
      data.zonalCode === zonalCode
    ) {
      return res.status(400).json("No changes made");
    }

    if (data) {
      let zoneID = await thanaModel.findOne({ userId });
      // let user_name = await thanaModel.findOne({ userName})
      let zone_code = await thanaModel.findOne({ zonalCode });
      if (!zoneID || data?.userId === userId) {
        if (data?.zonalCode === zone_code?.zonalCode || !zone_code) {
          await thanaModel
            .findOneAndUpdate(
              { _id: id, userRole: "zonal" },
              { userId, userName, zonalCode },
              { new: true }
            )
            .then(() => {
              return res.status(200).json("Updated data successfully");
            })
            .catch((error) => {
              return res.status(500).json({ error: error.message });
            });
        } else {
          return res.status(400).json("Zonal Code Already Exists");
        }
      } else {
        return res.status(400).json("User ID Aleardy exists");
      }
    } else {
      return res.status(400).json("User not found");
    }
  },
  updateZonalPassword: async (req, res) => {
    const { id } = req.params;

    let data = await thanaModel.findOne({ _id: id, userRole: "zonal" });

    if (data) {
      const { password1, password2 } = req.body;

      if (password1 === password2) {
        const hashedPassword = await bcrypt.hash(password1, 10);

        (data.password = hashedPassword), data.save();

        return res.status(200).json("Updated data successfully");
      } else {
        return res.status(400).json("Password does not match");
      }
    } else {
      return res.status(400).json("User not found");
    }
  },

  deleteZonal: async (req, res) => {
    let { id } = req.params;
    let data = await thanaModel.deleteOne({
      _id: id,
      userRole: "zonal",
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
