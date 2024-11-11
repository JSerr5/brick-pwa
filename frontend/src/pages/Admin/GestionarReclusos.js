import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./GestionarReclusos.css";
import adminBG from "../../assets/images/adminBG.jpg";
import Alert from "../Alert/Alert";
import axios from "axios";

const GestionarReclusos = () => {
  const navigate = useNavigate();
  const [reclusos, setReclusos] = useState([]);
  const [nombre, setNombre] = useState("");
  const [direccion, setDireccion] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [dispositivoAsignado, setDispositivoAsignado] = useState("");
  const [dispositivosDisponibles, setDispositivosDisponibles] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [reclusoIdToEdit, setReclusoIdToEdit] = useState(null);
  const [alertMessage, setAlertMessage] = useState("");
  const [showAlert, setShowAlert] = useState(false);

  // Obtener reclusos y dispositivos al cargar el componente
  useEffect(() => {
    fetchReclusos();
    fetchDispositivosDisponibles();
  }, []);

  // Función para obtener todos los reclusos
  const fetchReclusos = async () => {
    try {
      const response = await axios.get("http://localhost:4000/api/reclusos");
      setReclusos(response.data);
    } catch (error) {
      console.error("Error al obtener reclusos:", error);
    }
  };

  // Función para obtener dispositivos no asignados a ningún recluso
  const fetchDispositivosDisponibles = async () => {
    try {
      const response = await axios.get(
        "http://localhost:4000/api/dispositivos-disponibles"
      );
      setDispositivosDisponibles(response.data);
    } catch (error) {
      console.error("Error al obtener dispositivos disponibles:", error);
    }
  };

  // Función para añadir un recluso
  const handleAgregarRecluso = async () => {
    try {
      const response = await axios.post("http://localhost:4000/api/reclusos", {
        nombre,
        direccion,
        descripcion,
        dispositivo_asignado: dispositivoAsignado,
      });
      setReclusos([...reclusos, response.data]);
      resetForm();
      setAlertMessage("Recluso agregado correctamente");
      setShowAlert(true);

      // Actualizar la lista de dispositivos disponibles
      fetchDispositivosDisponibles();
    } catch (error) {
      console.error("Error al agregar recluso:", error);
      setAlertMessage("Error al agregar recluso");
      setShowAlert(true);
    }
  };

  // Función para actualizar un recluso
  const handleActualizarRecluso = async () => {
    try {
      await axios.put(`http://localhost:4000/api/reclusos/${reclusoIdToEdit}`, {
        nombre,
        direccion,
        descripcion,
        dispositivo_asignado: dispositivoAsignado,
      });
      fetchReclusos();
      resetForm();
      setIsEditMode(false);
      setReclusoIdToEdit(null);
      setAlertMessage("Recluso actualizado correctamente");
      setShowAlert(true);

      // Actualizar la lista de dispositivos disponibles
      fetchDispositivosDisponibles();
    } catch (error) {
      console.error("Error al actualizar recluso:", error);
      setAlertMessage("Error al actualizar recluso");
      setShowAlert(true);
    }
  };

  // Función para eliminar un recluso
  const handleEliminarRecluso = async (id_recluso) => {
    try {
      await axios.delete(`http://localhost:4000/api/reclusos/${id_recluso}`);
      setReclusos(
        reclusos.filter((recluso) => recluso.id_recluso !== id_recluso)
      );
      setAlertMessage("Recluso eliminado correctamente");
      setShowAlert(true);

      // Actualizar la lista de dispositivos disponibles
      fetchDispositivosDisponibles();
    } catch (error) {
      console.error("Error al eliminar recluso:", error);
      setAlertMessage("Error al eliminar recluso");
      setShowAlert(true);
    }
  };

  // Preparar el formulario para editar un recluso
  const prepareEditForm = (recluso) => {
    setNombre(recluso.nombre);
    setDireccion(recluso.direccion);
    setDescripcion(recluso.descripcion);
    setDispositivoAsignado(recluso.dispositivo_asignado);
    setIsEditMode(true);
    setReclusoIdToEdit(recluso.id_recluso);
  };

  // Resetear el formulario
  const resetForm = () => {
    setNombre("");
    setDireccion("");
    setDescripcion("");
    setDispositivoAsignado("");
    setIsEditMode(false);
    setReclusoIdToEdit(null);
  };

  return (
    <div
      className="gesrecluso-gestionar"
      style={{ backgroundImage: `url(${adminBG})`, backgroundSize: "cover" }}
    >
      <div className="gesrecluso-title-container">
        <h1 className="gesrecluso-titulo">Gestionar Reclusos</h1>
      </div>
      <div className="gesrecluso-form-container">
        <input
          type="text"
          placeholder="Nombre"
          className="gesrecluso-input"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />
        <input
          type="text"
          placeholder="Dirección"
          className="gesrecluso-input"
          value={direccion}
          onChange={(e) => setDireccion(e.target.value)}
        />
        <input
          type="text"
          placeholder="Descripción del delito"
          className="gesrecluso-input"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
        />
        <select
          value={dispositivoAsignado}
          onChange={(e) => setDispositivoAsignado(e.target.value)}
          className="gesrecluso-input"
        >
          <option value="">Seleccionar dispositivo</option>
          {dispositivosDisponibles.map((dispositivo) => (
            <option
              key={dispositivo.id_dispositivo}
              value={dispositivo.id_dispositivo}
            >
              {dispositivo.id_dispositivo}
            </option>
          ))}
        </select>

        <div className="gesrecluso-buttons">
          {isEditMode ? (
            <button
              className="gesrecluso-button actualizar"
              onClick={handleActualizarRecluso}
            >
              Actualizar
            </button>
          ) : (
            <button
              className="gesrecluso-button agregar"
              onClick={handleAgregarRecluso}
            >
              Añadir
            </button>
          )}
          <button className="gesrecluso-button cancelar" onClick={resetForm}>
            Cancelar
          </button>
        </div>
      </div>

      <div className="gesrecluso-table-wrapper">
        <table className="gesrecluso-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Dirección</th>
              <th>Descripción</th>
              <th>Dispositivo Asignado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {reclusos.map((recluso) => (
              <tr key={recluso.id_recluso}>
                <td>{recluso.id_recluso}</td>
                <td>{recluso.nombre}</td>
                <td>{recluso.direccion}</td>
                <td>{recluso.descripcion}</td>
                <td>{recluso.dispositivo_asignado}</td>
                <td>
                  <button
                    className="editar"
                    onClick={() => prepareEditForm(recluso)}
                  >
                    Editar
                  </button>
                  <button
                    className="eliminar"
                    onClick={() => handleEliminarRecluso(recluso.id_recluso)}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button className="gesrecluso-back-button" onClick={() => navigate(-1)}>
        Atrás
      </button>

      {showAlert && (
        <Alert message={alertMessage} onClose={() => setShowAlert(false)} />
      )}
    </div>
  );
};

export default GestionarReclusos;
