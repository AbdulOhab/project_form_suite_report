import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import BASE_URL from "../../../auth/dbUrl";
import SweetAlert from "../../time/SweetAlert";

function RegionalUsersUpdate() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [userId, setUserId] = useState("");
  const [userName, setUserName] = useState("");
  const [zonalCode, setZonalCode] = useState("");

  // get thana data from database

  useEffect(() => {
    async function getThanaUser() {
      await fetch(`${BASE_URL}/get-zonal-users/${id}`, {
        method: "GET",
        headers: {
          Authorization: "Bearer " + window.localStorage.getItem("gsmToken"),
        },
      })
        .then((res) => res.json())
        .then((res) => {
          setUserId(res?.userId);
          setUserName(res?.userName);
          setZonalCode(res?.zonalCode);
        })
        .catch((err) => {
          SweetAlert({
            icon: "error",
            message: err.message,
          });
        });
    }
    getThanaUser();
  }, [id]);

  // update handler function
  function updateHandler(e) {
    e.preventDefault();
    // const formData = new FormData(e.target);
    fetch(`${BASE_URL}/update-zonal-users/${id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + window.localStorage.getItem("gsmToken"),
      },
      body: JSON.stringify({
        userId: userId,

        userName: userName,
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
          navigate("/dashboard/zonal-users");
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

  return (
    <div className="col-md-5 col-lg-5 col-sm-12 m-auto ">
      <div className="my-5">
        <div className=" p-1 rounded">
          <div className="card shadow ">
            <div className="card-header bg-secondary bg-opacity-75 border border-5 border-light">
              <h2 className="text-center text-uppercase text-highlight bg-success rounded">
                অঞ্চলের তথ্য হালনাগাদ করুন
              </h2>
            </div>
            <div className="card-body card-hover  border border-5 border-light">
              <form onSubmit={updateHandler}>
                <div className="form-group">
                  <input
                    type="number"
                    name="userId"
                    className="form-control"
                    id="userId"
                    placeholder="Enter userId"
                    required
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                  />
                </div>

                <div className="form-group mt-3">
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

                <div className="form-group mt-3">
                  <input
                    type="number"
                    name="zonalCode"
                    className="form-control"
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

export default RegionalUsersUpdate;
