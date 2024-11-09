import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./GestionarDispositivos.css";
import Alert from "../Alert/Alert"; // Importa el componente Alert
import tecnicoBG from "../../assets/images/tecnicoBG.jpg";

const GestionarDispositivos = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [dispositivo, setDispositivo] = useState(null);
  const [fechaRevisado, setFechaRevisado] = useState("");
  const [revisado, setRevisado] = useState(false);
  const [alertMessage, setAlertMessage] = useState(""); // Estado para almacenar el mensaje del alert
  const [showAlert, setShowAlert] = useState(false); // Estado para mostrar el alert

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
        if (
          response.headers.get("content-type")?.includes("application/json")
        ) {
          const data = await response.json();
          setDispositivo(data);
          setRevisado(data.revisado === 1);
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

  // Función para enviar los datos a la base de datos
  const handleSubmit = async () => {
    const currentDate = new Date();
    const selectedDate = new Date(fechaRevisado);

    // Validar que la fecha seleccionada sea posterior a hoy
    if (selectedDate <= currentDate) {
      setAlertMessage("La fecha de revisión debe ser posterior al día de hoy.");
      setShowAlert(true);
      return;
    }

    // Validar que el checkbox de revisado esté marcado
    if (!revisado) {
      setAlertMessage("El dispositivo debe estar marcado como revisado.");
      setShowAlert(true);
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:4000/api/dispositivos/${idDispositivo}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            revisado: 1, // Aseguramos que se envíe como "revisado"
            date_revisado: fechaRevisado,
          }),
        }
      );

      if (response.ok) {
        setAlertMessage("Datos actualizados correctamente.");
        setShowAlert(true);
        setTimeout(() => navigate(-1), 2000); // Redirige después de 2 segundos
      } else {
        setAlertMessage("Error al actualizar el dispositivo.");
        setShowAlert(true);
      }
    } catch (error) {
      setAlertMessage("Error al enviar los datos.");
      setShowAlert(true);
    }
  };

  return (
    <div
      style={{
        backgroundImage: `url(${tecnicoBG})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "20px",
        margin: "0",
      }}
    >
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
            {/* Nuevo contenedor de botones */}
            <div className="button-container">
              <button
                onClick={() => navigate(-1)}
                className="button back-button-gesdis"
              >
                Atrás
              </button>
              <button onClick={handleSubmit} className="button submit-button">
                Guardar Cambios
              </button>
            </div>
          </div>
        ) : (
          <p>Cargando información del dispositivo...</p>
        )}
        {showAlert && (
          <Alert message={alertMessage} onClose={() => setShowAlert(false)} />
        )}
      </div>
    </div>
  );
};

export default GestionarDispositivos;
