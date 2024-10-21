import { Navigate, Outlet, useLocation } from "react-router-dom";

function ProtectedRoutes() { 
    const location = useLocation();
    const accessToken =  localStorage.getItem("token");
    const userType = localStorage.getItem("userType");
    return accessToken && userType ? <Outlet /> : <Navigate to="login" state={{path: location.pathname}}/>;
}

export default ProtectedRoutes;