import mysql from 'mysql2/promise';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url'; // Necesario para obtener el __dirname en ES Modules
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();  // Cargar las variables de entorno

const app = express();
app.use(bodyParser.json());

// Conexión a la base de datos MySQL
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
  });

// Simular el comportamiento de __dirname en ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configurar CORS - Se permiten tanto dominios de producción como locales para desarrollo
const allowedOrigins = ['http://localhost:3000'];
app.use(
  cors({
    origin: process.env.NODE_ENV === 'development' ? allowedOrigins : '*', // En desarrollo, permite cualquier origen
  })
);

const JWT_SECRET = process.env.JWT_SECRET;  // Obtener JWT_SECRET desde .env

// Ruta de API para login
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Faltan campos de usuario o contraseña' });
  }

  try {
    let userQuery;
    let user;
    let role = '';

    // Determinar la tabla dependiendo del tipo de usuario
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

    user = userQuery[0][0];  // En mysql2 los resultados están en un array dentro de otro array

    if (!user) {
      return res.status(400).json({ message: 'Usuario no encontrado' });
    }

    // Comparar la contraseña ingresada con la almacenada en la base de datos
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (isPasswordValid) {
      // Generar token JWT dependiendo del rol
      const token = jwt.sign(
        { id: user.id_policia || user.id_tecnico || user.id_admin, role: role },
        JWT_SECRET,
        { expiresIn: '2h' }
      );

      return res.json({ token });
    } else {
      return res.status(400).json({ message: 'Credenciales incorrectas' });
    }
  } catch (error) {
    return res.status(500).json({ message: 'Error del servidor' });
  }
});

// Ruta de API para obtener los datos del usuario actual
app.get('/api/user', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1]; // Obtener el token del header

  if (!token) {
    return res.status(401).json({ message: 'Token no proporcionado' });
  }

  try {
    // Verificar el token JWT
    const decoded = jwt.verify(token, JWT_SECRET);

    let userQuery;
    let user;

    if (decoded.role === 'policía') {
      userQuery = await pool.query('SELECT nombre FROM policias WHERE id_policia = ?', [decoded.id]);
    } else if (decoded.role === 'técnico') {
      userQuery = await pool.query('SELECT nombre FROM tecnicos WHERE id_tecnico = ?', [decoded.id]);
    }

    user = userQuery[0][0];  // En mysql2 los resultados están en un array dentro de otro array

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    return res.json({ nombre: user.nombre, role: decoded.role });
  } catch (error) {
    return res.status(401).json({ message: 'Token inválido' });
  }
});

// Ruta de API para obtener los dispositivos
app.get('/api/dispositivos', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1]; // Obtener el token del header

  if (!token) {
    return res.status(401).json({ message: 'Token no proporcionado' });
  }

  try {
    // Verificar el token JWT
    const decoded = jwt.verify(token, JWT_SECRET);

    // Consulta para obtener los dispositivos
    const dispositivosQuery = await pool.query('SELECT id_dispositivo FROM dispositivos');
    const dispositivos = dispositivosQuery[0];  // En mysql2 los resultados están en un array

    if (!dispositivos.length) {
      return res.status(404).json({ message: 'No se encontraron dispositivos' });
    }

    // Devolver los dispositivos en formato JSON
    return res.json(dispositivos);
  } catch (error) {
    console.error('Error al verificar el token o consultar los dispositivos:', error);
    return res.status(500).json({ message: 'Error del servidor' });
  }
});

// Ruta de API para obtener la información detallada de un dispositivo por su ID
app.get('/api/dispositivos/:id_dispositivo', async (req, res) => {
  const { id_dispositivo } = req.params;
  const token = req.headers.authorization?.split(' ')[1]; // Obtener el token del header

  if (!token) {
    return res.status(401).json({ message: 'Token no proporcionado' });
  }

  try {
    // Verificar el token JWT
    const decoded = jwt.verify(token, JWT_SECRET);

    // Consulta para obtener la información detallada del dispositivo
    const dispositivoQuery = await pool.query('SELECT * FROM dispositivos WHERE id_dispositivo = ?', [id_dispositivo]);
    const dispositivo = dispositivoQuery[0][0];  // En mysql2 los resultados están en un array

    if (!dispositivo) {
      return res.status(404).json({ message: 'Dispositivo no encontrado' });
    }

    // Devolver la información del dispositivo en formato JSON
    return res.json(dispositivo);
  } catch (error) {
    console.error('Error al obtener el dispositivo:', error);
    return res.status(500).json({ message: 'Error del servidor' });
  }
});

// Manejar rutas de API no encontradas (404) y redirigir a acceso denegado
app.use('/api', (req, res, next) => {
    res.redirect('/frontend/src/pages/Denied/AccessDenied.js'); // Redirigir a la página de acceso denegado
  });
  
  // Redirigir cualquier otra ruta no gestionada a acceso denegado
  app.get('*', (req, res) => {
    res.redirect('/frontend/src/pages/Denied/AccessDenied.js'); // Redirigir a la página de acceso denegado
  });

// Servir archivos estáticos desde la carpeta 'build' de React
app.use(express.static(path.join(__dirname, 'build')));

// Iniciar el servidor
const PORT = process.env.PORT || 4000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor corriendo en http://0.0.0.0:${PORT}`);
});
