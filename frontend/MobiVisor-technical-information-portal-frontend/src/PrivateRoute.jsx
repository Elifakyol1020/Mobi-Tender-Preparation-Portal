import { Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "./context/AuthContext";
import { clearSession } from "./api/authClient";

const PrivateRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return null;
  }

  if (!user) {
    clearSession();
    return <Navigate to="/" replace />;
  }

  const role = user.role || user.roles?.[0];

  if (allowedRoles.includes(role)) {
    return children;
  } else {
    clearSession();
    return <Navigate to="/" replace />;
  }
};

export default PrivateRoute;
