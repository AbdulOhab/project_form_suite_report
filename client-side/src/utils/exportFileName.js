// Builds a consistent Excel export filename: {UserId}_{Role}_{Title}_{YYYY-MM-DD_HH-mm}.xlsx
export const buildExportFileName = (userId, role, title) => {
  const safeTitle = (title || "Report")
    .toString()
    .trim()
    .replace(/[^\p{L}\p{N}\p{M}]+/gu, "-")
    .replace(/^-+|-+$/g, "") || "Report";

  const pad = (n) => String(n).padStart(2, "0");
  const now = new Date();
  const stamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}-${pad(now.getMinutes())}`;

  return `${userId || "user"}_${role}_${safeTitle}_${stamp}.xlsx`;
};
