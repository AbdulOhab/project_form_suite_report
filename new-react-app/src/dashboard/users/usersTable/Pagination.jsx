import React, { useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

function Pagination({ usersPerPage, totalUsers, paginate }) {
  const { zonalId, branchId } = useParams();

  const location = useLocation(); // Get query parameters
  const navigate = useNavigate(); // Get current URL location

  const pageNumbers = [];

  for (let i = 1; i <= Math.ceil(totalUsers / usersPerPage); i++) {
    pageNumbers?.push(i);
  }
  useEffect(() => {
    // Check if path is /dashboard/zonal-users without query parameters
    if (location.pathname === "/dashboard/zonal-users" && !location.search) {
      navigate("/dashboard/zonal-users?page=1", { replace: true }); // Redirect to page=1
    }
  else  if (
      location.pathname === `/dashboard/zonal-branch/${zonalId}` &&
      !location.search
    ) {
      navigate(`/dashboard/zonal-branch/${zonalId}?page=1`, { replace: true });
    }

   else if (
      location.pathname ===
        `/dashboard/zonal-branch/${zonalId}/branch-thana/${branchId}` &&
      !location.search
    ) {
      navigate(
        `/dashboard/zonal-branch/${zonalId}/branch-thana/${branchId}?page=1`,
        { replace: true }
      );
    }
   
  }, [location, navigate, zonalId, branchId]);

  const handlePageClick = (number) => {
    paginate(number); // Call the paginate function for data loading
    navigate(`?page=${number}`); // Update the URL with the page number
  };

  return (
    <nav>
      <ul className="pagination flex-wrap gap-2">
        {pageNumbers.map((number) => (
          <li key={number} className="page-item ">
            <button
              onClick={() => handlePageClick(number)}
              className="page-link border"
            >
              {number}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default Pagination;
