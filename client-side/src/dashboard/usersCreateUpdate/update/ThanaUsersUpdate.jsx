import React from "react";
import BASE_URL from "../../../auth/dbUrl";
import {  useParams } from "react-router-dom";
import { useEffect } from "react";
import { useState } from "react";
import SweetAlert from "../../time/SweetAlert";

function ThanaUsersUpdate() {
  const { id } = useParams();

  const [userId, setUserId] = useState("");
  const [userName, setUserName] = useState("");
  const [thanaCode, setThanaCode] = useState("");
  const [branchCode, setBranchCode] = useState("");
  const [zonalCode, setZonalCode] = useState("");

  // get thana data from database

  useEffect(() => {
    async function getThanaUser() {
      await fetch(`${BASE_URL}/get-thana-users-for-update/${id}`, {
        method: "POST",
        headers: {
          Authorization: "Bearer " + window.localStorage.getItem("gsmToken"),
        },
      })
        .then((res) => res.json())
        .then((res) => {
          setUserId(res?.userId);
          setUserName(res?.userName);
          setThanaCode(res?.thanaCode);
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
    fetch(`${BASE_URL}/update-thana-users/${id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + window.localStorage.getItem("gsmToken"),
      },
      body: JSON.stringify({
        userId: userId,
        userName: userName,
        thanaCode: thanaCode,
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
            icon: "success",
            message: res.data,
          });
          reset()
        } else {
          SweetAlert({
            icon: "error",
            message: res.data,
          });
        }
      })
      .catch((err) => {
        SweetAlert({
          icon: "error",
          message: err.message,
        });
      });
  }

  const reset = () => {
    setUserId("");
    setUserName("");
    setThanaCode("");
    setBranchCode("");
    setZonalCode("");
  }
  return (
    <div className="col-md-5 col-lg-5 col-sm-12 m-auto ">
      <div className="my-5">
        <div className=" p-1 rounded">
          <div className="card shadow ">
            <div className="card-header bg-success text-highlight border border-5 border-light">
              <h1 className="text-center">থানার তথ্য হালনাগাদ করুন</h1>
            </div>
            <div className="card-body card-hover   border border-5 border-light">
              <form onSubmit={updateHandler}>
                <div className="form-group  d-flex justify-content-between align-items-center border-bottom border-light border-3 pb-2">
                  <label htmlFor="userId" className="form-label w-25 pt-2">
                    User ID
                  </label>
                  <input
                    type="number"
                    name="userId"
                    className="form-control w-75"
                    id="UserId"
                    placeholder="Enter UserId"
                    required
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                  />
                </div>

                <div className="form-group d-flex justify-content-between align-items-center pb-2 my-3 border-bottom border-light border-3">
                  <label htmlFor="userName" className="form-label w-25 pt-2">
                    User Name
                  </label>
                  <input
                    type="text"
                    name="userName"
                    className="form-control w-75"
                    id="userName"
                    placeholder="User Name"
                    required
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                  />
                </div>
                <div className="form-group d-flex justify-content-between align-items-center pb-2 my-3  border-bottom border-light border-3">
                  <label htmlFor="thanaCode" className="form-label w-25 pt-2">
                    Thana Code
                  </label>
                  <input
                    type="number"
                    name="thanaCode"
                    className="form-control w-75"
                    id="thanaCode"
                    placeholder="Thana Code"
                    required
                    value={thanaCode}
                    onChange={(e) => setThanaCode(e.target.value)}
                  />
                </div>

                <div className="form-group d-flex justify-content-between align-items-center pb-2 my-3  border-bottom border-light border-3">
                  <label htmlFor="branchCode" className="form-label w-25 pt-2">
                    Branch Code
                  </label>
                  <input
                    type="number"
                    name="branchCode"
                    className="form-control w-75"
                    id="branchCode"
                    placeholder="Branch Code"
                    required
                    value={branchCode}
                    onChange={(e) => setBranchCode(e.target.value)}
                  />
                </div>

                <div className="form-group d-flex justify-content-between align-items-center pb-2 my-3  border-bottom border-light border-3">
                  <label htmlFor="zonalCode" className="form-label w-25 pt-2">
                    Zonal Code
                  </label>
                  <input
                    type="number"
                    name="zonalCode"
                    className="form-control w-75"
                    id="zonalCode"
                    placeholder="Zonal Code"
                    required
                    value={zonalCode}
                    onChange={(e) => setZonalCode(e.target.value)}
                  />
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

export default ThanaUsersUpdate;
