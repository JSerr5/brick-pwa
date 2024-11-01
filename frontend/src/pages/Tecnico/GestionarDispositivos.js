import React, { useState, useEffect } from "react";
import "./GestionarDispositivos.css"; // Archivo CSS para estilos adicionales

const GestionarDispositivos = () => {
  const [dispositivos, setDispositivos] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);

  useEffect(() => {
    // Obtener lista de dispositivos de la API
    const fetchDispositivos = async () => {
      try {
        const response = await fetch("/api/dispositivos");
        const data = await response.json();
        setDispositivos(data);
      } catch (error) {
        console.error("Error al obtener dispositivos:", error);
      }
    };

    fetchDispositivos();
  }, []);

  const handleDeviceSelect = (dispositivo) => {
    setSelectedDevice(dispositivo);
    console.log("Dispositivo seleccionado:", dispositivo);
  };

  return (
    <div className="gestionar-dispositivos">
      <h2>Seleccionar Dispositivo</h2>
      {selectedDevice && (
        <div>
          <h3>Detalles del Dispositivo</h3>
          <p>ID: {selectedDevice.id_dispositivo}</p>
          <p>Nombre: {selectedDevice.nombre}</p>
          {/* Aquí puedes añadir más detalles del dispositivo */}
        </div>
      )}
    </div>
  );
};

export default GestionarDispositivos;
