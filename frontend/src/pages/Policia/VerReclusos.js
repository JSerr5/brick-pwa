import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./VerReclusos.css";
import axios from "axios";
import policiaBG from "../../assets/images/policiaBG.jpg";

const VerReclusos = () => {
  const navigate = useNavigate();
  const [reclusos, setReclusos] = useState([]);

  // Función para obtener los reclusos
  useEffect(() => {
    const fetchReclusos = async () => {
      try {
        const response = await axios.get("http://localhost:4000/api/reclusos");
        setReclusos(response.data);
      } catch (error) {
        console.error("Error al obtener los reclusos:", error);
      }
    };

    fetchReclusos();
  }, []);

  return (
    <div
      className="ver-reclusos-container"
      style={{ backgroundImage: `url(${policiaBG})` }}
    >
      <h1 className="ver-reclusos-titulo">Lista de Reclusos</h1>
      <table className="ver-reclusos-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Dirección</th>
            <th>Descripción</th>
          </tr>
        </thead>
        <tbody>
          {reclusos.map((recluso) => (
            <tr key={recluso.id_recluso}>
              <td>{recluso.id_recluso}</td>
              <td>{recluso.nombre}</td>
              <td>{recluso.direccion}</td>
              <td>{recluso.descripcion}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <button className="ver-reclusos-back-button" onClick={() => navigate(-1)}>
        🔙 Atrás
      </button>
    </div>
  );
};

export default VerReclusos;
