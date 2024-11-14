import mysql from "mysql2/promise";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcryptjs";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import { generateToken, verifyToken } from "./auth.js";
import { hashPassword } from "./hashPassword.js";
import { check, validationResult } from "express-validator";

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

// Configuración de CORS para permitir solo el frontend local en HTTP y HTTPS
const allowedOrigins = ["http://localhost:3000", "https://localhost:3443"];

app.use(
  cors({
    origin: function (origin, callback) {
      // Permite solicitudes desde los orígenes especificados o desde un origen nulo (por ejemplo, para pruebas locales sin origen)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Origen no permitido por CORS"));
      }
    },
    credentials: true, // Permite el uso de cookies y credenciales
  })
);

// -------------------- Rutas de la API --------------------

// Ruta para el login de usuarios
app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    // *console.log("Faltan campos de usuario o contraseña");
    return res
      .status(400)
      .json({ message: "Faltan campos de usuario o contraseña" });
  }

  try {
    let role = "";
    let userQuery;
    let user;

    // Determinar la tabla y el rol según el prefijo del username
    if (username.startsWith("p")) {
      role = "policia";
      userQuery = await pool.query(
        "SELECT * FROM policias WHERE id_policia = ?",
        [username]
      );
    } else if (username.startsWith("t")) {
      role = "tecnico";
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
      return res.status(400).json({ message: "Rol no reconocido" });
    }

    user = userQuery[0][0];

    if (!user) {
      // *console.log("Credenciales incorrectas");
      return res.status(400).json({ message: "Credenciales incorrectas" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      // *console.log("Contraseña incorrecta");
      return res.status(400).json({ message: "Credenciales incorrectas" });
    }

    const token = generateToken({
      id: user.id || user.id_tecnico || user.id_policia,
      role,
    });
    return res.json({
      token,
      role,
      id: user.id || user.id_tecnico || user.id_policia,
    });
  } catch (error) {
    console.error("Error del servidor en /api/login:", error);
    return res.status(500).json({ message: "Error del servidor" });
  }
});

// Ruta para obtener los datos del usuario autenticado
app.get("/api/user", verifyToken, async (req, res) => {
  // *console.log("Ruta /api/user alcanzada");

  try {
    const { userRole: role, userId: id } = req;
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
      userQuery = await pool.query("SELECT nombre FROM admins WHERE id = ?", [
        id,
      ]);
    } else {
      return res.status(400).json({ message: "Rol no reconocido" });
    }

    const user = userQuery[0][0];
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // *console.log("Datos del usuario:", user);
    return res.json({ nombre: user.nombre, role });
  } catch (error) {
    console.error("Error en /api/user:", error);
    return res.status(500).json({ message: "Error en el servidor" });
  }
});

// Ruta para obtener datos específicos de admin
app.get("/api/admin/data", verifyToken, async (req, res) => {
  // *console.log("Ruta /api/admin/data alcanzada");

  try {
    const { userRole: role } = req;

    if (role !== "admin") {
      return res.status(403).json({ message: "Acceso denegado" });
    }

    const [tecnicos] = await pool.query(
      "SELECT id_tecnico, nombre FROM tecnicos"
    );
    const [policias] = await pool.query(
      "SELECT id_policia, nombre FROM policias"
    );

    // *console.log("Datos obtenidos para admin");

    return res.json({
      tecnicos,
      policias,
    });
  } catch (error) {
    console.error("Error en /api/admin/data:", error);
    return res.status(500).json({ message: "Error en el servidor" });
  }
});

// -------------------- Rutas para crud de tecnicos --------------------

