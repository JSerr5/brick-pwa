import mysql from "mysql2/promise";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";

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

const JWT_SECRET = process.env.JWT_SECRET; // Secreto para firmar los JWT

// Middleware para verificar y decodificar el token JWT
const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]; // Obtener el token del encabezado
  if (!token) {
    console.log("Token no proporcionado");
    return res.status(401).json({ message: "Token no proporcionado" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET); // Verificar y decodificar el token
    req.user = decoded; // Almacenar los datos del token en `req.user`
    next(); // Pasar al siguiente middleware
  } catch (error) {
    console.error("Token inválido o expirado:", error); // Imprimir el error exacto
    return res.status(403).json({ message: "Token inválido o expirado" });
  }
};

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
      role = "policía";
      userQuery = await pool.query(
        "SELECT * FROM policias WHERE id_policia = ?",
        [username]
      );
    } else if (username.startsWith("t")) {
      role = "técnico";
      userQuery = await pool.query(
        "SELECT * FROM tecnicos WHERE id_tecnico = ?",
        [username]
      );
    } else if (username === "admin") {
      role = "admin";
      userQuery = await pool.query("SELECT * FROM admins WHERE username = ?", [
        username,
      ]);
    } else {
      console.log("Credenciales incorrectas");
      return res.status(400).json({ message: "Credenciales incorrectas" });
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

    // Generar el token JWT
    const token = jwt.sign(
      { id: user.id_policia || user.id_tecnico || user.id_admin, role },
      JWT_SECRET,
      { expiresIn: "2h" }
    );

    // Enviar el token y el rol al frontend
    console.log("Usuario autenticado:", username, "con rol:", role);
    return res.json({ token, role });
  } catch (error) {
    console.error("Error del servidor en /api/login:", error);
    return res.status(500).json({ message: "Error del servidor" });
  }
});

// Ruta para obtener los datos del usuario autenticado
app.get("/api/user", authenticateToken, async (req, res) => {
  console.log("Ruta /api/user alcanzada"); // Verificar si esta ruta es alcanzada

  try {
    const { role, id } = req.user; // Obtener el rol y ID del token
    let userQuery;

    if (role === "policía") {
      userQuery = await pool.query(
        "SELECT nombre FROM policias WHERE id_policia = ?",
        [id]
      );
    } else if (role === "técnico") {
      userQuery = await pool.query(
        "SELECT nombre FROM tecnicos WHERE id_tecnico = ?",
        [id]
      );
    } else {
      return res.status(400).json({ message: "Rol no reconocido" });
    }

    const user = userQuery[0][0];
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    console.log("Datos del usuario:", user); // Mostrar los datos del usuario en el servidor
    return res.json({ nombre: user.nombre, role });
  } catch (error) {
    console.error("Error en /api/user:", error); // Mostrar errores en la consola del servidor
    return res.status(500).json({ message: "Error en el servidor" });
  }
});

// -------------------- Rutas para manejar dispositivos --------------------

// Ruta para obtener la lista de dispositivos
app.get("/api/dispositivos", authenticateToken, async (req, res) => {
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
app.get(
  "/api/dispositivos/:id_dispositivo",
  authenticateToken,
  async (req, res) => {
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
      return res
        .status(500)
        .json({ message: "Error al obtener el dispositivo" });
    }
  }
);

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
