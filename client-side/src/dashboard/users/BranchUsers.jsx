import React, { useEffect, useState } from "react";
import Pagination from "./usersTable/Pagination";
import BASE_URL from "../../auth/dbUrl";
import BranchTableBody from "./usersTable/BranchTableBody";

function BranchUsers() {
  const [userData, setUserData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage, setUsersPerPage] = useState(25);

  useEffect(() => {
    const getBranchUsers = async () => {
      try {
        let response = await fetch(`${BASE_URL}/branch-users`, {
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
        setUserData(data);
      } catch (error) {
        console.error("Error fetching notice data:", error);
        // Handle error
      }
    };
    getBranchUsers();
  }, []);

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
        {/* header options  */}
        <div className="d-flex gap-2">
          <div className="mb-3 col-lg-1 col-md-1 col-sm-1">
            <div className="form-group">
              <select
                onChange={selectHandler}
                className="form-select"
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
          <div className="col-sm-10 col-md-10 col-lg-10 ">
            <h2 className="text-center text-success fw-bold">শাখা সমূহ</h2>
          </div>
        </div>
        {/* branch table  */}
        <BranchTableBody users={currentUsers} />
        {/* pagination and tatal data counter  */}
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

export default BranchUsers;
