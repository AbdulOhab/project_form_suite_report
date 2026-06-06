const answerModel = require("../model/answerModel");
const formModel = require("../model/formModel");
const thanaModel = require("../model/thanaModel");

module.exports = {
  thanaData: async (req, res, next) => {
    const { id } = req.params;
    const user = req.userData;

    if (!id || !user) {
      return res.status(404).json({ answer: [], question: [], sumsArray: [] });
    }

    const question = await formModel.findById(id).exec();
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    const answers = await answerModel
      .find({
        noticeId: question._id,
        thanaCode: user.thanaCode,
        branchCode: user.branchCode,
        zonalCode: user.zonalCode,
      })
      .sort({ _id: -1, createdAt: -1 })
      .exec();

    const sums = {};
    const allQuestions = new Set();

    answers?.forEach((answ) => {
      answ?.answers?.forEach((ans) => {
        const { questionText, questionType, data } = ans;
        allQuestions.add(questionText);
        if (questionType === "number") {
          sums[questionText] = (sums[questionText] || 0) + Number(data);
        }
      });
    });

    const sumsArray = Array.from(allQuestions).map((questionText, index) => ({
      [index]: sums[questionText] || 0,
    }));

    return res.status(200).json({ answers, question, sumsArray });
  },
  findDataCheckout: async (req, res, next) => {
    const { id, currentDay } = req.params;
    const user = req.userData;

    // Fetch the question
    let question = await formModel.findOne({ _id: id }).exec();

    // Validate `question` and `startDadeline`
    if (!question || !question.startDadeline) {
      return res
        .status(400)
        .json({ error: "Invalid question or missing startDadeline" });
    }

    // Validate `currentDay`
    if (isNaN(Number(currentDay))) {
      return res.status(400).json({ error: "Invalid currentDay" });
    }

    // Create the date range for the specified day
    const startOfToday = new Date(question.startDadeline);
    startOfToday.setHours(0, 0, 0, 0);

    // Adjust the date by adding `currentDay - 1` days
    const toDay = new Date(startOfToday);
    toDay.setDate(toDay.getDate() + (Number(currentDay) - 1));

    // Define the end of the adjusted day
    const endOfToday = new Date(toDay);
    endOfToday.setHours(23, 59, 59, 999);

    // Fetch answers within the date range
    let answers = await answerModel
      .find({
        noticeId: question._id,
        thanaCode: user?.thanaCode,
        branchCode: user?.branchCode,
        zonalCode: user?.zonalCode,
        updatedAt: { $gte: toDay, $lt: endOfToday },
      })
      .exec();

    // Return the results
    if (answers.length === 0) {
      return res.status(200).json({ answer: [] });
    }

    return res.status(200).json({ answer: answers });
  },
  branchData: async (req, res, next) => {
    const { dayId, noticeId } = req.params;

    const user = req.userData;
    let question = await formModel.findOne({ _id: noticeId }).exec();

    const startDate = new Date(question?.startDadeline);
    startDate.setDate(startDate.getDate() + Number(dayId) - 1);
    const reportDate = startDate.toISOString().split("T")[0];

    let thana = await thanaModel
      .find({
        branchCode: user.branchCode,
        thanaCode: { $ne: null },
        userRole: "thana",
      })
      .exec();
    let tempThana = await Promise.all(
      thana.map(async (t) => {
        let a = {
          ...t.toObject(),
        };

        const toDay = new Date(reportDate);
        toDay.setHours(0, 0, 0, 0);
        const endOfToday = new Date(reportDate);
        endOfToday.setHours(23, 59, 59, 999);

        let answer = await answerModel
          .findOne({
            $or: [
              { reportDate: reportDate },
              { reportDate: { $exists: false }, createdAt: { $gte: toDay, $lt: endOfToday } },
            ],
            noticeId: question._id,
            thanaCode: t.thanaCode,
            branchCode: user.branchCode,
          })
          .sort({ _id: -1 })
          .exec();

        a.answer = answer || null;
        return a;
      })
    );
    let sums = {};
    let allQuestions = new Set();

    // Iterate through each thana user
    tempThana.forEach((item) => {
      if (item.answer && Array.isArray(item.answer.answers)) {
        item.answer.answers.forEach((answer) => {
          const questionText = answer.questionText;
          allQuestions.add(questionText);
          if (!sums[questionText]) sums[questionText] = 0;
          if (answer.questionType === "number") {
            sums[questionText] += Number(answer.data);
          }
        });
      }
    });

    // Ensure all questions have an entry in the sums array
    const sumsArray = Array.from(allQuestions).map((questionText, index) => ({
      [index]: sums[questionText] || 0,
    }));

    return res.status(200).json({ tempThana, question, sumsArray });
  },

  branchDataInterface: async (req, res, next) => {
    const { id } = req.params;

    const user = req.userData;

    let question = await formModel.findOne({ _id: id }).exec();

    let thana = await thanaModel
      .find({
        branchCode: user?.branchCode,
        userRole: "thana",
      })
      .exec();

    let tempThana = await Promise.all(
      thana.map(async (t) => {
        let a = {
          ...t.toObject(),
        };

        let answer = await answerModel
          .find({
            noticeId: question?._id,
            thanaCode: t?.thanaCode,
            branchCode: user?.branchCode,
          })
          .sort({ _id: -1, updatedAt: -1 })
          .exec();

        a.answer = answer;
        return a;
      })
    );
    let sums = {};
    let allQuestions = new Set();

    // Iterate through each user object
    tempThana.forEach((item) => {
      if (item.answer && Array.isArray(item.answer)) {
        item.answer.forEach((ans) => {
          if (ans.answers && Array.isArray(ans.answers)) {
            ans.answers.forEach((data) => {
              let questionText = data?.questionText;
              allQuestions.add(questionText); // Add all questions to the set
              let value = 0;
              if (data?.questionType === "number") {
                value = Number(data.data);
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

    return res.status(200).json({ tempThana, question, sumsArray });
  },

  zonalData: async (req, res, next) => {
    const { dayId, noticeId } = req.params;

    const user = req.userData;

    let question = await formModel.findOne({ _id: noticeId }).exec();

    if (!question) return res.status(404).json({ message: "Notice not found" });

    const startDate = new Date(question?.startDadeline);
    startDate.setDate(startDate.getDate() + Number(dayId) - 1);
    const reportDate = startDate.toISOString().split("T")[0];

    const toDay = new Date(reportDate);
    toDay.setHours(0, 0, 0, 0);

    const endOfToday = new Date(reportDate);
    endOfToday.setHours(23, 59, 59, 999);

    let branch = await thanaModel
      .find({
        zonalCode: user.zonalCode,
        userRole: "branch",
      })
      .exec();

    let tempBranch = await Promise.all(
      branch.map(async (b) => {
        let a = {
          ...b.toObject(),
        };
        let tempThana = await thanaModel
          .find({
            branchCode: b.branchCode,
            zonalCode: user.zonalCode,
            userRole: "thana",
          })
          .exec();

        // Process each thana asynchronously
        for (let i = 0; i < tempThana.length; i++) {
          let t = tempThana[i].toObject(); // Ensure t is a plain object

          let answer = await answerModel
            .findOne({
              $or: [
                { reportDate },
                { reportDate: { $exists: false }, createdAt: { $gte: toDay, $lt: endOfToday } },
              ],
              noticeId: question._id,
              thanaCode: t.thanaCode,
              branchCode: t.branchCode,
              zonalCode: user.zonalCode,
            })
            .sort({ _id: -1 })
            .exec();

          t.answer = answer || null;
          tempThana[i] = t; // Update the tempThana array
        }

        a.tempThana = tempThana;
        return a;
      })
    );

    // Initialize the necessary variables
    const allQuestions = new Set();
    const sums = {};

    // Iterate through each branch object
    tempBranch?.forEach((branch) => {
      if (branch && Array.isArray(branch?.tempThana)) {
        branch?.tempThana?.forEach((item) => {
          if (item?.answer && Array.isArray(item.answer.answers)) {
            item.answer.answers.forEach((data) => {
              let questionText = data?.questionText;
              allQuestions.add(questionText);

              let value = 0;
              if (data?.questionType === "number") {
                value = Number(data?.data);
              }

              if (!sums[questionText]) {
                sums[questionText] = 0;
              }

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

    return res.status(200).json({ tempBranch, question, sumsArray });
  },

  zonalDataInterface: async (req, res, next) => {
    const { id } = req.params;
    const user = req.userData;

    let question = await formModel.findOne({ _id: id }).exec();
    let branch = await thanaModel
      .find({
        zonalCode: user.zonalCode,
        thanaCode: null,
        branchCode: { $ne: null },
      })
      .exec();

    let tempBranch = await Promise.all(
      branch.map(async (b) => {
        let a = {
          ...b.toObject(),
        };

        let thana = await thanaModel
          .find({ branchCode: b.branchCode, zonalCode: b.zonalCode })
          .exec();

        let tempThana = await Promise.all(
          thana.map(async (t) => {
            let m = {
              ...t.toObject(),
            };
            let answer = await answerModel
              .find({
                noticeId: question._id,
                thanaCode: t.thanaCode,
                branchCode: b.branchCode,
                zonalCode: user.zonalCode,
              })
              .sort({ _id: -1 })
              .exec();
            m.answer = answer;
            return m;
          })
        );
        a.tempThana = tempThana;

        return a;
      })
    );
    let sums = {};
    let allQuestions = new Set();
    // Iterate through each user object

    tempBranch.forEach((item) => {
      if (item.tempThana && Array.isArray(item.tempThana)) {
        item.tempThana.forEach((item) => {
          if (item.answer && Array.isArray(item.answer)) {
            item.answer.forEach((ans) => {
              if (ans.answers && Array.isArray(ans.answers)) {
                ans.answers.forEach((data) => {
                  let questionText = data.questionText;
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

    return res.status(200).json({ question, tempBranch, sumsArray });
  },

  zonalDayCountData: async (req, res, next) => {
    const { branchId, dayId, noticeId } = req.params;
    const user = req.userData;

    let question = await formModel.findOne({ _id: noticeId }).exec();

    const startOfToday = new Date(question?.startDadeline);
    let day = startOfToday.getDate() + Number(dayId - 1);
    let month = startOfToday.getMonth() + 1;
    let year = startOfToday.getFullYear();

    const date = `${year}-${month}-${day}`;
    const toDay = new Date(date);

    toDay.setHours(0, 0, 0, 0);

    const endOfToday = new Date(date);
    endOfToday.setHours(23, 59, 59, 999);
    const branch = await thanaModel
      .findOne({ branchCode: branchId, thanaCode: null })
      .exec();

    let thana = await thanaModel
      .find({
        branchCode: branchId,
        zonalCode: user.zonalCode,
        userRole: "thana",
      })
      .exec();

    let tempThana = await Promise.all(
      thana.map(async (t) => {
        let a = {
          ...t.toObject(),
        };

        let answer = await answerModel
          .findOne({
            createdAt: {
              $gte: toDay,
              $lt: endOfToday,
            },
            noticeId: question._id,
            thanaCode: t.thanaCode,
            branchCode: branchId,
            zonalCode: user.zonalCode,
          })
          .sort({ _id: -1 })
          .exec();

        a.answer = answer;
        return a;
      })
    );
    let sums = {};
    let allQuestions = new Set();

    // Iterate through each user object
    tempThana.forEach((item) => {
      if (item.answer && Array.isArray(item.answer.answers)) {
        item.answer.answers.forEach((answer) => {
          let questionText = answer.questionText;
          allQuestions.add(questionText); // Add all questions to the set

          let value = 0;
          if (answer.questionType === "number") {
            value = Number(answer.data);
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

    // Ensure all questions have an entry in the sums array
    const sumsArray = Array.from(allQuestions).map((questionText, index) => ({
      [index]: sums[questionText] || 0,
    }));

    return res.status(200).json({ question, tempThana, sumsArray, branch });
  },

  adminDataInterface: async (req, res, next) => {
    const { id } = req.params;

    // Fetch the question and zonal data in parallel
    const [question, zonal] = await Promise.all([
      formModel.findOne({ _id: id }).exec(),
      thanaModel
        .find({ userRole: "zonal" })
        .select("-password -_id -thanaCode -branchCode")
        .exec(),
    ]);

    if (!question) {
      return res.status(404).json({ message: "Notice not found" });
    }

    // Fetch all branches and thanas in a single query
    const branches = await thanaModel
      .find({ userRole: "branch" })
      .select("-password -_id -thanaCode")
      .exec();

    const thanas = await thanaModel
      .find({ userRole: "thana" })
      .select("-password -_id")
      .exec();

    // Fetch all answers for the question in a single query
    const answers = await answerModel
      .find({ noticeId: question._id })
      .sort({ _id: -1 })
      .exec();

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

    // Calculate sums
    const sums = {};
    const allQuestions = new Set();

    tempZonal.forEach((zonal) => {
      zonal.tempBranch.forEach((branch) => {
        branch.tempThana.forEach((thana) => {
          thana.answer.forEach((ans) => {
            ans.answers.forEach((data) => {
              const questionText = data?.questionText;
              allQuestions.add(questionText);
              if (data.questionType === "number") {
                const value = Number(data.data) || 0;
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

    return res.status(200).json({ question, tempZonal, sumsArray });
  },
  adminZonalData: async (req, res) => {
    const { dayId, noticeId } = req.params;

    // Fetch question and calculate date range
    const question = await formModel.findById(noticeId).lean();
    if (!question)
      return res.status(404).json({ message: "Question not found" });

    const startDate = new Date(question.startDadeline);
    startDate.setDate(startDate.getDate() + Number(dayId) - 1);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(startDate);
    endDate.setHours(23, 59, 59, 999);

    // Parallel data fetching with lean()
    const [zonal, branches, thanas, answers] = await Promise.all([
      thanaModel.find({ userRole: "zonal" }).lean(),
      thanaModel.find({ userRole: "branch" }).lean(),
      thanaModel.find({ userRole: "thana" }).lean(),
      answerModel
        .find({
          createdAt: { $gte: startDate, $lt: endDate },
          noticeId: question._id,
        })
        .sort({ _id: -1 })
        .lean(),
    ]);

    // Create lookup maps
    const thanaMap = thanas.reduce((acc, t) => {
      acc[`${t.zonalCode}-${t.branchCode}-${t.thanaCode}`] = t;
      return acc;
    }, {});

    const answerMap = answers.reduce((acc, a) => {
      const key = `${a.zonalCode}-${a.branchCode}-${a.thanaCode}`;
      (acc[key] || (acc[key] = [])).push(a);
      return acc;
    }, {});

    // Process data in single pass
    const [sums, allQuestions, metrics] = zonal.reduce(
      ([sums, questions, metrics], z) => {
        const zBranches = branches.filter((b) => b.zonalCode === z.zonalCode);
        let zSubmitted = 0,
          zUnsubmitted = 0;

        z.tempBranch = zBranches.map((b) => {
          const bThanas = thanas.filter(
            (t) => t.branchCode === b.branchCode && t.zonalCode === z.zonalCode
          );

          const processedThanas = bThanas.map((t) => {
            const key = `${z.zonalCode}-${b.branchCode}-${t.thanaCode}`;
            const answer = answerMap[key] || [];
            const hasAnswers = answer.length > 0;

            hasAnswers ? zSubmitted++ : zUnsubmitted++;

            answer.forEach(({ answers }) => {
              answers.forEach(({ questionText, questionType, data }) => {
                questions.add(questionText);
                if (questionType === "number") {
                  sums[questionText] = (sums[questionText] || 0) + Number(data);
                }
              });
            });

            return { ...t, answer };
          });

          return { ...b, tempThana: processedThanas };
        });

        // Assign thanaAnsSubmit and thanaAnsUnsubmit to the zonal object
        z.thanaAnsSubmit = zSubmitted;
        z.thanaAnsUnsubmit = zUnsubmitted;

        metrics.totalSubmitted += zSubmitted;
        metrics.totalUnsubmitted += zUnsubmitted;

        return [sums, questions, metrics];
      },
      [{}, new Set(), { totalSubmitted: 0, totalUnsubmitted: 0 }]
    );

    // Generate final structures
    const sumsArray = Array.from(allQuestions).map((qt, i) => ({
      [i]: sums[qt] || 0,
    }));
    const tempData = zonal.map((z) => ({
      zonalCode: z.zonalCode,
      userName: z.userName,
      totalThana: z.tempBranch.reduce((acc, b) => acc + b.tempThana.length, 0),
      thanaAnsSubmit: z.thanaAnsSubmit, // Include thanaAnsSubmit
      thanaAnsUnsubmit: z.thanaAnsUnsubmit, // Include thanaAnsUnsubmit
      ...z.tempBranch.reduce((acc, b) => {
        b.tempThana.forEach((t) => {
          t.answer.forEach(({ answers }) => {
            answers.forEach(({ questionText, questionType, data }) => {
              if (questionType === "number") {
                acc[questionText] = (acc[questionText] || 0) + Number(data);
              }
            });
          });
        });
        return acc;
      }, {}),
    }));

    return res.status(200).json({
      tempZonal: zonal,
      question,
      sumsArray,
      totalSubmitted: metrics.totalSubmitted,
      totalUnsubmitted: metrics.totalUnsubmitted,
      tempData,
    });

  },
  adminBranchData: async (req, res, next) => {
    const { dayId, noticeId, zonalId } = req.params;

    // Fetch question and handle date calculation
    const question = await formModel.findById(noticeId).lean().exec();
    if (!question)
      return res.status(404).json({ message: "Question not found" });

    const startDate = new Date(question.startDadeline);
    startDate.setDate(startDate.getDate() + Number(dayId) - 1);
    startDate.setHours(0, 0, 0, 0);
    const toDay = new Date(startDate);
    const endOfToday = new Date(startDate);
    endOfToday.setHours(23, 59, 59, 999);

    // Fetch all relevant data in parallel
    const [branches, thanas, answers] = await Promise.all([
      thanaModel.find({ zonalCode: zonalId, userRole: "branch" }).lean().exec(),
      thanaModel
        .find({
          zonalCode: zonalId,
          userRole: "thana",
          branchCode: {
            $in: await thanaModel.distinct("branchCode", {
              zonalCode: zonalId,
              userRole: "branch",
            }),
          },
        })
        .lean()
        .exec(),
      answerModel
        .find({
          noticeId,
          zonalCode: zonalId,
          updatedAt: { $gte: toDay, $lt: endOfToday },
        })
        .lean()
        .exec(),
    ]);

    // Create lookup structures
    const answerMap = answers.reduce((acc, ans) => {
      const key = `${ans.branchCode}-${ans.thanaCode}`;
      (acc[key] = acc[key] || []).push(ans);
      return acc;
    }, {});

    const thanasByBranch = thanas.reduce((acc, t) => {
      (acc[t.branchCode] = acc[t.branchCode] || []).push(t);
      return acc;
    }, {});

    // Process branches and thanas
    const tempBranch = branches.map((branch) => {
      const branchThanas = (thanasByBranch[branch.branchCode] || []).map(
        (thana) => ({
          ...thana,
          answer: answerMap[`${branch.branchCode}-${thana.thanaCode}`] || [],
        })
      );

      const counts = branchThanas.reduce(
        (acc, thana) => {
          thana.answer.length ? acc.submit++ : acc.unsubmit++;
          return acc;
        },
        { submit: 0, unsubmit: 0 }
      );

      return {
        ...branch,
        tempThana: branchThanas,
        ...counts,
        totalThana: branchThanas.length,
      };
    });

    // Calculate totals across all branches
    let totalSubmit = 0;
    let totalUnsubmit = 0;
    tempBranch.forEach((branch) => {
      totalSubmit += branch.submit;
      totalUnsubmit += branch.unsubmit;
    });

    // Calculate sums efficiently
    const [sums, branchSums] = answers.reduce(
      ([sums, branchSums], ans) => {
        ans.answers.forEach((data) => {
          if (data.questionType !== "number") return;

          const val = Number(data.data) || 0;
          const questionText = data.questionText;

          sums[questionText] = (sums[questionText] || 0) + val;
          branchSums[ans.branchCode] = branchSums[ans.branchCode] || {};
          branchSums[ans.branchCode][questionText] =
            (branchSums[ans.branchCode][questionText] || 0) + val;
        });
        return [sums, branchSums];
      },
      [{}, {}]
    );

    // Format final output
    const sumsArray = Object.entries(sums).map(([k, v], i) => ({ [i]: v }));
    const tempData = tempBranch.map((b) => ({
      branchCode: b.branchCode,
      userName: b.userName,
      zonalCode: b.zonalCode,
      ...b,
      ...(branchSums[b.branchCode] || {}),
    }));

    return res.status(200).json({
      tempBranch,
      question,
      sumsArray,
      tempData,
      totalSubmit,
      totalUnsubmit,
      totalThana: totalSubmit + totalUnsubmit,
    });
  },

  getAllBranches: async (req, res, next) => {
    const { dayId, noticeId } = req.params;

    // Fetch the question and calculate the date range
    const question = await formModel.findById(noticeId).exec();
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    const startOfToday = new Date(question.startDadeline);
    startOfToday.setDate(startOfToday.getDate() + Number(dayId - 1));
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date(startOfToday);
    endOfToday.setHours(23, 59, 59, 999);

    // Fetch all branches and their corresponding thanas
    const branches = await thanaModel.find({ userRole: "branch" }).exec();

    const tempBranch = await Promise.all(
      branches.map(async (branch) => {
        const thanas = await thanaModel
          .find({ branchCode: branch.branchCode, userRole: "thana" })
          .exec();

        const processedThanas = await Promise.all(
          thanas.map(async (thana) => {
            const answers = await answerModel
              .find({
                createdAt: { $gte: startOfToday, $lt: endOfToday },
                noticeId: question._id,
                thanaCode: thana.thanaCode,
                branchCode: branch.branchCode,
              })
              .sort({ _id: -1 })
              .exec();

            return { ...thana.toObject(), answers };
          })
        );

        return { ...branch.toObject(), tempThana: processedThanas };
      })
    );

    // Calculate sums and other metrics
    const allQuestions = new Set();
    const sums = {};
    let count = 0;
    let thanaLength = 0;

    tempBranch.forEach((branch) => {
      let branchSubmitted = 0;
      let branchUnsubmitted = 0;

      branch.tempThana.forEach((thana) => {
        if (thana.answers.length === 0) {
          branchUnsubmitted += 1;
          count += 1;
        } else {
          branchSubmitted += 1;
          thanaLength += 1;
        }

        thana.answers.forEach((ans) => {
          ans.answers.forEach((data) => {
            const questionText = data.questionText;
            allQuestions.add(questionText);

            if (data.questionType === "number") {
              sums[questionText] =
                (sums[questionText] || 0) + Number(data.data);
            }
          });
        });
      });

      // Add thanaAnsSubmit and thanaAnsUnsubmit to the branch object
      branch.thanaAnsSubmit = branchSubmitted;
      branch.thanaAnsUnsubmit = branchUnsubmitted;
    });

    const sumsArray = Array.from(allQuestions).map((questionText, index) => ({
      [index]: sums[questionText] || 0,
    }));

    const tempData = tempBranch.map((branch) => {
      const dsums = {
        branchCode: branch.branchCode,
        userName: branch.userName,
        zonalCode: branch.zonalCode,
        totalThana: branch.tempThana.length,
        thanaAnsSubmit: branch.thanaAnsSubmit, // Add thanaAnsSubmit
        thanaAnsUnsubmit: branch.thanaAnsUnsubmit, // Add thanaAnsUnsubmit
      };

      branch.tempThana.forEach((thana) => {
        thana.answers.forEach((ans) => {
          ans.answers.forEach((data) => {
            if (data.questionType === "number") {
              const questionText = data.questionText;
              dsums[questionText] =
                (dsums[questionText] || 0) + Number(data.data);
            }
          });
        });
      });

      return dsums;
    });

    return res.status(200).json({ tempBranch, question, sumsArray, tempData });
  },
  adminThanaDayCountData: async (req, res, next) => {
    const { branchId, zonalId, dayId, noticeId } = req.params;

    let question = await formModel.findOne({ _id: noticeId }).exec();

    const startOfToday = new Date(question?.startDadeline);
    let day = startOfToday.getDate() + Number(dayId - 1);
    let month = startOfToday.getMonth() + 1;
    let year = startOfToday.getFullYear();

    const date = `${year}-${month}-${day}`;
    const toDay = new Date(date);

    toDay.setHours(0, 0, 0, 0);

    const endOfToday = new Date(date);
    endOfToday.setHours(23, 59, 59, 999);
    const branch = await thanaModel
      .findOne({ branchCode: branchId, zonalCode: zonalId, userRole: "branch" })
      .exec();

    let thana = await thanaModel
      .find({ branchCode: branchId, zonalCode: zonalId, userRole: "thana" })
      .exec();

    let tempThana = await Promise.all(
      thana.map(async (t) => {
        let a = {
          ...t.toObject(),
        };

        let answer = await answerModel
          .findOne({
            createdAt: {
              $gte: toDay,
              $lt: endOfToday,
            },
            noticeId: question._id,
            thanaCode: t.thanaCode,
            branchCode: branchId,
            zonalCode: zonalId,
          })
          .sort({ _id: -1 })
          .exec();

        a.answer = answer;
        return a;
      })
    );
    let sums = {};
    let allQuestions = new Set();

    // Iterate through each user object
    tempThana.forEach((item) => {
      if (item.answer && Array.isArray(item.answer.answers)) {
        item.answer.answers.forEach((answer) => {
          let questionText = answer?.questionText;
          allQuestions.add(questionText); // Add all questions to the set

          let value = 0;
          if (answer?.questionType === "number") {
            value = Number(answer.data);
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

    // Ensure all questions have an entry in the sums array
    const sumsArray = Array.from(allQuestions).map((questionText, index) => ({
      [index]: sums[questionText] || 0,
    }));

    return res.status(200).json({ question, tempThana, sumsArray, branch });
  },

  submissionOverview: async (req, res) => {
    const [notices, totalThanas] = await Promise.all([
      formModel.find().sort({ _id: -1 }).exec(),
      thanaModel.countDocuments({ userRole: "thana" }).exec(),
    ]);

    const overview = await Promise.all(
      notices.map(async (notice) => {
        const totalDays = Number(notice.range) || 1;
        const totalExpected = totalThanas * totalDays;
        const submitted = await answerModel.countDocuments({ noticeId: notice._id });
        const uniqueThanas = await answerModel.distinct("thanaCode", { noticeId: notice._id });

        return {
          _id: notice._id,
          document_name: notice.document_name,
          sub_title: notice.sub_title,
          startDadeline: notice.startDadeline,
          endDadeline: notice.endDadeline,
          range: notice.range,
          timeStart: notice.timeStart,
          timeEnd: notice.timeEnd,
          totalThanas,
          totalExpected,
          submitted,
          uniqueThanaCount: uniqueThanas.length,
          pending: Math.max(0, totalExpected - submitted),
        };
      })
    );

    return res.status(200).json({ overview, totalThanas });
  },

  // sums all data
};
