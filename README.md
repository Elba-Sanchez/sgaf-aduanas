# SGAF - Sistema de Gestión Aduanera Fronteriza

### Descripción
SGAF (Sistema de gestión Aduanera Fronteriza) o AduanApp, es una propuesta de sistema desarrollada para modernizar y optimizar los procesos de control fronterizo del Servicio Nacional de Aduanas de Chile.

Este proyecto busca digitalizar y automatizar procesos, actualmente manuales, permitiendo una gestión de estos mismos procesos más eficientes, de esta forma, reduciendo los tiempos de espera y mejorando la experiencia de los pasajeros y funcionarios.

Este repositorio contiene el prototipo web desarrollado con React + Vite como apoyo al levantamiento de requisitos y válidación de la interfaz del usuario.

### Objetivos
- Digitalizar procesos aduaneros.
- Reducir tiempos de espera en el paso fronterizo.
- Mejorar la coordinación entre los organismos involucrados.
- Centralizar la información de usuarios, vehículos y declaraciones.

# Instalación

### Clonar repo
- git clone <https://github.com/Elba-Sanchez/sgaf-aduanas.git>

### Ingresar al proyecto
- cd sgaf-aduanas

### Instalación de depedencias
- pnpm install

En algunos computadores es necesario instalar las dependencias utilizando 'npm' y asegurarse de qu Vite esté disponible antes de ejecutar el proyecto

- npm install
- npx vite
- pnpm dev

### Compilación para producción
- pnpm build

### Vista previa de producción
- pnpm preview

# Funcionalidades consideradas

## Gestión de Usuarios
- Registro de usuarios (Funcionario, Administrador, Pasajero).
- Inicio de sesión.
- Administración de perfiles y roles.

### Gestión de Documentos
- Validación de autorizaciones de menores.
- Gestión documental asociada a trámites aduaneros.

### Gestión Vehicular
- Registro de ingreso y salida de vehículos.
- Control de admisión temporal.

### Declaración SAG
- Registro digital de declaraciones.
- Validación de información ingresada.

### Reportes
- Generación de reportes estadísticos.
- Exportación de información.

# Tecnologías Utilizadas

### Frontend
- React 19
- Vite
- JavaScript(ES6+)
- CSS
- Lucide React

### Herramientas de Desarrollo
- ESLint
- pnpm / npm

# Estructura del Proyecto

```text
├── public/
│   ├── favicon.svg
│   └── icons.svg
└── src/
    ├── assets/
    ├── App.jsx
    ├── App.css
    ├── main.jsx
    └── index.css
```

# Relación con el proyecto Académico

Este prototipo fue desarrollado como parte del proyecto semestral de Ingeniería de Software, basado en la especificación de Requisitos de Software (ERS) del Sistema de Gestión Aduanera Fronteriza (SGAF).

El sistema considera la integración con organismos como:
- Servicio Nacional de Aduanas (SNA).
- Servicio Agrícola y Ganadero (SAG).
- Policía de Investigaciones (PDI).

# Equipo de Desarrollo

- Elba Sánchez / elb.sanchezs@duocuc.cl
- Ignacia Padilla / svt.nova@pm.me
