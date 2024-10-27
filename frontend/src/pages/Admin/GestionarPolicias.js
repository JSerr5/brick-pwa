import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./GestionarPolicias.css";
import adminBG from "../../assets/images/adminBG.jpg";
import Alert from "../Alert/Alert";
import showIcon from "../../assets/images/show-icon.png";
import hideIcon from "../../assets/images/hide-icon.png";

const GestionarPolicias = () => {
  const navigate = useNavigate();
  const [policiaSeleccionado, setPoliciaSeleccionado] = useState("");
  const [nombre, setNombre] = useState("");
  const [caiAsignado, setCaiAsignado] = useState("");
  const [password, setPassword] = useState("");
  const [policias, setPolicias] = useState([]);
  const [alertMessage, setAlertMessage] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
        setAlertMessage("Error al obtener los datos de policías.");
        setShowAlert(true); // Muestra Alert
      }
    } catch (error) {
      setAlertMessage("Error del servidor. Intenta más tarde.");
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
    if (isEditMode) return;
    setAlertMessage("");
    setShowAlert(false);

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
        setNombre("");
        setCaiAsignado("");
        setPassword("");
        fetchPolicias();
        setAlertMessage("Policía agregado correctamente");
        setShowAlert(true);
      } else {
        const errorData = await response.json();
        setAlertMessage(errorData.message || "Error al agregar policía");
        setShowAlert(true);
      }
    } catch (error) {
      setAlertMessage("Error al agregar policía");
      setShowAlert(true);
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
        fetchPolicias();
        setNombre("");
        setCaiAsignado("");
        setPassword("");
        setPoliciaSeleccionado("");
        setAlertMessage("Policía actualizado correctamente");
        setShowAlert(true); // Muestra mensaje de éxito
      } else {
        const errorData = await response.json();
        setAlertMessage(errorData.message || "Error al actualizar policía");
        setShowAlert(true); // Muestra Alert en caso de error
      }
    } catch (error) {
      setAlertMessage("Error al actualizar policía");
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
        setPoliciaSeleccionado("");
        setNombre("");
        setCaiAsignado("");
        setPassword("");
        fetchPolicias();
        setAlertMessage("Policía eliminado correctamente");
        setShowAlert(true); // Muestra mensaje de éxito
      } else {
        const errorData = await response.json();
        setAlertMessage(errorData.message || "Error al eliminar policía");
        setShowAlert(true); // Muestra Alert en caso de error
      }
    } catch (error) {
      setAlertMessage("Error al eliminar policía");
      setShowAlert(true); // Muestra Alert
    }
  };

  const handlePoliciaChange = (id) => {
    const policia = policias.find((p) => p.id_policia === id);
    setPoliciaSeleccionado(id);
    setNombre(policia ? policia.nombre : "");
    setCaiAsignado(policia ? policia.cai_asignado : "");
    setPassword("");
    setIsEditMode(!!id);
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
          className="policia-select full-width"
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
        <div className="gestionar-policia-password-container">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Contraseña"
            className="policia-input password-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <img
            src={showPassword ? hideIcon : showIcon} // Icono de ojo abierto o cerrado
            alt="Toggle Password Visibility"
            className="gestionar-policia-toggle-password-icon"
            onClick={() => setShowPassword(!showPassword)}
          />
        </div>
        <div className="policia-buttons equal-width">
          <button
            className="policia-button actualizar"
            onClick={handleActualizarPolicia}
            disabled={!isEditMode}
          >
            Actualizar
          </button>
          <button
            className="policia-button eliminar"
            onClick={handleEliminarPolicia}
            disabled={!isEditMode}
          >
            Eliminar
          </button>
          <button
            className="policia-button agregar full-width"
            onClick={handleAgregarPolicia}
            disabled={isEditMode}
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
        <Alert
          message={alertMessage}
          onClose={() => {
            setShowAlert(false);
            setAlertMessage("");
          }}
        />
      )}
    </div>
  );
};

export default GestionarPolicias;
