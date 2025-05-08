import { Navigate, Outlet } from "react-router-dom";

function PublicRoutes() {
  const accessToken = localStorage.getItem("token");
  const userType = localStorage.getItem("userType");
  return !accessToken && !userType ? (
    <Outlet />
  ) : userType === "tenant" ? (
    <Navigate to="/tenant" />
  ) : (
    <Navigate to="/owner" />
  );
}

export default PublicRoutes;
