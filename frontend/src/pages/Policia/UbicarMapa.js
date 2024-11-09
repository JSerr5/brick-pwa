import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./UbicarMapa.css";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const UbicarMapa = () => {
  const { lat, lng } = useParams(); // Extrae latitud y longitud de la URL
  const navigate = useNavigate();

  useEffect(() => {
    // Inicializar el mapa cuando el componente se monta
    const map = L.map("map").setView([lat, lng], 16);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Añadir un marcador en la ubicación del recluso
    L.marker([lat, lng]).addTo(map).bindPopup("Ubicación actual del recluso").openPopup();

    // Limpiar el mapa cuando se desmonte el componente
    return () => map.remove();
  }, [lat, lng]);

  return (
    <div className="ubicar-mapa">
      <button className="back-button" onClick={() => navigate(-1)}>Volver</button>
      <div id="map" className="map-container"></div>
    </div>
  );
};

export default UbicarMapa;
