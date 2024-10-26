import jwt from 'jsonwebtoken';

// Función para generar el token JWT
export function generateToken(user) {
    const payload = {
        id: user.id,
        role: user.role
    };
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
}

// Middleware para verificar el token JWT
export function verifyToken(req, res, next) {
    const token = req.headers["authorization"];
    if (!token) {
        return res.status(403).json({ message: "Token no proporcionado" });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            console.log("Token no válido:", err);
            return res.status(401).json({ message: "Token no válido" });
        }

        req.userId = decoded.id;
        req.userRole = decoded.role;
        next();
    });
}
