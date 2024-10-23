import React from 'react';
import './AccessDenied.css';  // Importa el archivo CSS

const AccessDenied = () => {
  return (
    <div className="access-denied-container">
      <h1 className="access-denied-title">Acceso Denegado</h1>
      <p className="access-denied-text">No tienes permisos para acceder a esta página.</p>
    </div>
  );
};

export default AccessDenied;
