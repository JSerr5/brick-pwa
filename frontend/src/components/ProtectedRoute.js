import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const token = localStorage.getItem("token");

  // Verificar si el token está presente
  if (!token) {
    console.warn("No hay token, redirigiendo a /login."); // DEBUG
    return <Navigate to="/login" />;
  }

  try {
    const decodedToken = jwtDecode(token);
    console.log("Token decodificado:", decodedToken); // DEBUG

    // Validación de expiración del token
    const currentTime = Date.now() / 1000;
    if (decodedToken.exp < currentTime) {
      console.warn("Token expirado, redirigiendo a /access-denied."); // DEBUG
      localStorage.removeItem("token");
      return <Navigate to="/access-denied" />;
    }

    // Validación del rol según la ruta
    const userRole = decodedToken.role;
    const path = location.pathname;

    console.log("Rol del usuario:", userRole); // DEBUG
    console.log("Ruta actual:", path); // DEBUG

    if (
      (userRole === "tecnico" &&
        !path.startsWith("/dashboard-tecnico") &&
        !path.startsWith("/gestionar-dispositivos") &&
        !path.startsWith("/crud-dispositivos") &&
        !path.startsWith("/infoDispositivos")) ||
      (userRole === "policia" && !path.startsWith("/dashboard-policia")) ||
      (userRole === "admin" &&
        !path.startsWith("/dashboard-admin") &&
        !path.startsWith("/gestionar-tecnicos") &&
        !path.startsWith("/gestionar-policias"))
    ) {
      console.warn(`Acceso denegado para el rol: ${userRole}`);
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
