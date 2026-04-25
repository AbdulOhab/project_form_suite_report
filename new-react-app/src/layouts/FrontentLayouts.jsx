import React from "react";
import Footer from "../frontend/layouts/Footer";
import { Outlet } from "react-router-dom";
import Nav from "../frontend/layouts/Nav";

const FrontentLayouts = () => {
  return (
    <div className="backgroundImage min-vh-100">
      <Nav />
      <Outlet />
      <Footer />
    </div>
  );
};

export default FrontentLayouts;
