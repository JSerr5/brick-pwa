import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./GestionarPolicias.css";
import adminBG from "../../assets/images/adminBG.jpg";
import Alert from "../Alert/Alert";

const GestionarPolicias = () => {
  const navigate = useNavigate();
  const [policiaSeleccionado, setPoliciaSeleccionado] = useState("");
  const [nombre, setNombre] = useState("");
  const [caiAsignado, setCaiAsignado] = useState("");
  const [password, setPassword] = useState("");
  const [policias, setPolicias] = useState([]);
  const [error, setError] = useState("");
  const [showAlert, setShowAlert] = useState(false);

  const fetchPolicias = async () => {
    const token = localStorage.getItem("token");

    try {
      const response = await fetch("http://localhost:4000/api/policias", {
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setPolicias(data);
      } else {
        setError("Error al obtener los datos de policías.");
        setShowAlert(true); // Muestra Alert
      }
    } catch (error) {
      setError("Error del servidor. Intenta más tarde.");
      setShowAlert(true); // Muestra Alert
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    fetchPolicias();
  }, [navigate]);

  const handleAgregarPolicia = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:4000/api/policias", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify({ nombre, password, cai_asignado: caiAsignado }),
      });

      if (response.ok) {
        setError("");
        setNombre("");
        setCaiAsignado("");
        setPassword("");
        fetchPolicias();
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Error al agregar policía");
        setShowAlert(true); // Muestra Alert en caso de error
      }
    } catch (error) {
      setError("Error al agregar policía");
      setShowAlert(true); // Muestra Alert
    }
  };

  const handleActualizarPolicia = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:4000/api/policias/${policiaSeleccionado}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
          },
          body: JSON.stringify({ nombre, password, cai_asignado: caiAsignado }),
        }
      );

      if (response.ok) {
        setError("");
        fetchPolicias();
        setNombre("");
        setCaiAsignado("");
        setPassword("");
        setPoliciaSeleccionado("");
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Error al actualizar policía");
        setShowAlert(true); // Muestra Alert
      }
    } catch (error) {
      setError("Error al actualizar policía");
      setShowAlert(true); // Muestra Alert
    }
  };

  const handleEliminarPolicia = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:4000/api/policias/${policiaSeleccionado}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
          },
        }
      );

      if (response.ok) {
        setError("");
        setPoliciaSeleccionado("");
        setNombre("");
        setCaiAsignado("");
        setPassword("");
        fetchPolicias();
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Error al eliminar policía");
        setShowAlert(true); // Muestra Alert
      }
    } catch (error) {
      setError("Error al eliminar policía");
      setShowAlert(true); // Muestra Alert
    }
  };

  const handlePoliciaChange = (id) => {
    const policia = policias.find((p) => p.id_policia === id);
    setPoliciaSeleccionado(id);
    setNombre(policia ? policia.nombre : "");
    setCaiAsignado(policia ? policia.cai_asignado : "");
    setPassword("");
  };

  return (
    <div
      className="gestionar-policias"
      style={{ backgroundImage: `url(${adminBG})`, backgroundSize: "cover" }}
    >
      <div className="title-policia-container">
        <h1 className="gestionar-titulo">Gestionar Policías</h1>
      </div>
      <div className="policia-form-container">
        <select
          className="policia-select full-width" // Añade la clase full-width
          value={policiaSeleccionado}
          onChange={(e) => handlePoliciaChange(e.target.value)}
        >
          <option value="">Seleccione un policía</option>
          {policias.map((policia) => (
            <option key={policia.id_policia} value={policia.id_policia}>
              {policia.id_policia} - {policia.nombre}
            </option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Nombre"
          className="policia-input"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />
        <input
          type="text"
          placeholder="CAI Asignado"
          className="policia-input"
          value={caiAsignado}
          onChange={(e) => setCaiAsignado(e.target.value)}
        />
        <input
          type="password"
          placeholder="Contraseña"
          className="policia-input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <div className="policia-buttons equal-width">
          <button
            className="policia-button actualizar"
            onClick={handleActualizarPolicia}
          >
            Actualizar
          </button>
          <button
            className="policia-button eliminar"
            onClick={handleEliminarPolicia}
          >
            Eliminar
          </button>
          <button
            className="policia-button agregar full-width" // Clase full-width para el botón Añadir
            onClick={handleAgregarPolicia}
          >
            Añadir
          </button>
        </div>
      </div>
      <button
        className="back-button"
        onClick={() => navigate("/dashboard-admin")}
      >
        Atrás
      </button>
      {showAlert && (
        <Alert message={error} onClose={() => setShowAlert(false)} />
      )}{" "}
      {/* Usa Alert */}
    </div>
  );
};

export default GestionarPolicias;
