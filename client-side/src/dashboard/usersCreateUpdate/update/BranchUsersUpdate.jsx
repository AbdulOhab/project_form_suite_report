import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import BASE_URL from "../../../auth/dbUrl";
import SweetAlert from "../../time/SweetAlert";

function BranchUsersUpdate() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [userId, setUserId] = useState("");
  const [userName, setUserName] = useState("");
  const [branchCode, setBranchCode] = useState("");
  const [zonalCode, setZonalCode] = useState("");

  // get thana data from database

  useEffect(() => {
    async function getThanaUser() {
      await fetch(`${BASE_URL}/get-branch-users/${id}`, {
        method: "POST",
        headers: {
          Authorization: "Bearer " + window.localStorage.getItem("gsmToken"),
        },
      })
        .then((res) => res.json())
        .then((res) => {
          setUserId(res?.userId);
          setUserName(res?.userName);
          setBranchCode(res?.branchCode);
          setZonalCode(res?.zonalCode);
        });
    }
    getThanaUser();
  }, [id]);

  // update handler function
  function updateHandler(e) {
    e.preventDefault();
    // const formData = new FormData(e.target);
    fetch(`${BASE_URL}/update-branch-users/${id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + window.localStorage.getItem("gsmToken"),
      },
      body: JSON.stringify({
        userId: userId,
        userName: userName,

        branchCode: branchCode,
        zonalCode: zonalCode,
      }),
    })
      .then(async (res) => {
        let data = await res.json();
        return {
          status: res.status,
          data,
        };
      })
      .then((res) => {
        if (res.status === 200) {
          SweetAlert({
            message: res.data,
            icon: "success",
          });
          navigate("/dashboard/branch-users");
        } else {
          SweetAlert({
            message: res.data,
            icon: "error",
          });
        }
      });
  }

  return (
    <div className="col-md-6 col-lg-6 col-sm-12 m-auto ">
      <div className="my-5">
        <div className=" p-1 rounded">
          <div className="card shadow ">
            <div className="card-header bg-success  border border-5 border-light rounded">
              <h2 className="text-center  text-highlight ">
                ব্রাঞ্চ হালনাগাদ করুন
              </h2>
            </div>
            <div className="card-body card-hover  border border-5 border-light">
              <form onSubmit={updateHandler}>
                <div className="d-flex justify-content-between align-items-center border-2 border-bottom pb-2 border-light">
                  <label htmlFor="userId" className="form-label w-25">
                    User ID
                  </label>
                  <div className="form-group w-75">
                    <input
                      type="number"
                      name="userId"
                      className="form-control"
                      id="userId"
                      placeholder="Enter User ID"
                      required
                      value={userId}
                      onChange={(e) => setUserId(e.target.value)}
                    />
                  </div>
                </div>
                <div className="d-flex justify-content-between align-items-center border-2 border-bottom py-2 border-light">
                  <label htmlFor="userName" className="form-lavel w-25">
                    User Name
                  </label>
                  <div className="form-group w-75">
                    <input
                      type="text"
                      name="userName"
                      className="form-control"
                      id="userName"
                      placeholder="User Name"
                      required
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                    />
                  </div>
                </div>
                <div className="d-flex justify-content-between align-items-center border-2 border-bottom py-2 border-light">
                  <label htmlFor="branchCode" className="form-label w-25">
                    Branch Code
                  </label>
                  <div className="form-group w-75">
                    <input
                      type="number"
                      name="branchCode"
                      className="form-control"
                      id="branchCode"
                      placeholder="Branch Code"
                      required
                      value={branchCode}
                      onChange={(e) => setBranchCode(e.target.value)}
                    />
                  </div>
                </div>
                <div className="d-flex justify-content-between align-items-center border-2 border-bottom py-2 border-light">
                  <label htmlFor="zonalCode" className="form-label w-25">
                    Zonal Code
                  </label>
                  <div className="form-group w-75">
                    <input
                      type="number"
                      name="zonalCode"
                      className="form-control "
                      id="zonalCode"
                      placeholder="Zonal Code"
                      required
                      value={zonalCode}
                      onChange={(e) => setZonalCode(e.target.value)}
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="btn btn-success text-highlight mt-3 float-end"
                >
                  Update
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BranchUsersUpdate;
