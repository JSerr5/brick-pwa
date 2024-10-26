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
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const fetchPolicias = async () => {
    try {
      const response = await fetch("http://localhost:4000/api/policias");
      const data = await response.json();
      setPolicias(data);
    } catch (error) {
      setError("Error al obtener policías.");
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
        setError(errorData.message || "Error al agregar policía.");
        return;
      }
      fetchPolicias();
      setFormData({ nombre: "", password: "", cai_asignado: "" });
      setError("");
    } catch {
      setError("Error en el servidor al agregar policía.");
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
    } catch {
      setError("Error en el servidor al eliminar policía.");
    }
  };

  const handleEdit = (policia) => {
    setFormData({
      nombre: policia.nombre,
      password: "",
      cai_asignado: policia.cai_asignado,
    });
    setEditId(policia.id_policia);
    setEditMode(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        `http://localhost:4000/api/policias/${editId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );
      if (!response.ok) {
        setError("Error al actualizar policía.");
        return;
      }
      fetchPolicias();
      setFormData({ nombre: "", password: "", cai_asignado: "" });
      setEditMode(false);
      setError("");
    } catch {
      setError("Error en el servidor al actualizar policía.");
    }
  };

  return (
    <div className="gestionar-policias">
      <h2>Gestionar Policías</h2>
      {error && <Alert message={error} onClose={() => setError("")} />}
      <form onSubmit={editMode ? handleUpdate : handleAdd}>
        <select onChange={(e) => handleEdit(JSON.parse(e.target.value))}>
          <option value="">Seleccionar Policía</option>
          {policias.map((policia) => (
            <option key={policia.id_policia} value={JSON.stringify(policia)}>
              {policia.id_policia} - {policia.nombre}
            </option>
          ))}
        </select>
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
          required={!editMode}
        />
        <input
          type="text"
          name="cai_asignado"
          placeholder="CAI Asignado"
          value={formData.cai_asignado}
          onChange={handleChange}
          required
        />
        <div className="button-group">
          <button
            type="submit"
            className={editMode ? "update-button" : "add-button"}
          >
            {editMode ? "Actualizar" : "Añadir"}
          </button>
          {editMode && (
            <button
              type="button"
              onClick={() => setEditMode(false)}
              className="cancel-button"
            >
              Cancelar
            </button>
          )}
        </div>
      </form>
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
