// One-time backfill: assigns a stable questionId to every question in every
// notice (form_models_2024), then tags every already-submitted answer's
// answers[] entries with the matching questionId (matched by the question's
// CURRENT text — the same text the entry was originally submitted against).
//
// Why this is needed: reports used to match answers to report columns by
// questionText alone, so editing a question's wording later silently broke
// historical totals for that column. Going forward, sumsDataController
// matches by questionId first (stable across text edits), falling back to
// questionText only for entries this backfill can't confidently match.
//
// Safe to re-run: questions/entries that already have a questionId are left
// untouched. Entries whose questionText doesn't match any current question
// (already-drifted data predating this fix) are reported, not guessed at.
//
// Usage (run inside the app container in production, per DEPLOYMENT.md):
//   node model/seeders/backfillQuestionIds.js
// Or from server-side/ in local dev:
//   node model/seeders/backfillQuestionIds.js

const mongoose = require("mongoose");
require("dotenv").config();
const formModel = require("../formModel");
const answerModel = require("../answerModel");

const run = async () => {
  await mongoose.connect(process.env.MONGODB_URI);

  const notices = await formModel.find().exec();
  console.log(`Found ${notices.length} notice(s).`);

  let questionsAssigned = 0;
  let noticesTouched = 0;
  let answersTouched = 0;
  let entriesMatched = 0;
  let entriesUnmatched = 0;
  const unmatchedSamples = [];

  for (const notice of notices) {
    let noticeChanged = false;
    const byText = new Map();

    notice.questions.forEach((q, index) => {
      if (!q.questionId) {
        q.questionId = new mongoose.Types.ObjectId().toString();
        questionsAssigned++;
        noticeChanged = true;
      }
      if (q.questionText) byText.set(q.questionText, q.questionId);
    });

    if (noticeChanged) {
      notice.markModified("questions");
      // { timestamps: false } — this is metadata backfill, not a real edit;
      // letting mongoose bump updatedAt here already burned us once on the
      // answer side (see below) — report/table code elsewhere keys off it.
      await notice.save({ timestamps: false });
      noticesTouched++;
    }

    const answers = await answerModel.find({ noticeId: notice._id.toString() }).exec();

    for (const answer of answers) {
      let answerChanged = false;

      answer.answers.forEach((entry) => {
        if (entry.questionId) return; // already migrated
        const matchedId = entry.questionText ? byText.get(entry.questionText) : undefined;
        if (matchedId) {
          entry.questionId = matchedId;
          entriesMatched++;
          answerChanged = true;
        } else {
          entriesUnmatched++;
          if (unmatchedSamples.length < 20) {
            unmatchedSamples.push({
              noticeId: notice._id.toString(),
              noticeTitle: notice.document_name,
              answerId: answer._id.toString(),
              questionText: entry.questionText,
            });
          }
        }
      });

      if (answerChanged) {
        answer.markModified("answers");
        // { timestamps: false } is critical here: AdminTableDataInterfce's
        // per-day report buckets rows by answer.updatedAt. A plain save()
        // would silently bump every touched answer's updatedAt to "now",
        // shifting historical submissions into today's row in every report
        // (this happened once already during local testing — restored via
        // a one-off updatedAt=createdAt correction, not by this script).
        await answer.save({ timestamps: false });
        answersTouched++;
      }
    }
  }

  console.log("--- Backfill complete ---");
  console.log(`Notices touched:        ${noticesTouched}`);
  console.log(`Questions assigned ids: ${questionsAssigned}`);
  console.log(`Answer docs touched:    ${answersTouched}`);
  console.log(`Answer entries matched: ${entriesMatched}`);
  console.log(`Answer entries UNMATCHED (left without questionId): ${entriesUnmatched}`);
  if (unmatchedSamples.length) {
    console.log("Sample unmatched entries (first 20):");
    console.log(JSON.stringify(unmatchedSamples, null, 2));
  }

  await mongoose.disconnect();
};

run()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Backfill failed:", err);
    process.exit(1);
  });
