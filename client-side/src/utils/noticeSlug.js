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

// Route prefixes whose page reads the real ID from router `state` rather
// than the URL. That state only exists for in-app navigations — anything
// that restores a bare pathname (e.g. "return here after login") lands on
// these with no ID and nothing to show. Callers should redirect such paths
// to /dashboard instead of restoring them.
const STATE_ONLY_ROUTE_PREFIXES = [
  "/dashboard/notice-view/",
  "/dashboard/thana-submission/",
  "/dashboard/branch-data-interface/",
  "/dashboard/zonal-data-interface/",
  "/dashboard/admin-data-interface/",
];

export const isStateOnlyNoticeRoute = (pathname) =>
  STATE_ONLY_ROUTE_PREFIXES.some((prefix) => pathname?.startsWith(prefix));
