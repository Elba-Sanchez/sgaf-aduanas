import { useState } from "react";
import { C } from "../../theme.js";
import { mockApi } from "../../services/mockApi.js";

export function VehiculoIngreso({ onToast }) {
  const [folio, setFolio] = useState("");
  const [estado, setEstado] = useState(null);

  const handleScan = async () => {
    if (!folio) { onToast("Ingresa el folio o escanea el código.", "error"); return; }
    setEstado("loading");
    try {
      const res = await mockApi.consultarAduanaArg();
      const fechaLimite = new Date(); fechaLimite.setDate(fechaLimite.getDate() + 180);
      setEstado({ ok: true, ...res, patente: "ARG-" + folio.slice(-4).toUpperCase(), pais: "Argentina", fechaLimite: fechaLimite.toLocaleDateString("es-CL") });
      onToast("Vehículo validado. Ingreso autorizado.", "success");
    } catch (e) {
      setEstado({ ok: false, error: e.message });
      onToast(e.message, "error");
    }
  };

  return (
    <div className="fade">
      <div className="stitle">🚙 Registro Ingreso Vehículos Extranjeros</div>
      <div className="ssub">Valida el documento de admisión temporal emitido por Aduana Argentina</div>
      <div className="card" style={{ maxWidth: 580 }}>
        <div className="fgroup">
          <label className="flabel">Folio / Código del documento argentino</label>
          <div style={{ display: "flex", gap: 10 }}>
            <input type="text" placeholder="ARG-2024-XK9..." value={folio} onChange={e => setFolio(e.target.value)} onKeyDown={e => e.key === "Enter" && handleScan()} />
            <button className="btn btn-primary" onClick={handleScan} disabled={estado === "loading"} style={{ flexShrink: 0 }}>
              {estado === "loading" ? "⏳..." : "🔍 Validar"}
            </button>
          </div>
        </div>
        {estado === "loading" && <div className="pulse" style={{ color: C.textSec, fontSize: 13, marginTop: 8 }}>🔗 Consultando Aduana Argentina (Horcones)...</div>}
        {estado?.ok && (
          <div className="fade">
            <div style={{ background: C.successBg, border: `1px solid ${C.success}40`, borderRadius: 10, padding: 16, marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <span className="semaforo s-verde" />
                <strong style={{ color: C.success }}>Documento válido — Ingreso autorizado</strong>
              </div>
              <div className="g2" style={{ fontSize: 13 }}>
                <div><strong>Patente:</strong> {estado.patente}</div>
                <div><strong>Titular:</strong> {estado.titular}</div>
                <div><strong>Modelo:</strong> {estado.modelo}</div>
                <div><strong>Días restantes:</strong> <span style={{ color: C.success, fontWeight: 500 }}>{estado.diasRestantes} días</span></div>
                <div><strong>País:</strong> {estado.pais}</div>
                <div><strong>Plazo límite:</strong> <span style={{ color: C.warning, fontWeight: 500 }}>{estado.fechaLimite}</span></div>
              </div>
            </div>
            <button className="btn btn-success btn-sm">✅ Registrar ingreso</button>
          </div>
        )}
        {estado?.error && (
          <div style={{ background: C.dangerBg, border: `1px solid ${C.danger}40`, borderRadius: 10, padding: 14, marginTop: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <span className="semaforo s-rojo" />
              <strong style={{ color: C.danger }}>Error de validación</strong>
            </div>
            <div style={{ fontSize: 13, color: C.danger }}>{estado.error}</div>
          </div>
        )}
      </div>
    </div>
  );
}
