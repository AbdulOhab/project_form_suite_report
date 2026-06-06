import { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { Navigate } from "react-router-dom";

const RoleRoute = ({ children, roles }) => {
  const { userInfo } = useContext(AuthContext);

  if (!userInfo) return null;

  if (!roles.includes(userInfo.userRole)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default RoleRoute;
