import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./DashboardTecnico.css";
import tecnicoImageLeft from "../../assets/images/tecnico.jpg"; // Imagen a la izquierda
import alertaImageRight from "../../assets/images/alertaTC.jpg"; // Imagen a la derecha
import tecnicoBG from "../../assets/images/tecnicoBG.jpg"; // Imagen de fondo

const DashboardTecnico = () => {
  const navigate = useNavigate();
  const [nombreTecnico, setNombreTecnico] = useState(""); // Estado para almacenar el nombre del técnico
  const [dispositivos, setDispositivos] = useState([]); // Estado para almacenar la lista de dispositivos

  useEffect(() => {
    const token = localStorage.getItem("token");

    // Si no hay token, redirigir al login
    if (!token) {
      console.log("No se encontró token en localStorage. Redirigiendo al login.");
      navigate("/login");
      return;
    }

    // Función para obtener los datos del usuario técnico y los dispositivos
    const fetchUserData = async () => {
      try {
        console.log("Iniciando fetch de datos de usuario...");
        const response = await fetch("/api/user", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`, // Adjuntar el token en el encabezado
            "Content-Type": "application/json",
          },
        });
    
        console.log("Respuesta del servidor:", response); // Mostrar la respuesta completa en la consola
    
        if (response.ok) {
          const data = await response.json();
          setNombreTecnico(data.nombre);
          console.log("Nombre del técnico obtenido:", data.nombre);

          // Después de obtener los datos del usuario, obtener la lista de dispositivos
          const dispositivosResponse = await fetch("/api/dispositivos", {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`, // Adjuntar el token en el encabezado
              "Content-Type": "application/json",
            },
          });

          if (dispositivosResponse.ok) {
            const dispositivosData = await dispositivosResponse.json();
            setDispositivos(dispositivosData); // Almacenar los dispositivos en el estado
            console.log("Dispositivos obtenidos:", dispositivosData);
          } else {
            console.log("Error al obtener dispositivos. Redirigiendo al login.");
            navigate("/login");
          }

        } else {
          console.log("Error al obtener datos del usuario. Redirigiendo al login.");
          navigate("/login");
        }
      } catch (error) {
        console.error("Error al obtener los datos del usuario:", error);
        navigate("/login");
      }
    };

    // Ejecutar la función para obtener los datos del usuario y los dispositivos
    fetchUserData();
  }, [navigate]);

  // Manejar la selección de un dispositivo del dropdown
  const handleDispositivoChange = (e) => {
    const dispositivoSeleccionado = e.target.value;
    console.log("Dispositivo seleccionado:", dispositivoSeleccionado);
    navigate(`/infoDispositivos/${dispositivoSeleccionado}`); // Redirigir a la nueva página con la información del dispositivo seleccionado
  };

  // Manejar el cierre de sesión
  const handleLogout = () => {
    console.log("Cerrando sesión...");
    localStorage.removeItem("token"); // Eliminar el token del localStorage
    navigate("/login"); // Redirigir al login
  };

  return (
    <div
      className="dashboard-tecnico"
      style={{ backgroundImage: `url(${tecnicoBG})` }} // Establecer la imagen de fondo
    >
      <header className="tecnico-header">
        <div className="logo-container">
          <img src={tecnicoImageLeft} alt="Tecnico" className="tecnico-logo" /> {/* Imagen del técnico */}
        </div>
        <div className="tecnico-title-container">
          <h1 className="tecnico-title">Bienvenido {nombreTecnico}</h1> {/* Mostrar el nombre del técnico */}
        </div>
        <div className="logo-container">
          <img src={alertaImageRight} alt="Alerta" className="tecnico-logo" /> {/* Imagen de alerta */}
        </div>
      </header>
      
      <div className="tecnico-options">
        <select
          id="dispositivo-select"
          className="tecnico-select"
          onChange={handleDispositivoChange}
          defaultValue="" // Valor por defecto vacío hasta que se seleccione un dispositivo
        >
          <option value="" disabled>
            Seleccionar dispositivo
          </option>
          {/* Iterar sobre los dispositivos obtenidos y mostrarlos como opciones en el dropdown */}
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
