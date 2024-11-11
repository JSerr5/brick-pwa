import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./DashboardPolicia.css";
import policiaImageLeft from "../../assets/images/policia.jpg";
import policiaImageRight from "../../assets/images/alertaPL.jpg";
import policiaBG from "../../assets/images/policiaBG.jpg";
import { jwtDecode } from "jwt-decode";

const DashboardPolicia = ({ idPolicia }) => {
  const navigate = useNavigate();
  const [nombrePolicia, setNombrePolicia] = useState("");
  const [alertas, setAlertas] = useState([]); // Estado para almacenar las alertas
  const [isModalOpen, setIsModalOpen] = useState(false); // Controla el estado del modal

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
        const token = localStorage.getItem("token");
        try {
          const response = await fetch(
            `http://localhost:4000/api/user?role=policia&id=${idPolicia}`,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: token,
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

  // Función para consultar alertas
  const fetchAlertas = async () => {
    try {
      const response = await fetch("http://localhost:4000/api/alertas");
      if (response.ok) {
        const data = await response.json();
        setAlertas(data); // Almacena directamente las alertas activas
      }
    } catch (error) {
      console.error("Error al obtener las alertas:", error);
    }
  };

  // Configurar intervalo para chequear alertas cada 10 segundos
  useEffect(() => {
    fetchAlertas(); // Llamada inicial
    const interval = setInterval(fetchAlertas, 10000); // Cada 10 segundos
    return () => clearInterval(interval); // Limpiar intervalo al desmontar
  }, []);

  // Control de logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  // Función para abrir y cerrar el modal
  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
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
          <h1 className="policia-title">Bienvenido {nombrePolicia}</h1>
        </div>
        <div className="logo-container">
          <img src={policiaImageRight} alt="Alerta" className="policia-logo" />
        </div>
      </header>
      <div className="policia-options">
        <button
          className="policia-button"
          onClick={() => navigate("/ver-reclusos")}
        >
          Ver Reclusos
        </button>{" "}
        <button
          className={`policia-button ${
            alertas.length > 0 ? "alerta-activa" : ""
          }`}
          onClick={alertas.length > 0 ? toggleModal : null}
        >
          Ver Alertas
        </button>
      </div>
      <button className="logout-button" onClick={handleLogout}>
        Cerrar Sesión
      </button>

      {/* Modal para mostrar alertas */}
      {isModalOpen && (
        <div className="alerta-modal">
          <div className="alerta-modal-content">
            <h2>Alertas Activas</h2>
            {alertas.length > 0 ? (
              <ul>
                {alertas.map((alerta) => (
                  <div className="alerta-item" key={alerta.id_dispositivo}>
                    <p>
                      <strong>Recluso:</strong> {alerta.nombre}
                    </p>
                    <p>
                      <strong>Dispositivo:</strong> {alerta.id_dispositivo}
                    </p>
                    <p>
                      <strong>Última ubicación:</strong> Latitud{" "}
                      {alerta.latitud}, Longitud {alerta.longitud}
                    </p>
                    <p>
                      <strong>Dirección:</strong> {alerta.direccion}
                    </p>
                    <button
                      className="modal-ubicar-button"
                      onClick={() => {
                        //console.log(`Navegando a /ubicar/${alerta.latitud}/${alerta.longitud}/${alerta.id_dispositivo}`);
                        navigate(
                          `/ubicar/${alerta.latitud}/${alerta.longitud}/${alerta.id_dispositivo}`
                        );
                      }}
                    >
                      Ubicar
                    </button>
                  </div>
                ))}
              </ul>
            ) : (
              <p>No hay alertas activas.</p>
            )}
            <button className="modal-close-button" onClick={toggleModal}>
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPolicia;
