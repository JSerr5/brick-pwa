import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./DashboardPolicia.css";
import policiaImageLeft from "../../assets/images/policia.jpg"; // Imagen a la izquierda
import policiaImageRight from "../../assets/images/alertaPL.jpg"; // Imagen a la derecha
import policiaBG from "../../assets/images/policiaBG.jpg"; // Imagen de fondo
import { jwtDecode } from "jwt-decode";

const DashboardPolicia = ({ idPolicia }) => {
  const navigate = useNavigate();
  const [nombrePolicia, setNombrePolicia] = useState(""); // Estado para almacenar el nombre

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    try {
      const decodedToken = jwtDecode(token);
      if (decodedToken.role !== "policia") {
        navigate("/access-denied");
        return;
      }

      // Función para obtener los datos del usuario desde la base de datos
      const fetchUserData = async () => {
        const token = localStorage.getItem("token"); // Obtener el token de localStorage
        try {
          const response = await fetch(
            `http://localhost:4000/api/user?role=policia&id=${idPolicia}`,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: token, // Agregar el token en el encabezado
              },
            }
          );

          if (response.ok) {
            const data = await response.json();
            setNombrePolicia(data.nombre);
          } else {
            navigate("/login");
          }
        } catch (error) {
          navigate("/login");
        }
      };

      fetchUserData();
    } catch (error) {
      console.error("Error al decodificar el token:", error);
      navigate("/access-denied");
    }
  }, [idPolicia, navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token"); // Eliminar el token
    navigate("/login"); // Redirigir al login
  };

  return (
    <div
      className="dashboard-policia"
      style={{ backgroundImage: `url(${policiaBG})` }}
    >
      <header className="policia-header">
        <div className="logo-container">
          <img src={policiaImageLeft} alt="Policia" className="policia-logo" />
        </div>
        <div className="policia-title-container">
          <h1 className="policia-title">Bienvenido {nombrePolicia}</h1>{" "}
          {/* Mostrar el nombre dinámicamente */}
        </div>
        <div className="logo-container">
          <img src={policiaImageRight} alt="Alerta" className="policia-logo" />
        </div>
      </header>
      <div className="policia-options">
        <button className="policia-button">Localizar Recluso</button>
        <button className="policia-button">Ver Alertas</button>
      </div>
      <button className="logout-button" onClick={handleLogout}>
        Cerrar Sesión
      </button>
    </div>
  );
};

export default DashboardPolicia;
