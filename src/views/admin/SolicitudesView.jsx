import { useState, useEffect } from "react";
import { C } from "../../theme.js";
import { DetalleSolicitud } from "../../components/common/DetalleSolicitud.jsx";

const mapBackendTramiteToSolicitud = (t) => {
  let tipoUI = t.tipo;
  if (t.tipo === "DECLARACION_SAG") tipoUI = "Declaración SAG";
  else if (t.tipo === "AUTORIZACION_MENOR") tipoUI = "Validación de menor";
  else if (t.tipo === "SALIDA_VEHICULO") tipoUI = "Salida de vehículo";
  else if (t.tipo === "INGRESO_VEHICULO") tipoUI = "Ingreso de vehículo";

  let estadoUI = "Pendiente";
  if (t.estado === "APROBADO") estadoUI = "Aprobado";
  else if (t.estado === "RECHAZADO") estadoUI = "Rechazado";

  const metadata = t.metadata || {};
  let detalle = {};
  if (t.tipo === "DECLARACION_SAG") {
    const productosLabels = {
      tiene_alimentos: "Alimentos",
      tiene_productos_vegetales: "Productos vegetales",
      tiene_productos_animales: "Productos animales",
      tiene_mascotas: "Mascotas",
    };
    const prodList = [];
    if (metadata.tiene_alimentos) prodList.push(productosLabels.tiene_alimentos);
    if (metadata.tiene_productos_vegetales) prodList.push(productosLabels.tiene_productos_vegetales);
    if (metadata.tiene_productos_animales) prodList.push(productosLabels.tiene_productos_animales);
    if (metadata.tiene_mascotas) prodList.push(productosLabels.tiene_mascotas);

    detalle = {
      productos: prodList,
      descripcion: metadata.descripcion || "",
      folio: t.folio,
      mensajeSistema: metadata.resultadoValidacion || "Procesado",
    };
  } else if (t.tipo === "AUTORIZACION_MENOR") {
    detalle = {
      nombreMenor: metadata.nombreMenor || "",
      rutMenor: metadata.rutMenor || "",
      fechaNacimiento: metadata.fechaNacimientoMenor || "",
      rutAutorizante: metadata.rutAdultoResponsable || "",
      vinculo: metadata.relacionConMenor || "",
      folio: t.folio,
      mensajeSistema: t.motivoRechazo || "Pendiente de verificación física",
    };
  } else if (t.tipo === "SALIDA_VEHICULO") {
    detalle = {
      patente: metadata.patente || "",
      marca: metadata.marca || "",
      modelo: metadata.modelo || "",
      propietario: metadata.propietarioNombre || "",
      rut: metadata.propietarioRut || "",
    };
  }

  const solicitanteName = metadata.nombreAdultoResponsable || metadata.propietarioNombre || "Pasajero";
  const identificacionVal = metadata.rutAdultoResponsable || metadata.propietarioRut || "—";

  return {
    id: t.folio,
    dbId: t.id,
    tipo: tipoUI,
    solicitante: solicitanteName,
    identificacion: identificacionVal.startsWith("RUT") ? identificacionVal : `RUT ${identificacionVal}`,
    estado: estadoUI,
    fecha: t.createdAt ? new Date(t.createdAt).toLocaleString("sv-SE").slice(0, 16) : new Date().toLocaleString("sv-SE").slice(0, 16),
    detalle: detalle,
    motivoRechazo: t.motivoRechazo || undefined
  };
};

