// rbac.js — Mapa de control de acceso basado en roles (RNF-S-02)

export const ACCESO_PERMITIDO = {
  pasajero: ["pasajero", "sag", "menores", "vehiculo_salida", "ayuda"],
  funcionario: ["funcionario", "vehiculo_ingreso", "pdi", "lector"],
  admin: ["admin", "solicitudes", "usuarios", "auditoria", "reportes", "lector"],
  pdi: ["pdi", "lector"],
};

export const DEFAULT_VIEW_BY_ROLE = {
  pasajero: "pasajero",
  funcionario: "funcionario",
  admin: "admin",
  pdi: "pdi",
};
