import { React, useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContext";

const Nav = () => {
  const { checkAuth, logout } = useContext(AuthContext);
  return (
    <div className="container pt-3 px-0">
      <nav className="navbar bg-success">
        <div className="container-fluid">
          <Link className="navbarBrand ms-5" to="/">
            <i className="fa fa-eye" aria-hidden="true"></i>
          </Link>

          <ul className="justify-content-end list-inline d-flex gap-3 align-items-center m-1 p-1">
            {/* <li className="navItem">
                <Link className="navLink" aria-current="page" to="/">
                  Home
                </Link>
              </li>
              <li className="navItem">
                <Link className="navLink" to="/about">
                  About
                </Link>
              </li>
              <li className="navItem">
                <Link className="navLink" to="/contact">
                  Contact Us
                </Link>
              </li> */}
            <li className="navItem">
              {!checkAuth?.isAuth ? (
                <Link className="homeButton" to="/login">
                  Login
                </Link>
              ) : (
                <a
                  className="homeButton"
                  href="/"
                  onClick={() => window.confirm("logout") && logout()}
                >
                  logout
                </a>
              )}
            </li>
            <li className="navItem">
              {checkAuth?.isAuth ? (
                <Link className="homeButton" to="/dashboard">
                  Dashboard
                </Link>
              ) : (
                false
              )}
            </li>
          </ul>
        </div>
      </nav>
    </div>
  );
};

export default Nav;
