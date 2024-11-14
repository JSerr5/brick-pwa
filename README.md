# BRICK - Sistema de Monitoreo de Reclusos 🚀 *(Finalizado)*

Este es el repositorio del proyecto **BRICK**, un sistema de monitoreo de reclusos basado en una PWA (Progressive Web App) que permite a los usuarios autorizados, como técnicos y policías, acceder a información en tiempo real sobre dispositivos de monitoreo y sus estados. **El proyecto está actualmente finalizado.**

## Tecnologías Utilizadas 🛠️

<p align="center">
  <img src="https://img.shields.io/badge/-JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" />
  <img src="https://img.shields.io/badge/-React-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/-Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white" />
  <img src="https://img.shields.io/badge/-MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white" />
  <img src="https://img.shields.io/badge/-HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white" />
  <img src="https://img.shields.io/badge/-CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white" />
  <img src="https://img.shields.io/badge/-JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white" />
  <img src="https://img.shields.io/badge/-bcrypt-4A90E2?style=for-the-badge&logo=lock&logoColor=white" />
</p>

## Descripción del Proyecto 📋

El sistema está diseñado para monitorizar el estado y la ubicación de los reclusos mediante dispositivos de rastreo. Cada usuario con un rol específico tiene acceso a un panel de control personalizado:
- **Policías**: monitorean el estado y la ubicación de los dispositivos asociados a reclusos bajo su supervisión.
- **Técnicos**: gestionan el estado técnico de los dispositivos y acceden a detalles específicos.
- **Administradores**: gestionan el acceso de usuarios y permisos dentro de la aplicación.

La interfaz principal es una PWA accesible tanto en dispositivos móviles como en navegadores web.

## Tecnologías Utilizadas 🛠️

El proyecto está desarrollado utilizando las siguientes tecnologías:

- **Frontend**: React.js
- **Backend**: Node.js y Express
- **Base de Datos**: MySQL
- **Autenticación y Autorización**: JWT (JSON Web Tokens) para el manejo de roles y permisos
- **Otros**:
  - **bcrypt.js** para el cifrado de contraseñas
  - **dotenv** para la gestión de variables de entorno

## Estado del Proyecto 🚀

> **Este proyecto está finalizado.** Todas las funcionalidades previstas han sido implementadas y probadas exitosamente.

## Instalación y Uso 🛠️

1. **Clona el repositorio**:

    ```bash
    git clone https://github.com/tuusuario/brick-pwa.git
    ```

2. **Instala las dependencias** para el backend y el frontend:

    - Para el backend:
        ```bash
        cd backend
        npm install
        ```

    - Para el frontend:
        ```bash
        cd frontend
        npm install
        ```

3. **Configura las variables de entorno** en el archivo `.env` dentro del directorio `backend` (consulta `example.env` para las variables necesarias).

4. **Construye la aplicación de React**:

    - En el directorio `frontend`, ejecuta:
        ```bash
        npm run build
        ```

5. **Inicia el servidor y la aplicación de React**:

    - En el directorio `backend`:
        ```bash
        node server.js
        ```

    - En el directorio `frontend` (en caso de servidor local):
        ```bash
        npm start
        o
        node https-server.js
        ```

## Contribuciones 🤝

Dado que el proyecto está finalizado, actualmente no se aceptan contribuciones externas. Sin embargo, si tienes sugerencias o encuentras algún problema, por favor abre un issue en GitHub.

---

**BRICK - Sistema de Monitoreo de Reclusos**  
Proyecto finalizado, creado para mejorar la seguridad y control en la supervisión de dispositivos de monitoreo.

---