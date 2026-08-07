// Finds thana answer documents that duplicate an earlier same-day submission
// for the same notice (e.g. from a double-click/retry before createAnswer's
// duplicate check existed — see answerController.js) and removes the extras,
// keeping the most recent per (notice, thana, day). Works across ALL notices,
// not just one.
//
// Defaults to a DRY RUN — reports what it would delete without deleting
// anything. Pass --apply to actually delete. Always take a DB backup first
// when running against production.
//
// Usage (run inside the app container in production, per DEPLOYMENT.md):
//   docker compose exec app node model/seeders/dedupeAnswerDuplicates.js            # dry run
//   docker compose exec app node model/seeders/dedupeAnswerDuplicates.js --apply    # deletes
// Local dev, from server-side/:
//   node model/seeders/dedupeAnswerDuplicates.js [--apply]

const mongoose = require("mongoose");
require("dotenv").config();
const answerModel = require("../answerModel");

// Same "day" definition used elsewhere (answerController.js, dataCheckController.js):
// Bangladesh wall-clock (UTC+6), since notice/report days are defined in BD time
// regardless of the server's own timezone.
const BD_OFFSET_MS = 6 * 60 * 60 * 1000;
const bangladeshDayKey = (date) =>
  new Date(new Date(date).getTime() + BD_OFFSET_MS).toISOString().split("T")[0];

const run = async () => {
  const apply = process.argv.includes("--apply");
  await mongoose.connect(process.env.MONGODB_URI);

  const all = await answerModel.find().lean();
  console.log(`Scanning ${all.length} answer document(s) across all notices...`);

  // Group by (notice, thana, day) — same reportDate string if the docs have
  // one, else the same Bangladesh calendar day of createdAt. Two docs in the
  // same group are duplicates of the same day's report, not separate days.
  const groups = new Map();
  all.forEach((doc) => {
    const dayKey = doc.reportDate || bangladeshDayKey(doc.createdAt);
    const key = `${doc.noticeId}|${doc.thanaCode}|${dayKey}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(doc);
  });

  let dupGroups = 0;
  const toDelete = [];
  groups.forEach((docs) => {
    if (docs.length <= 1) return;
    dupGroups++;
    docs.sort(
      (a, b) =>
        new Date(b.createdAt) - new Date(a.createdAt) ||
        String(b._id).localeCompare(String(a._id))
    );
    toDelete.push(...docs.slice(1)); // keep docs[0] (latest), drop the rest
  });

  console.log(`Duplicate (notice, thana, day) groups found: ${dupGroups}`);
  console.log(`Documents that would be deleted: ${toDelete.length}`);

  if (!toDelete.length) {
    console.log("Nothing to do.");
    await mongoose.disconnect();
    return;
  }

  console.log("Sample (first 20):");
  console.log(
    JSON.stringify(
      toDelete.slice(0, 20).map((d) => ({
        id: d._id.toString(),
        noticeId: d.noticeId,
        thanaCode: d.thanaCode,
        reportDate: d.reportDate,
        createdAt: d.createdAt,
      })),
      null,
      2
    )
  );

  if (!apply) {
    console.log("\nDRY RUN — nothing deleted. Re-run with --apply to actually delete these.");
    await mongoose.disconnect();
    return;
  }

  const result = await answerModel.deleteMany({ _id: { $in: toDelete.map((d) => d._id) } });
  console.log(`Deleted ${result.deletedCount} duplicate document(s).`);
  await mongoose.disconnect();
};

run()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Failed:", err);
    process.exit(1);
  });
