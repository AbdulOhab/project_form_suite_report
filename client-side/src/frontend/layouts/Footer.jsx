import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <div className="container bg-success">
      <footer className="py-3 text-light">
        <div className="d-flex align-items-center justify-content-between small">
          <div className="text-light mx-5">Copyright © Your Website 2023</div>
          <div className="mx-5">
            <Link className="text-light" to="#">Privacy Policy</Link> &nbsp;
            <Link className="text-light" to="#">Terms &amp; Conditions</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Footer;
