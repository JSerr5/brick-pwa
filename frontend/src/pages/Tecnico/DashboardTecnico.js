import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import "./DashboardTecnico.css";
import tecnicoImageLeft from "../../assets/images/tecnico.jpg"; // Imagen a la izquierda
import alertaImageRight from "../../assets/images/alertaTC.jpg"; // Imagen a la derecha
import tecnicoBG from "../../assets/images/tecnicoBG.jpg"; // Imagen de fondo

const DashboardTecnico = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search); // Obtener los parámetros de la URL
  const idTecnico = queryParams.get("id") || localStorage.getItem("idTecnico");

  const [nombreTecnico, setNombreTecnico] = useState(""); // Estado para almacenar el nombre del técnico
  const [dispositivos, setDispositivos] = useState([]); // Estado para almacenar la lista de dispositivos

  useEffect(() => {
    const token = localStorage.getItem("token");

    // Verificación de la existencia del token
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      // Decodificación del token para verificar el rol
      const decodedToken = jwtDecode(token);
      if (decodedToken.role !== "tecnico") {
        navigate("/access-denied");
        return;
      }

      // Función para obtener los datos del usuario técnico y los dispositivos directamente desde la base de datos
      const fetchUserData = async () => {
        try {
          console.log(`Consultando los datos del técnico con ID: ${idTecnico}`);

          // Realizamos la consulta al servidor para obtener los datos del técnico con el ID dinámico
          const response = await fetch(
            `http://localhost:4000/api/user?role=tecnico&id=${idTecnico}`,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: token, // Agregar el token en el encabezado
              },
            }
          );
          console.log("Respuesta del servidor para /api/user:", response);

          if (response.ok) {
            const contentType = response.headers.get("content-type");

            if (contentType && contentType.includes("application/json")) {
              const data = await response.json();
              setNombreTecnico(data.nombre);
              console.log("Nombre del técnico obtenido:", data.nombre);

              // Después de obtener los datos del usuario, obtener la lista de dispositivos
              const dispositivosResponse = await fetch(
                "http://localhost:4000/api/dispositivos",
                {
                  method: "GET",
                  headers: {
                    "Content-Type": "application/json",
                  },
                }
              );

              console.log(
                "Respuesta del servidor para /api/dispositivos:",
                dispositivosResponse
              );

              if (dispositivosResponse.ok) {
                const dispositivosData = await dispositivosResponse.json();
                setDispositivos(dispositivosData); // Almacenar los dispositivos en el estado
                console.log("Dispositivos obtenidos:", dispositivosData);
              } else {
                console.log("Error al obtener dispositivos.");
                navigate("/login");
              }
            } else {
              // La respuesta no es JSON
              const textResponse = await response.text();
              console.error("La respuesta no es JSON:", textResponse);
              navigate("/login");
            }
          } else {
            console.log(
              "Error al obtener datos del usuario:",
              response.status,
              response.statusText
            );
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

  // Manejo del cambio de selección de dispositivo
  const handleDispositivoChange = (e) => {
    const dispositivoSeleccionado = e.target.value;
    console.log("Dispositivo seleccionado:", dispositivoSeleccionado);
    navigate(`/infoDispositivos/${dispositivoSeleccionado}`);
  };

  // Manejo de la acción de cerrar sesión
  const handleLogout = () => {
    localStorage.removeItem("token"); // Eliminar el token
    navigate("/login"); // Redirigir al login
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
            <option key={index} value={dispositivo.id_dispositivo}>
              {dispositivo.id_dispositivo}
            </option>
          ))}
        </select>
      </div>

      <button className="logout-button" onClick={handleLogout}>
        Cerrar Sesión
      </button>
    </div>
  );
};

export default DashboardTecnico;
