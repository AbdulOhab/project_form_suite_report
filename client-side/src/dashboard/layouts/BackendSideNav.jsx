import React from "react";
import { Link } from "react-router-dom";

const BackendSideNav = () => {
  return (
    <>
      <nav
        className="sb-sidenav accordion sb-sidenav-dark"
        id="sidenavAccordion"
      >
        <div className="sb-sidenav-menu">
          <div className="nav">
            <div className="sb-sidenav-menu-heading">Core</div>
            <Link className="nav-link" to="/dashboard">
              <div className="sb-nav-link-icon gsm">
                <i className="fas fa-home" aria-hidden="true"></i>
              </div>
              Dashboard
            </Link>

            <div className="sb-sidenav-menu-heading">Interface</div>

            {/* USERS CREATE  */}
            <div className="userCreateAndUpdate">
              <a
                className="nav-link collapsed"
                href="#/"
                data-bs-toggle="collapse"
                data-bs-target="#collapseLayoutsCreateUsers"
                aria-expanded="false"
                aria-controls="collapseLayoutsCreateUsers"
              >
                <div className="sb-nav-link-icon">
                  <i className="fas fa-columns"></i>
                </div>
                Create Users
                <div className="sb-sidenav-collapse-arrow">
                  <i className="fas fa-angle-down"></i>
                </div>
              </a>
              <div
                className="collapse"
                id="collapseLayoutsCreateUsers"
                aria-labelledby="headingOne"
                data-bs-parent="#sidenavAccordion"
              >
                <nav className="sb-sidenav-menu-nested nav">
                  <Link
                    className="nav-link collapsed text-capitalize"
                    to={"upload-user-file"}
                  >
                    upload user file
                  </Link>
                  <Link className="nav-link collapsed" to={"create-zonal"}>
                    Create Region
                  </Link>

                  <Link className="nav-link collapsed" to="create-branch">
                    Create Branch
                  </Link>
                  <Link className="nav-link collapsed" to={"create-thana"}>
                    Create Thana
                  </Link>
                </nav>
              </div>
            </div>

            {/* USERS Pannel  */}
            <div className="UsersPannel">
              <a
                className="nav-link collapsed"
                href="#/"
                data-bs-toggle="collapse"
                data-bs-target="#collapseLayouts-user"
                aria-expanded="false"
                aria-controls="collapseLayouts-user"
              >
                <div className="sb-nav-link-icon">
                  <i className="fas fa-columns"></i>
                </div>
                Users List
                <div className="sb-sidenav-collapse-arrow">
                  <i className="fas fa-angle-down"></i>
                </div>
              </a>
              <div
                className="collapse"
                id="collapseLayouts-user"
                aria-labelledby="headingOne"
                data-bs-parent="#sidenavAccordion"
              >
                <nav className="sb-sidenav-menu-nested nav">
                  <Link className="nav-link collapsed" to={"zonal-users"}>
                    <div className="sb-nav-link-icon">
                      <i className="fa-solid fa-user-secret gsm"></i>
                    </div>
                    Region Users
                  </Link>

                  <Link className="nav-link collapsed" to="branch-users">
                    <div className="sb-nav-link-icon">
                      <i className="fa-solid fa-user-plus gsm"></i>
                    </div>
                    Branch Users
                  </Link>
                  {/* <Link className="nav-link collapsed" to={"thana-users"}>
                    <div className="sb-nav-link-icon gsm">
                      <i className="fa-solid fa-users"></i>
                    </div>
                    Thana Users
                  </Link> */}
                </nav>
              </div>
            </div>

            {/* data submitssion interface  */}
            <Link className="nav-link collapsed" to="admin-submission">
              <div className="sb-nav-link-icon">
                <i
                  className="fa-solid fa-address-card gsm"
                  aria-hidden="true"
                ></i>
              </div>
              Admin Reviews
            </Link>
            <Link className="nav-link collapsed" to="#">
              <div className="sb-nav-link-icon">
                <i className="fa-solid fa-address-card gsm"></i>
              </div>
              Regional Reviews
            </Link>
            <Link className="nav-link collapsed" to="#">
              <div className="sb-nav-link-icon">
                <i className="fa-solid fa-address-card gsm"></i>
              </div>
              Branch Reviews
            </Link>

            {/* user interface  */}
            <Link className="nav-link collapsed" to="#">
              <div className="sb-nav-link-icon">
                <i className="fa-solid fa-user-check gsm"></i>
              </div>
              Main Users
            </Link>

            {/* <div className="sb-sidenav-menu-heading">Pages</div> */}
          </div>
        </div>
        <div className="homeBackButton py-3">
          <Link className="homeButton ps-3  my-3" to="/">
            <i className="fa fa-home fa-fade" aria-hidden="true"></i> &nbsp;
          </Link>
        </div>
      </nav>
    </>
  );
};

export default BackendSideNav;
