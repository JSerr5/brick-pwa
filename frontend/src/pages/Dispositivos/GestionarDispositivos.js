import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./GestionarDispositivos.css";

const GestionarDispositivos = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [dispositivo, setDispositivo] = useState(null);
  const [fechaRevisado, setFechaRevisado] = useState("");
  const [revisado, setRevisado] = useState(false);

  const idDispositivo = new URLSearchParams(location.search).get("id");

  useEffect(() => {
    console.log("ID del dispositivo recibido:", idDispositivo);

    if (!idDispositivo) {
      console.error("No se encontró el ID del dispositivo en la URL.");
      return;
    }

    const fetchDispositivo = async () => {
      try {
        const response = await fetch(
          `http://localhost:4000/api/dispositivos/${idDispositivo}`
        );
        console.log("Respuesta del servidor:", response);

        if (
          response.headers.get("content-type")?.includes("application/json")
        ) {
          const data = await response.json();
          setDispositivo(data);
          setRevisado(data.revisado === 1);
          console.log("Datos del dispositivo obtenidos:", data);
        } else {
          console.error("La respuesta no es JSON válida");
        }
      } catch (error) {
        console.error("Error al obtener el dispositivo:", error);
      }
    };

    fetchDispositivo();
  }, [idDispositivo]);

  const handleDateChange = (e) => setFechaRevisado(e.target.value);
  const handleCheckboxChange = (e) => setRevisado(e.target.checked);

  return (
    <div className="gestionar-dispositivos">
      <h2>Gestionar Dispositivo</h2>
      {dispositivo ? (
        <div>
          <p>ID del Dispositivo: {dispositivo.id_dispositivo}</p>
          <label>
            Nueva fecha de revisión:
            <input
              type="date"
              value={fechaRevisado}
              onChange={handleDateChange}
            />
          </label>
          <div className="revisar-checkbox-container">
            <label>
              Revisado?
              <input
                type="checkbox"
                checked={revisado}
                onChange={handleCheckboxChange}
              />
            </label>
          </div>
          <button onClick={() => navigate(-1)} className="back-button">
            Atrás
          </button>
        </div>
      ) : (
        <p>Cargando información del dispositivo...</p>
      )}
    </div>
  );
};

export default GestionarDispositivos;
