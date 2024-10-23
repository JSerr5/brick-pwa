import React from 'react';
import { Navigate } from 'react-router-dom';
import decodeToken from '../services/decodeToken.js';

const ProtectedRoute = ({ role, children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" />;
  }

  try {
    const decodedToken = decodeToken(token);

    // Verificar el rol
    if (decodedToken.role !== role) {
      return <Navigate to="/access-denied" />;
    }

    return children;
  } catch (error) {
    return <Navigate to="/login" />;
  }
};

export default ProtectedRoute;
