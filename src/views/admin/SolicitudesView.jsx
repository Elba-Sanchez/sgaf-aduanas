import { useState } from "react";
import { C } from "../../theme.js";

export function SolicitudesView({ solicitudes, setSolicitudes, onToast }) {
  const [search, setSearch] = useState("");
  const [rechazoModal, setRechazoModal] = useState(null); // { id, motivo }

  const filtered = solicitudes.filter(sol => {
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

  const aprobar = (id) => {
    setSolicitudes(prev =>
      prev.map(sol => (sol.id === id ? { ...sol, estado: "Aprobado", motivoRechazo: undefined } : sol))
    );
    onToast(`Solicitud ${id} marcada como "Aprobado".`, "success");
  };

  const abrirRechazo = (id) => setRechazoModal({ id, motivo: "" });
  const cerrarRechazo = () => setRechazoModal(null);

  const confirmarRechazo = () => {
    const motivo = rechazoModal.motivo.trim();
    if (!motivo) { onToast("Debes indicar el motivo del rechazo.", "error"); return; }
    setSolicitudes(prev =>
      prev.map(sol => (sol.id === rechazoModal.id ? { ...sol, estado: "Rechazado", motivoRechazo: motivo } : sol))
    );
    onToast(`Solicitud ${rechazoModal.id} rechazada.`, "success");
    setRechazoModal(null);
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
              <th style={{ width: 160 }}>Acciones</th>
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
                    {sol.estado === "Pendiente" && (
                      <div style={{ display: "flex", gap: 6 }}>
                        <button className="btn btn-success btn-sm" onClick={() => aprobar(sol.id)}>
                          Aprobar
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => abrirRechazo(sol.id)}>
                          Rechazar
                        </button>
                      </div>
                    )}
                    {sol.estado !== "Pendiente" && (
                      <span style={{ color: C.textMuted, fontSize: 12 }}>Sin acciones</span>
                    )}
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
          Mostrando {filtered.length} de {solicitudes.length} solicitudes
        </div>
      </div>

      {rechazoModal && (
        <div
          className="fade"
          style={{
            position: "fixed", inset: 0, background: "rgba(17,23,32,0.45)",
            display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 16
          }}
          onClick={cerrarRechazo}
        >
          <div className="card" style={{ maxWidth: 440, width: "100%" }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
              <span style={{ fontSize: 22 }}>❌</span>
              <div style={{ fontSize: 16, fontWeight: 600 }}>Rechazar solicitud {rechazoModal.id}</div>
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
                value={rechazoModal.motivo}
                onChange={e => setRechazoModal(m => ({ ...m, motivo: e.target.value }))}
              />
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button className="btn btn-sec btn-sm" onClick={cerrarRechazo}>Cancelar</button>
              <button className="btn btn-danger btn-sm" onClick={confirmarRechazo}>Confirmar rechazo</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
