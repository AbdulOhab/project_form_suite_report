import React from "react";
import { useEffect } from "react";
import { useState } from "react";
import Pagination from "./usersTable/Pagination";
import BASE_URL from "../../auth/dbUrl";
import ZonalTableBody from "./usersTable/ZonalTableBody";
import { Link } from "react-router-dom";

function ZonalUsers() {
  const [userData, setUserData] = useState([]);
  const [currentPage, setCurrenPage] = useState(1);
  const [usersPerPage, setUsersPerPage] = useState(25);

  useEffect(() => {
    const getZonalUsers = async () => {
      try {
        let response = await fetch(`${BASE_URL}/zonal-users`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + window.localStorage.getItem("gsmToken"),
          },
        });
        let data = await response.json();
        // console.log(response.status);
        if (!response.ok) {
          throw new Error("get notice data failed");
        }
        if (response.ok) {
          // console.log(data);
          setUserData(data);
        }
      } catch (error) {
        console.error("Error fetching notice data:", error);
        // Handle error
      }
    };
    getZonalUsers();
  }, []);

  // get current users
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = userData.slice(indexOfFirstUser, indexOfLastUser);

  const selectHandler = (e) => {
    e.preventDefault();
    setUsersPerPage(e.target.value);
  };

  const paginate = (pageNumber) => setCurrenPage(pageNumber);
  return (
    <div className="mt-3">
      <div className="bg-white p-3 rounded">
        <div className="d-flex align-items-center justify-content-between">
          <div className="mb-3">
            <select
              onChange={selectHandler}
              className="form-select-custom"
              name=""
              value={usersPerPage}
            >
              <option value={25}>{25}</option>
              <option value={Math.ceil(userData?.length / 16)}>
                {Math.ceil(userData?.length / 16)}
              </option>
              <option value={Math.ceil(userData?.length / 8)}>
                {Math.ceil(userData?.length / 8)}
              </option>
              <option value={Math.ceil(userData?.length / 4)}>
                {Math.ceil(userData?.length / 4)}
              </option>
              <option value={Math.ceil(userData?.length / 2)}>
                {Math.ceil(userData?.length / 2)}
              </option>
              <option value={Math.ceil(userData?.length)}>
                {Math.ceil(userData?.length)}
              </option>
            </select>
          </div>
          <div className="">
            <h2 className="text-center text-success fw-bold">
              অঞ্চল সমূহ
            </h2>
          </div>
          <div className="backButton">
            <Link className="button fs-5 p-2" to={`/dashboard`}>
              <span>Back</span>
            </Link>
          </div>
        </div>

        <ZonalTableBody users={currentUsers} />
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

export default ZonalUsers;
