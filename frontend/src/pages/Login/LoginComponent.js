import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LoginComponent.css";
import "../Alert/Alert.css";
import background from "../../assets/images/background.jpg";
import logo from "../../assets/images/logo.jpg";
import policia from "../../assets/images/policia.jpg";
import tecnico from "../../assets/images/tecnico.jpg";
import Alert from "../Alert/Alert.js";
import showIcon from "../../assets/images/show-icon.png";
import hideIcon from "../../assets/images/hide-icon.png";
import welcomeAudio from "../../assets/audios/welcome.mp3";

function LoginComponent() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const soundPlayed = sessionStorage.getItem("soundPlayed");
    const isMobilePWA = () => {
      return (
        window.matchMedia("(display-mode: standalone)").matches &&
        /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
      );
    };

    if (!soundPlayed && isMobilePWA()) {
      const audio = new Audio(welcomeAudio);
      const playAudio = async () => {
        try {
          await audio.play();
          sessionStorage.setItem("soundPlayed", "true");
        } catch (error) {
          window.addEventListener(
            "click",
            () => {
              audio.play();
              sessionStorage.setItem("soundPlayed", "true");
            },
            { once: true }
          );
        }
      };
      playAudio();
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // DEBUG: Mostrar el username y password que se están enviando
    console.log("Intentando iniciar sesión con usuario:", username);
    console.log("Contraseña:", password);

    try {
      const response = await fetch("http://localhost:4000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      // DEBUG: Mostrar el objeto de respuesta completa
      console.log("Respuesta del servidor:", response);

      if (!response.ok) {
        const errorData = await response.json();
        console.log("Error en el login:", errorData); // DEBUG: Mostrar el error recibido
        setError(errorData.message || "Error desconocido");
        setLoading(false);
        return;
      }

      const data = await response.json();
      console.log("Datos recibidos del servidor:", data); // DEBUG: Mostrar datos recibidos

      // Guardar el token en localStorage antes de redirigir
      localStorage.setItem("token", data.token); // Asegurarse de almacenar el token

      // Redirigir basado en el rol recibido desde el backend
      if (data.role === "policia") {
        console.log("Redirigiendo al dashboard de policía"); // DEBUG
        navigate(`/dashboard-policia?id=${data.id}`);
      } else if (data.role === "tecnico") {
        console.log("Redirigiendo al dashboard de técnico");
        localStorage.setItem("idTecnico", data.id); // Guardar el id del técnico si es necesario
        navigate(`/dashboard-tecnico?id=${data.id}`);
      } else if (data.role === "admin") {
        console.log("Redirigiendo al dashboard de admin"); // DEBUG
        navigate(`/dashboard-admin?id=${data.id}`);
      } else {
        setError("Rol desconocido");
        console.log("Rol desconocido:", data.role); // DEBUG: Rol que no coincide con ningún caso
      }
    } catch (error) {
      console.error("Error en el servidor:", error); // DEBUG: Mostrar cualquier error de conexión
      setError("Error en el servidor, intenta de nuevo más tarde.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="app"
      style={{
        backgroundImage: `url(${background})`,
        height: "100vh",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
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
              type={showPassword ? "text" : "password"}
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
            {loading ? "Cargando..." : "Iniciar Sesión"}
          </button>
        </form>

        <Alert message={error} onClose={() => setError("")} />
      </div>
    </div>
  );
}

export default LoginComponent;
