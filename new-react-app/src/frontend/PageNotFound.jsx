import React from "react";
import { Link } from "react-router-dom";

const PageNotFound = () => {
  return (
    <>
      <div
        className={`d-flex flex-column align-items-center gap-2 p-5 min-vh-100 container`}
      >
        <img
          src="/assects/images/404.png"
          alt="not found"
          className={`img-thumbnail w-25 rounded-5`}
        />
        <h1 className="fw-bold text-white my-3 fs-1">Page Not Found</h1>

        <p className="text-white fs-6">
          <Link className="btn btn-light fs-5" to={`/`}>
            Return Home Page
          </Link>
        </p>
        <div className="mt-auto text-center">
          <img
            src="/assects/images/logo.webp"
            alt="logo"
            style={{ width: "80px", height: "80px" }}
            className=" border border-3 border-success rounded-5 "
          />
        </div>
      </div>
    </>
  );
};

export default PageNotFound;
