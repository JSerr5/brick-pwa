import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import Alert from "../Alert/Alert";
import "./DashboardTecnico.css";
import tecnicoImageLeft from "../../assets/images/tecnico.jpg";
import alertaImageRight from "../../assets/images/alertaTC.jpg";
import tecnicoBG from "../../assets/images/tecnicoBG.jpg";

const DashboardTecnico = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const idTecnico = queryParams.get("id") || localStorage.getItem("idTecnico");

  const [nombreTecnico, setNombreTecnico] = useState("");
  const [dispositivos, setDispositivos] = useState([]);
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const decodedToken = jwtDecode(token);
      if (decodedToken.role !== "tecnico") {
        navigate("/access-denied");
        return;
      }

      const fetchUserData = async () => {
        try {
          const response = await fetch(
            `http://localhost:4000/api/user?role=tecnico&id=${idTecnico}`,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: token,
              },
            }
          );

          if (response.ok) {
            const data = await response.json();
            setNombreTecnico(data.nombre);

            // Obtener la lista de dispositivos
            const dispositivosResponse = await fetch(
              "http://localhost:4000/api/dispositivos",
              {
                method: "GET",
                headers: {
                  "Content-Type": "application/json",
                },
              }
            );

            if (dispositivosResponse.ok) {
              const dispositivosData = await dispositivosResponse.json();

              const hoy = new Date();
              hoy.setHours(0, 0, 0, 0); // Asegúrate de eliminar las horas para comparar solo las fechas

              // Marcar los dispositivos que necesitan revisión
              const dispositivosConEstado = dispositivosData.map((device) => {
                const fechaRevisado = new Date(device.date_revisado);
                device.needsReview =
                  fechaRevisado < hoy && device.revisado === 0;
                return device;
              });

              // Ordenar dispositivos: los que necesitan revisión primero
              const sortedDevices = dispositivosConEstado.sort(
                (a, b) => b.needsReview - a.needsReview
              );
              setDispositivos(sortedDevices);

              // Verificar si hay algún dispositivo que necesite revisión
              const needsReview = sortedDevices.some(
                (device) => device.needsReview
              );
              setShowAlert(needsReview); // Mostrar la alerta si hay dispositivos a revisar
            } else {
              console.log("Error al obtener dispositivos.");
              navigate("/login");
            }
          } else {
            navigate("/login");
          }
        } catch (error) {
          console.error("Error al obtener los datos del usuario:", error);
          navigate("/login");
        }
      };

      fetchUserData();
    } catch (error) {
      console.error("Error al decodificar el token:", error);
      navigate("/access-denied");
    }
  }, [idTecnico, navigate]);

  const handleDispositivoChange = (e) => {
    const dispositivoSeleccionado = e.target.value;
    navigate(`/infoDispositivos/${dispositivoSeleccionado}`);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div
      className="dashboard-tecnico"
      style={{ backgroundImage: `url(${tecnicoBG})` }}
    >
      <header className="tecnico-header">
        <div className="logo-container">
          <img src={tecnicoImageLeft} alt="Tecnico" className="tecnico-logo" />
        </div>
        <div className="tecnico-title-container">
          <h1 className="tecnico-title">Bienvenido {nombreTecnico}</h1>
        </div>
        <div className="logo-container">
          <img src={alertaImageRight} alt="Alerta" className="tecnico-logo" />
        </div>
      </header>

      <div className="tecnico-options">
        <select
          id="dispositivo-select"
          className="tecnico-select"
          onChange={handleDispositivoChange}
          defaultValue=""
        >
          <option value="" disabled>
            Seleccionar dispositivo
          </option>
          {dispositivos.map((dispositivo, index) => (
            <option
              key={index}
              value={dispositivo.id_dispositivo}
              className={dispositivo.needsReview ? "needs-review-option" : ""}
            >
              {dispositivo.id_dispositivo}
              {dispositivo.needsReview ? " - Necesita revisión" : ""}
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={() => navigate("/crud-dispositivos")}
        className="crud-dispositivos-button"
      >
        CRUD Dispositivos
      </button>

      <button className="logout-button" onClick={handleLogout}>
        Cerrar Sesión
      </button>

      {showAlert && (
        <Alert
          message="Alerta! Hay dispositivos que necesitan una revisión"
          onClose={() => setShowAlert(false)}
        />
      )}
    </div>
  );
};

export default DashboardTecnico;
