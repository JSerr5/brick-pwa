const https = require("https");
const fs = require("fs");
const path = require("path");
const express = require("express");

const app = express();

// Sirve los archivos de la carpeta build
app.use(express.static(path.join(__dirname, "build")));

// Redirige todas las solicitudes al index.html (para que funcione con React Router)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

// Configuración del certificado y clave
const options = {
  key: fs.readFileSync("server.key"),
  cert: fs.readFileSync("server.cert"),
};

// Inicia el servidor HTTPS
https.createServer(options, app).listen(3443, "0.0.0.0", () => {
  console.log("Servidor HTTPS escuchando en https://localhost:3443");
  console.log(
    "Para acceder desde otro dispositivo, usa https://[IP_LOCAL]:3443"
  );
});
