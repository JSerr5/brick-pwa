import React from "react";
import { Navigate } from "react-router-dom";
import decodeToken from "../services/decodeToken"; // Usar la función manual de decodificación

const ProtectedRoute = ({ children, role }) => {
  const token = localStorage.getItem("token");

  if (!token) {
    console.log("No se encontró el token en localStorage. Redirigiendo al login.");
    return <Navigate to="/login" />;
  }

  try {
    const decodedToken = decodeToken(token);
    const currentTime = Math.floor(Date.now() / 1000); // Tiempo actual en segundos

    // Depuración: Mostrar tiempo actual y tiempo de expiración del token
    console.log("Tiempo actual:", currentTime);
    console.log("Expiración del token:", decodedToken.exp);

    // Verificar si el token ha expirado
    if (decodedToken.exp < currentTime) {
      console.log("El token ha expirado. Redirigiendo al login.");
      localStorage.removeItem("token");
      return <Navigate to="/login" />;
    }

    // Verificar si el rol coincide
    if (decodedToken.role !== role) {
      console.log(`El rol ${decodedToken.role} no coincide con el rol requerido: ${role}. Redirigiendo a acceso denegado.`);
      return <Navigate to="/access-denied" />;
    }

    // Si todo es correcto, renderizar los children
    console.log("Token y rol válidos. Renderizando el contenido protegido.");
    return children;
  } catch (error) {
    console.error("Error al decodificar el token:", error);
    localStorage.removeItem("token");
    return <Navigate to="/login" />;
  }
};

export default ProtectedRoute;
