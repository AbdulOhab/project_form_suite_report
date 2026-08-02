import React, { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { Navigate, useLocation } from "react-router-dom";

const AuthRoutes = ({ children }) => {
  const { checkAuth, authChecked } = useContext(AuthContext);
  const location = useLocation();

  // Always remember the requested location so that once the (async) auth
  // check resolves, Login can send the user back here instead of the
  // generic /dashboard — this must be captured before auth is confirmed,
  // since that's the render where a reload would otherwise lose it.
  window.authPrevlink = location;

  // Wait for the token check to actually resolve before deciding — on a
  // reload, checkAuth starts out false while the request is in flight, so
  // redirecting immediately would flash the login page for every visit.
  if (!authChecked) return null;

  return checkAuth?.isAuth ? children : <Navigate to="/login" />;
};

export default AuthRoutes;
