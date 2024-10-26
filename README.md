# BRICK - Sistema de Monitoreo de Reclusos 🚧 *(En Desarrollo)*

Este es el repositorio del proyecto **BRICK**, un sistema de monitoreo de reclusos basado en una PWA (Progressive Web App) que permite a los usuarios autorizados, como técnicos y policías, acceder a información en tiempo real sobre dispositivos de monitoreo y sus estados. **El proyecto está actualmente en desarrollo.**

## Descripción del Proyecto 📋

El sistema está diseñado para monitorizar el estado y la ubicación de los reclusos mediante dispositivos de rastreo. Cada usuario con un rol específico tiene acceso a un panel de control personalizado:
- **Policías** pueden acceder a un panel donde monitorean el estado y la ubicación de los dispositivos asociados a reclusos bajo su supervisión.
- **Técnicos** tienen un panel para gestionar el estado técnico de los dispositivos y acceder a detalles específicos.
- **Administradores** pueden gestionar el acceso de usuarios y permisos dentro de la aplicación.

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

## Estado del Proyecto 🚧

> **Este proyecto está en desarrollo activo.** Algunas funcionalidades pueden estar incompletas o en pruebas, y se están realizando mejoras y ajustes continuamente. Algunas rutas y vistas pueden cambiar en futuras versiones.

## Instalación y Uso 🛠️

> **Nota:** Este proyecto está en desarrollo y algunos pasos de instalación pueden cambiar en futuras versiones.

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

4. **Inicia el servidor y la aplicación de React**:

    - En el directorio `backend`:
        ```bash
        node server.js
        ```

    - En el directorio `frontend`:
        ```bash
        npm start
        ```

## Contribuciones 🤝

Dado que el proyecto está en desarrollo, actualmente no se aceptan contribuciones externas. Sin embargo, si tienes sugerencias o encuentras algún problema, por favor abre un issue en GitHub.

---

**BRICK - Sistema de Monitoreo de Reclusos**  
Proyecto en desarrollo, creado para mejorar la seguridad y control en la supervisión de dispositivos de monitoreo.
