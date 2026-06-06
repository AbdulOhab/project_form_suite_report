const mongoose = require("mongoose");
const dbConnector = require("../../config/dbConnector");
const formModel = require("../formModel");

// ─── পূর্ব (Past) — endDadeline before 2026-06-06 ───────────────────────────
const pastNotices = [
  {
    document_name: "Q1 Branch Performance Report",
    sub_title: "January - March 2026",
    doc_desc: "First quarter branch-level performance summary including collection data, member growth, and target achievement.",
    range: "90",
    thana: false, branch: true, zonal: false,
    startDadeline: "2026-01-01", endDadeline: "2026-03-31",
    timeStart: "09:00", timeEnd: "17:00",
    questions: [
      { questionText: "Total collection (BDT) in Q1", questionType: "number", options: [{ optionsText: "Value must be number" }], required: true, open: false },
      { questionText: "New members enrolled in Q1", questionType: "number", options: [{ optionsText: "Value must be number" }], required: true, open: false },
      { questionText: "Target achieved? Remarks", questionType: "text", options: [{ optionsText: "Sort answer text" }], required: false, open: false },
    ],
  },
  {
    document_name: "April Monthly Thana Update",
    sub_title: "April 2026",
    doc_desc: "Monthly field update for all thana-level officers covering visit counts and new registrations for April.",
    range: "30",
    thana: true, branch: false, zonal: false,
    startDadeline: "2026-04-01", endDadeline: "2026-04-30",
    timeStart: "08:00", timeEnd: "16:00",
    questions: [
      { questionText: "Field visits completed in April", questionType: "number", options: [{ optionsText: "Value must be number" }], required: true, open: false },
      { questionText: "New registrations in April", questionType: "number", options: [{ optionsText: "Value must be number" }], required: true, open: false },
      { questionText: "Notable issues or events", questionType: "text", options: [{ optionsText: "Sort answer text" }], required: false, open: false },
    ],
  },
  {
    document_name: "Zonal Q1 Consolidated Review",
    sub_title: "Q1 2026 Zonal Summary",
    doc_desc: "Zonal offices to submit consolidated Q1 review aggregating all branch data under their zone.",
    range: "11",
    thana: false, branch: false, zonal: true,
    startDadeline: "2026-04-10", endDadeline: "2026-04-20",
    timeStart: "09:00", timeEnd: "18:00",
    questions: [
      { questionText: "Total Q1 collection across branches (BDT)", questionType: "number", options: [{ optionsText: "Value must be number" }], required: true, open: false },
      { questionText: "Number of branches meeting targets", questionType: "number", options: [{ optionsText: "Value must be number" }], required: true, open: false },
      { questionText: "Zone-level observations", questionType: "text", options: [{ optionsText: "Sort answer text" }], required: false, open: false },
    ],
  },
  {
    document_name: "May Emergency Field Survey",
    sub_title: "May 2026",
    doc_desc: "Special emergency survey for all units to report operational disruptions and mitigation actions taken in May.",
    range: "12",
    thana: true, branch: true, zonal: true,
    startDadeline: "2026-05-20", endDadeline: "2026-05-31",
    timeStart: "08:00", timeEnd: "18:00",
    questions: [
      { questionText: "Number of disrupted operations", questionType: "number", options: [{ optionsText: "Value must be number" }], required: true, open: false },
      { questionText: "Mitigation actions summary", questionType: "text", options: [{ optionsText: "Sort answer text" }], required: true, open: false },
    ],
  },
  {
    document_name: "Staff Attendance Compliance Report",
    sub_title: "May 2026",
    doc_desc: "Branch-level attendance and compliance status for May. All branches must submit before June 1.",
    range: "8",
    thana: false, branch: true, zonal: false,
    startDadeline: "2026-05-25", endDadeline: "2026-06-01",
    timeStart: "09:00", timeEnd: "17:00",
    questions: [
      { questionText: "Total working days in May", questionType: "number", options: [{ optionsText: "Value must be number" }], required: true, open: false },
      { questionText: "Staff present on average per day", questionType: "number", options: [{ optionsText: "Value must be number" }], required: true, open: false },
      { questionText: "Compliance issues to report?", questionType: "text", options: [{ optionsText: "Sort answer text" }], required: false, open: false },
    ],
  },
];

