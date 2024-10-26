import React from "react";
import { HashRouter as Router, Route, Routes } from "react-router-dom";
import LoginComponent from "./pages/Login/LoginComponent.js";
import DashboardPolicia from "./pages/Policia/DashboardPolicia.js";
import DashboardTecnico from "./pages/Tecnico/DashboardTecnico.js";
import DashboardAdmin from "./pages/Admin/DashboardAdmin.js";
import InfoDispositivo from "./pages/Dispositivos/infoDispositivos.js";
import AccessDenied from "./pages/Denied/AccessDenied.js";
import ProtectedRoute from "./components/ProtectedRoute.js";
import GestionarTecnicos from "./pages/Admin/GestionarTecnicos";
import GestionarPolicias from "./pages/Admin/GestionarPolicias";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginComponent />} />
        <Route path="/" element={<LoginComponent />} />

        {/* Rutas protegidas */}
        <Route
          path="/dashboard-policia"
          element={
            <ProtectedRoute>
              <DashboardPolicia />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard-tecnico"
          element={
            <ProtectedRoute>
              <DashboardTecnico />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard-admin"
          element={
            <ProtectedRoute>
              <DashboardAdmin />
            </ProtectedRoute>
          }
        />
        <Route
          path="/infoDispositivos/:id_dispositivo"
          element={
            <ProtectedRoute>
              <InfoDispositivo />
            </ProtectedRoute>
          }
        />

        {/* Rutas de CRUD para Admin */}
        <Route
          path="/gestionar-tecnicos"
          element={
            <ProtectedRoute>
              <GestionarTecnicos />
            </ProtectedRoute>
          }
        />
        <Route
          path="/gestionar-policias"
          element={
            <ProtectedRoute>
              <GestionarPolicias />
            </ProtectedRoute>
          }
        />

        {/* Ruta para acceso denegado */}
        <Route path="/access-denied" element={<AccessDenied />} />
      </Routes>
    </Router>
  );
}

export default App;
