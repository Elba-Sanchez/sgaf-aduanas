// mockApi.js — Simulación de llamadas a servicios externos (SAG, PDI, Aduana Argentina)
//
// IMPORTANTE: estos resultados son DETERMINÍSTICOS según el RUT/folio que se
// consulta, nunca puramente aleatorios. Así, para una misma persona, el
// sistema siempre entrega el mismo resultado (aprobado/rechazado, con o sin
// alerta), sin importar cuántas veces se repita la prueba.
//
// El resultado se obtiene en dos pasos:
//   1) Si el RUT corresponde a una de las cuentas demo (PERSONAS_MOCK en
//      data/initialData.js), se usa el resultado ya definido ahí, que además
//      es coherente con SOLICITUDES_INIT (p.ej. Ignacio Vargas = SAG
//      aprobado, Camila Sepúlveda = rechazado/alerta).
//   2) Si el RUT no está en esa tabla (por ejemplo, uno inventado durante una
//      prueba), se usa una función hash estable sobre el RUT para decidir el
//      resultado. Al ser un hash y no Math.random(), ese mismo RUT "inventado"
//      seguirá dando siempre el mismo resultado mientras se pruebe.

import { PERSONAS_MOCK } from "../data/initialData.js";

// Normaliza un RUT/documento para usarlo como llave: sin puntos, sin
// espacios, sin mayúsculas/minúsculas mezcladas. "12.345.678-9" y
// "12345678-9" deben resolver a la misma persona.
const _normalizar = (valor) =>
  (valor ?? "").toString().trim().toLowerCase().replace(/\./g, "").replace(/\s+/g, "");

// Hash determinístico simple (FNV-1a) → siempre el mismo número para el
// mismo texto de entrada. Se usa como reemplazo de Math.random() para que
// los RUT que no están en PERSONAS_MOCK igual tengan un resultado estable.
const _hash01 = (texto) => {
  let h = 0x811c9dc5;
  for (let i = 0; i < texto.length; i++) {
    h ^= texto.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return ((h >>> 0) % 10000) / 10000; // número estable en [0, 1)
};

// Folio también determinístico por (rut + prefijo), para que si se repite
// una consulta se muestre el mismo folio en vez de uno nuevo cada vez.
const _folio = (semilla, prefijo) => {
  const n = Math.floor(100000 + _hash01(prefijo + ":" + semilla) * 900000);
  return `${prefijo}-${n}`;
};

const _persona = (rutOrDoc) => PERSONAS_MOCK[_normalizar(rutOrDoc)];

const _delay = (ms = 1400) =>
  new Promise((res, rej) =>
    setTimeout(
      () => (Math.random() < 0.08 ? rej(new Error("Error de conexión. Intente nuevamente.")) : res()),
      ms
    )
  );

const _medir = async (fn) => {
  const start = performance.now();
  const data = await fn();
  const ms = Math.round(performance.now() - start);
  return { ...data, _tiempoMs: ms };
};

export const mockApi = {
  // rut: RUT/documento del pasajero que declara (dueño de la declaración).
  validarSag: async (rut) => {
    await _delay();
    const key = _normalizar(rut);
    const persona = _persona(key);
    const ok = persona?.sag ? persona.sag.aprobado : _hash01("sag:" + key) > 0.3;
    const mensaje = persona?.sag?.mensaje ?? (ok ? "Declaración aceptada automáticamente." : "Requiere revisión presencial en andén SAG.");
    return {
      aprobado: ok,
      folio: _folio(key || "anonimo", "SAG"),
      mensaje,
    };
  },

  // rutMenor: RUT/documento del menor que se está autorizando a cruzar.
  validarMenor: async (rutMenor) => {
    await _delay();
    const key = _normalizar(rutMenor);
    const persona = _persona(key);
    const ok = persona?.menor ? persona.menor.aprobado : _hash01("menor:" + key) > 0.1;
    return {
      aprobado: ok,
      folio: _folio(key || "anonimo", "AU"),
      mensaje: persona?.menor?.mensaje ?? (ok ? "Autorización validada correctamente." : "Documento notarial ilegible, requiere revisión manual."),
    };
  },

  // rut: RUT/documento consultado en el módulo PDI (control fronterizo o lector).
  consultarPDI: async (rut) =>
    _medir(async () => {
      await _delay();
      const key = _normalizar(rut);
      const persona = _persona(key);
      const alerta = persona?.pdi ? persona.pdi.alerta : _hash01("pdi:" + key) > 0.82;
      return {
        nombre: persona?.nombre ?? "Sebastián Aravena Muñoz",
        alerta,
        habilitado: !alerta,
        mensaje: persona?.pdi?.mensaje ?? (alerta ? "ALERTA: Orden de arraigo nacional activo." : "Sin arraigo nacional ni órdenes vigentes."),
      };
    }),

  // folio: código del documento argentino que se está validando en el ingreso.
  consultarAduanaArg: async (folio) =>
    _medir(async () => {
      await _delay();
      const key = _normalizar(folio) || "anonimo";
      return { habilitado: true, diasRestantes: 180, titular: "Carlos Rodríguez", modelo: "Toyota Hilux 2022", folio: key };
    }),
};
