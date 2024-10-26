import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Alert from "../Alert/Alert.js";
import "./GestionarTecnicos.css";

const GestionarTecnicos = () => {
  const [tecnicos, setTecnicos] = useState([]);
  const [formData, setFormData] = useState({
    nombre: "",
    password: "",
    ciudad: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const fetchTecnicos = async () => {
    try {
      const response = await fetch("http://localhost:4000/api/tecnicos");
      const data = await response.json();
      setTecnicos(data);
    } catch (error) {
      setError("Error al obtener técnicos.");
      console.error("Error al obtener técnicos:", error);
    }
  };

  useEffect(() => {
    fetchTecnicos();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:4000/api/tecnicos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.message || "Error desconocido al agregar técnico.");
        return;
      }
      fetchTecnicos();
      setFormData({ nombre: "", password: "", ciudad: "" });
      setError("");
    } catch (error) {
      setError("Error en el servidor al agregar técnico.");
      console.error("Error al agregar técnico:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`http://localhost:4000/api/tecnicos/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        setError("Error al eliminar técnico.");
        return;
      }
      fetchTecnicos();
      setError("");
    } catch (error) {
      setError("Error en el servidor al eliminar técnico.");
      console.error("Error al eliminar técnico:", error);
    }
  };

  return (
    <div className="gestionar-tecnicos">
      <h2>Gestionar Técnicos</h2>
      {error && <Alert message={error} onClose={() => setError("")} />}
      <form onSubmit={handleAdd}>
        <input
          type="text"
          name="nombre"
          placeholder="Nombre"
          value={formData.nombre}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Contraseña"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="ciudad"
          placeholder="Ciudad"
          value={formData.ciudad}
          onChange={handleChange}
          required
        />
        <button type="submit" className="add-button">
          Agregar Técnico
        </button>
      </form>

      <ul className="tecnicos-list">
        {tecnicos.map((tecnico) => (
          <li key={tecnico.id_tecnico}>
            {tecnico.nombre} - {tecnico.ciudad}
            <button
              onClick={() => handleDelete(tecnico.id_tecnico)}
              className="delete-button"
            >
              Eliminar
            </button>
          </li>
        ))}
      </ul>
      <button
        className="back-button"
        onClick={() => navigate("/dashboard-admin")}
      >
        Atrás
      </button>
    </div>
  );
};

export default GestionarTecnicos;
