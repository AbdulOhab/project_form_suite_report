import React, { useEffect, useState } from "react";
import Pagination from "./usersTable/Pagination";
import BASE_URL from "../../auth/dbUrl";
import ThanaTableBody from "./usersTable/ThanaTableBody";
import { Link, useParams } from "react-router-dom";

function ZonalBranchThana() {
  const { zonalId, branchId } = useParams();

  const [userData, setUserData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage, setUsersPerPage] = useState(25);
  const [branchName, setBranchName] = useState("");

  useEffect(() => {
    const getThanaUsers = async () => {
      try {
        let response = await fetch(`${BASE_URL}/get-thana-users/${branchId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + window.localStorage.getItem("gsmToken"),
          },
        });
        let data = await response.json();
        if (!response.ok) {
          throw new Error("get notice data failed");
        }
        setUserData(data.thana);
        setBranchName(data.branchName);
      } catch (error) {
        console.error("Error fetching notice data:", error);
      }
    };
    getThanaUsers();
  }, [branchId]);

  // Get current users
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = userData.slice(indexOfFirstUser, indexOfLastUser);

  const selectHandler = (e) => {
    setUsersPerPage(parseInt(e.target.value, 10));
    setCurrentPage(1); // Reset to the first page on items per page change
  };

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="mt-3">
      <div className="bg-white p-3 rounded">
        <div className="d-flex justify-content-between align-items-center my-3">
          {/* pagination value  */}
          <div className="">
            <select
              onChange={selectHandler}
              className="form-select-custom"
              value={usersPerPage}
            >
              <option value={25}>25</option>
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
          {/* branch Name  */}
          <div className="BranchName">
            <h2 className="text-center text-success fw-bold">
              {branchName?.userName}
            </h2>
          </div>
          {/* back button  */}
          <div className="backButton ">
            <Link
              className="button fs-5 p-2"
              to={`/dashboard/zonal-branch/${zonalId}`}
            >
              <span>Back</span>
            </Link>
          </div>
        </div>
        {/* thana user table  */}
        <ThanaTableBody users={currentUsers} />

        {/* pagination & total data  */}
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
}

export default ZonalBranchThana;