// ─── চলমান (Active) — startDadeline <= 2026-06-06 <= endDadeline ─────────────
const activeNotices = [
  {
    document_name: "Monthly Branch Performance Report",
    sub_title: "June 2026",
    doc_desc: "Submit the monthly performance data for your branch including collection targets, member count, and operational updates.",
    range: "30",
    thana: false,
    branch: true,
    zonal: false,
    startDadeline: "2026-06-01",
    endDadeline: "2026-06-30",
    timeStart: "09:00",
    timeEnd: "17:00",
    questions: [
      {
        questionText: "Total number of active members this month",
        questionType: "number",
        options: [{ optionsText: "Value must be number" }],
        required: true,
        open: false,
      },
      {
        questionText: "Total collection amount (BDT)",
        questionType: "number",
        options: [{ optionsText: "Value must be number" }],
        required: true,
        open: false,
      },
      {
        questionText: "Any operational issues faced this month?",
        questionType: "text",
        options: [{ optionsText: "Sort answer text" }],
        required: false,
        open: false,
      },
    ],
  },
  {
    document_name: "Thana Weekly Field Report",
    sub_title: "Week 23 - 2026",
    doc_desc: "Weekly field visit report for all thana-level officers. Report must be submitted every Sunday before 5PM.",
    range: "7",
    thana: true,
    branch: false,
    zonal: false,
    startDadeline: "2026-06-02",
    endDadeline: "2026-06-08",
    timeStart: "08:00",
    timeEnd: "17:00",
    questions: [
      {
        questionText: "Number of field visits completed this week",
        questionType: "number",
        options: [{ optionsText: "Value must be number" }],
        required: true,
        open: false,
      },
      {
        questionText: "Number of new member registrations",
        questionType: "number",
        options: [{ optionsText: "Value must be number" }],
        required: true,
        open: false,
      },
      {
        questionText: "Field visit remarks / observations",
        questionType: "text",
        options: [{ optionsText: "Sort answer text" }],
        required: false,
        open: false,
      },
    ],
  },
  {
    document_name: "June Emergency Operations Update",
    sub_title: "June 2026",
    doc_desc: "Urgent operational status update for all branches. Report any resource shortage, staff issues, or field problems encountered in June.",
    range: "15",
    thana: false, branch: true, zonal: false,
    startDadeline: "2026-06-01", endDadeline: "2026-06-15",
    timeStart: "08:00", timeEnd: "18:00",
    questions: [
      { questionText: "Any resource shortages this week?", questionType: "text", options: [{ optionsText: "Sort answer text" }], required: true, open: false },
      { questionText: "Number of unresolved field complaints", questionType: "number", options: [{ optionsText: "Value must be number" }], required: true, open: false },
    ],
  },
  {
    document_name: "Mid-Year Staff Check-in",
    sub_title: "June 2026",
    doc_desc: "Mid-year staff wellbeing and performance check-in for all levels. Submit by June 20.",
    range: "16",
    thana: true, branch: true, zonal: true,
    startDadeline: "2026-06-05", endDadeline: "2026-06-20",
    timeStart: "09:00", timeEnd: "17:00",
    questions: [
      { questionText: "Total active staff in your unit", questionType: "number", options: [{ optionsText: "Value must be number" }], required: true, open: false },
      { questionText: "Staff on leave this month", questionType: "number", options: [{ optionsText: "Value must be number" }], required: true, open: false },
      { questionText: "General staff feedback or concerns", questionType: "text", options: [{ optionsText: "Sort answer text" }], required: false, open: false },
    ],
  },
];

