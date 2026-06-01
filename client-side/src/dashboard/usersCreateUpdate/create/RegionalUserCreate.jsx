import React from "react";
import { useNavigate } from "react-router-dom";
import BASE_URL from "../../../auth/dbUrl";
import Swal from "sweetalert2";
import SweetAlert from "../../time/SweetAlert";

function RegionalUserCreate() {
  const navigate = useNavigate();
  function submitHandler(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    fetch(`${BASE_URL}/create-zonal-users`, {
      method: "POST",
      headers: {
        Authorization: "Bearer " + window.localStorage.getItem("gsmToken"),
      },
      body: formData,
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
      });
  }
  return (
    <div className="col-md-5 col-lg-5 col-sm-12 m-auto ">
      <div className="my-5">
        <div className=" p-1 rounded">
          <div className="card shadow ">
            <div className="card-header bg-secondary bg-opacity-75 border border-5 border-light">
              <h1 className="text-center text-uppercase text-highlight bg-success rounded">
                Crate Regional
              </h1>
            </div>
            <div className="card-body bg-body-secondary  border border-5 border-light">
              <form onSubmit={submitHandler}>
                <div className="form-group">
                  {/* <label htmlFor="email">Email address</label> */}
                  <input
                    type="number"
                    name="userId"
                    className="form-control"
                    id="userId"
                    placeholder="Enter user ID"
                    required
                  />
                </div>
                <div className="form-group mt-3">
                  {/* <label htmlFor="password">Password</label> */}
                  <input
                    type="password"
                    name="password"
                    className="form-control"
                    id="password"
                    placeholder="Password"
                    required
                  />
                </div>

                <div className="form-group mt-3">
                  {/* <label htmlFor="userName">User Name</label> */}
                  <input
                    type="text"
                    name="userName"
                    className="form-control"
                    id="userName"
                    placeholder="User Name"
                    required
                  />
                </div>

                <div className="form-group mt-3">
                  {/* <label htmlFor="zonalCode">Zonal Code</label> */}
                  <input
                    type="number"
                    name="zonalCode"
                    className="form-control"
                    id="zonalCode"
                    placeholder="Zonal Code"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-success text-highlight mt-3 float-end"
                >
                  Create
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegionalUserCreate;
