import React, { useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

function getVisiblePages(currentPage, totalPages) {
  const delta = 1; // pages around current
  const range = [];
  const rangeWithDots = [];

  for (
    let i = Math.max(2, currentPage - delta);
    i <= Math.min(totalPages - 1, currentPage + delta);
    i++
  ) {
    range.push(i);
  }

  if (currentPage - delta > 2) {
    range.unshift("...");
  }
  if (currentPage + delta < totalPages - 1) {
    range.push("...");
  }

  rangeWithDots.push(1);
  rangeWithDots.push(...range);
  if (totalPages > 1) {
    rangeWithDots.push(totalPages);
  }

  // deduplicate while keeping order
  return rangeWithDots.filter(
    (v, i, a) => a.indexOf(v) === i
  );
}

const btnStyle = (isActive) => ({
  minWidth: 36,
  height: 36,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: 4,
  border: "1px solid",
  borderColor: isActive ? "#1976d2" : "#ccc",
  backgroundColor: isActive ? "#1976d2" : "#fff",
  color: isActive ? "#fff" : "#333",
  fontWeight: isActive ? 700 : 400,
  cursor: "pointer",
  fontSize: 14,
  padding: "0 8px",
});

function Pagination({ usersPerPage, totalUsers, paginate, currentPage }) {
  const { zonalId, branchId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const totalPages = Math.ceil(totalUsers / usersPerPage);
  const visiblePages = getVisiblePages(currentPage, totalPages);

  useEffect(() => {
    if (!location.search) {
      const path = location.pathname;
      if (path === "/dashboard/zonal-users") {
        navigate("/dashboard/zonal-users?page=1", { replace: true });
      } else if (path === `/dashboard/zonal-branch/${zonalId}`) {
        navigate(`/dashboard/zonal-branch/${zonalId}?page=1`, { replace: true });
      } else if (
        path === `/dashboard/zonal-branch/${zonalId}/branch-thana/${branchId}`
      ) {
        navigate(
          `/dashboard/zonal-branch/${zonalId}/branch-thana/${branchId}?page=1`,
          { replace: true }
        );
      } else if (path === "/dashboard/users-list") {
        navigate("/dashboard/users-list?page=1", { replace: true });
      }
    }
  }, [location, navigate, zonalId, branchId]);

  const handlePageClick = (number) => {
    paginate(number);
    navigate(`?page=${number}`);
  };

  if (totalPages <= 1) return null;

  return (
    <nav>
      <ul
        style={{
          listStyle: "none",
          display: "flex",
          alignItems: "center",
          gap: 4,
          padding: 0,
          margin: 0,
        }}
      >
        {visiblePages.map((page, idx) =>
          page === "..." ? (
            <li key={`dots-${idx}`} style={{ display: "flex", alignItems: "center", px: 0.5 }}>
              <span style={{ padding: "0 6px", color: "#999", fontSize: 14 }}>
                &hellip;
              </span>
            </li>
          ) : (
            <li key={page}>
              <button
                onClick={() => handlePageClick(page)}
                style={btnStyle(page === currentPage)}
              >
                {page}
              </button>
            </li>
          )
        )}
      </ul>
    </nav>
  );
}

export default Pagination;
