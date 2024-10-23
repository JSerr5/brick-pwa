import mysql from 'mysql2/promise';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url'; 
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';

// Cargar las variables de entorno desde .env
dotenv.config();

const app = express();
app.use(bodyParser.json());

// Conexión a la base de datos MySQL
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  connectionLimit: 10 // Limitar el número de conexiones
});

// Simular __dirname en ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configurar CORS - Se permiten tanto dominios de producción como locales
const allowedOrigins = ['http://localhost:3000']; // Solo permitir localhost en desarrollo

app.use(cors({ origin: allowedOrigins }));

const JWT_SECRET = process.env.JWT_SECRET;

// Middleware para verificar el token
const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]; // Obtener el token
  if (!token) {
    return res.status(401).json({ message: 'Token no proporcionado' });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Almacenar los datos decodificados en req.user
    next(); // Pasar al siguiente middleware
  } catch (error) {
    return res.status(403).json({ message: 'Token inválido' });
  }
};

// -------------------- Rutas de API --------------------

// Ruta para login
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Faltan campos de usuario o contraseña' });
  }
  try {
    let role = '';
    let userQuery;
    
    // Determinar la tabla según el tipo de usuario
    if (username.startsWith('p')) {
      role = 'policía';
      userQuery = await pool.query('SELECT * FROM policias WHERE id_policia = ?', [username]);
    } else if (username.startsWith('t')) {
      role = 'técnico';
      userQuery = await pool.query('SELECT * FROM tecnicos WHERE id_tecnico = ?', [username]);
    } else if (username === 'admin') {
      role = 'admin';
      userQuery = await pool.query('SELECT * FROM admins WHERE username = ?', [username]);
    } else {
      return res.status(400).json({ message: 'Credenciales incorrectas' });
    }
    
    const user = userQuery[0][0]; // Acceder al primer resultado
    if (!user) {
      return res.status(400).json({ message: 'Usuario no encontrado' });
    }

    // Verificar la contraseña
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Credenciales incorrectas' });
    }

    // Generar el token JWT
    const token = jwt.sign(
      { id: user.id_policia || user.id_tecnico || user.id_admin, role },
      JWT_SECRET,
      { expiresIn: '2h' }
    );

    // Enviar el token y el rol al frontend
    return res.json({ token, role });

  } catch (error) {
    return res.status(500).json({ message: 'Error del servidor' });
  }
});

// Ruta para obtener los datos del usuario autenticado
app.get('/api/user', authenticateToken, async (req, res) => {
  try {
    let userQuery;
    const { role, id } = req.user;

    // Obtener los datos del usuario según su rol
    if (role === 'policía') {
      userQuery = await pool.query('SELECT nombre FROM policias WHERE id_policia = ?', [id]);
    } else if (role === 'técnico') {
      userQuery = await pool.query('SELECT nombre FROM tecnicos WHERE id_tecnico = ?', [id]);
    } else {
      return res.status(400).json({ message: 'Rol no reconocido' });
    }

    const user = userQuery[0][0];
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Devolver los datos del usuario
    return res.json({ nombre: user.nombre, role });

  } catch (error) {
    return res.status(500).json({ message: 'Error al obtener los datos del usuario' });
  }
});

// Ruta para obtener la lista de dispositivos
app.get('/api/dispositivos', authenticateToken, async (req, res) => {
  try {
    const dispositivosQuery = await pool.query('SELECT id_dispositivo FROM dispositivos');
    const dispositivos = dispositivosQuery[0]; // Resultados de MySQL

    if (!dispositivos.length) {
      return res.status(404).json({ message: 'No se encontraron dispositivos' });
    }

    // Devolver la lista de dispositivos
    return res.json(dispositivos);

  } catch (error) {
    return res.status(500).json({ message: 'Error al obtener los dispositivos' });
  }
});

// Ruta para obtener la información de un dispositivo por ID
app.get('/api/dispositivos/:id_dispositivo', authenticateToken, async (req, res) => {
  const { id_dispositivo } = req.params;
  try {
    const dispositivoQuery = await pool.query('SELECT * FROM dispositivos WHERE id_dispositivo = ?', [id_dispositivo]);
    const dispositivo = dispositivoQuery[0][0];

    if (!dispositivo) {
      return res.status(404).json({ message: 'Dispositivo no encontrado' });
    }

    // Devolver la información del dispositivo
    return res.json(dispositivo);

  } catch (error) {
    return res.status(500).json({ message: 'Error al obtener el dispositivo' });
  }
});

// -------------------- Manejo de rutas no encontradas --------------------
// Rutas de API no encontradas
app.use('/api', (req, res) => {
  res.status(404).json({ message: 'Recurso no encontrado' });
});

// Servir archivos estáticos de React desde el build
app.use(express.static(path.join(__dirname, 'frontend/build')));

// Redirigir cualquier ruta no gestionada al frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/build', 'index.html'));
});

// -------------------- Iniciar el servidor --------------------
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
