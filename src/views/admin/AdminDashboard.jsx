import { C } from "../../theme.js";
import { StatCard } from "../../components/common/StatCard.jsx";
import { ProgressBar } from "../../components/common/ProgressBar.jsx";

export function AdminDashboard({ onNav }) {
  const now = new Date();
  const flujo = Array.from({ length: 12 }, (_, i) => ({ hora: `${7 + i}:00`, ing: Math.floor(30 + Math.random() * 80), sal: Math.floor(20 + Math.random() * 70) }));
  const maxV = Math.max(...flujo.map(h => h.ing + h.sal));

  return (
    <div className="fade">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div>
          <div className="stitle">📊 Dashboard — Paso Los Libertadores</div>
          <div className="ssub">{now.toLocaleDateString("es-CL", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</div>
        </div>
        <span className="badge b-green pulse">🟢 Sistema operativo</span>
      </div>
      <div className="g4" style={{ marginBottom: 24 }}>
        <StatCard label="Ingresos hoy" value="847" sub="↑ 8% vs ayer" color={C.navy} />
        <StatCard label="Salidas hoy" value="712" sub="↓ 2% vs ayer" color={C.navyLight} />
        <StatCard label="Vehículos" value="312" sub="63 extranjeros" color={C.success} />
        <StatCard label="Alertas activas" value="4" sub="2 SAG · 2 PDI" color={C.danger} />
      </div>
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div style={{ fontWeight: 600 }}>Flujo en tiempo real — Hoy</div>
          <div style={{ display: "flex", gap: 12, fontSize: 12 }}>
            <span style={{ display: "flex", alignItems: "center", gap: 5 }}><span
              style={{ width: 12, height: 12, background: C.navy, borderRadius: 2, display: "inline-block" }} />Ingresos</span>
            <span style={{ display: "flex", alignItems: "center", gap: 5 }}><span
              style={{ width: 12, height: 12, background: C.gold, borderRadius: 2, display: "inline-block" }} />Salidas</span>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 130, overflowX: "auto" }}>
          {flujo.map((h, i) => (
            <div key={i} style={{ flex: 1, minWidth: 32, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
              <div style={{ width: "90%", display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
                <div style={{ width: "100%", height: Math.round(h.ing / maxV * 100), background: C.navy, borderRadius: "3px 3px 0 0", minHeight: 3 }} />
                <div style={{ width: "100%", height: Math.round(h.sal / maxV * 100), background: C.gold, borderRadius: "0 0 3px 3px", minHeight: 3 }} />
              </div>
              <div style={{ fontSize: 10, color: C.textMuted, marginTop: 2 }}>{h.hora}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="g2">
        <div className="card">
          <div style={{ fontWeight: 600, marginBottom: 12 }}>Ocupación por ventanilla</div>
          {[["V1", 85], ["V2", 72], ["V3", 91], ["V4", 43], ["V5", 67]].map(([v, pct]) => (
            <div key={v} style={{ marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
                <span>Ventanilla {v}</span>
                <span style={{ fontWeight: 500, color: pct > 80 ? C.danger : pct > 60 ? C.warning : C.success }}>{pct}%</span>
              </div>
              <ProgressBar value={pct} color={pct > 80 ? C.danger : pct > 60 ? C.warning : C.success} />
            </div>
          ))}
        </div>
        <div className="card">
          <div style={{ fontWeight: 600, marginBottom: 12 }}>Estado de integraciones</div>
          {[["API PDI", "Activo", true], ["API SAG", "Activo", true], ["Aduana Argentina", "Activo", true],
          ["Sistema de Reportes", "Activo", true], ["Escáner Ventanilla 4", "Fuera de línea", false]].map(([n, s, ok], i) => (
            <div key={i} style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "7px 0", borderBottom: i < 4 ? `1px solid ${C.border}` : "none", fontSize: 13
            }}>
              <span>{n}</span>
              <span className={`badge ${ok ? "b-green" : "b-red"}`}>{ok ? "🟢" : "🔴"} {s}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{ marginTop: 20 }}>
        <button className="btn btn-primary btn-sm" onClick={() => onNav("reportes")}>📈 Ver reportes y exportar</button>
      </div>
    </div>
  );
}
