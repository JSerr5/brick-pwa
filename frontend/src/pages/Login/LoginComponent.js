import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import decodeToken from '../../services/decodeToken.js';
import './LoginComponent.css';
import '../Alert/Alert.css';
import background from '../../assets/images/background.jpg';
import logo from '../../assets/images/logo.jpg';
import policia from '../../assets/images/policia.jpg';
import tecnico from '../../assets/images/tecnico.jpg';
import Alert from '../Alert/Alert.js';
import showIcon from '../../assets/images/show-icon.png';
import hideIcon from '../../assets/images/hide-icon.png';
import welcomeAudio from '../../assets/audios/welcome.mp3'; // Importa el archivo de sonido

function LoginComponent() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const soundPlayed = sessionStorage.getItem('soundPlayed');
    const isMobilePWA = () => {
      return (
        window.matchMedia('(display-mode: standalone)').matches &&
        /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
      );
    };
  
    if (!soundPlayed && isMobilePWA()) {
      const audio = new Audio(welcomeAudio);
      const playAudio = async () => {
        try {
          await audio.play();
          sessionStorage.setItem('soundPlayed', 'true');
        } catch (error) {
          window.addEventListener('click', () => {
            audio.play();
            sessionStorage.setItem('soundPlayed', 'true');
          }, { once: true });
        }
      };
      playAudio();
    }
  }, []);
  

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:4000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.message || 'Error desconocido');
        setLoading(false);
        return;
      }

      const data = await response.json();
      if (data.token) {
        localStorage.setItem('token', data.token);

        try {
          const decodedToken = decodeToken(data.token);

          if (decodedToken.role === 'policía') {
            navigate('/dashboard-policia');
          } else if (decodedToken.role === 'técnico') {
            navigate('/dashboard-tecnico');
          } else if (decodedToken.role === 'admin') {
            navigate('/dashboard-admin');
          } else {
            setError('Rol desconocido');
          }
        } catch (error) {
          setError('El token ha expirado. Por favor, inicia sesión nuevamente.');
          localStorage.removeItem('token');
          navigate('/login');
        }
      } else {
        setError('Respuesta inválida del servidor');
      }
    } catch (error) {
      setError('Error en el servidor, intenta de nuevo más tarde.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app" style={{ backgroundImage: `url(${background})`, height: '100vh', backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <h1 className="app-title">BRICK - Monitoreo de Reclusos</h1>

      <div className="container">
        <div className="logo-container">
          <img src={logo} alt="BRICK Logo" className="app-logo" />
        </div>

        <div className="login-options">
          <div className="login-box">
            <img src={policia} alt="Policía" className="login-icon" />
          </div>
          <div className="login-box">
            <img src={tecnico} alt="Técnico" className="login-icon" />
          </div>
        </div>

        <form className="login-form" onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Usuario"
            className="login-input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={loading}
          />
          <div className="password-container">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Contraseña"
              className="login-input password-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
            <img
              src={showPassword ? hideIcon : showIcon}
              alt="Toggle Password Visibility"
              className="toggle-password-icon"
              onClick={() => setShowPassword(!showPassword)}
            />
          </div>
          <button type="submit" className="login-button" disabled={loading}>
            {loading ? 'Cargando...' : 'Iniciar Sesión'}
          </button>
        </form>

        <Alert message={error} onClose={() => setError('')} />
      </div>
    </div>
  );
}

export default LoginComponent;
