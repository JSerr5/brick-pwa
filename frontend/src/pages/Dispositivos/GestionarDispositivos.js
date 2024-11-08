import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import "./GestionarDispositivos.css";

const GestionarDispositivos = () => {
  const location = useLocation();
  const [dispositivo, setDispositivo] = useState(null); // Estado para almacenar el dispositivo seleccionado
  const [fechaRevisado, setFechaRevisado] = useState(""); // Estado para la nueva fecha de revisión
  const [revisado, setRevisado] = useState(false); // Estado para el checkbox de revisión

  // Obtener el ID del dispositivo de la URL
  const idDispositivo = new URLSearchParams(location.search).get("id");

  useEffect(() => {
    // Obtener datos del dispositivo seleccionado
    const fetchDispositivo = async () => {
      try {
        const response = await fetch(`/api/dispositivos/${idDispositivo}`);
        if (response.ok) {
          const data = await response.json();
          setDispositivo(data);
          setRevisado(data.revisado === 1); // Establecer el estado inicial del checkbox
        } else {
          console.error("Error al obtener el dispositivo.");
        }
      } catch (error) {
        console.error("Error al obtener el dispositivo:", error);
      }
    };

    if (idDispositivo) fetchDispositivo();
  }, [idDispositivo]);

  const handleDateChange = (e) => {
    setFechaRevisado(e.target.value);
  };

  const handleCheckboxChange = (e) => {
    setRevisado(e.target.checked);
  };

  return (
    <div className="gestionar-dispositivos">
      <h2>Gestionar Dispositivo</h2>
      {dispositivo ? (
        <div>
          <p>ID del Dispositivo: {dispositivo.id_dispositivo}</p>
          <label>
            Nueva Fecha de Revisión:
            <input
              type="date"
              value={fechaRevisado}
              onChange={handleDateChange}
            />
          </label>
          <label>
            Revisado?
            <input
              type="checkbox"
              checked={revisado}
              onChange={handleCheckboxChange}
            />
          </label>
          {/* Aquí se puede agregar el botón para confirmar la actualización en la base de datos */}
        </div>
      ) : (
        <p>Cargando información del dispositivo...</p>
      )}
    </div>
  );
};

export default GestionarDispositivos;