// Crear un nuevo técnico
app.post(
  "/api/tecnicos",
  [
    check("nombre").notEmpty().withMessage("El nombre es requerido"),
    check("password")
      .isLength({ min: 6 })
      .withMessage("La contraseña debe tener al menos 6 caracteres"),
    check("ciudad").notEmpty().withMessage("La ciudad es requerida"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { nombre, password, ciudad } = req.body;
    const MAX_ID_NUMBER = 9999999; // Límite máximo para el número del ID

    try {
      // Obtener el último ID de técnico y calcular el nuevo ID
      const [lastTechnician] = await pool.query(
        "SELECT id_tecnico FROM tecnicos ORDER BY id_tecnico DESC LIMIT 1"
      );
      let newId;

      if (lastTechnician.length > 0) {
        const lastIdNumber = parseInt(
          lastTechnician[0].id_tecnico.replace("t", "")
        );
        if (lastIdNumber >= MAX_ID_NUMBER) {
          return res.status(400).json({
            message: "Se ha alcanzado el límite máximo de IDs para técnicos.",
          });
        }
        newId = `t${lastIdNumber + 1}`;
      } else {
        newId = "t1"; // Si no hay registros, empieza con t1
      }

      const hashedPassword = await hashPassword(password);
      await pool.query(
        "INSERT INTO tecnicos (id_tecnico, nombre, password, ciudad) VALUES (?, ?, ?, ?)",
        [newId, nombre, hashedPassword, ciudad]
      );

      res.status(201).json({ message: "Técnico creado", tecnicoId: newId });
    } catch (error) {
      console.error("Error al crear técnico:", error);
      res.status(500).json({ message: "Error en el servidor" });
    }
  }
);

// Leer todos los técnicos
app.get("/api/tecnicos", async (req, res) => {
  try {
    const [tecnicos] = await pool.query(
      "SELECT id_tecnico, nombre, ciudad FROM tecnicos"
    );
    res.json(tecnicos);
  } catch (error) {
    console.error("Error al obtener técnicos:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
});

// Actualizar un técnico
app.put(
  "/api/tecnicos/:id",
  [
    check("nombre").notEmpty().withMessage("El nombre es requerido"),
    check("password")
      .optional()
      .isLength({ min: 6 })
      .withMessage("La contraseña debe tener al menos 6 caracteres"),
    check("ciudad").notEmpty().withMessage("La ciudad es requerida"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { nombre, password, ciudad } = req.body;
    const { id } = req.params;
    try {
      const hashedPassword = password ? await hashPassword(password) : null;
      await pool.query(
        "UPDATE tecnicos SET nombre = ?, ciudad = ?, password = COALESCE(?, password) WHERE id_tecnico = ?",
        [nombre, ciudad, hashedPassword, id]
      );
      res.json({ message: "Técnico actualizado" });
    } catch (error) {
      console.error("Error al actualizar técnico:", error);
      res.status(500).json({ message: "Error en el servidor" });
    }
  }
);

// Eliminar un técnico
app.delete("/api/tecnicos/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM tecnicos WHERE id_tecnico = ?", [id]);
    res.json({ message: "Técnico eliminado" });
  } catch (error) {
    console.error("Error al eliminar técnico:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
});

// -------------------- Rutas para crud de policias --------------------

// Crear un nuevo policía
app.post(
  "/api/policias",
  [
    check("nombre").notEmpty().withMessage("El nombre es requerido"),
    check("password")
      .isLength({ min: 6 })
      .withMessage("La contraseña debe tener al menos 6 caracteres"),
    check("cai_asignado")
      .notEmpty()
      .withMessage("El CAI asignado es requerido"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { nombre, password, cai_asignado } = req.body;
    const MAX_ID_NUMBER = 9999999; // Establece un límite máximo para el número

    try {
      // Obtener el último ID de policía y calcular el nuevo ID
      const [lastPolice] = await pool.query(
        "SELECT id_policia FROM policias ORDER BY id_policia DESC LIMIT 1"
      );
      let newId;

      if (lastPolice.length > 0) {
        const lastIdNumber = parseInt(
          lastPolice[0].id_policia.replace("p", "")
        );
        if (lastIdNumber >= MAX_ID_NUMBER) {
          return res.status(400).json({
            message: "Se ha alcanzado el límite máximo de IDs para policías.",
          });
        }
        newId = `p${lastIdNumber + 1}`;
      } else {
        newId = "p1"; // Si no hay registros, empieza con p1
      }

      const hashedPassword = await hashPassword(password);
      await pool.query(
        "INSERT INTO policias (id_policia, nombre, password, cai_asignado) VALUES (?, ?, ?, ?)",
        [newId, nombre, hashedPassword, cai_asignado]
      );

      res.status(201).json({ message: "Policía creado", policiaId: newId });
    } catch (error) {
      console.error("Error al crear policía:", error);
      res.status(500).json({ message: "Error en el servidor" });
    }
  }
);

// Leer todos los policías
app.get("/api/policias", async (req, res) => {
  try {
    const [policias] = await pool.query(
      "SELECT id_policia, nombre, cai_asignado FROM policias"
    );
    res.json(policias);
  } catch (error) {
    console.error("Error al obtener policías:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
});

// Actualizar un policía
app.put(
  "/api/policias/:id",
  [
    check("nombre").notEmpty().withMessage("El nombre es requerido"),
    check("password")
      .optional()
      .isLength({ min: 6 })
      .withMessage("La contraseña debe tener al menos 6 caracteres"),
    check("cai_asignado")
      .notEmpty()
      .withMessage("El CAI asignado es requerido"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { nombre, password, cai_asignado } = req.body;
    const { id } = req.params;
    try {
      const hashedPassword = password ? await hashPassword(password) : null;
      await pool.query(
        "UPDATE policias SET nombre = ?, cai_asignado = ?, password = COALESCE(?, password) WHERE id_policia = ?",
        [nombre, cai_asignado, hashedPassword, id]
      );
      res.json({ message: "Policía actualizado" });
    } catch (error) {
      console.error("Error al actualizar policía:", error);
      res.status(500).json({ message: "Error en el servidor" });
    }
  }
);

// Eliminar un policía
app.delete("/api/policias/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM policias WHERE id_policia = ?", [id]);
    res.json({ message: "Policía eliminado" });
  } catch (error) {
    console.error("Error al eliminar policía:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
});

// -------------------- Rutas para manejar dispositivos --------------------

// Ruta para obtener la lista de dispositivos y verificar si necesitan revisión
app.get("/api/dispositivos", async (req, res) => {
  try {
    const dispositivosQuery = await pool.query(
      "SELECT id_dispositivo, revisado, date_revisado FROM dispositivos"
    );
    const dispositivos = dispositivosQuery[0];
    const currentDate = new Date();

    // Revisar cada dispositivo para ver si la fecha de revisión es anterior a hoy
    dispositivos.forEach((dispositivo) => {
      const reviewDate = new Date(dispositivo.date_revisado);
      if (reviewDate < currentDate) {
        // Si la fecha es anterior a hoy, marcar como no revisado y establecer needsReview
        dispositivo.revisado = 0;
        dispositivo.needsReview = true;
      } else {
        dispositivo.needsReview = false;
      }
    });

    // Enviar la lista de dispositivos al frontend con el campo needsReview actualizado
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
      return res.status(404).json({ message: "Dispositivo no encontrado" });
    }

    // Verificar si date_revisado es anterior a hoy y actualizar "revisado" a 0 si es necesario
    const currentDate = new Date();
    const reviewDate = new Date(dispositivo.date_revisado);
    if (reviewDate < currentDate && dispositivo.revisado !== 0) {
      await pool.query(
        "UPDATE dispositivos SET revisado = 0 WHERE id_dispositivo = ?",
        [id_dispositivo]
      );
      dispositivo.revisado = 0; // Actualizar también el objeto para enviar al frontend
    }

    // Devolver la información del dispositivo actualizada
    return res.json(dispositivo);
  } catch (error) {
    console.error("Error al obtener el dispositivo:", error);
    return res.status(500).json({ message: "Error al obtener el dispositivo" });
  }
});

// Ruta para actualizar el estado de revisión y la fecha de revisión de un dispositivo por ID
app.put("/api/dispositivos/:id_dispositivo", async (req, res) => {
  const { id_dispositivo } = req.params;
  const { revisado, date_revisado } = req.body;

  // Verificar que date_revisado sea posterior a la fecha actual
  const currentDate = new Date();
  const selectedDate = new Date(date_revisado);
  if (selectedDate <= currentDate) {
    return res.status(400).json({
      message: "La fecha de revisión debe ser posterior a la fecha actual.",
    });
  }

  try {
    const updateQuery = `
      UPDATE dispositivos 
      SET revisado = ?, date_revisado = ? 
      WHERE id_dispositivo = ?
    `;
    const [result] = await pool.query(updateQuery, [
      revisado,
      date_revisado,
      id_dispositivo,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Dispositivo no encontrado" });
    }

    return res
      .status(200)
      .json({ message: "Dispositivo actualizado correctamente" });
  } catch (error) {
    console.error("Error al actualizar el dispositivo:", error);
    return res
      .status(500)
      .json({ message: "Error al actualizar el dispositivo" });
  }
});

// Ruta para añadir un nuevo dispositivo
app.post("/api/dispositivos", async (req, res) => {
  try {
    // Obtener el número máximo de ID en la base de datos y extraer solo la parte numérica después de 'd'
    const lastDispositivoQuery = await pool.query(
      "SELECT MAX(CAST(SUBSTRING(id_dispositivo, 2) AS UNSIGNED)) AS max_id FROM dispositivos"
    );
    const lastIdNumber = lastDispositivoQuery[0][0].max_id;

    // Incrementar el número para el nuevo ID
    const newIdNumber = lastIdNumber ? lastIdNumber + 1 : 1;
    const newIdDispositivo = `d${newIdNumber}`;

    // Insertar el nuevo dispositivo en la base de datos con la fecha actual
    const insertQuery = `
      INSERT INTO dispositivos (id_dispositivo, revisado, date_revisado)
      VALUES (?, 0, CURDATE())
    `;
    await pool.query(insertQuery, [newIdDispositivo]);

    return res.status(201).json({
      message: "Dispositivo añadido correctamente",
      dispositivo: { id_dispositivo: newIdDispositivo },
    });
  } catch (error) {
    console.error("Error al añadir el dispositivo:", error);
    return res.status(500).json({ message: "Error al añadir el dispositivo" });
  }
});

// Ruta para eliminar un dispositivo por ID
app.delete("/api/dispositivos/:id_dispositivo", async (req, res) => {
  const { id_dispositivo } = req.params;

  try {
    const deleteQuery = "DELETE FROM dispositivos WHERE id_dispositivo = ?";
    const [result] = await pool.query(deleteQuery, [id_dispositivo]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Dispositivo no encontrado" });
    }

    return res
      .status(200)
      .json({ message: "Dispositivo eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar el dispositivo:", error);
    return res
      .status(500)
      .json({ message: "Error al eliminar el dispositivo" });
  }
});

// -------------------- Rutas para alertas de los dispositivos --------------------

// Endpoint para obtener alertas activas (dispositivos fuera de rango)
app.get("/api/alertas", async (req, res) => {
  try {
    // Consulta a la base de datos para obtener dispositivos con in_range = 0
    const [alertas] = await pool.query(`
      SELECT d.id_dispositivo, d.latitud, d.longitud, r.id_recluso, r.nombre, r.direccion
      FROM dispositivos d
      JOIN reclusos r ON r.dispositivo_asignado = d.id_dispositivo
      WHERE d.in_range = 0 OR d.open_close = 1
    `);

    res.json(alertas); // Devuelve solo las alertas activas
  } catch (error) {
    console.error("Error al obtener alertas activas:", error);
    res.status(500).json({ error: "Error al obtener alertas" });
  }
});

// -------------------- Rutas para obtener datos de los reclusos --------------------

// Ruta para obtener la información de un recluso por ID de dispositivo
app.get("/api/recluso/dispositivo/:id_dispositivo", async (req, res) => {
  const { id_dispositivo } = req.params;
  console.log("ID del dispositivo recibido:", id_dispositivo);
  try {
    const dispositivoQuery = await pool.query(
      `SELECT d.id_dispositivo, d.latitud, d.longitud, d.date_revisado, d.revisado,
              r.nombre AS recluso_nombre, r.direccion, r.descripcion
       FROM dispositivos d
       JOIN reclusos r ON r.dispositivo_asignado = d.id_dispositivo
       WHERE d.id_dispositivo = ?`,
      [id_dispositivo]
    );

    const dispositivo = dispositivoQuery[0][0];
    console.log("Resultado de la consulta:", dispositivo);

    if (!dispositivo) {
      return res
        .status(404)
        .json({ message: "Dispositivo no encontrado o sin recluso asignado" });
    }

    res.json(dispositivo);
  } catch (error) {
    console.error(
      "Error al obtener la información del recluso y dispositivo:",
      error
    );
    res
      .status(500)
      .json({ message: "Error en el servidor al obtener el dispositivo" });
  }
});

// -------------------- Rutas para manejar reclusos --------------------

// Crear un nuevo recluso
app.post("/api/reclusos", async (req, res) => {
  const { nombre, direccion, descripcion, dispositivo_asignado } = req.body;

  try {
    // Obtener el último ID de recluso y generar un nuevo ID
    const lastReclusoQuery = await pool.query(
      "SELECT MAX(CAST(SUBSTRING(id_recluso, 2) AS UNSIGNED)) AS max_id FROM reclusos"
    );
    const lastIdNumber = lastReclusoQuery[0][0].max_id;
    const newIdNumber = lastIdNumber ? lastIdNumber + 1 : 1;
    const newIdRecluso = `r${newIdNumber}`;

    // Insertar el nuevo recluso en la base de datos
    await pool.query(
      `INSERT INTO reclusos (id_recluso, nombre, direccion, descripcion, dispositivo_asignado)
       VALUES (?, ?, ?, ?, ?)`,
      [newIdRecluso, nombre, direccion, descripcion, dispositivo_asignado]
    );

    return res.status(201).json({
      message: "Recluso creado correctamente",
      recluso: {
        id_recluso: newIdRecluso,
        nombre,
        direccion,
        descripcion,
        dispositivo_asignado,
      },
    });
  } catch (error) {
    console.error("Error al crear el recluso:", error);
    res.status(500).json({ message: "Error al crear el recluso" });
  }
});

// Obtener todos los reclusos
app.get("/api/reclusos", async (req, res) => {
  try {
    const reclusosQuery = await pool.query(
      `SELECT id_recluso, nombre, direccion, descripcion, dispositivo_asignado
       FROM reclusos`
    );
    res.json(reclusosQuery[0]);
  } catch (error) {
    console.error("Error al obtener reclusos:", error);
    res.status(500).json({ message: "Error al obtener reclusos" });
  }
});

// Actualizar un recluso
app.put("/api/reclusos/:id_recluso", async (req, res) => {
  const { id_recluso } = req.params;
  const { nombre, direccion, descripcion, dispositivo_asignado } = req.body;

  try {
    const result = await pool.query(
      `UPDATE reclusos
       SET nombre = ?, direccion = ?, descripcion = ?, dispositivo_asignado = ?
       WHERE id_recluso = ?`,
      [nombre, direccion, descripcion, dispositivo_asignado, id_recluso]
    );

    if (result[0].affectedRows === 0) {
      return res.status(404).json({ message: "Recluso no encontrado" });
    }

    res.json({ message: "Recluso actualizado correctamente" });
  } catch (error) {
    console.error("Error al actualizar recluso:", error);
    res.status(500).json({ message: "Error al actualizar el recluso" });
  }
});

// Eliminar un recluso
app.delete("/api/reclusos/:id_recluso", async (req, res) => {
  const { id_recluso } = req.params;

  try {
    const result = await pool.query(
      "DELETE FROM reclusos WHERE id_recluso = ?",
      [id_recluso]
    );

    if (result[0].affectedRows === 0) {
      return res.status(404).json({ message: "Recluso no encontrado" });
    }

    res.json({ message: "Recluso eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar recluso:", error);
    res.status(500).json({ message: "Error al eliminar el recluso" });
  }
});

// -------------------- Ruta para obtener dispositivos disponibles --------------------

// Obtener dispositivos no asignados a reclusos
app.get("/api/dispositivos-disponibles", async (req, res) => {
  try {
    const dispositivosQuery = await pool.query(
      `SELECT id_dispositivo
       FROM dispositivos
       WHERE id_dispositivo NOT IN (SELECT dispositivo_asignado FROM reclusos WHERE dispositivo_asignado IS NOT NULL)`
    );
    res.json(dispositivosQuery[0]);
  } catch (error) {
    console.error("Error al obtener dispositivos disponibles:", error);
    res
      .status(500)
      .json({ message: "Error al obtener dispositivos disponibles" });
  }
});

// -------------------- Manejo de rutas no encontradas --------------------

// Rutas de API no encontradas
app.use("/api/*", (req, res) => {
  // *console.log("Recurso API no encontrado:", req.originalUrl);
  return res.status(404).json({ message: "Recurso API no encontrado" });
});

// Servir archivos estáticos de React desde el build
app.use(express.static(path.join(__dirname, "frontend/build")));

// Redirigir cualquier ruta no gestionada al frontend (React)
app.get("*", (req, res) => {
  // *console.log("Redirigiendo a React para la ruta:", req.originalUrl);
  res.sendFile(path.join(__dirname, "frontend/build", "index.html"));
});

// -------------------- Iniciar el servidor --------------------
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  // *console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
