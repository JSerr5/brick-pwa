import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Alert from "../Alert/Alert.js";
import "./GestionarPolicias.css";

const GestionarPolicias = () => {
  const [policias, setPolicias] = useState([]);
  const [formData, setFormData] = useState({
    nombre: "",
    password: "",
    cai_asignado: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const fetchPolicias = async () => {
    try {
      const response = await fetch("http://localhost:4000/api/policias");
      const data = await response.json();
      setPolicias(data);
    } catch (error) {
      setError("Error al obtener policías.");
      console.error("Error al obtener policías:", error);
    }
  };

  useEffect(() => {
    fetchPolicias();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:4000/api/policias", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.message || "Error desconocido al agregar policía.");
        return;
      }
      fetchPolicias();
      setFormData({ nombre: "", password: "", cai_asignado: "" });
      setError("");
    } catch (error) {
      setError("Error en el servidor al agregar policía.");
      console.error("Error al agregar policía:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`http://localhost:4000/api/policias/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        setError("Error al eliminar policía.");
        return;
      }
      fetchPolicias();
      setError("");
    } catch (error) {
      setError("Error en el servidor al eliminar policía.");
      console.error("Error al eliminar policía:", error);
    }
  };

  return (
    <div className="gestionar-policias">
      <h2>Gestionar Policías</h2>
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
          name="cai_asignado"
          placeholder="CAI Asignado"
          value={formData.cai_asignado}
          onChange={handleChange}
          required
        />
        <button type="submit" className="add-button">
          Agregar Policía
        </button>
      </form>

      <ul className="policias-list">
        {policias.map((policia) => (
          <li key={policia.id_policia}>
            {policia.nombre} - {policia.cai_asignado}
            <button
              onClick={() => handleDelete(policia.id_policia)}
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

export default GestionarPolicias;
