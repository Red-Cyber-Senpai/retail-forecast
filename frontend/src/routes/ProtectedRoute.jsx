import { Navigate, useLocation } from "react-router-dom";

import Loader from "../components/common/Loader";
import useAuth from "../hooks/useAuth";

function ProtectedRoute({
  children,
  roles = [],
}) {
  const { user, loading } = useAuth();

  const location = useLocation();

  if (loading) {
    return <Loader />;
  }

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  if (
    roles.length > 0 &&
    !roles.includes(user.role)
  ) {
    return (
      <Navigate
        to="/dashboard"
        replace
      />
    );
  }

  return children;
}

export default ProtectedRoute;