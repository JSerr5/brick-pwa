import React from 'react';
import './Alert.css';  // Estilos separados para el alert

function Alert({ message, onClose }) {
  if (!message) return null; // Si no hay mensaje, no mostrar nada

  return (
    <div className="alert-overlay">
      <div className="alert-box">
        <p>{message}</p>
        <button onClick={onClose} className="alert-close-button">Cerrar</button>
      </div>
    </div>
  );
}

export default Alert;
