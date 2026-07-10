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
  validarSag: async (rut, form) =>
    _medir(async () => {
      const token = sessionStorage.getItem("token");
      const userId = sessionStorage.getItem("userId");
      const userRol = sessionStorage.getItem("userRol");

      if (token && form) {
        try {
          const payload = {
            tramite_id: "00000000-0000-0000-0000-000000000000", // UUID ficticio si no hay trámite asociado aún
            tiene_alimentos: form.frutas || form.carnes || form.lacteos,
            tiene_productos_vegetales: form.semillas || form.frutas,
            tiene_productos_animales: form.carnes || form.lacteos,
            tiene_mascotas: form.mascotas,
            descripcion: form.descripcion || "",
          };

          const response = await fetch("/api/integraciones/sag/validar-declaracion", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`,
              "X-User-Id": userId,
              "X-User-Rol": userRol,
            },
            body: JSON.stringify(payload),
          });

          if (!response.ok) {
            throw new Error(`Error del servidor: ${response.status}`);
          }

          const result = await response.json();
          if (result.error) {
            throw new Error(result.error.message);
          }

          const resData = result.data;
          return {
            aprobado: resData.estado === "APROBADO",
            folio: resData.codigo_sag,
            mensaje: resData.observaciones,
          };
        } catch (error) {
          console.warn("Error enviando declaración SAG al backend, usando fallback local...", error);
        }
      }

      // Fallback local en caso de estar offline o sin token
      await _delay();
      const key = _normalizar(rut);
      const persona = _persona(key);
      const ok = form ? !(form.frutas || form.carnes || form.lacteos || form.mascotas || form.semillas) : (persona?.sag ? persona.sag.aprobado : _hash01("sag:" + key) > 0.3);
      const mensaje = persona?.sag?.mensaje ?? (ok ? "Declaración aceptada automáticamente." : "Requiere revisión presencial en andén SAG.");
      return {
        aprobado: ok,
        folio: _folio(key || "anonimo", "SAG"),
        mensaje,
      };
    }),

  validarMenor: async (form, user) =>
    _medir(async () => {
      const token = sessionStorage.getItem("token");
      const userId = sessionStorage.getItem("userId");
      const userRol = sessionStorage.getItem("userRol");

      if (token && form && user) {
        try {
          // Mapeamos la relación a las permitidas por el validador del backend ("padre", "madre", "tutor", "otro")
          let relacion = "otro";
          const vinculoLower = (form.vinculo || "").toLowerCase();
          if (vinculoLower.includes("padre") || vinculoLower.includes("madre")) {
            relacion = "padre";
          } else if (vinculoLower.includes("tutor")) {
            relacion = "tutor";
          }

          const payload = {
            tipo: "AUTORIZACION_MENOR",
            metadata: {
              nombreMenor: form.nombreMenor,
              rutMenor: form.rutMenor || null,
              pasaporteMenor: null,
              fechaNacimientoMenor: form.fechaNacimiento || new Date().toISOString().slice(0, 10),
              nombreAdultoResponsable: user.name || "Adulto Responsable",
              rutAdultoResponsable: form.rutAutorizante,
              tipoDocumentoAdulto: "cedula",
              numeroDocumentoAdulto: form.rutAutorizante,
              relacionConMenor: relacion,
            },
          };

          const response = await fetch("/api/tramites", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`,
              "X-User-Id": userId,
              "X-User-Rol": userRol,
            },
            body: JSON.stringify(payload),
          });

          if (!response.ok) {
            const errRes = await response.json().catch(() => ({}));
            throw new Error(errRes.error?.message || `Error del servidor: ${response.status}`);
          }

          const result = await response.json();
          const tramite = result.data;

          // Por diseño del backend, los trámites de menores quedan en PENDIENTE hasta revisión física
          return {
            aprobado: tramite.estado === "APROBADO", // será false dado que inicia en PENDIENTE
            folio: tramite.folio,
            mensaje: "Autorización de viaje para menor de edad registrada. Pendiente de verificación física por funcionario.",
          };
        } catch (error) {
          console.warn("Error creando trámite de menores en el backend, usando fallback local...", error);
        }
      }

      // Fallback local en caso de estar offline o sin token
      await _delay();
      const key = _normalizar(form?.rutMenor || "anonimo");
      const persona = _persona(key);
      const ok = persona?.menor ? persona.menor.aprobado : _hash01("menor:" + key) > 0.1;
      return {
        aprobado: ok,
        folio: _folio(key || "anonimo", "AU"),
        mensaje: persona?.menor?.mensaje ?? (ok ? "Autorización validada correctamente." : "Documento notarial ilegible, requiere revisión manual."),
      };
    }),

  consultarPDI: async (rut) =>
    _medir(async () => {
      const token = sessionStorage.getItem("token");
      const userId = sessionStorage.getItem("userId");
      const userRol = sessionStorage.getItem("userRol");

      if (token) {
        try {
          const response = await fetch("/api/integraciones/pdi/consultar-rut", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`,
              "X-User-Id": userId,
              "X-User-Rol": userRol,
            },
            body: JSON.stringify({ rut }),
          });

          if (!response.ok) {
            throw new Error(`Error del servidor: ${response.status}`);
          }

          const result = await response.json();
          if (result.error) {
            throw new Error(result.error.message);
          }

          const resData = result.data;
          const hasAlerta = !resData.habilitado || resData.alertas > 0 || !!resData.alerta;

          return {
            nombre: resData.nombre || "Nombre no disponible",
            alerta: hasAlerta,
            habilitado: resData.habilitado,
            mensaje: resData.alerta || (resData.habilitado ? "Sin arraigo nacional ni órdenes vigentes." : "Orden de arraigo nacional activo."),
          };
        } catch (error) {
          console.warn("Error consultando PDI en el backend, usando fallback local...", error);
        }
      }

      // Fallback local en caso de estar offline o sin token
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

  validarVehiculoSalida: async (form, user) =>
    _medir(async () => {
      const token = sessionStorage.getItem("token");
      const userId = sessionStorage.getItem("userId");
      const userRol = sessionStorage.getItem("userRol");

      if (token && form && user) {
        try {
          const payload = {
            tipo: "SALIDA_VEHICULO",
            metadata: {
              patente: form.patente,
              marca: form.marca,
              modelo: form.modelo,
              anio: parseInt(form.anio) || new Date().getFullYear(),
              paisDestino: "Argentina",
              propietarioNombre: form.propietario,
              propietarioRut: form.rut,
              fechaSalida: new Date().toISOString().slice(0, 10),
              documentoGenerado: true
            }
          };

          const response = await fetch("/api/tramites", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`,
              "X-User-Id": userId,
              "X-User-Rol": userRol,
            },
            body: JSON.stringify(payload),
          });

          if (!response.ok) {
            const errRes = await response.json().catch(() => ({}));
            throw new Error(errRes.error?.message || `Error del servidor: ${response.status}`);
          }

          const result = await response.json();
          const tramite = result.data;

          return {
            aprobado: tramite.estado === "APROBADO", // será false dado que inicia en PENDIENTE
            folio: tramite.folio,
            mensaje: "Trámite de Salida y Admisión Temporal de Vehículo registrado exitosamente.",
          };
        } catch (error) {
          console.warn("Error creando trámite de vehículo en el backend, usando fallback local...", error);
        }
      }

      // Fallback local en caso de estar offline o sin token
      await _delay();
      const randomFolio = Math.floor(100000 + Math.random() * 900000).toString();
      return {
        aprobado: false,
        folio: randomFolio,
        mensaje: "Trámite de vehículo generado localmente (modo desarrollo offline).",
      };
    }),

  consultarAduanaArg: async (folio) =>
    _medir(async () => {
      const token = sessionStorage.getItem("token");
      const userId = sessionStorage.getItem("userId");
      const userRol = sessionStorage.getItem("userRol");

      if (token && folio) {
        try {
          // Removemos guiones o espacios para obtener la patente pura (ej. "ARG-2024-XK9" -> "ARG2024XK9")
          const patenteLimpia = folio.trim().toUpperCase().replace(/\s|-/g, "");
          const response = await fetch("/api/integraciones/aduana-argentina/consultar-vehiculo", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`,
              "X-User-Id": userId,
              "X-User-Rol": userRol,
            },
            body: JSON.stringify({ patente: patenteLimpia }),
          });

          if (!response.ok) {
            throw new Error(`Error del servidor: ${response.status}`);
          }

          const result = await response.json();
          if (result.error) {
            throw new Error(result.error.message);
          }

          const resData = result.data;
          return {
            habilitado: resData.habilitado,
            diasRestantes: resData.habilitado ? 180 : 0,
            titular: resData.titular || "Propietario Argentino",
            modelo: "Vehículo Argentino",
            patente: resData.patente,
            motivo: resData.motivo || (resData.habilitado ? undefined : "El documento no figura como vigente en el sistema de Aduana Argentina."),
            folio: folio,
          };
        } catch (error) {
          console.warn("Error consultando Aduana Argentina en el backend, usando fallback local...", error);
        }
      }

      // Fallback local en caso de estar offline o sin token
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
