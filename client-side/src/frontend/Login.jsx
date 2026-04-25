import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import BASE_URL from "../auth/dbUrl";
import SweetAlert from "../dashboard/time/SweetAlert";

const Login = () => {
  const [formErrors, setFormErrors] = useState();
  const { checkAuth, setcheckAuth } = useContext(AuthContext);

  const navigate = useNavigate();
  useEffect(() => {
    const storedPath = sessionStorage.getItem("authPrevlink") || "/dashboard";
    const pathName = window?.authPrevlink?.pathname || storedPath;

    if (checkAuth?.isAuth && pathName) {
      navigate(pathName);
      sessionStorage.setItem("authPrevlink", pathName); // Store the last visited path
    } else if (checkAuth?.isAuth) {
      navigate("/dashboard");
    } else {
      navigate("/login");
    }

    // Optionally, remove the global variable if no longer needed
    // delete window.authPrevlink;
  }, [checkAuth, navigate]);

  async function submitHandler(e) {
    e.preventDefault();
    const formData = new FormData(e.target);

    setFormErrors({}); // Initialize formErrors as an empty object

    await fetch(`${BASE_URL}/submit`, {
      method: "POST",
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
        if (res.status === 422) {
          let tempError = {
            userId: [],
            password: [],
          };
          res.data?.errors?.forEach((e, index) => {
            if (!tempError[e.path]) {
              tempError[e.path] = [];
            }
            tempError[e.path].push(
              <li
                key={index}
                className="alert alert-danger mt-1 text-center fw-bold text-capitalize"
              >
                {e.msg}
              </li>
            );
          });
          setFormErrors(tempError);
        }
        if (res.status === 200) {
          window.localStorage.setItem("gsmToken", res.data.token);
          setcheckAuth({
            isAuth: true,
            gsmToken: res.data.token,
          });
          SweetAlert({
            icon: "success",
            message: res.data.message,
          });
        } else if (res.status === 404) {
          SweetAlert({
            icon: "error",
            message: res.data.message,
          });
        } else {
          SweetAlert({
            icon: "error",
            message: res.data.errors[0].msg,
          });
        }
      })
      .catch((err) => {
        console.log(err, "error");
        SweetAlert({
          icon: "error",
          message: err.message,
        });
      });
  }

  return (
    <>
      {!checkAuth?.isAuth ? (
        <div className="loginPage">
          <div className="container">
            <div className="col-lg-6 col-md-6 col-ms-12 m-auto">
              <div className="card shadow rounded my-3">
                <div className="shadow">
                  <h3 className="text-center text-success fw-bold  my-4">
                    Login
                  </h3>
                </div>
                <div className="card-body">
                  <form
                    method="POST"
                    onSubmit={submitHandler}
                    encType="multipart/form-data"
                    action="/submit"
                  >
                    <div className="form-floating mb-3">
                      <input
                        className="form-control"
                        id="userId"
                        type="number"
                        name="userId"
                        placeholder="userId"
                      />
                      <label htmlFor="userId">User ID</label>
                      <ul className="list-unstyled">{formErrors?.userId}</ul>
                    </div>

                    <div className="form-floating mb-3">
                      <input
                        className="form-control"
                        id="inputPassword"
                        type="password"
                        name="password"
                        placeholder="Password"
                      />
                      <label htmlFor="inputPassword">Password</label>
                      <ul className="list-unstyled">{formErrors?.password}</ul>
                    </div>

                    <button type="submit" className="btn btn-success float-end">
                      Submit
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        ""
      )}
    </>
  );
};

export default Login;
