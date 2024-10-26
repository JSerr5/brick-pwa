import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import "./infoDispositivos.css";
import tecnicoBG from "../../assets/images/tecnicoBG.jpg";

const InfoDispositivo = () => {
  const { id_dispositivo } = useParams(); // Obtener el ID del dispositivo desde los parámetros de la URL
  const navigate = useNavigate();
  const [dispositivo, setDispositivo] = useState(null); // Estado para almacenar los datos del dispositivo

  useEffect(() => {
    const token = localStorage.getItem("token");
    console.log("Token encontrado en localStorage:", token); // DEBUG: Verificar si el token está presente

    // Verificación de la existencia del token
    if (!token) {
      console.warn("No se encontró token, redirigiendo a login."); // DEBUG
      navigate("/login");
      return;
    }

    try {
      // Decodificación del token para verificar el rol
      const decodedToken = jwtDecode(token);
      console.log("Token decodificado:", decodedToken); // DEBUG: Mostrar el contenido del token decodificado

      if (decodedToken.role !== "tecnico") {
        console.warn("Rol no autorizado para acceder a este componente."); // DEBUG
        navigate("/access-denied");
        return;
      }

      // Obtener la información del dispositivo
      const fetchDispositivoData = async () => {
        try {
          console.log(
            `Consultando la información del dispositivo ID: ${id_dispositivo}`
          ); // DEBUG

          const response = await fetch(
            `http://localhost:4000/api/dispositivos/${id_dispositivo}`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`, // Asegúrate de que el token esté en el formato correcto
              },
            }
          );

          console.log(
            "Respuesta del servidor para /api/dispositivos/:id_dispositivo:",
            response
          ); // DEBUG

          if (response.ok) {
            const data = await response.json();
            setDispositivo(data);
            console.log("Datos del dispositivo obtenidos:", data); // DEBUG
          } else {
            console.error(
              "Error al obtener la información del dispositivo:",
              response.status
            ); // DEBUG
            navigate("/access-denied");
          }
        } catch (error) {
          console.error(
            "Error del servidor al obtener los datos del dispositivo:",
            error
          ); // DEBUG
          navigate("/access-denied");
        }
      };

      fetchDispositivoData();
    } catch (error) {
      console.error("Error al decodificar el token:", error); // DEBUG
      localStorage.removeItem("token"); // Eliminar token inválido
      navigate("/access-denied");
    }
  }, [id_dispositivo, navigate]);

  if (!dispositivo) {
    return <div>Cargando...</div>; // Muestra un estado de carga mientras se obtienen los datos
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
