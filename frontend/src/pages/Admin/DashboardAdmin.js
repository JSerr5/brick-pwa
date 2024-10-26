import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import "./DashboardAdmin.css";
import adminImageI from "../../assets/images/admin-I.jpg";
import adminImageD from "../../assets/images/admin-D.jpg";
import adminBG from "../../assets/images/adminBG.jpg";

const DashboardAdmin = () => {
  const navigate = useNavigate();
  const [tecnicos, setTecnicos] = useState([]);
  const [policias, setPolicias] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const decodedToken = jwtDecode(token);
      if (decodedToken.role !== "admin") {
        navigate("/access-denied");
        return;
      }

      const fetchAdminData = async () => {
        try {
          const response = await fetch("http://localhost:4000/api/admin/data", {
            headers: {
              "Content-Type": "application/json",
              Authorization: token,
            },
          });

          if (response.ok) {
            const data = await response.json();
            setTecnicos(data.tecnicos);
            setPolicias(data.policias);
          } else {
            setError("Error al obtener los datos de administradores");
            navigate("/login");
          }
        } catch (error) {
          setError("Error del servidor, intenta de nuevo más tarde.");
          navigate("/login");
        }
      };

      fetchAdminData();
    } catch (error) {
      console.error("Error al decodificar el token:", error);
      navigate("/access-denied");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div
      className="dashboard-admin"
      style={{ backgroundImage: `url(${adminBG})` }}
    >
      <header className="admin-header">
        <div className="logo-container">
          <img src={adminImageD} alt="Admin" className="admin-logo" />
        </div>
        <div className="admin-title-container">
          <h1 className="admin-title">ADMIN SUPREMO</h1>
        </div>
        <div className="logo-container">
          <img src={adminImageI} alt="Admin" className="admin-logo" />
        </div>
      </header>

      <div className="admin-options">
        <button
          className="admin-button"
          onClick={() => navigate("/gestionar-tecnicos")}
        >
          Gestionar Técnicos
        </button>
        <button
          className="admin-button"
          onClick={() => navigate("/gestionar-policias")}
        >
          Gestionar Policías
        </button>
        <button
          className="admin-button"
          onClick={() => navigate("/gestionar-admin")}
        >
          Gestionar Admin
        </button>
      </div>

      {error && <p className="error-message">{error}</p>}

      <button className="logout-button" onClick={handleLogout}>
        Cerrar sesión
      </button>
    </div>
  );
};

export default DashboardAdmin;
