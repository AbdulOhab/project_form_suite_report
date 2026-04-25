import React, { useContext, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContext";

const BackendHeader = ({ role, userName }) => {
  const { logout, userInfo } = useContext(AuthContext);

  useEffect(() => {
    // Toggle the side navigation
    const sidebarToggle = document.getElementById("sidebarToggle");

    if (sidebarToggle) {
      sidebarToggle.addEventListener("click", (event) => {
        event.preventDefault();
        document.body.classList.toggle("sb-sidenav-toggled");
        localStorage.setItem(
          "sb|sidebar-toggle",
          document.body.classList.contains("sb-sidenav-toggled")
        );
      });
    }
  }, [role]);

  return (
    <>
      <nav className="sb-topnav navbar navbar-expand bg-success  flex-row justify-content-between px-3 ">
        <div className="">
          {/* Navbar Brand */}
          <Link
            className="navbar-brand  text-light text-capitalize "
            to="/dashboard"
          >
            <span className="border border-white border-2 px-2 py-1 rounded-3 ">
              {role?.userRole} Panel
            </span>
          </Link>

          {/* Sidebar Toggle */}

          {role?.userRole === "admin" ? (
            <button
              id="sidebarToggle"
              className="btn  btn-sm border border-2 border-white ms-3"
            >
              <i className="fa fa-bars"></i>
            </button>
          ) : (
            ""
          )}
        </div>

        {role?.userRole === "admin" ? (
          <Link
            to={`notice/${parseInt(Math.random() * 1000000000)}`}
            className="homeButton text-nowrap"
          >
            Create Notice
          </Link>
        ) : (
          <div className="border border-white rounded-3 ">
            <button className="text-center text-uppercase text-light  btn">
              {userName}
            </button>
          </div>
        )}
        <div className={`col-lg-7 d-md-none d-lg-block d-sm-none d-none  `}>
          <h2 className="text-center fw-bold text-highlight">
            <span className="bg-success px-2 rounded">
              রিপোর্ট সেন্টারে আপনাকে স্বাগতম
            </span>
          </h2>
        </div>

        {/* Navbar */}
        <div className="text-end border  rounded-3">
          <ul className="navbar-nav ms-auto ms-md-0 me-3">
            <li className="nav-item dropdown">
              <Link
                className="nav-link dropdown-toggle"
                id="navbarDropdown"
                to="#"
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                <i className="fas fa-user text-highlight"></i>
              </Link>
              <ul
                className="dropdown-menu dropdown-menu-end "
                aria-labelledby="navbarDropdown"
              >
                {/* <li>
                <a className="dropdown-item" href="#!">
                  Settings
                </a>
              </li>
              <li>
                <a className="dropdown-item" href="#!">
                  Activity Log
                </a>
              </li>
              <li>
                <hr className="dropdown-divider" />
              </li> */}
                <li>
                  <a
                    className="dropdown-item "
                    href="/"
                    onClick={() => window.confirm("logout") && logout()}
                  >
                    @{userInfo?.userName} <br />
                    Logout
                  </a>
                </li>
              </ul>
            </li>
          </ul>
        </div>
      </nav>
    </>
  );
};

export default BackendHeader;
