// initialData.js — Datos mockeados iniciales de la aplicación

export const USUARIOS_INIT = [
  { id: 1, nombre: "Fernando Salazar Muñoz", run: "16.234.567-8", rol: "Administrador", aduana: "Los Libertadores", correo: "fsalazar@aduana.cl" },
  { id: 2, nombre: "Carolina Espinoza Reyes", run: "15.987.654-3", rol: "Funcionario", aduana: "Pino Hachado", correo: "cespinoza@aduana.cl" },
  { id: 3, nombre: "Rodrigo Fuentes Castillo", run: "18.456.123-K", rol: "Funcionario", aduana: "Los Libertadores", correo: "rfuentes@aduana.cl" },
  { id: 4, nombre: "Carlos Rodríguez Pérez", run: "87.654.321-0", rol: "Funcionario", aduana: "Los Libertadores", correo: "crodriguez@aduana.cl" },
];

export const SOLICITUDES_INIT = [
  {
    id: "SOL-101", tipo: "Declaración SAG", solicitante: "Andrea Contreras Silva", identificacion: "Pasaporte A998231",
    estado: "Pendiente", fecha: "2026-06-04 10:14",
    detalle: { productos: ["Frutas y verduras", "Semillas y plantas"], descripcion: "Trae 2 kg de manzanas y semillas de tomate para uso personal.", folio: "SAG-118204", mensajeSistema: "Requiere revisión presencial en andén SAG." }
  },
  {
    id: "SOL-102", tipo: "Validación de menor", solicitante: "Matías Herrera Poblete", identificacion: "RUT 18.231.992-K",
    estado: "Pendiente", fecha: "2026-06-04 11:02",
    detalle: { nombreMenor: "Martina Herrera Contreras", rutMenor: "24.109.887-3", fechaNacimiento: "2016-03-11", rutAutorizante: "18.231.992-K", vinculo: "Padre/Madre", folio: "AU-552310", mensajeSistema: "Documento notarial ilegible, requiere revisión manual." }
  },
  {
    id: "SOL-103", tipo: "Validación de vehículo", solicitante: "Francisca Morales Díaz", identificacion: "Patente AA-234-BB",
    estado: "Pendiente", fecha: "2026-06-04 11:45",
    detalle: { patente: "AA-234-BB", marca: "Chevrolet", modelo: "Onix", anio: "2021", color: "Gris", propietario: "Francisca Morales Díaz", rut: "19.334.221-5" }
  },
  {
    id: "SOL-104", tipo: "Declaración SAG", solicitante: "Ignacio Vargas Rojas", identificacion: "RUT 15.667.123-4",
    estado: "Aprobado", fecha: "2026-06-04 09:12",
    detalle: { productos: [], descripcion: "", folio: "SAG-994102", mensajeSistema: "Declaración aceptada automáticamente." }
  },
  {
    id: "SOL-105", tipo: "Validación de vehículo", solicitante: "Camila Sepúlveda Torres", identificacion: "Patente AF-998-LK",
    estado: "Rechazado", fecha: "2026-06-04 08:30",
    motivoRechazo: "El número de motor declarado no coincide con el registrado en el padrón vehicular argentino.",
    detalle: { patente: "AF-998-LK", marca: "Ford", modelo: "Ranger", anio: "2019", color: "Rojo", propietario: "Camila Sepúlveda Torres", rut: "17.882.556-1" }
  },
];

export function siguienteIdSolicitud(solicitudesActuales) {
  const max = solicitudesActuales.reduce((acc, s) => {
    const n = parseInt(String(s.id).replace(/\D/g, ""), 10);
    return Number.isFinite(n) && n > acc ? n : acc;
  }, 100);
  return `SOL-${max + 1}`;
}

export const FOLIOS_ADUANA_MOCK = {
  "arg-2024-xk9": { habilitado: true, titular: "Carlos Gómez Bianchi", modelo: "Volkswagen Amarok 2021", patente: "AC992LL" },
  "arg-2024-lm2": { habilitado: true, titular: "Roberto Díaz Sosa", modelo: "Toyota Hilux 2022", patente: "AD118KP" },
  "arg-2023-zz0": { habilitado: false, titular: "Martín Álvarez Pino", modelo: "Ford Ranger 2018", patente: "AB004JJ", motivo: "El documento de admisión temporal venció hace 12 días." },
};

export const AUDIT_INIT = [
  { id: 1, timestamp: "2026-06-04 14:22:10", usuario: "fsalazar@aduana.cl", accion: "Modificación de permisos de usuario ID 2" },
  { id: 2, timestamp: "2026-06-04 14:15:32", usuario: "cespinoza@aduana.cl", accion: "Aprobación documento Vehículo SOL-103" },
  { id: 3, timestamp: "2026-06-04 13:45:11", usuario: "cespinoza@aduana.cl", accion: "Consulta RUT 14.552.123-4 en módulo PDI" },
  { id: 4, timestamp: "2026-06-04 12:10:04", usuario: "fsalazar@aduana.cl", accion: "Ingreso Vehículo Argentino Patente: AC992LL" },
];


