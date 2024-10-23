import React from 'react';
import { useNavigate } from 'react-router-dom';
import './DashboardAdmin.css';
import adminImageI from '../../assets/images/admin-I.jpg';
import adminImageD from '../../assets/images/admin-D.jpg';
import adminBG from '../../assets/images/adminBG.jpg';

const DashboardAdmin = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    return (
        <div className="dashboard-admin" style={{ backgroundImage: `url(${adminBG})` }}>
            <header className="admin-header">
                <div className="logo-container">
                    <img src={adminImageD} alt="Admin" className="admin-logo" />
                </div>
                <div className="admin-title-container">
                    <h1 className="admin-title">ADMIN SUPREMO</h1>
                </div>
                <div className="logo-container">
                    <img src={adminImageI} alt="Admin" className="admin-logo" />
                </div>
            </header>
            <div className="admin-options">
                <button className="admin-button">Gestionar Técnicos</button>
                <button className="admin-button">Gestionar Policías</button>
                <button className="admin-button">Gestionar Admin</button>
            </div>
            <button className="logout-button" onClick={handleLogout}>Cerrar sesión</button>
        </div>
    );
};

export default DashboardAdmin;
