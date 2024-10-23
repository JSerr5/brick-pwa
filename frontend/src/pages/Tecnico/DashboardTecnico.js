import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './DashboardTecnico.css';
import tecnicoImageLeft from '../../assets/images/tecnico.jpg';  // Imagen a la izquierda
import alertaImageRight from '../../assets/images/alertaTC.jpg'; // Imagen a la derecha
import tecnicoBG from '../../assets/images/tecnicoBG.jpg';  // Imagen de fondo

const DashboardTecnico = () => {
  const navigate = useNavigate();
  const [nombreTecnico, setNombreTecnico] = useState('');
  const [dispositivos, setDispositivos] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      navigate('/login');
      return;
    }

    const fetchUserData = async () => {
      try {
        const response = await fetch('/api/user', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          setNombreTecnico(data.nombre);

          // Realizar la petición para obtener los dispositivos
          const dispositivosResponse = await fetch('/api/dispositivos', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });

          if (dispositivosResponse.ok) {
            const dispositivosData = await dispositivosResponse.json();
            setDispositivos(dispositivosData);
          }
        } else {
          navigate('/login');
        }
      } catch (error) {
        navigate('/login');
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleDispositivoChange = (e) => {
    const dispositivoSeleccionado = e.target.value;
    navigate(`/infoDispositivos/${dispositivoSeleccionado}`);  // Redirigir a la nueva página
  };  

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="dashboard-tecnico" style={{ backgroundImage: `url(${tecnicoBG})` }}>
      <header className="tecnico-header">
        <div className="logo-container">
          <img src={tecnicoImageLeft} alt="Tecnico" className="tecnico-logo" />
        </div>
        <div className="tecnico-title-container">
          <h1 className="tecnico-title">Bienvenido {nombreTecnico}</h1>  
        </div>
        <div className="logo-container">
          <img src={alertaImageRight} alt="Alerta" className="tecnico-logo" />
        </div>
      </header>
      <div className="tecnico-options">
        <select id="dispositivo-select" className="tecnico-select" onChange={handleDispositivoChange}>
          <option value="" disabled selected>Seleccionar dispositivo</option>
          {dispositivos.map((dispositivo, index) => (
            <option key={index} value={dispositivo.id_dispositivo}>
              {dispositivo.id_dispositivo}
            </option>
          ))}
        </select>
      </div>
      <button className="logout-button" onClick={handleLogout}>Cerrar Sesión</button>
    </div>
  );
};

export default DashboardTecnico;
