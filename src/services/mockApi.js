// mockApi.js — Simulación de llamadas a servicios externos (SAG, PDI, Aduana Argentina)

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
  validarSag: async () => {
    await _delay();
    const ok = Math.random() > 0.3;
    return {
      aprobado: ok,
      folio: "SAG-" + Math.floor(100000 + Math.random() * 900000),
      mensaje: ok ? "Declaración aceptada automáticamente." : "Requiere revisión presencial en andén SAG.",
    };
  },

  validarMenor: async () => {
    await _delay();
    return { aprobado: true, folio: "AU-" + Math.floor(100000 + Math.random() * 900000) };
  },

  consultarPDI: async (rut) =>
    _medir(async () => {
      await _delay();
      const alerta = Math.random() > 0.82;
      return {
        nombre: rut === "12345678-9" ? "María González" : "Sebastián Aravena Muñoz",
        alerta,
        habilitado: !alerta,
        mensaje: alerta ? "ALERTA: Orden de arraigo nacional activo." : "Sin arraigo nacional ni órdenes vigentes.",
      };
    }),

  consultarAduanaArg: async () =>
    _medir(async () => {
      await _delay();
      return { habilitado: true, diasRestantes: 180, titular: "Carlos Rodríguez", modelo: "Toyota Hilux 2022" };
    }),
};
