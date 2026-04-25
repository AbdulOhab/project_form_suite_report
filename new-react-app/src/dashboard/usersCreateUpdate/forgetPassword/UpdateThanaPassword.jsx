import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import BASE_URL from "../../../auth/dbUrl";
import Swal from "sweetalert2";

function UpdateThanaPassword() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [password1, setPassword1] = useState("");
  const [password2, setPassword2] = useState("");

  // get thana data from database

  // useEffect(() => {
  //   async function getThanaUser() {
  //     await fetch(`${BASE_URL}/get-thana-users/${id}`, {
  //       method: "GET",
  //       headers: {
  //         Authorization: "myworld " + window.localStorage.getItem("gsmToken"),
  //       },
  //     })
  //       .then((res) => res.json())
  //       .then((res) => {

  //       });
  //   }
  //   getThanaUser();
  // }, [id]);

  // update handler function
  function updateHandler(e) {
    e.preventDefault();
    // const formData = new FormData(e.target);
    fetch(`${BASE_URL}/update-thana-password/${id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "myworld " + window.localStorage.getItem("gsmToken"),
      },
      body: JSON.stringify({
        password1: password1,
        password2: password2,
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
          Swal.fire({
            position: "top-end",
            icon: "success",
            title: "Password updated Successfully",
            showConfirmButton: false,
            timer: 1500,
          });
          navigate("/dashboard");
        } else {
          Swal.fire({
            icon: "error",
            title: "Password does not match!",
            // title: "Oops...",
            // text: "Password does not match!",
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
              <h1 className="text-center text-uppercase text-light">Thana</h1>
            </div>
            <div className="card-body bg-body-secondary  border border-5 border-light">
              <form onSubmit={updateHandler}>
                <div className="form-group mt-3">
                  {/* <label htmlFor="password">Password</label> */}
                  <input
                    type="password"
                    name="password1"
                    className="form-control"
                    id="password1"
                    placeholder="New Password"
                    required
                    value={password1}
                    onChange={(e) => setPassword1(e.target.value)}
                  />
                </div>
                <div className="form-group mt-3">
                  {/* <label htmlFor="password">Password</label> */}
                  <input
                    type="password"
                    name="password2"
                    className="form-control"
                    id="password2"
                    placeholder="New Password"
                    required
                    value={password2}
                    onChange={(e) => setPassword2(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-secondary mt-3 float-end"
                >
                  Update Password
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UpdateThanaPassword;
