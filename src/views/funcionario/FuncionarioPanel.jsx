import { useState } from "react";
import { C } from "../../theme.js";
import { StatCard } from "../../components/common/StatCard.jsx";

export function FuncionarioPanel({ user, onNav, solicitudes, setSolicitudes, onToast }) {
  const [modal, setModal] = useState(null); // { sol, modo: 'ver' | 'rechazar', motivo }

  const pendientes = solicitudes.filter(s => s.estado === "Pendiente");

  const abrirDetalle = (sol) => setModal({ sol, modo: "ver", motivo: "" });
  const cerrar = () => setModal(null);
  const pedirMotivo = () => setModal(m => ({ ...m, modo: "rechazar" }));

  const aprobar = () => {
    const id = modal.sol.id;
    setSolicitudes(prev => prev.map(s => (s.id === id ? { ...s, estado: "Aprobado", motivoRechazo: undefined } : s)));
    onToast(`Solicitud ${id} aprobada.`, "success");
    cerrar();
  };

  const confirmarRechazo = () => {
    const motivo = modal.motivo.trim();
    if (!motivo) { onToast("Debes indicar el motivo del rechazo.", "error"); return; }
    const id = modal.sol.id;
    setSolicitudes(prev => prev.map(s => (s.id === id ? { ...s, estado: "Rechazado", motivoRechazo: motivo } : s)));
    onToast(`Solicitud ${id} rechazada.`, "success");
    cerrar();
  };

  const iconoTipo = (tipo) => {
    if (tipo.includes("SAG")) return "🌿";
    if (tipo.includes("menor")) return "👶";
    if (tipo.includes("vehículo") || tipo.includes("vehiculo")) return "🚗";
    return "📄";
  };

  const badgeTipo = (tipo) => {
    if (tipo.includes("SAG")) return "b-yellow";
    if (tipo.includes("menor")) return "b-blue";
    return "b-gray";
  };

  return (
    <div className="fade">
      <div className="stitle">🖥️ Panel de Control — Funcionario</div>
      <div className="ssub">Bienvenido/a, {user.name}. Ventanilla 3 — Activa</div>
      <div className="g4" style={{ marginBottom: 20 }}>
        <StatCard label="Atenciones hoy" value="47" sub="↑ 12% vs ayer" color={C.navy} />
        <StatCard label="Declaraciones SAG" value="23" sub="5 con productos" color={C.success} />
        <StatCard label="Vehículos ingresados" value="18" sub="3 argentinos" color={C.warning} />
        <StatCard label="Alertas activas" value={pendientes.length} sub="Requieren atención" color={C.danger} />
      </div>

      <div style={{ fontWeight: 600, marginBottom: 12 }}>Solicitudes pendientes</div>
      {pendientes.length === 0 && (
        <div className="card" style={{ color: C.textMuted, fontSize: 13, textAlign: "center", padding: 24 }}>
          No hay solicitudes pendientes por revisar. 🎉
        </div>
      )}
      {pendientes.map((sol) => (
        <div key={sol.id} className="card" style={{
          marginBottom: 10, borderLeft: `4px solid ${C.warning}`,
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, borderRadius: "0 12px 12px 0"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 20 }}>{iconoTipo(sol.tipo)}</span>
            <div>
              <div style={{ fontSize: 14, fontWeight: 500 }}>{sol.solicitante} <span style={{ color: C.textMuted, fontWeight: 400 }}>— {sol.identificacion}</span></div>
              <div style={{ fontSize: 13, color: C.textSec }}>{sol.tipo} · {sol.id}</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, flexShrink: 0, alignItems: "center" }}>
            <span className={`badge ${badgeTipo(sol.tipo)}`}>{sol.tipo}</span>
            <button className="btn btn-sec btn-sm" onClick={() => abrirDetalle(sol)}>Ver detalles</button>
          </div>
        </div>
      ))}

      <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
        <button className="btn btn-primary btn-sm" onClick={() => onNav("vehiculo_ingreso")}>🚙 Registrar Ingreso Vehículo</button>
        <button className="btn btn-sec btn-sm" onClick={() => onNav("pdi")}>🔍 Consulta PDI</button>
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
          <div className="card" style={{ maxWidth: 440, width: "100%" }} onClick={e => e.stopPropagation()}>
            {modal.modo === "ver" && (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                  <span style={{ fontSize: 22 }}>{iconoTipo(modal.sol.tipo)}</span>
                  <div style={{ fontSize: 16, fontWeight: 600 }}>Detalle de solicitud {modal.sol.id}</div>
                </div>
                <div style={{ fontSize: 13, color: C.textSec, marginBottom: 14 }}>
                  Revisa los datos antes de aprobar o rechazar el trámite.
                </div>
                <div className="g2" style={{ fontSize: 13, marginBottom: 18, rowGap: 10 }}>
                  <div><strong>Tipo:</strong> {modal.sol.tipo}</div>
                  <div><strong>Fecha:</strong> {modal.sol.fecha}</div>
                  <div><strong>Solicitante:</strong> {modal.sol.solicitante}</div>
                  <div><strong>Identificación:</strong> {modal.sol.identificacion}</div>
                </div>
                <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                  <button className="btn btn-sec btn-sm" onClick={cerrar}>Cerrar</button>
                  <button className="btn btn-danger btn-sm" onClick={pedirMotivo}>Rechazar</button>
                  <button className="btn btn-success btn-sm" onClick={aprobar}>Aprobar</button>
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