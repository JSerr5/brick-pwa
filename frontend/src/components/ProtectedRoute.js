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

    const rolePaths = {
      tecnico: [
        "/dashboard-tecnico",
        "/gestionar-dispositivos",
        "/crud-dispositivos",
        "/infoDispositivos",
      ],
      policia: ["/dashboard-policia", "/ubicar"],
      admin: ["/dashboard-admin", "/gestionar-tecnicos", "/gestionar-policias"],
    };

    const isAuthorized = rolePaths[userRole]?.some((allowedPath) =>
      path.startsWith(allowedPath)
    );

    if (!isAuthorized) {
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
