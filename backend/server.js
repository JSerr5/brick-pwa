import mysql from "mysql2/promise";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcryptjs";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import { generateToken, verifyToken } from "./auth.js";

// Cargar las variables de entorno desde el archivo .env
dotenv.config();

const app = express();
app.use(bodyParser.json()); // Parsear JSON automáticamente en todas las solicitudes

// Configuración de conexión a la base de datos MySQL
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  connectionLimit: 10, // Limitar el número máximo de conexiones simultáneas
});

// Simular __dirname en ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuración de CORS para permitir solo el frontend local
const allowedOrigins = ["http://localhost:3000"];
app.use(cors({ origin: allowedOrigins }));

// -------------------- Rutas de la API --------------------

// Ruta para el login de usuarios
app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;

  // Validar si los campos están presentes
  if (!username || !password) {
    console.log("Faltan campos de usuario o contraseña");
    return res
      .status(400)
      .json({ message: "Faltan campos de usuario o contraseña" });
  }

  try {
    let role = ""; // Determinar el rol del usuario
    let userQuery;

    // Determinar la tabla y el rol según el prefijo del username
    if (username.startsWith("p")) {
      role = "policia";
      userQuery = await pool.query(
        "SELECT * FROM policias WHERE id_policia = ?",
        [username]
      );
      const user = userQuery[0][0];
      if (!user) {
        return res.status(400).json({ message: "Credenciales incorrectas" });
      }

      // Generar el token JWT y devolverlo junto con el rol e ID
      const token = generateToken({ id: user.id_policia, role });
      return res.json({ token, role, id: user.id_policia });
    } else if (username.startsWith("t")) {
      role = "tecnico";
      userQuery = await pool.query(
        "SELECT * FROM tecnicos WHERE id_tecnico = ?",
        [username]
      );
      const user = userQuery[0][0];
      if (!user) {
        return res.status(400).json({ message: "Credenciales incorrectas" });
      }

      // Generar el token JWT y devolverlo junto con el rol e ID
      const token = generateToken({ id: user.id_tecnico, role });
      return res.json({ token, role, id: user.id_tecnico });
    } else if (username === "admin") {
      role = "admin";
      userQuery = await pool.query("SELECT * FROM admins WHERE username = ?", [
        username,
      ]);
      const user = userQuery[0][0];
      if (!user) {
        return res.status(400).json({ message: "Credenciales incorrectas" });
      }

      // Generar el token JWT y devolverlo junto con el rol e ID
      const token = generateToken({ id: user.id, role });
      return res.json({ token, role, id: user.id });
    }

    const user = userQuery[0][0]; // Acceder al primer resultado
    if (!user) {
      console.log("Credenciales incorrectas");
      return res.status(400).json({ message: "Credenciales incorrectas" });
    }

    // Verificar la contraseña
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.log("Contraseña incorrecta");
      return res.status(400).json({ message: "Credenciales incorrectas" });
    }

    // Enviar el token junto con el rol y el id
    const token = generateToken({ id: user.id, role });
    return res.json({ token, role, id: user.id });
  } catch (error) {
    console.error("Error del servidor en /api/login:", error);
    return res.status(500).json({ message: "Error del servidor" });
  }
});

// Ruta para obtener los datos del usuario autenticado
app.get("/api/user", verifyToken, async (req, res) => {
  console.log("Ruta /api/user alcanzada");

  try {
    const { userRole: role, userId: id } = req; // Obtener el rol e id desde el token verificado
    let userQuery;

    if (role === "policia") {
      userQuery = await pool.query(
        "SELECT nombre FROM policias WHERE id_policia = ?",
        [id]
      );
    } else if (role === "tecnico") {
      userQuery = await pool.query(
        "SELECT nombre FROM tecnicos WHERE id_tecnico = ?",
        [id]
      );
    } else if (role === "admin") {
      userQuery = await pool.query(
        "SELECT nombre FROM admins WHERE id = ?",
        [id]
      );
    } else {
      return res.status(400).json({ message: "Rol no reconocido" });
    }

    const user = userQuery[0][0];
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    console.log("Datos del usuario:", user);
    return res.json({ nombre: user.nombre, role });
  } catch (error) {
    console.error("Error en /api/user:", error);
    return res.status(500).json({ message: "Error en el servidor" });
  }
});

// Nueva ruta para obtener datos específicos de admin
app.get("/api/admin/data", verifyToken, async (req, res) => {
  console.log("Ruta /api/admin/data alcanzada");

  try {
    const { userRole: role } = req; // Obtener el rol desde el token

    if (role !== "admin") {
      return res.status(403).json({ message: "Acceso denegado" });
    }

    // Consultas para obtener datos de técnicos y policías
    const [tecnicos] = await pool.query("SELECT id_tecnico, nombre FROM tecnicos");
    const [policias] = await pool.query("SELECT id_policia, nombre FROM policias");

    console.log("Datos obtenidos para admin");

    return res.json({
      tecnicos,
      policias,
    });
  } catch (error) {
    console.error("Error en /api/admin/data:", error);
    return res.status(500).json({ message: "Error en el servidor" });
  }
});

// -------------------- Rutas para manejar dispositivos --------------------

// Ruta para obtener la lista de dispositivos
app.get("/api/dispositivos", async (req, res) => {
  try {
    const dispositivosQuery = await pool.query(
      "SELECT id_dispositivo FROM dispositivos"
    );
    const dispositivos = dispositivosQuery[0];

    if (!dispositivos.length) {
      console.log("No se encontraron dispositivos");
      return res
        .status(404)
        .json({ message: "No se encontraron dispositivos" });
    }

    // Enviar la lista de dispositivos al frontend
    return res.json(dispositivos);
  } catch (error) {
    console.error("Error al obtener los dispositivos:", error);
    return res
      .status(500)
      .json({ message: "Error al obtener los dispositivos" });
  }
});

// Ruta para obtener la información de un dispositivo por ID
app.get("/api/dispositivos/:id_dispositivo", async (req, res) => {
  const { id_dispositivo } = req.params;
  try {
    const dispositivoQuery = await pool.query(
      "SELECT * FROM dispositivos WHERE id_dispositivo = ?",
      [id_dispositivo]
    );
    const dispositivo = dispositivoQuery[0][0];

    if (!dispositivo) {
      console.log("Dispositivo no encontrado");
      return res.status(404).json({ message: "Dispositivo no encontrado" });
    }

    // Devolver la información del dispositivo
    return res.json(dispositivo);
  } catch (error) {
    console.error("Error al obtener el dispositivo:", error);
    return res.status(500).json({ message: "Error al obtener el dispositivo" });
  }
});

// -------------------- Manejo de rutas no encontradas --------------------

// Rutas de API no encontradas
app.use("/api/*", (req, res) => {
  console.log("Recurso API no encontrado:", req.originalUrl);
  return res.status(404).json({ message: "Recurso API no encontrado" });
});

// Servir archivos estáticos de React desde el build
app.use(express.static(path.join(__dirname, "frontend/build")));

// Redirigir cualquier ruta no gestionada al frontend (React)
app.get("*", (req, res) => {
  console.log("Redirigiendo a React para la ruta:", req.originalUrl);
  res.sendFile(path.join(__dirname, "frontend/build", "index.html"));
});

// -------------------- Iniciar el servidor --------------------
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
