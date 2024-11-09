import React, { useState, useEffect } from "react";
import "./CrudDispositivos.css";
import Alert from "../Alert/Alert";
import tecnicoBG from "../../assets/images/tecnicoBG.jpg";

const CrudDispositivos = () => {
  const [dispositivos, setDispositivos] = useState([]);
  const [selectedDispositivo, setSelectedDispositivo] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [showAlert, setShowAlert] = useState(false);

  // Define fetchDispositivos como una función independiente para que esté disponible
  const fetchDispositivos = async () => {
    try {
      const response = await fetch("http://localhost:4000/api/dispositivos");
      const data = await response.json();

      // Ordena los dispositivos en orden numérico usando el valor después de "d"
      data.sort((a, b) => {
        const numA = parseInt(a.id_dispositivo.slice(1), 10);
        const numB = parseInt(b.id_dispositivo.slice(1), 10);
        return numA - numB;
      });

      setDispositivos(data);
    } catch (error) {
      console.error("Error al obtener los dispositivos:", error);
    }
  };

  useEffect(() => {
    fetchDispositivos();
  }, []);

  const handleSelectChange = (e) => {
    const dispositivoId = e.target.value;
    setSelectedDispositivo(dispositivoId);
  };

  // Función para eliminar un dispositivo existente
  const handleDelete = async () => {
    if (!selectedDispositivo) {
      setAlertMessage("Por favor, selecciona un dispositivo para eliminar.");
      setShowAlert(true);
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:4000/api/dispositivos/${selectedDispositivo}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        setAlertMessage("Dispositivo eliminado correctamente.");
        setShowAlert(true);
        fetchDispositivos(); // Vuelve a cargar la lista de dispositivos
        setSelectedDispositivo(""); // Limpia la selección
      } else {
        setAlertMessage("Error al eliminar el dispositivo.");
        setShowAlert(true);
      }
    } catch (error) {
      console.error("Error al eliminar el dispositivo:", error);
      setAlertMessage("Error al eliminar el dispositivo.");
      setShowAlert(true);
    }
  };

  // Función para añadir un nuevo dispositivo
  const handleAdd = async () => {
    try {
      const response = await fetch("http://localhost:4000/api/dispositivos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });

      if (response.ok) {
        setAlertMessage("Dispositivo añadido correctamente.");
        setShowAlert(true);
        fetchDispositivos(); // Vuelve a cargar la lista de dispositivos
      } else {
        setAlertMessage("Error al añadir el dispositivo.");
        setShowAlert(true);
      }
    } catch (error) {
      console.error("Error al añadir el dispositivo:", error);
      setAlertMessage("Error al añadir el dispositivo.");
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
      }}
    >
      <div className="cruddis-container">
        <div className="cruddis-title-container">
          <h1 className="cruddis-title">Gestionar Dispositivos</h1>
        </div>

        <div className="cruddis-form-container">
          <select
            className="cruddis-select"
            value={selectedDispositivo}
            onChange={handleSelectChange}
          >
            <option value="">Seleccione un dispositivo</option>
            {dispositivos.map((dispositivo) => (
              <option
                key={dispositivo.id_dispositivo}
                value={dispositivo.id_dispositivo}
              >
                {dispositivo.id_dispositivo}
              </option>
            ))}
          </select>

          {(() => {
            const dispositivoSeleccionado = dispositivos.find(
              (d) => d.id_dispositivo === selectedDispositivo
            );
            return (
              <input
                type="text"
                className="cruddis-input"
                placeholder="ID del dispositivo"
                value={`${selectedDispositivo || "No ID"} - ${
                  dispositivoSeleccionado?.date_revisado
                    ? new Date(
                        dispositivoSeleccionado.date_revisado
                      ).toLocaleDateString()
                    : "Sin fecha"
                }`}
                readOnly
              />
            );
          })()}

          <div className="cruddis-button-group">
            <button
              className="cruddis-button cruddis-delete"
              onClick={handleDelete}
            >
              Eliminar
            </button>
            <button className="cruddis-button cruddis-add" onClick={handleAdd}>
              Añadir
            </button>
          </div>

          <button
            className="cruddis-back-button"
            onClick={() => window.history.back()}
          >
            Atrás
          </button>
        </div>

        {showAlert && (
          <Alert message={alertMessage} onClose={() => setShowAlert(false)} />
        )}
      </div>
    </div>
  );
};

export default CrudDispositivos;
