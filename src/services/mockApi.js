import { PERSONAS_MOCK, FOLIOS_ADUANA_MOCK } from "../data/initialData.js";

const _normalizar = (valor) =>
  (valor ?? "").toString().trim().toLowerCase().replace(/\./g, "").replace(/\s+/g, "");

const _hash01 = (texto) => {
  let h = 0x811c9dc5;
  for (let i = 0; i < texto.length; i++) {
    h ^= texto.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return ((h >>> 0) % 10000) / 10000; // número estable en [0, 1)
};

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

  consultarAduanaArg: async (folio) =>
    _medir(async () => {
      await _delay();
      const key = _normalizar(folio) || "anonimo";
      const doc = FOLIOS_ADUANA_MOCK[key];
      const habilitado = doc ? doc.habilitado : _hash01("arg:" + key) > 0.15;
      return {
        habilitado,
        diasRestantes: habilitado ? 180 : 0,
        titular: doc?.titular ?? "Carlos Gómez Bianchi",
        modelo: doc?.modelo ?? "Toyota Hilux 2022",
        patente: doc?.patente ?? ("AR" + key.slice(-4).toUpperCase()),
        motivo: doc?.motivo ?? (habilitado ? undefined : "El documento no figura como vigente en el sistema de Aduana Argentina."),
        folio: key,
      };
    }),
};
