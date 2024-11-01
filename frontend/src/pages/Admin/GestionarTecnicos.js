import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./GestionarTecnicos.css";
import adminBG from "../../assets/images/adminBG.jpg";
import Alert from "../Alert/Alert";
import showIcon from "../../assets/images/show-icon.png";
import hideIcon from "../../assets/images/hide-icon.png";

const GestionarTecnicos = () => {
  const navigate = useNavigate();
  const [tecnicos, setTecnicos] = useState([]);
  const [nombre, setNombre] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [password, setPassword] = useState("");
  const [tecnicoSeleccionado, setTecnicoSeleccionado] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const fetchTecnicos = async () => {
    const token = localStorage.getItem("token");

    try {
      const response = await fetch("http://localhost:4000/api/tecnicos", {
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setTecnicos(data);
      } else {
        setAlertMessage("Error al obtener los datos de técnicos.");
        setShowAlert(true);
      }
    } catch (error) {
      setAlertMessage("Error del servidor. Intenta más tarde.");
      setShowAlert(true);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    fetchTecnicos();
  }, [navigate]);

  const handleAgregarTecnico = async () => {
    if (isEditMode) return;
    setAlertMessage("");
    setShowAlert(false);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:4000/api/tecnicos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify({ nombre, ciudad, password }),
      });

      if (response.ok) {
        setNombre("");
        setCiudad("");
        setPassword("");
        fetchTecnicos();
        setAlertMessage("Técnico agregado correctamente");
        setShowAlert(true);
      } else {
        const errorData = await response.json();
        setAlertMessage(errorData.message || "Error al agregar técnico");
        setShowAlert(true);
      }
    } catch (error) {
      setAlertMessage("Error al agregar técnico");
      setShowAlert(true);
    }
  };

  const handleActualizarTecnico = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:4000/api/tecnicos/${tecnicoSeleccionado}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
          },
          body: JSON.stringify({ nombre, ciudad, password }),
        }
      );

      if (response.ok) {
        fetchTecnicos();
        setNombre("");
        setCiudad("");
        setPassword("");
        setTecnicoSeleccionado("");
        setAlertMessage("Técnico actualizado correctamente");
        setShowAlert(true);
      } else {
        const errorData = await response.json();
        setAlertMessage(errorData.message || "Error al actualizar técnico");
        setShowAlert(true);
      }
    } catch (error) {
      setAlertMessage("Error al actualizar técnico");
      setShowAlert(true);
    }
  };

  const handleEliminarTecnico = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:4000/api/tecnicos/${tecnicoSeleccionado}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
          },
        }
      );

      if (response.ok) {
        setTecnicoSeleccionado("");
        setNombre("");
        setCiudad("");
        setPassword("");
        fetchTecnicos();
        setAlertMessage("Técnico eliminado correctamente");
        setShowAlert(true);
      } else {
        const errorData = await response.json();
        setAlertMessage(errorData.message || "Error al eliminar técnico");
        setShowAlert(true);
      }
    } catch (error) {
      setAlertMessage("Error al eliminar técnico");
      setShowAlert(true);
    }
  };

  const handleTecnicoChange = (id) => {
    const tecnico = tecnicos.find((t) => t.id_tecnico === id);
    setTecnicoSeleccionado(id);
    setNombre(tecnico ? tecnico.nombre : "");
    setCiudad(tecnico ? tecnico.ciudad : "");
    setPassword("");
    setIsEditMode(!!id);
  };

  return (
    <div
      className="gestionar-tecnicos"
      style={{ backgroundImage: `url(${adminBG})`, backgroundSize: "cover" }}
    >
      <div className="title-tecnico-container">
        <h1 className="gestionar-titulo">Gestionar Técnicos</h1>
      </div>
      <div className="tecnico-form-container">
        <select
          className="tecnico-select-admin full-width"
          value={tecnicoSeleccionado}
          onChange={(e) => handleTecnicoChange(e.target.value)}
        >
          <option value="">Seleccione un técnico</option>
          {tecnicos.map((tecnico) => (
            <option key={tecnico.id_tecnico} value={tecnico.id_tecnico}>
              {tecnico.id_tecnico} - {tecnico.nombre}
            </option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Nombre"
          className="tecnico-input"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />
        <input
          type="text"
          placeholder="Ciudad"
          className="tecnico-input"
          value={ciudad}
          onChange={(e) => setCiudad(e.target.value)}
        />
        <div className="gestionar-tecnico-password-container">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Contraseña"
            className="tecnico-input password-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <img
            src={showPassword ? hideIcon : showIcon}
            alt="Toggle Password Visibility"
            className="gestionar-tecnico-toggle-password-icon"
            onClick={() => setShowPassword(!showPassword)}
          />
        </div>
        <div className="tecnico-buttons equal-width">
          <button
            className="tecnico-button actualizar"
            onClick={handleActualizarTecnico}
            disabled={!isEditMode}
          >
            Actualizar
          </button>
          <button
            className="tecnico-button eliminar"
            onClick={handleEliminarTecnico}
            disabled={!isEditMode}
          >
            Eliminar
          </button>
          <button
            className="tecnico-button agregar full-width"
            onClick={handleAgregarTecnico}
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

export default GestionarTecnicos;
