import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './infoDispositivos.css';

const InfoRecluso = () => {
  const { id_dispositivo } = useParams();  // Obtener el ID del dispositivo desde la URL
  const [dispositivo, setDispositivo] = useState(null);  // Estado para almacenar la información del dispositivo

  useEffect(() => {
    const token = localStorage.getItem('token');

    const fetchDispositivoData = async () => {
      try {
        const response = await fetch(`/api/dispositivos/${id_dispositivo}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          setDispositivo(data);  // Guardar la información del dispositivo
        } else {
          console.error('Error al obtener la información del dispositivo');
        }
      } catch (error) {
        console.error('Error del servidor:', error);
      }
    };

    fetchDispositivoData();
  }, [id_dispositivo]);

  if (!dispositivo) {
    return <div>Cargando...</div>;  // Mostrar mientras se carga la información
  }

  return (
    <div className="info-recluso">
      <h1>Información del Dispositivo {dispositivo.id_dispositivo}</h1>
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
            <td>{dispositivo.open_close === 1 ? 'Abierto' : 'Cerrado'}</td>
          </tr>
          <tr>
            <td>Revisado</td>
            <td>{dispositivo.revisado === 1 ? 'Sí' : 'No'}</td>
          </tr>
          <tr>
            <td>Dentro del Rango</td>
            <td>{dispositivo.in_range === 1 ? 'Sí' : 'No'}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default InfoRecluso;
