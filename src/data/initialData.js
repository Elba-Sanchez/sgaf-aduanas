// initialData.js — Datos mockeados iniciales de la aplicación

export const USUARIOS_INIT = [
  { id: 1, nombre: "Tulio Triviño", run: "12.345.678-9", rol: "Administrador", aduana: "Los Libertadores", correo: "tulio@aduana.cl" },
  { id: 2, nombre: "Juanin Juan Harry", run: "15.987.654-3", rol: "Funcionario", aduana: "Pino Hachado", correo: "juanin@aduana.cl" },
  { id: 3, nombre: "Patana Tufillo", run: "18.456.123-K", rol: "Funcionario", aduana: "Los Libertadores", correo: "tulio@aduana.cl" },
];

export const SOLICITUDES_INIT = [
  {
    id: "SOL-101", tipo: "Declaración SAG", solicitante: "Joseph Joestar", identificacion: "Pasaporte A998231",
    estado: "Pendiente", fecha: "2026-06-04 10:14"
  },
  {
    id: "SOL-102", tipo: "Validación de menor", solicitante: "Jotaro Kujo", identificacion: "RUT 18.231.992-K",
    estado: "Pendiente", fecha: "2026-06-04 11:02"
  },
  {
    id: "SOL-103", tipo: "Validación de vehículo", solicitante: "Josuke Higashikata", identificacion: "Patente AA-234-BB",
    estado: "Pendiente", fecha: "2026-06-04 11:45"
  },
  {
    id: "SOL-104", tipo: "Declaración SAG", solicitante: "Son Goku", identificacion: "RUT 15.667.123-4",
    estado: "Aprobado", fecha: "2026-06-04 09:12"
  },
  {
    id: "SOL-105", tipo: "Validación de vehículo", solicitante: "Dio Brando", identificacion: "Patente AF-998-LK",
    estado: "Rechazado", fecha: "2026-06-04 08:30"
  },
];

export const AUDIT_INIT = [
  { id: 1, timestamp: "2026-06-04 14:22:10", usuario: "tulio@aduana.cl", accion: "Modificación de permisos de usuario ID 2" },
  { id: 2, timestamp: "2026-06-04 14:15:32", usuario: "juanin@aduana.cl", accion: "Aprobación documento Vehículo SOL-103" },
  { id: 3, timestamp: "2026-06-04 13:45:11", usuario: "juanin@aduana.cl", accion: "Consulta RUT 14.552.123-4 en módulo PDI" },
  { id: 4, timestamp: "2026-06-04 12:10:04", usuario: "tulio@aduana.cl", accion: "Ingreso Vehículo Argentino Patente: AC992LL" },
];

export const USERS_LOGIN = {
  "12345678-9": { pass: "pasajero123", role: "pasajero", name: "María González" },
  "87654321-0": { pass: "func123", role: "funcionario", name: "Carlos Rodríguez" },
  "admin": { pass: "admin123", role: "admin", name: "Administrador SGAF" },
  "pdi001": { pass: "pdi123", role: "pdi", name: "Insp. Pedro Vásquez (PDI)" },
};
