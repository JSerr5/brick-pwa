import React from 'react';
import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode'; // Importación correcta sin llaves

const ProtectedRoute = ({ component: Component }) => {
  const token = localStorage.getItem('token');

  if (!token) {
    console.log('No token found, redirecting to login...');
    return <Navigate to="/login" />;
  }

  try {
    const decodedToken = jwtDecode(token);
    console.log('Token decodificado:', decodedToken);

    const currentTime = Date.now() / 1000;
    console.log(`Tiempo actual: ${currentTime}, Expiración del token: ${decodedToken.exp}`);

    if (decodedToken.exp < currentTime) {
      console.log('Token expired, redirecting to login...');
      localStorage.removeItem('token');
      return <Navigate to="/login" />;
    }

    console.log('Token is valid, rendering protected route...');
    return <Component />;
  } catch (error) {
    console.log('Error decoding token or other issue, redirecting to login...', error);
    localStorage.removeItem('token');
    return <Navigate to="/login" />;
  }
};

export default ProtectedRoute;
