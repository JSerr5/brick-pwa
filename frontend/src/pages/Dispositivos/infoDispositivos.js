import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./infoDispositivos.css";
import tecnicoBG from "../../assets/images/tecnicoBG.jpg";

const InfoDispositivo = () => {
  const { id_dispositivo } = useParams();
  const navigate = useNavigate();
  const [dispositivo, setDispositivo] = useState(null);

  // ID del técnico desde localStorage (puedes adaptarlo si se guarda de otra forma)
  const idTecnico = localStorage.getItem("id_tecnico");

  useEffect(() => {
    const fetchDispositivoData = async () => {
      try {
        const response = await fetch(
          `http://localhost:4000/api/dispositivos/${id_dispositivo}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setDispositivo(data);
          console.log("Datos del dispositivo obtenidos:", data);
        } else {
          console.error("Error al obtener la información del dispositivo");
        }
      } catch (error) {
        console.error("Error del servidor:", error);
      }
    };

    fetchDispositivoData();
  }, [id_dispositivo]);

  if (!dispositivo) {
    return <div>Cargando...</div>;
  }

  const handleBack = () => {
    const idTecnico = localStorage.getItem("idTecnico"); // Recupera el ID del técnico de localStorage
    navigate(`/dashboard-tecnico?id=${idTecnico}`);
  };

  return (
    <div
      className="info-dispositivo"
      style={{
        backgroundImage: `url(${tecnicoBG})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        minHeight: "100vh",
        paddingTop: "0",
        paddingBottom: "0",
        margin: "0",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between", // Para distribuir el contenido
      }}
    >
      <h1 className="info-title">
        Información del Dispositivo {dispositivo.id_dispositivo}
      </h1>

      <table className="info-table">
        <thead>
          <tr>
            <th>Atributo</th>
            <th>Valor</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>ID del Dispositivo</td>
            <td>{dispositivo.id_dispositivo}</td>
          </tr>
          <tr>
            <td>Latitud</td>
            <td>{dispositivo.latitud}</td>
          </tr>
          <tr>
            <td>Longitud</td>
            <td>{dispositivo.longitud}</td>
          </tr>
          <tr>
            <td>Estado (Open/Close)</td>
            <td>{dispositivo.open_close === 1 ? "Abierto" : "Cerrado"}</td>
          </tr>
          <tr>
            <td>Revisado</td>
            <td>{dispositivo.revisado === 1 ? "Sí" : "No"}</td>
          </tr>
          <tr>
            <td>Dentro del Rango</td>
            <td>{dispositivo.in_range === 1 ? "Sí" : "No"}</td>
          </tr>
        </tbody>
      </table>
      <button onClick={handleBack} className="back-button">
        Atrás
      </button>
    </div>
  );
};

export default InfoDispositivo;
