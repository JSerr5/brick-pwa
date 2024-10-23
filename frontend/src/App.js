import React from 'react';
import { HashRouter as Router, Route, Routes } from 'react-router-dom';
import LoginComponent from './pages/Login/LoginComponent.js';
import DashboardPolicia from './pages/Policia/DashboardPolicia.js';
import DashboardTecnico from './pages/Tecnico/DashboardTecnico.js';
import DashboardAdmin from './pages/Admin/DashboardAdmin.js';
import InfoRecluso from './pages/Dispositivos/infoDispositivos.js';
import ProtectedRoute from './router/ProtectedRoute.js';
import AccessDenied from './pages/Denied/AccessDenied.js';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginComponent />} />
        <Route path="/dashboard-policia" element={
          <ProtectedRoute role="policía">
            <DashboardPolicia />
          </ProtectedRoute>
        } />
        <Route path="/dashboard-tecnico" element={
          <ProtectedRoute role="técnico">
            <DashboardTecnico />
          </ProtectedRoute>
        } />
        <Route path="/dashboard-admin" element={
          <ProtectedRoute role="admin">
            <DashboardAdmin />
          </ProtectedRoute>
        } />
        <Route path="/infoDispositivos/:id_dispositivo" element={
          <ProtectedRoute role="técnico">
            <InfoRecluso />   {/* Añadir la nueva ruta */}
          </ProtectedRoute>
        } />
        <Route path="/access-denied" element={<AccessDenied />} />
        <Route path="/" element={<LoginComponent />} />
      </Routes>
    </Router>
  );
}

export default App;
