// Builds a readable "title-slug" for notice-view URLs. The real document ID
// travels separately via router navigation state (see NoticeBoard/NoticeDetail)
// rather than living in the URL.
export const buildNoticeSlug = (notice) => {
  const titleSlug = (notice?.document_name || "")
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\p{M}]+/gu, "-")
    .replace(/^-+|-+$/g, "");

  return titleSlug || "notice";
};
