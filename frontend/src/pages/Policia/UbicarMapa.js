import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./UbicarMapa.css";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";

// Icono personalizado para el marcador de ubicación
const locationIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
  iconSize: [35, 35], // Tamaño del icono
  iconAnchor: [17, 34], // Punto de anclaje para que la punta esté en la coordenada exacta
});

const UbicarMapa = () => {
  const { lat, lng, id_dispositivo } = useParams();
  const navigate = useNavigate();
  const [map, setMap] = useState(null);
  const [marker, setMarker] = useState(null);
  const [dispositivoData, setDispositivoData] = useState(null);

  // Nueva llamada en UbicarMapa.js
  const fetchReclusoData = async () => {
    try {
      const response = await axios.get(
        `http://localhost:4000/api/recluso/dispositivo/${id_dispositivo}`
      );
      setDispositivoData(response.data);
    } catch (error) {
      console.error(
        "Error al obtener la información del recluso y dispositivo:",
        error
      );
    }
  };

  // Inicialización del mapa y marcador
  useEffect(() => {
    // Inicializar el mapa al cargar el componente
    const initialMap = L.map("map").setView([lat, lng], 16);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(initialMap);

    const initialMarker = L.marker([lat, lng], { icon: locationIcon })
      .addTo(initialMap)
      .bindTooltip("Cargando datos...");

    setMap(initialMap);
    setMarker(initialMarker);

    fetchReclusoData(); // Llamada inicial para obtener los datos

    const interval = setInterval(fetchReclusoData, 10000); // Actualiza cada 10 segundos

    return () => {
      clearInterval(interval);
      initialMap.remove();
    };
  }, [lat, lng, id_dispositivo]);

  // useEffect para actualizar el contenido del tooltip y la posición del marcador
  useEffect(() => {
    if (map && marker && dispositivoData) {
      const {
        recluso_nombre = "N/A",
        direccion = "No disponible",
        descripcion = "No especificado",
        latitud,
        longitud,
      } = dispositivoData;

      // Actualizar el tooltip con la información del recluso
      marker.setTooltipContent(
        `<strong>Recluso:</strong> ${recluso_nombre}<br/>
         <strong>Dirección:</strong> ${direccion}<br/>
         <strong>Delito:</strong> ${descripcion}<br/>
         <strong>Última ubicación:</strong> ${latitud || lat}, ${
          longitud || lng
        }`
      );

      // Actualizar la posición del marcador y centrar el mapa si las coordenadas han cambiado
      if (
        latitud &&
        longitud &&
        (latitud !== marker.getLatLng().lat ||
          longitud !== marker.getLatLng().lng)
      ) {
        marker.setLatLng([latitud, longitud]);
        map.setView([latitud, longitud], map.getZoom(), { animate: true });
      }
    }
  }, [map, marker, dispositivoData]);

  // Función para acercar el mapa al marcador
  const handleZoom = () => {
    if (map && marker) {
      map.setView(marker.getLatLng(), 18); // Ajusta el zoom para acercar la vista
    }
  };

  return (
    <div className="ubicar-mapa">
      <div id="map" className="map-container"></div>
      <div className="button-container">
        <button className="zoom-button" onClick={handleZoom}>
          Señalar
        </button>
        <button className="back-button" onClick={() => navigate(-1)}>
          Volver
        </button>
      </div>
    </div>
  );
};

export default UbicarMapa;
