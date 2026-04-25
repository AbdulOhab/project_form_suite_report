const answerModel = require("../model/answerModel");
const formModel = require("../model/formModel");
const thanaModel = require("../model/thanaModel");

module.exports = {
  sumsZonalData: async (req, res, next) => {
    const { qId } = req.params;
    const user = req.userData;

    // Fetch the question and related data in parallel
    const [question, zonal, branches, thanas, answers] = await Promise.all([
      formModel.findOne({ _id: qId }).exec(),
      thanaModel.find({ userRole: "zonal" }).exec(),
      thanaModel.find({ userRole: "branch" }).exec(),
      thanaModel.find({ userRole: "thana" }).exec(),
      answerModel.find({ noticeId: qId }).sort({ _id: -1 }).exec(),
    ]);

    // Group answers by thanaCode, branchCode, and zonalCode
    const answersByThana = answers.reduce((acc, answer) => {
      const key = `${answer.thanaCode}-${answer.branchCode}-${answer.zonalCode}`;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(answer);
      return acc;
    }, {});

    // Process zonal data
    const tempZonal = zonal.map((z) => {
      const zonalBranches = branches.filter((b) => b.zonalCode === z.zonalCode);
      const tempBranch = zonalBranches.map((b) => {
        const branchThanas = thanas.filter(
          (t) => t.branchCode === b.branchCode && t.zonalCode === z.zonalCode
        );
        const tempThana = branchThanas.map((t) => {
          const key = `${t.thanaCode}-${b.branchCode}-${z.zonalCode}`;
          const answer = answersByThana[key] || [];
          return {
            ...t.toObject(),
            answer,
          };
        });
        return {
          ...b.toObject(),
          tempThana,
        };
      });
      return {
        ...z.toObject(),
        tempBranch,
      };
    });

    // Initialize the necessary variables
    const allQuestions = new Set();
    const sums = {};
    let submittedData = 0;
    let unsubmittedData = 0;

    // Iterate through each zonal object
    tempZonal.forEach((zonal) => {
      zonal.tempBranch.forEach((branch) => {
        branch.tempThana.forEach((thana) => {
          if (thana.answer.length === 0) {
            unsubmittedData++;
          } else {
            submittedData++;
          }

          thana.answer.forEach((ans) => {
            ans.answers.forEach((data) => {
              const questionText = data?.questionText;
              allQuestions.add(questionText);

              if (data?.questionType === "number") {
                const value = Number(data?.data) || 0;
                sums[questionText] = (sums[questionText] || 0) + value;
              }
            });
          });
        });
      });
    });

    // Convert sums to an array
    const sumsArray = Array.from(allQuestions).map((questionText, index) => ({
      [index]: sums[questionText] || 0,
    }));

    // Prepare tempData
    const tempData = tempZonal.map((zonal) => {
      const sumsThana = {
        zonalCode: zonal.zonalCode,
        userName: zonal.userName,
      };

      zonal.tempBranch.forEach((branch) => {
        branch.tempThana.forEach((thana) => {
          thana.answer.forEach((ans) => {
            ans.answers.forEach((data) => {
              if (data?.questionType === "number") {
                const questionText = data?.questionText;
                const value = Number(data?.data) || 0;
                sumsThana[questionText] =
                  (sumsThana[questionText] || 0) + value;
              }
            });
          });
        });
      });

      return sumsThana;
    });

    return res.status(200).json({
      tempZonal,
      question,
      sumsArray,
      submittedData,
      unsubmittedData,
      tempData,
    });
  },
  sumsDayByDayZonalData: async (req, res, next) => {
    const { zId, qId } = req?.params;

    // console.log(zId, qId);

    let question = await formModel.findOne({ _id: qId }).exec();
    let zonal = await thanaModel
      .findOne({
        zonalCode: zId,
        userRole: "zonal",
      })
      .exec();
    let branch = await thanaModel
      .find({ zonalCode: zId, userRole: "branch" })
      .exec();

    let tempBranch = await Promise.all(
      branch.map(async (b) => {
        let bObject = {
          ...b.toObject(),
        };

        let thana = await thanaModel
          .find({
            branchCode: b.branchCode,
            zonalCode: b.zonalCode,
            userRole: "thana",
          })
          .exec();

        let tempThana = await Promise.all(
          thana.map(async (t) => {
            let tObject = {
              ...t.toObject(),
            };
            let answer = await answerModel
              .find({
                noticeId: question._id,
                thanaCode: t.thanaCode,
                branchCode: b.branchCode,
                zonalCode: zId,
              })
              .sort({ _id: -1 })
              .exec();
            tObject.answer = answer;
            return tObject;
          })
        );
        bObject.tempThana = tempThana;
        return bObject;
      })
    );

    // Initialize the necessary variables
    const allQuestions = new Set();
    const sums = {};

    // Iterate through each branch object

    tempBranch?.forEach((branch) => {
      if (branch && Array.isArray(branch?.tempThana)) {
        branch?.tempThana?.forEach((item) => {
          if (item?.answer && Array.isArray(item?.answer)) {
            item?.answer?.forEach((ans) => {
              if (ans.answers && Array.isArray(ans.answers)) {
                ans.answers.forEach((data) => {
                  let questionText = data?.questionText;
                  allQuestions.add(questionText); // Add all questions to the set

                  let value = 0;
                  if (data?.questionType === "number") {
                    value = Number(data?.data);
                  }

                  // Initialize the sum for this question if it doesn't exist
                  if (!sums[questionText]) {
                    sums[questionText] = 0;
                  }

                  // Add the value to the corresponding sum
                  sums[questionText] += value;
                });
              }
            });
          }
        });
      }
    });

    // Ensure all questions have an entry in the sums array
    const sumsArray = Array.from(allQuestions).map((questionText, index) => ({
      [index]: sums[questionText] || 0,
    }));
    // console.log(sumsArray,'sumsArray');

    return res.status(200).json({ tempBranch, sumsArray, question });
  },
  sumsZonalDataByBranch: async (req, res) => {
    const { qId, zId } = req.params;

    let question = await formModel.findOne({ _id: qId }).exec();
    let zonal = await thanaModel
      .findOne({
        zonalCode: zId,
        userRole: "zonal",
      })
      .exec();

    let branch = await thanaModel
      .find({ zonalCode: zId, userRole: "branch" })
      .exec();

    let tempBranch = await Promise.all(
      branch.map(async (b) => {
        let bObject = {
          ...b.toObject(),
        };

        let thana = await thanaModel
          .find({
            branchCode: b.branchCode,
            zonalCode: b.zonalCode,
            userRole: "thana",
          })
          .exec();

        let tempThana = await Promise.all(
          thana.map(async (t) => {
            let tObject = {
              ...t.toObject(),
            };
            let answer = await answerModel
              .find({
                noticeId: question._id,
                thanaCode: t.thanaCode,
                branchCode: b.branchCode,
                zonalCode: zId,
              })
              .sort({ _id: -1 })
              .exec();
            tObject.answer = answer;
            return tObject;
          })
        );
        bObject.tempThana = tempThana;
        return bObject;
      })
    );

    // Initialize the necessary variables
    const allQuestions = new Set();
    const sums = {};

    // Iterate through each branch object

    tempBranch?.forEach((branch) => {
      if (branch && Array.isArray(branch?.tempThana)) {
        branch?.tempThana?.forEach((item) => {
          if (item?.answer && Array.isArray(item?.answer)) {
            item?.answer?.forEach((ans) => {
              if (ans.answers && Array.isArray(ans.answers)) {
                ans.answers.forEach((data) => {
                  let questionText = data?.questionText;
                  allQuestions.add(questionText); // Add all questions to the set

                  let value = 0;
                  if (data?.questionType === "number") {
                    value = Number(data?.data);
                  }

                  // Initialize the sum for this question if it doesn't exist
                  if (!sums[questionText]) {
                    sums[questionText] = 0;
                  }

                  // Add the value to the corresponding sum
                  sums[questionText] += value;
                });
              }
            });
          }
        });
      }
    });

    // Ensure all questions have an entry in the sums array
    const sumsArray = Array.from(allQuestions).map((questionText, index) => ({
      [index]: sums[questionText] || 0,
    }));

    let tempData = tempBranch?.map((branch) => {
      let sums = { branchCode: branch.branchCode, userName: branch.userName };
      if (branch?.tempThana && Array.isArray(branch?.tempThana)) {
        branch.tempThana.forEach((thana) => {
          thana?.answer?.forEach((ans) => {
            ans?.answers?.forEach((data) => {
              let questionText = data?.questionText;

              if (data?.questionType === "number") {
                let value = Number(data?.data);
                if (!sums[questionText]) {
                  sums[questionText] = 0;
                }
                sums[questionText] += value;
              }
            });
          });
        });
      }
      return sums;
    });

    return res.status(200).json({ sumsArray, question, tempData });
  },
  sumsBranchData: async (req, res, next) => {
    const { qId } = req.params;

    // Fetch the question and related data in parallel
    const [question, branches, thanas] = await Promise.all([
      formModel.findOne({ _id: qId }).exec(),
      thanaModel.find({ userRole: "branch" }).exec(),
      thanaModel.find({ userRole: "thana" }).exec(),
    ]);

    // Fetch all answers for the question in a single query
    const answers = await answerModel
      .find({ noticeId: question._id })
      .sort({ _id: -1 })
      .exec();

    // Group answers by thanaCode and branchCode
    const answersByThana = answers.reduce((acc, answer) => {
      const key = `${answer.thanaCode}-${answer.branchCode}`;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(answer);
      return acc;
    }, {});

    // Process branch data
    const tempBranch = branches.map((b) => {
      const branchThanas = thanas.filter((t) => t.branchCode === b.branchCode);
      const tempThana = branchThanas.map((t) => {
        const key = `${t.thanaCode}-${b.branchCode}`;
        const answer = answersByThana[key] || [];
        return {
          ...t.toObject(),
          answer,
        };
      });
      return {
        ...b.toObject(),
        tempThana,
      };
    });

    // Initialize the necessary variables
    const allQuestions = new Set();
    const sums = {};

    // Iterate through each branch object
    tempBranch.forEach((branch) => {
      branch.tempThana.forEach((thana) => {
        thana.answer.forEach((ans) => {
          ans.answers.forEach((data) => {
            const questionText = data?.questionText;
            allQuestions.add(questionText);

            if (data?.questionType === "number") {
              const value = Number(data?.data) || 0;
              sums[questionText] = (sums[questionText] || 0) + value;
            }
          });
        });
      });
    });

    // Convert sums to an array
    const sumsArray = Array.from(allQuestions).map((questionText, index) => ({
      [index]: sums[questionText] || 0,
    }));

    // Calculate counts
    let count = 0;
    let thanaLength = 0;

    tempBranch.forEach((branch) => {
      branch.tempThana.forEach((thana) => {
        if (thana.answer.length === 0) {
          count++;
        } else {
          thanaLength++;
        }
      });
    });

    // Prepare tempData
    const tempData = tempBranch.map((branch) => {
      const dsums = {
        branchCode: branch.branchCode,
        userName: branch.userName,
        zonalCode: branch.zonalCode,
      };

      branch.tempThana.forEach((thana) => {
        thana.answer.forEach((ans) => {
          ans.answers.forEach((data) => {
            if (data?.questionType === "number") {
              const questionText = data?.questionText;
              const value = Number(data?.data) || 0;
              dsums[questionText] = (dsums[questionText] || 0) + value;
            }
          });
        });
      });

      return dsums;
    });

    return res.status(200).json({ tempBranch, question, sumsArray, tempData });
  },

  sumsTotalDaysBranchData: async (req, res, next) => {
    const { qId, zId, bId } = req.params;

    let question = await formModel.findOne({ _id: qId }).exec();

    let thana = await thanaModel
      .find({
        branchCode: bId,
        zonalCode: zId,
        userRole: "thana",
      })
      .select("-password -_id")
      .exec();

    let tempThana = await Promise.all(
      thana.map(async (t) => {
        let tObject = {
          ...t.toObject(),
        };
        let answer = await answerModel
          .find({
            noticeId: question._id,
            thanaCode: t.thanaCode,
            branchCode: bId,
            zonalCode: zId,
          })
          // .sort({ _id: -1 })
          .select("-document_name -doc_desc")
          .exec();
        tObject.answer = answer;
        return tObject;
      })
    );

    let sums = {};
    let allQuestions = new Set();
    // Iterate through each user object

    if (tempThana && Array.isArray(tempThana)) {
      tempThana.forEach((item) => {
        if (item.answer && Array.isArray(item.answer)) {
          item.answer.forEach((ans) => {
            if (ans.answers && Array.isArray(ans.answers)) {
              ans.answers.forEach((data) => {
                let questionText = data?.questionText;
                allQuestions.add(questionText); // Add all questions to the set
                let value = 0;
                if (data.questionType === "number") {
                  value = Number(data.data);
                }
                // Initialize the sum for this question if it doesn't exist
                if (!sums[questionText]) {
                  sums[questionText] = 0;
                }

                // Add the value to the corresponding sum
                sums[questionText] += value;
              });
              value = 0;
            }
          });
        }
      });
    }

    // Ensure all questions have an entry in the sums array
    const sumsArray = Array.from(allQuestions).map((questionText, index) => ({
      [index]: sums[questionText] || 0,
    }));

    return res.status(200).json({ question, tempThana, sumsArray });
  },

  sumsThanaByBranchesDada: async (req, res, next) => {
    const { qId, bId } = req.params;

    // Find the question
    let question = await formModel.findOne({ _id: qId }).exec();

    // Find the branch
    const branch = await thanaModel
      .findOne({ branchCode: bId, userRole: "branch" })
      .exec();

    if (!branch) {
      console.error("Branch not found");
      return res.status(404).send("Branch not found");
    }

    // Find related thanas
    let tempThana = await thanaModel
      .find({ branchCode: branch.branchCode, userRole: "thana" })
      .exec();

    // Process each thana asynchronously
    for (let i = 0; i < tempThana.length; i++) {
      let t = tempThana[i].toObject(); // Ensure it's a plain object

      let answer = await answerModel
        .find({
          noticeId: question._id,
          thanaCode: t.thanaCode,
          branchCode: branch.branchCode,
        })
        .sort({ _id: -1 })
        .exec();

      t.answer = answer;
      tempThana[i] = t; // Update the tempThana array
    }

    // return;

    let sums = {};
    let allQuestions = new Set();

    // Iterate through each user object
    tempThana?.forEach((item) => {
      if (item?.answer && Array.isArray(item?.answer)) {
        item?.answer?.forEach((ans) => {
          if (ans.answers && Array.isArray(ans.answers)) {
            ans.answers.forEach((data) => {
              let questionText = data?.questionText;
              allQuestions.add(questionText); // Add all questions to the set

              let value = 0;
              if (data?.questionType === "number") {
                value = Number(data?.data);
              }

              // Initialize the sum for this question if it doesn't exist
              if (!sums[questionText]) {
                sums[questionText] = 0;
              }

              // Add the value to the corresponding sum
              sums[questionText] += value;
            });
          }
        });
      }
    });

    // Ensure all questions have an entry in the sums array
    const sumsArray = Array.from(allQuestions).map((questionText, index) => ({
      [index]: sums[questionText] || 0,
    }));

    // let thanaSums = {};

    let sumsThanaData = tempThana.map((thana) => {
      let dsums = {
        thanaCode: thana.thanaCode,
        userName: thana.userName,
      };
      thana?.answer?.forEach((ans) => {
        ans?.answers?.forEach((data) => {
          if (data?.questionType === "number") {
            let questionText = data?.questionText;
            let value = Number(data.data) || 0;

            if (!dsums[questionText]) {
              dsums[questionText] = 0;
            }

            dsums[questionText] += value;
          }
        });
      });
      return dsums;
    });

    return res
      .status(200)
      .json({ question, tempThana, sumsArray, branch, sumsThanaData });
  },

  sumsThanaData: async (req, res, next) => {
    const { qId } = req.params;

    // Fetch the question and related answers in a single query
    const [question, tempThana] = await Promise.all([
      formModel.findOne({ _id: qId }).exec(),
      thanaModel.find({ userRole: "thana" }).exec(),
    ]);

    // Fetch all answers for the question in a single query
    const answers = await answerModel
      .find({ noticeId: question._id })
      .sort({ _id: -1 })
      .exec();

    // Group answers by thanaCode
    const answersByThana = answers.reduce((acc, answer) => {
      if (!acc[answer.submitId]) {
        acc[answer.submitId] = [];
      }
      acc[answer.submitId].push(answer);
      return acc;
    }, {});

    // Process each thana
    const sums = {};
    const allQuestions = new Set();
    const sumsThanaData = tempThana.map((thana) => {
      const dsums = {
        thanaCode: thana.thanaCode,
        zonalCode: thana.zonalCode,
        branchCode: thana.branchCode,
        userName: thana.userName,
      };

      const thanaAnswers = answersByThana[thana.userId] || [];
      thanaAnswers.forEach((ans) => {
        ans.answers.forEach((data) => {
          const questionText = data?.questionText;
          allQuestions.add(questionText);

          if (data?.questionType === "number") {
            const value = Number(data?.data) || 0;

            // Update sums for all questions
            sums[questionText] = (sums[questionText] || 0) + value;

            // Update sums for this thana
            dsums[questionText] = (dsums[questionText] || 0) + value;
          }
        });
      });

      return dsums;
    });

    // Convert sums to an array
    const sumsArray = Array.from(allQuestions).map((questionText, index) => ({
      [index]: sums[questionText] || 0,
    }));

    return res.status(200).json({ question, sumsArray, sumsThanaData,tempThana});
  },

  sumsTotalDaysThanaData: async (req, res, next) => {
    const { qId, zId, bId, tId } = req.params;

    let question = await formModel.findOne({ _id: qId }).exec();

    let answer = await answerModel
      .find({
        noticeId: question?._id,
        thanaCode: tId,
        branchCode: bId,
        zonalCode: zId,
      })
      // .sort({ _id: -1, createdAt: -1 })
      .exec();
    let sums = {};
    let allQuestions = new Set();

    // Iterate through each user object
    if (answer && Array.isArray(answer)) {
      answer?.forEach((ans) => {
        if (ans.answers && Array.isArray(ans.answers)) {
          ans.answers.forEach((data) => {
            let questionText = data?.questionText;
            allQuestions.add(questionText); // Add all questions to the set

            let value = 0;
            if (data?.questionType === "number") {
              value = Number(data?.data);
            }

            // Initialize the sum for this question if it doesn't exist
            if (!sums[questionText]) {
              sums[questionText] = 0;
            }

            // Add the value to the corresponding sum
            sums[questionText] += value;
          });
        }
      });
    }
    // console.log(sums);

    // Ensure all questions have an entry in the sums array
    const sumsArray = Array.from(allQuestions).map((questionText, index) => ({
      [index]: sums[questionText] || 0,
    }));

    return res.status(200).json({ answer, question, sumsArray });
  },
};