export const PERSONAS_MOCK = {
  "12345678-9": {
    nombre: "María González",
    pdi: { alerta: false, mensaje: "Sin arraigo nacional ni órdenes vigentes." },
    sag: { aprobado: true, mensaje: "Declaración aceptada automáticamente." },
  },
  "a998231": {
    nombre: "Andrea Contreras Silva", // SOL-101: Declaración SAG — Pendiente
    pdi: { alerta: false, mensaje: "Sin arraigo nacional ni órdenes vigentes." },
    sag: { aprobado: false, mensaje: "Requiere revisión presencial en andén SAG." },
  },
  "18231992-k": {
    nombre: "Matías Herrera Poblete", // SOL-102: Validación de menor — Pendiente
    pdi: { alerta: false, mensaje: "Sin arraigo nacional ni órdenes vigentes." },
    sag: { aprobado: true, mensaje: "Declaración aceptada automáticamente." },
  },
  "19334221-5": {
    nombre: "Francisca Morales Díaz", // SOL-103: Validación de vehículo — Pendiente
    pdi: { alerta: false, mensaje: "Sin arraigo nacional ni órdenes vigentes." },
    sag: { aprobado: true, mensaje: "Declaración aceptada automáticamente." },
  },
  "15667123-4": {
    nombre: "Ignacio Vargas Rojas", // SOL-104: Declaración SAG — Aprobado
    pdi: { alerta: false, mensaje: "Sin arraigo nacional ni órdenes vigentes." },
    sag: { aprobado: true, mensaje: "Declaración aceptada automáticamente." },
  },
  "17882556-1": {
    nombre: "Camila Sepúlveda Torres", // SOL-105: Validación de vehículo — Rechazado
    pdi: { alerta: true, mensaje: "ALERTA: Orden de arraigo nacional activo." },
    sag: { aprobado: false, mensaje: "Requiere revisión presencial en andén SAG." },
  },
  "87654321-0": {
    nombre: "Carlos Rodríguez Pérez",
    pdi: { alerta: false, mensaje: "Sin arraigo nacional ni órdenes vigentes." },
  },
  "15987654-3": {
    nombre: "Carolina Espinoza Reyes",
    pdi: { alerta: false, mensaje: "Sin arraigo nacional ni órdenes vigentes." },
  },
  "18456123-k": {
    nombre: "Rodrigo Fuentes Castillo",
    pdi: { alerta: false, mensaje: "Sin arraigo nacional ni órdenes vigentes." },
  },
  "16234567-8": {
    nombre: "Fernando Salazar Muñoz",
    pdi: { alerta: false, mensaje: "Sin arraigo nacional ni órdenes vigentes." },
  },
};

export const USERS_LOGIN = {
  // --- Pasajeros ---
  "12345678-9": { pass: "pasajero123", role: "pasajero", name: "María González" }, // cuenta demo por defecto
  "a998231": { pass: "pasajero123", role: "pasajero", name: "Andrea Contreras Silva" }, // SOL-101, declaración SAG pendiente
  "18231992-k": { pass: "pasajero123", role: "pasajero", name: "Matías Herrera Poblete" }, // SOL-102, validación de menor
  "19334221-5": { pass: "pasajero123", role: "pasajero", name: "Francisca Morales Díaz" }, // SOL-103, vehículo patente AA-234-BB
  "15667123-4": { pass: "pasajero123", role: "pasajero", name: "Ignacio Vargas Rojas" }, // SOL-104, declaración SAG aprobada
  "17882556-1": { pass: "pasajero123", role: "pasajero", name: "Camila Sepúlveda Torres" }, // SOL-105, vehículo rechazado

  // --- Funcionarios de aduana (coinciden con USUARIOS_INIT) ---
  "87654321-0": { pass: "func123", role: "funcionario", name: "Carlos Rodríguez Pérez" }, // cuenta demo por defecto
  "15987654-3": { pass: "func123", role: "funcionario", name: "Carolina Espinoza Reyes" },
  "18456123-k": { pass: "func123", role: "funcionario", name: "Rodrigo Fuentes Castillo" },

  // --- Administración (coincide con USUARIOS_INIT) ---
  "admin": { pass: "admin123", role: "admin", name: "Administrador SGAF" }, // cuenta demo por defecto
  "16234567-8": { pass: "admin123", role: "admin", name: "Fernando Salazar Muñoz" },

  // --- PDI ---
  "pdi001": { pass: "pdi123", role: "pdi", name: "Insp. Pedro Vásquez (PDI)" },
};