// ─── আসবে (Upcoming) — startDadeline after 2026-06-06 ────────────────────────
const upcomingNotices = [
  {
    document_name: "Zonal Quarterly Review",
    sub_title: "Q2 2026 (April - June)",
    doc_desc: "Quarterly review submission for all zonal offices. Include aggregated performance data from all branches under your zone.",
    range: "10",
    thana: false,
    branch: false,
    zonal: true,
    startDadeline: "2026-07-01",
    endDadeline: "2026-07-10",
    timeStart: "09:00",
    timeEnd: "18:00",
    questions: [
      {
        questionText: "Total branches active under this zone",
        questionType: "number",
        options: [{ optionsText: "Value must be number" }],
        required: true,
        open: false,
      },
      {
        questionText: "Total quarterly collection (BDT)",
        questionType: "number",
        options: [{ optionsText: "Value must be number" }],
        required: true,
        open: false,
      },
      {
        questionText: "Number of branches that missed targets",
        questionType: "number",
        options: [{ optionsText: "Value must be number" }],
        required: true,
        open: false,
      },
      {
        questionText: "Summary comments for the quarter",
        questionType: "text",
        options: [{ optionsText: "Sort answer text" }],
        required: false,
        open: false,
      },
    ],
  },
  {
    document_name: "Annual Staff Assessment Form",
    sub_title: "Year 2026",
    doc_desc: "Annual staff performance and compliance assessment. All levels must submit this form. Deadline is strict.",
    range: "31",
    thana: true, branch: true, zonal: true,
    startDadeline: "2026-12-01", endDadeline: "2026-12-31",
    timeStart: "09:00", timeEnd: "17:00",
    questions: [
      { questionText: "Total staff count in your unit", questionType: "number", options: [{ optionsText: "Value must be number" }], required: true, open: false },
      { questionText: "Number of staff who completed mandatory training", questionType: "number", options: [{ optionsText: "Value must be number" }], required: true, open: false },
      { questionText: "Any compliance issues or incidents to report?", questionType: "text", options: [{ optionsText: "Sort answer text" }], required: false, open: false },
    ],
  },
  {
    document_name: "July Branch Target Report",
    sub_title: "July 2026",
    doc_desc: "Monthly branch report for July covering collection targets, active members, and outstanding loans.",
    range: "17",
    thana: false, branch: true, zonal: false,
    startDadeline: "2026-07-15", endDadeline: "2026-07-31",
    timeStart: "09:00", timeEnd: "17:00",
    questions: [
      { questionText: "July collection target (BDT)", questionType: "number", options: [{ optionsText: "Value must be number" }], required: true, open: false },
      { questionText: "Actual collection achieved (BDT)", questionType: "number", options: [{ optionsText: "Value must be number" }], required: true, open: false },
      { questionText: "Remarks on shortfall or surplus", questionType: "text", options: [{ optionsText: "Sort answer text" }], required: false, open: false },
    ],
  },
  {
    document_name: "Q3 Training & Capacity Assessment",
    sub_title: "August 2026",
    doc_desc: "Third quarter training completion and capacity building assessment for all thana and branch officers.",
    range: "15",
    thana: true, branch: true, zonal: false,
    startDadeline: "2026-08-01", endDadeline: "2026-08-15",
    timeStart: "09:00", timeEnd: "17:00",
    questions: [
      { questionText: "Number of staff who attended Q3 training", questionType: "number", options: [{ optionsText: "Value must be number" }], required: true, open: false },
      { questionText: "Training topics covered", questionType: "text", options: [{ optionsText: "Sort answer text" }], required: true, open: false },
      { questionText: "Suggested training improvements", questionType: "text", options: [{ optionsText: "Sort answer text" }], required: false, open: false },
    ],
  },
];

const notices = [...pastNotices, ...activeNotices, ...upcomingNotices];

const seedNotices = async () => {
  try {
    await mongoose.connect(dbConnector);
    console.log("Connected to MongoDB\n");

    console.log("[1/2] Clearing existing notices...");
    await formModel.deleteMany({});

    console.log("[2/2] Inserting sample notices...");
    for (const notice of notices) {
      await formModel.create(notice);
      console.log(`      -> Created: "${notice.document_name}"`);
    }

    console.log("\n============================================");
    console.log("       NOTICE SEED COMPLETE - SUMMARY");
    console.log("============================================");
    console.log(`  Total notices seeded : ${notices.length}`);
    console.log(`  পূর্ব  (past)        : ${pastNotices.length}`);
    console.log(`  চলমান (active)       : ${activeNotices.length}`);
    console.log(`  আসবে  (upcoming)     : ${upcomingNotices.length}`);
    console.log("--------------------------------------------");
    console.log(`  Branch notices       : ${notices.filter((n) => n.branch).length}`);
    console.log(`  Thana notices        : ${notices.filter((n) => n.thana).length}`);
    console.log(`  Zonal notices        : ${notices.filter((n) => n.zonal).length}`);
    console.log("============================================");
  } catch (error) {
    console.error("\nNOTICE SEED ERROR:", error.message);
  } finally {
    await mongoose.connection.close();
    console.log("\nMongoDB connection closed.");
  }
};

module.exports = seedNotices;

// Run directly: node model/seeders/noticeSeeder.js
if (require.main === module) {
  seedNotices();
}
