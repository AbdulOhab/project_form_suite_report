const thanaModel = require("../model/thanaModel");
const bcrypt = require("bcrypt");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const csv = require("csvtojson");

module.exports = {
  downloadUsersCsv: async (req, res) => {
    try {
      const users = await thanaModel.find({}).sort({ userRole: 1, userId: 1 }).lean();
      const header = "userId,password,userName,email,zonalCode,branchCode,thanaCode,userRole";
      const rows = users.map((u) =>
        [u.userId, "", u.userName, u.email || "", u.zonalCode || "", u.branchCode || "", u.thanaCode || "", u.userRole].join(",")
      );
      const csvContent = [header, ...rows].join("\n");

      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", "attachment; filename=users_list.csv");
      return res.status(200).send(csvContent);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },

  uploadUser: async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json("No file uploaded");
      }

      let jsonArray = await csv().fromFile(req.file.path);

      if (!jsonArray.length) {
        return res.status(400).json("CSV file is empty");
      }

      const bulkPassword = "";
      let updated = 0;
      let created = 0;

      for (const record of jsonArray) {
        const userId = Number(record.userId);
        if (!userId || isNaN(userId)) continue;

        const existing = await thanaModel.findOne({ userId });

        const updateData = {
          userName: record.userName,
          email: record.email || undefined,
          zonalCode: record.zonalCode ? Number(record.zonalCode) : undefined,
          branchCode: record.branchCode ? Number(record.branchCode) : undefined,
          thanaCode: record.thanaCode ? Number(record.thanaCode) : undefined,
          userRole: record.userRole,
        };

        // Hash password from CSV password column
        if (record.password && record.password.trim()) {
          updateData.password = await bcrypt.hash(String(record.password), 10);
        }

        if (existing) {
          await thanaModel.updateOne({ userId }, { $set: updateData });
          updated++;
        } else {
          if (!updateData.password) {
            updateData.password = await bcrypt.hash("1122", 10);
          }
          await thanaModel.create({ userId, ...updateData });
          created++;
        }
      }

      // Clean up uploaded file
      fs.unlink(req.file.path, () => {});

      const msg = [];
      if (updated > 0) msg.push(`${updated} users updated`);
      if (created > 0) msg.push(`${created} users created`);
      if (bulkPassword) msg.push("password reset for all");

      return res.status(200).json(msg.join(", ") || "No changes made");
    } catch (error) {
      if (req.file) fs.unlink(req.file.path, () => {});
      return res.status(500).json({ error: error.message });
    }
  },

  createThana: async (req, res) => {
    try {
      const { userId, password, userName, thanaCode, branchCode, zonalCode } = req.body;
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
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },

  getThana: async (req, res) => {
    try {
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
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },

  getThanaUsersUpdate: async (req, res) => {
    try {
      const { id } = req.params;
      const thana = await thanaModel.findOne({ _id: id, userRole: "thana" });
      return res.status(200).json(thana);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },

  updateThana: async (req, res) => {
    try {
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
                    { _id: id },
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
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },

  updateThanaPassword: async (req, res) => {
    try {
      const { id } = req.params;
      let data = await thanaModel.findOne({ _id: id });
      if (data) {
        const { password1, password2 } = req.body;
        if (password1 === password2) {
          const hashedPassword = await bcrypt.hash(password1, 10);
          data.password = hashedPassword;
          data.save();
          return res.status(200).json("Updated data successfully");
        } else {
          return res.status(400).json("Password does not match");
        }
      } else {
        return res.status(400).json("User not found");
      }
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },

  deleteThana: async (req, res) => {
    try {
      let { id } = req.params;
      let data = await thanaModel.deleteOne({ _id: id });
      if (data.deletedCount) {
        return res.status(200).json("delete Item");
      } else {
        return res.status(400).json({ msg: "does not delete Item", data });
      }
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },

  createBranch: async (req, res) => {
    try {
      const { userId, password, userName, branchCode, zonalCode } = req.body;

      if (!userId || !password || !userName || !branchCode || !zonalCode) {
        const missing = [];
        if (!userId) missing.push("User ID");
        if (!password) missing.push("Password");
        if (!userName) missing.push("User Name");
        if (!branchCode) missing.push("Branch Code");
        if (!zonalCode) missing.push("Zonal Code");
        return res.status(400).json(`${missing.join(", ")} is required`);
      }

      const user_id = await thanaModel.findOne({ userId });
      const user_name = await thanaModel.findOne({ userName });
      const branch_code = await thanaModel.findOne({ branchCode, userRole: "branch" });
      const zonal_exists = await thanaModel.findOne({ zonalCode, userRole: "zonal" });

      if (user_name) {
        return res.status(400).json("User Name Already Exists");
      } else if (user_id) {
        return res.status(400).json("User ID Already Exists");
      } else if (branch_code) {
        return res.status(400).json("Branch Code Already Exists");
      } else if (!zonal_exists) {
        return res.status(400).json("Zonal Code does not exist. Create the zonal first.");
      }

      const hashedPassword = await bcrypt.hash(String(password), 10);
      const user = new thanaModel({
        userId: Number(userId),
        password: hashedPassword,
        userName,
        branchCode: Number(branchCode),
        zonalCode: Number(zonalCode),
        userRole: "branch",
      });

      await user.save();
      return res.status(200).json("Branch user created successfully");
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },

  getBranch: async (req, res) => {
    try {
      const { id } = req.params;
      const branch = await thanaModel.findOne({ _id: id, userRole: "branch" });
      return res.status(200).json(branch);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },

  updateBranch: async (req, res) => {
    try {
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
                  { _id: id },
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
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },

  updateBranchPassword: async (req, res) => {
    try {
      const { id } = req.params;
      let data = await thanaModel.findOne({ _id: id, userRole: "branch" });
      if (data) {
        const { password1, password2 } = req.body;
        if (password1 === password2) {
          const hashedPassword = await bcrypt.hash(password1, 10);
          data.password = hashedPassword;
          data.save();
          return res.status(200).json("Updated data successfully");
        } else {
          return res.status(400).json("Password does not match");
        }
      } else {
        return res.status(400).json("User not found");
      }
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },

  deleteBranch: async (req, res) => {
    try {
      let { id } = req.params;
      let data = await thanaModel.deleteOne({ _id: id, userRole: "branch" });
      if (data.deletedCount) {
        return res.status(200).json("delete Item");
      } else {
        return res.status(400).json({ msg: "does not delete Item", data });
      }
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },

  createZonal: async (req, res) => {
    try {
      const { userId, password, userName, zonalCode } = req.body;

      if (!userId || !password || !userName || !zonalCode) {
        const missing = [];
        if (!userId) missing.push("User ID");
        if (!password) missing.push("Password");
        if (!userName) missing.push("User Name");
        if (!zonalCode) missing.push("Zonal Code");
        return res.status(400).json(`${missing.join(", ")} is required`);
      }

      const zonal_code = await thanaModel.findOne({ zonalCode, userRole: "zonal" });
      const user_name = await thanaModel.findOne({ userName });
      const user_id = await thanaModel.findOne({ userId });

      if (zonal_code) {
        return res.status(400).json("Zonal Code Already Exists");
      } else if (user_name) {
        return res.status(400).json("User Name Already Exists");
      } else if (user_id) {
        return res.status(400).json("User ID Already Exists");
      }

      const hashedPassword = await bcrypt.hash(String(password), 10);
      const user = new thanaModel({
        userId: Number(userId),
        password: hashedPassword,
        userName,
        zonalCode: Number(zonalCode),
        userRole: "zonal",
      });

      await user.save();
      return res.status(200).json("Zonal user created successfully");
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },

  getZonal: async (req, res) => {
    try {
      const { id } = req.params;
      const thana = await thanaModel.findOne({ _id: id, userRole: "zonal" });
      return res.status(200).json(thana);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },

  getBranchByZonal: async (req, res) => {
    try {
      const { zonalId } = req.params;
      const branch = await thanaModel
        .find({ zonalCode: zonalId, userRole: "branch" })
        .exec();
      const zonalName = await thanaModel
        .findOne({ zonalCode: zonalId, userRole: "zonal" })
        .select("userName -_id")
        .exec();
      return res.status(200).json({ branch, zonalName });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },

  updateZonal: async (req, res) => {
    try {
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
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },

  updateZonalPassword: async (req, res) => {
    try {
      const { id } = req.params;
      let data = await thanaModel.findOne({ _id: id, userRole: "zonal" });
      if (data) {
        const { password1, password2 } = req.body;
        if (password1 === password2) {
          const hashedPassword = await bcrypt.hash(password1, 10);
          data.password = hashedPassword;
          data.save();
          return res.status(200).json("Updated data successfully");
        } else {
          return res.status(400).json("Password does not match");
        }
      } else {
        return res.status(400).json("User not found");
      }
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },

  deleteZonal: async (req, res) => {
    try {
      let { id } = req.params;
      let data = await thanaModel.deleteOne({ _id: id, userRole: "zonal" });
      if (data.deletedCount) {
        return res.status(200).json("delete Item");
      } else {
        return res.status(400).json({ msg: "does not delete Item", data });
      }
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },

  // ===================== ADMIN CRUD =====================

  createAdmin: async (req, res) => {
    try {
      const { userId, password, userName, email } = req.body;
      if (!userId || !password || !userName || isNaN(Number(userId))) {
        return res.status(400).json("Invalid input. userId must be a number.");
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      const user_id = await thanaModel.findOne({ userId: Number(userId) });
      const user_name = await thanaModel.findOne({ userName });
      if (user_name) {
        return res.status(400).json("User Name Already Exists");
      } else if (user_id) {
        return res.status(400).json("User ID Already Exists");
      } else {
        let admin = await new thanaModel({
          userId: Number(userId),
          password: hashedPassword,
          userName,
          email,
          userRole: "admin",
        });
        admin
          .save()
          .then(() => {
            return res.status(200).json("Admin user created successfully");
          })
          .catch((error) => {
            return res.status(500).json({ error: error.message });
          });
      }
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },

  getAdmin: async (req, res) => {
    try {
      const { id } = req.params;
      const admin = await thanaModel.findOne({ _id: id, userRole: "admin" });
      return res.status(200).json(admin);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },

  updateAdmin: async (req, res) => {
    try {
      const { id } = req.params;
      let data = await thanaModel.findOne({ _id: id, userRole: "admin" });
      const { userId, userName, email } = req.body;

      if (!data) {
        return res.status(400).json("User not found");
      }

      if (
        data.userId == userId &&
        data.userName === userName &&
        data.email === email
      ) {
        return res.status(400).json("No changes made");
      }

      let userID = await thanaModel.findOne({ userId: Number(userId) });
      let user_name = await thanaModel.findOne({ userName });
      if (!userID || data.userId == userId) {
        if (!user_name || data.userName === userName) {
          await thanaModel
            .findOneAndUpdate(
              { _id: id, userRole: "admin" },
              { userId: Number(userId), userName, email },
              { new: true }
            )
            .then(() => {
              return res.status(200).json("Updated data successfully");
            })
            .catch((error) => {
              return res.status(500).json({ error: error.message });
            });
        } else {
          return res.status(400).json("User Name Already Exists");
        }
      } else {
        return res.status(400).json("User ID Already Exists");
      }
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },

  updateAdminPassword: async (req, res) => {
    try {
      const { id } = req.params;
      let data = await thanaModel.findOne({ _id: id, userRole: "admin" });
      if (data) {
        const { password1, password2 } = req.body;
        if (password1 === password2) {
          const hashedPassword = await bcrypt.hash(password1, 10);
          data.password = hashedPassword;
          data.save();
          return res.status(200).json("Updated password successfully");
        } else {
          return res.status(400).json("Password does not match");
        }
      } else {
        return res.status(400).json("User not found");
      }
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },

  deleteAdmin: async (req, res) => {
    try {
      let { id } = req.params;
      let data = await thanaModel.deleteOne({ _id: id, userRole: "admin" });
      if (data.deletedCount) {
        return res.status(200).json("Deleted successfully");
      } else {
        return res.status(400).json({ msg: "Failed to delete", data });
      }
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },
};
