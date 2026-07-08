import { useState } from "react";
import { C } from "../../theme.js";
import { DetalleSolicitud } from "../../components/common/DetalleSolicitud.jsx";

export function SolicitudesView({ solicitudes, setSolicitudes, onToast }) {
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null); // { sol, modo: 'ver' | 'rechazar', motivo }

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

  const abrirDetalle = (sol) => setModal({ sol, modo: "ver", motivo: "" });
  const cerrar = () => setModal(null);
  const pedirMotivo = () => setModal(m => ({ ...m, modo: "rechazar" }));

  const aprobar = () => {
    const id = modal.sol.id;
    setSolicitudes(prev => prev.map(sol => (sol.id === id ? { ...sol, estado: "Aprobado", motivoRechazo: undefined } : sol)));
    onToast(`Solicitud ${id} marcada como "Aprobado".`, "success");
    cerrar();
  };

  const confirmarRechazo = () => {
    const motivo = modal.motivo.trim();
    if (!motivo) { onToast("Debes indicar el motivo del rechazo.", "error"); return; }
    const id = modal.sol.id;
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
          Mostrando {filtered.length} de {solicitudes.length} solicitudes
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
