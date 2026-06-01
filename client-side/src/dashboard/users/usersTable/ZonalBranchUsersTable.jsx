import React, { useEffect, useState } from "react";
import BASE_URL from "../../../auth/dbUrl";
import Pagination from "./Pagination";
import ZonalBranchesTable from "./ZonalBranchesTable";
import { Link, useLocation, useParams } from "react-router-dom";

const ZonalBranchUsersTable = () => {
  const location = useLocation(); // Access the current location
  const queryParams = location.search;
  const [zonalName, setZonalName] = useState("");

  const { zonalId } = useParams();

  const [userData, setUserData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage, setUsersPerPage] = useState(25);
  useEffect(() => {
    const getBranchUsers = async () => {
      try {
        let response = await fetch(
          `${BASE_URL}/get-branch-users-by-zonal/${zonalId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization:
                "Bearer " + window.localStorage.getItem("gsmToken"),
            },
          }
        );

        let data = await response.json();

        if (!response.ok) {
          throw new Error("Failed to fetch branch users data");
        }
        if (response.ok) {
          setUserData(data?.branch);
          setZonalName(data?.zonalName);
        }
      } catch (error) {
        console.error("Error fetching branch users data:", error);
        // Handle error as needed
      }
    };
    getBranchUsers();
  }, [zonalId]);

  // get current users
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = userData.slice(indexOfFirstUser, indexOfLastUser);

  const selectHandler = (e) => {
    e.preventDefault();
    setUsersPerPage(parseInt(e.target.value, 10));
    setCurrentPage(1); // Reset to the first page on items per page change
  };

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="mt-3">
      <div className="bg-white p-3 rounded">
        <div className="d-flex justify-content-between align-items-center my-3">
          {/* pagination value  */}
          <div className="pagiantionValue">
            <div className="form-group">
              <select
                onChange={selectHandler}
                className="form-select-custom"
                id="userS"
                value={usersPerPage}
              >
                <option value={25}>{25}</option>
                <option value={Math.ceil(userData.length / 16)}>
                  {Math.ceil(userData.length / 16)}
                </option>
                <option value={Math.ceil(userData.length / 8)}>
                  {Math.ceil(userData.length / 8)}
                </option>
                <option value={Math.ceil(userData.length / 4)}>
                  {Math.ceil(userData.length / 4)}
                </option>
                <option value={Math.ceil(userData.length / 2)}>
                  {Math.ceil(userData.length / 2)}
                </option>
                <option value={Math.ceil(userData.length)}>
                  {Math.ceil(userData.length)}
                </option>
              </select>
            </div>
          </div>
          {/* branch name  */}
          <div className="BranchName">
            <h2 className="text-center text-success fw-bold">
              {zonalName?.userName}
            </h2>
          </div>
          {/* back button  */}
          <div className="backButton ">
            <Link
              className="button fs-5 p-2"
              to={`/dashboard/zonal-users${queryParams}`}
            >
              <span>Back</span>
            </Link>
          </div>
        </div>
        {/* branch users table  */}
        <ZonalBranchesTable users={currentUsers} />

        {/* pagination  & data length  */}
        <div className="d-flex justify-content-between align-items-center">
          <div className="userAndDataLength">
            <p className="border p-2 rounded">
              Showing {currentUsers.length} of {userData.length} users
            </p>
          </div>
          <div className="pagination-container">
            <Pagination
              usersPerPage={usersPerPage}
              totalUsers={userData.length}
              paginate={paginate}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ZonalBranchUsersTable;
