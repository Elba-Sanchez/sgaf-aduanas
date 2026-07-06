// initialData.js — Datos mockeados iniciales de la aplicación

export const USUARIOS_INIT = [
  { id: 1, nombre: "Fernando Salazar Muñoz", run: "12.345.678-9", rol: "Administrador", aduana: "Los Libertadores", correo: "fsalazar@aduana.cl" },
  { id: 2, nombre: "Carolina Espinoza Reyes", run: "15.987.654-3", rol: "Funcionario", aduana: "Pino Hachado", correo: "cespinoza@aduana.cl" },
  { id: 3, nombre: "Rodrigo Fuentes Castillo", run: "18.456.123-K", rol: "Funcionario", aduana: "Los Libertadores", correo: "rfuentes@aduana.cl" },
];

export const SOLICITUDES_INIT = [
  {
    id: "SOL-101", tipo: "Declaración SAG", solicitante: "Andrea Contreras Silva", identificacion: "Pasaporte A998231",
    estado: "Pendiente", fecha: "2026-06-04 10:14"
  },
  {
    id: "SOL-102", tipo: "Validación de menor", solicitante: "Matías Herrera Poblete", identificacion: "RUT 18.231.992-K",
    estado: "Pendiente", fecha: "2026-06-04 11:02"
  },
  {
    id: "SOL-103", tipo: "Validación de vehículo", solicitante: "Francisca Morales Díaz", identificacion: "Patente AA-234-BB",
    estado: "Pendiente", fecha: "2026-06-04 11:45"
  },
  {
    id: "SOL-104", tipo: "Declaración SAG", solicitante: "Ignacio Vargas Rojas", identificacion: "RUT 15.667.123-4",
    estado: "Aprobado", fecha: "2026-06-04 09:12"
  },
  {
    id: "SOL-105", tipo: "Validación de vehículo", solicitante: "Camila Sepúlveda Torres", identificacion: "Patente AF-998-LK",
    estado: "Rechazado", fecha: "2026-06-04 08:30"
  },
];

export const AUDIT_INIT = [
  { id: 1, timestamp: "2026-06-04 14:22:10", usuario: "fsalazar@aduana.cl", accion: "Modificación de permisos de usuario ID 2" },
  { id: 2, timestamp: "2026-06-04 14:15:32", usuario: "cespinoza@aduana.cl", accion: "Aprobación documento Vehículo SOL-103" },
  { id: 3, timestamp: "2026-06-04 13:45:11", usuario: "cespinoza@aduana.cl", accion: "Consulta RUT 14.552.123-4 en módulo PDI" },
  { id: 4, timestamp: "2026-06-04 12:10:04", usuario: "fsalazar@aduana.cl", accion: "Ingreso Vehículo Argentino Patente: AC992LL" },
];

export const USERS_LOGIN = {
  "12345678-9": { pass: "pasajero123", role: "pasajero", name: "María González" },
  "87654321-0": { pass: "func123", role: "funcionario", name: "Carlos Rodríguez" },
  "admin": { pass: "admin123", role: "admin", name: "Administrador SGAF" },
  "pdi001": { pass: "pdi123", role: "pdi", name: "Insp. Pedro Vásquez (PDI)" },
};
