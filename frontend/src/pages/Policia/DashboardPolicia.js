import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './DashboardPolicia.css';
import policiaImageLeft from '../../assets/images/policia.jpg';  // Imagen a la izquierda
import policiaImageRight from '../../assets/images/alertaPL.jpg'; // Imagen a la derecha
import policiaBG from '../../assets/images/policiaBG.jpg';  // Imagen de fondo

const DashboardPolicia = () => {
  const navigate = useNavigate();
  const [nombrePolicia, setNombrePolicia] = useState('');  // Estado para almacenar el nombre
  const [role, setRole] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token'); // Obtener el token JWT del localStorage

    if (!token) {
      navigate('/login');
      return;
    }

    // Realizar la petición a la API para obtener el nombre del usuario
    const fetchUserData = async () => {
      try {
        const response = await fetch('/api/user', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`, // Enviar el token en el header
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          setNombrePolicia(data.nombre);  // Guardar el nombre en el estado
          setRole(data.role);  // Guardar el rol (opcional, por si se requiere en otras partes)
        } else {
          navigate('/login');
        }
      } catch (error) {
        navigate('/login');
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="dashboard-policia" style={{ backgroundImage: `url(${policiaBG})` }}>
      <header className="policia-header">
        <div className="logo-container">
          <img src={policiaImageLeft} alt="Policia" className="policia-logo" />
        </div>
        <div className="policia-title-container">
          <h1 className="policia-title">Bienvenido {nombrePolicia}</h1>  {/* Mostrar el nombre dinámicamente */}
        </div>
        <div className="logo-container">
          <img src={policiaImageRight} alt="Alerta" className="policia-logo" />
        </div>
      </header>
      <div className="policia-options">
        <button className="policia-button">Localizar Recluso</button>
        <button className="policia-button">Ver Alertas</button>
      </div>
      <button className="logout-button" onClick={handleLogout}>Cerrar Sesión</button>
    </div>
  );
};

export default DashboardPolicia;
