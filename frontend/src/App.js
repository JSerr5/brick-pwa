import React, { useEffect, useState } from "react";
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
import GestionarDispositivos from "./pages/Dispositivos/GestionarDispositivos";
import CrudDispositivos from "./pages/Dispositivos/CrudDispositivos";
import UbicarMapa from "./pages/Policia/UbicarMapa";
import GestionarReclusos from "./pages/Admin/GestionarReclusos.js";
import VerReclusos from "./pages/Policia/VerReclusos.js";

function App() {
  const [apiData, setApiData] = useState(null);

  // Llamada a la API al cargar la aplicación
  useEffect(() => {
    const apiUrl = process.env.REACT_APP_API_URL;
  }, []);

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
          path="/ver-reclusos"
          element={
            <ProtectedRoute>
              <VerReclusos />
            </ProtectedRoute>
          }
        />

        <Route
          path="/ubicar/:lat/:lng/:id_dispositivo"
          element={
            <ProtectedRoute>
              <UbicarMapa />
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
        <Route
          path="/gestionar-reclusos"
          element={
            <ProtectedRoute>
              <GestionarReclusos />
            </ProtectedRoute>
          }
        />

        {/* Rutas de CRUD para Dispositivos en Técnicos */}
        <Route
          path="/gestionar-dispositivos"
          element={
            <ProtectedRoute>
              <GestionarDispositivos />
            </ProtectedRoute>
          }
        />

        <Route
          path="/crud-dispositivos"
          element={
            <ProtectedRoute>
              <CrudDispositivos />
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