export function SolicitudesView({ solicitudes, setSolicitudes, onToast }) {
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null); // { sol, modo: 'ver' | 'rechazar', motivo }
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchSolicitudes = async () => {
    const token = sessionStorage.getItem("token");
    const userId = sessionStorage.getItem("userId");
    const userRol = sessionStorage.getItem("userRol");

    if (token) {
      setLoading(true);
      try {
        const response = await fetch("/api/tramites?size=100", {
          headers: {
            "Authorization": `Bearer ${token}`,
            "X-User-Id": userId,
            "X-User-Rol": userRol,
          }
        });
        if (response.ok) {
          const res = await response.json();
          const mapped = res.data.content.map(mapBackendTramiteToSolicitud);
          setList(mapped);
          return;
        }
      } catch (err) {
        console.warn("Error cargando solicitudes del backend, usando fallback local...", err);
      } finally {
        setLoading(false);
      }
    }
    setList(solicitudes);
  };

  useEffect(() => {
    fetchSolicitudes();
  }, [solicitudes]);

  const filtered = list.filter(sol => {
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    return (
      sol.id.toLowerCase().includes(term) ||
      sol.tipo.toLowerCase().includes(term) ||
      sol.solicitante.toLowerCase().includes(term) ||
      sol.identificacion.toLowerCase().includes(term) ||
      sol.estado.toLowerCase().includes(term) ||
      sol.fecha.toLowerCase().includes(term)
    );
  });

  const abrirDetalle = (sol) => setModal({ sol, modo: "ver", motivo: "" });
  const cerrar = () => setModal(null);
  const pedirMotivo = () => setModal(m => ({ ...m, modo: "rechazar" }));

  const aprobar = async () => {
    const id = modal.sol.id;
    const dbId = modal.sol.dbId;

    const token = sessionStorage.getItem("token");
    const userId = sessionStorage.getItem("userId");
    const userRol = sessionStorage.getItem("userRol");

    if (token && dbId) {
      try {
        const response = await fetch(`/api/tramites/${dbId}/estado`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
            "X-User-Id": userId,
            "X-User-Rol": userRol,
          },
          body: JSON.stringify({ nuevoEstado: "APROBADO" })
        });

        if (!response.ok) {
          const errRes = await response.json().catch(() => ({}));
          throw new Error(errRes.error?.message || "Error al aprobar el trámite.");
        }

        onToast(`Solicitud ${id} marcada como "Aprobado".`, "success");
        fetchSolicitudes();
        cerrar();
        return;
      } catch (err) {
        onToast(err.message, "error");
        return;
      }
    }

    setSolicitudes(prev => prev.map(sol => (sol.id === id ? { ...sol, estado: "Aprobado", motivoRechazo: undefined } : sol)));
    onToast(`Solicitud ${id} marcada como "Aprobado".`, "success");
    cerrar();
  };

  const confirmarRechazo = async () => {
    const motivo = modal.motivo.trim();
    if (!motivo) { onToast("Debes indicar el motivo del rechazo.", "error"); return; }
    
    const id = modal.sol.id;
    const dbId = modal.sol.dbId;

    const token = sessionStorage.getItem("token");
    const userId = sessionStorage.getItem("userId");
    const userRol = sessionStorage.getItem("userRol");

    if (token && dbId) {
      try {
        const response = await fetch(`/api/tramites/${dbId}/estado`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
            "X-User-Id": userId,
            "X-User-Rol": userRol,
          },
          body: JSON.stringify({ nuevoEstado: "RECHAZADO", motivoRechazo: motivo })
        });

        if (!response.ok) {
          const errRes = await response.json().catch(() => ({}));
          throw new Error(errRes.error?.message || "Error al rechazar el trámite.");
        }

        onToast(`Solicitud ${id} rechazada.`, "success");
        fetchSolicitudes();
        cerrar();
        return;
      } catch (err) {
        onToast(err.message, "error");
        return;
      }
    }

    setSolicitudes(prev => prev.map(sol => (sol.id === id ? { ...sol, estado: "Rechazado", motivoRechazo: motivo } : sol)));
    onToast(`Solicitud ${id} rechazada.`, "success");
    cerrar();
  };

  const estadoBadge = (estado) => {
    switch (estado) {
      case "Pendiente": return <span className="badge b-yellow">⏳ Pendiente</span>;
      case "Aprobado": return <span className="badge b-green">✅ Aprobado</span>;
      case "Rechazado": return <span className="badge b-red">❌ Rechazado</span>;
      default: return <span className="badge b-gray">{estado}</span>;
    }
  };

  return (
    <div className="fade">
      <div className="stitle">📋 Gestión de Solicitudes</div>
      <div className="ssub">Administra las solicitudes de trámites del sistema</div>
      <div className="card">
        <div style={{ display: 'flex', gap: 10, marginBottom: 16, alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Buscar por ID, tipo, solicitante, identificación..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ flex: 1 }}
          />
          <button className="btn btn-sec btn-sm" onClick={() => setSearch('')}>
            Limpiar filtros
          </button>
        </div>

        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Tipo</th>
              <th>Solicitante</th>
              <th>Identificación</th>
              <th>Estado</th>
              <th>Fecha</th>
              <th style={{ width: 130 }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length > 0 ? (
              filtered.map(sol => (
                <tr key={sol.id}>
                  <td style={{ fontFamily: 'monospace' }}>{sol.id}</td>
                  <td>{sol.tipo}</td>
                  <td>{sol.solicitante}</td>
                  <td>{sol.identificacion}</td>
                  <td>
                    {estadoBadge(sol.estado)}
                    {sol.estado === "Rechazado" && sol.motivoRechazo && (
                      <div style={{ fontSize: 11, color: C.textMuted, marginTop: 4, maxWidth: 220 }}>
                        <strong>Motivo:</strong> {sol.motivoRechazo}
                      </div>
                    )}
                  </td>
                  <td>{sol.fecha}</td>
                  <td>
                    <button className="btn btn-sec btn-sm" onClick={() => abrirDetalle(sol)}>
                      📄 Ver documento
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: 20, color: C.textMuted }}>
                  No se encontraron solicitudes con ese criterio.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div style={{ marginTop: 12, fontSize: 13, color: C.textMuted }}>
          Mostrando {filtered.length} de {list.length} solicitudes
        </div>
      </div>

      {modal && (
        <div
          className="fade"
          style={{
            position: "fixed", inset: 0, background: "rgba(17,23,32,0.45)",
            display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 16
          }}
          onClick={cerrar}
        >
          <div className="card" style={{ maxWidth: 560, width: "100%", maxHeight: "90vh", overflowY: "auto" }} onClick={e => e.stopPropagation()}>
            {modal.modo === "ver" && (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                  <span style={{ fontSize: 22 }}>📄</span>
                  <div style={{ fontSize: 16, fontWeight: 600 }}>{modal.sol.tipo} — {modal.sol.id}</div>
                </div>
                <div className="g2" style={{ fontSize: 13, marginBottom: 14, rowGap: 10, marginTop: 10 }}>
                  <div><strong>Fecha:</strong> {modal.sol.fecha}</div>
                  <div><strong>Estado:</strong> {estadoBadge(modal.sol.estado)}</div>
                  <div><strong>Solicitante:</strong> {modal.sol.solicitante}</div>
                  <div><strong>Identificación:</strong> {modal.sol.identificacion}</div>
                </div>
                <DetalleSolicitud solicitud={modal.sol} onToast={onToast} />
                <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 18 }}>
                  <button className="btn btn-sec btn-sm" onClick={cerrar}>Cerrar</button>
                  {modal.sol.estado === "Pendiente" && (
                    <>
                      <button className="btn btn-danger btn-sm" onClick={pedirMotivo}>Rechazar</button>
                      <button className="btn btn-success btn-sm" onClick={aprobar}>Aprobar</button>
                    </>
                  )}
                </div>
              </>
            )}

            {modal.modo === "rechazar" && (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                  <span style={{ fontSize: 22 }}>❌</span>
                  <div style={{ fontSize: 16, fontWeight: 600 }}>Rechazar solicitud {modal.sol.id}</div>
                </div>
                <div style={{ fontSize: 13, color: C.textSec, marginBottom: 14 }}>
                  Indica el motivo del rechazo. Quedará registrado junto a la solicitud y podrá ser consultado por el solicitante.
                </div>
                <div className="fgroup">
                  <label className="flabel">Motivo del rechazo *</label>
                  <textarea
                    rows={4}
                    autoFocus
                    placeholder="Ej: Documentación incompleta, patente no coincide con el registro, etc."
                    value={modal.motivo}
                    onChange={e => setModal(m => ({ ...m, motivo: e.target.value }))}
                  />
                </div>
                <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                  <button className="btn btn-sec btn-sm" onClick={() => setModal(m => ({ ...m, modo: "ver" }))}>← Volver</button>
                  <button className="btn btn-danger btn-sm" onClick={confirmarRechazo}>Confirmar rechazo</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
