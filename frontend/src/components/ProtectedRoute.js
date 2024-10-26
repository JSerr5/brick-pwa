import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" />;
  }

  try {
    const decodedToken = jwtDecode(token);

    // Validación de expiración del token
    const currentTime = Date.now() / 1000;
    if (decodedToken.exp < currentTime) {
      localStorage.removeItem("token");
      return <Navigate to="/access-denied" />;
    }

    // Validación del rol según la ruta
    const userRole = decodedToken.role;
    const path = location.pathname;

    if (
      (userRole === "tecnico" && !path.startsWith("/dashboard-tecnico")) ||
      (userRole === "policia" && !path.startsWith("/dashboard-policia")) ||
      (userRole === "admin" && !path.startsWith("/dashboard-admin"))
    ) {
      return <Navigate to="/access-denied" />;
    }

    return children;
  } catch (error) {
    console.error("Token no válido:", error);
    localStorage.removeItem("token");
    return <Navigate to="/access-denied" />;
  }
};

export default ProtectedRoute;
