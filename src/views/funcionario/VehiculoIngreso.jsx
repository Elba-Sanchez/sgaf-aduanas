import { useState } from "react";
import { C } from "../../theme.js";
import { mockApi } from "../../services/mockApi.js";

export function VehiculoIngreso({ onToast }) {
  const [folio, setFolio] = useState("");
  const [estado, setEstado] = useState(null); // null | "loading" | { ok:true, ... } | { ok:false, motivo } | { error }
  const [registrado, setRegistrado] = useState(false);

  const handleScan = async (folioAUsar = folio) => {
    if (!folioAUsar) { onToast("Ingresa el folio o escanea el código.", "error"); return; }
    setEstado("loading");
    setRegistrado(false);
    try {
      const res = await mockApi.consultarAduanaArg(folioAUsar);
      const fechaLimite = new Date(); fechaLimite.setDate(fechaLimite.getDate() + res.diasRestantes);
      if (res.habilitado) {
        setEstado({ ok: true, ...res, pais: "Argentina", fechaLimite: fechaLimite.toLocaleDateString("es-CL") });
        onToast("Documento válido. Ingreso puede autorizarse.", "success");
      } else {
        setEstado({ ok: false, ...res });
        onToast("El documento no está habilitado para el ingreso.", "warning");
      }
    } catch (e) {
      setEstado({ error: e.message });
      onToast(e.message, "error");
    }
  };

  const handleRegistrar = () => {
    setRegistrado(true);
    onToast("Ingreso registrado correctamente.", "success");
  };

  return (
    <div className="fade">
      <div className="stitle">🚙 Registro Ingreso Vehículos Extranjeros</div>
      <div className="ssub">Valida el documento de admisión temporal emitido por Aduana Argentina</div>
      <div className="card" style={{ maxWidth: 620 }}>
        <div className="fgroup">
          <label className="flabel">Folio / Código del documento argentino</label>
          <div style={{ display: "flex", gap: 10 }}>
            <input type="text" placeholder="ARG-2024-XK9..." value={folio} onChange={e => setFolio(e.target.value)} 
            onKeyDown={e => e.key === "Enter" && handleScan()} />
            <button className="btn btn-primary" onClick={() => handleScan()} disabled={estado === "loading"} style={{ flexShrink: 0 }}>
              {estado === "loading" ? "⏳..." : "🔍 Validar"}
            </button>
          </div>
          <div style={{ fontSize: 11, color: C.textMuted, marginTop: 6 }}>
            Ejemplo: <strong style={{ fontFamily: "monospace" }}>ARG-2024-XK9</strong>
          </div>
        </div>

        {estado === "loading" && <div className="pulse" style={{ color: C.textSec, 
          fontSize: 13, marginTop: 8 }}>🔗 Consultando Aduana Argentina (Horcones)...</div>}

        {estado?.ok && (
          <div className="fade" style={{ marginTop: 14 }}>
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
            {registrado ? (
              <div style={{ fontSize: 13, color: C.success }}>✅ Ingreso ya registrado para este vehículo.</div>
            ) : (
              <button className="btn btn-success btn-sm" onClick={handleRegistrar}>✅ Registrar ingreso</button>
            )}
          </div>
        )}

        {estado?.ok === false && (
          <div style={{ background: C.dangerBg, border: `1px solid ${C.danger}40`, borderRadius: 10, padding: 14, marginTop: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <span className="semaforo s-rojo" />
              <strong style={{ color: C.danger }}>Documento no habilitado — Ingreso rechazado</strong>
            </div>
            <div style={{ fontSize: 13, color: C.danger }}>
              {estado.motivo ?? "El documento no figura como vigente en el sistema de Aduana Argentina."}
            </div>
          </div>
        )}

        {estado?.error && (
          <div style={{ background: C.dangerBg, border: `1px solid ${C.danger}40`, borderRadius: 10, padding: 14, marginTop: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <span className="semaforo s-rojo" />
              <strong style={{ color: C.danger }}>Error de conexión</strong>
            </div>
            <div style={{ fontSize: 13, color: C.danger }}>{estado.error}</div>
          </div>
        )}
      </div>
    </div>
  );
}
