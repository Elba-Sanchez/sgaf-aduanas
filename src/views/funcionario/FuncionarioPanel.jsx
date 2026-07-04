import { C } from "../../theme.js";
import { StatCard } from "../../components/common/StatCard.jsx";

const ALERTAS = [
  { tipo: "SAG", pasajero: "Ana López", doc: "12.456.789-0", msg: "Declaró productos de origen animal", badge: "b-yellow", icon: "⚠️" },
  { tipo: "PDI", pasajero: "Carlos Méndez", doc: "Pasaporte ARG-X4521", msg: "Consulta de antecedentes pendiente", badge: "b-blue", icon: "🔍" },
];

export function FuncionarioPanel({ user, onNav }) {
  return (
    <div className="fade">
      <div className="stitle">🖥️ Panel de Control — Funcionario</div>
      <div className="ssub">Bienvenido/a, {user.name}. Ventanilla 3 — Activa</div>
      <div className="g4" style={{ marginBottom: 20 }}>
        <StatCard label="Atenciones hoy" value="47" sub="↑ 12% vs ayer" color={C.navy} />
        <StatCard label="Declaraciones SAG" value="23" sub="5 con productos" color={C.success} />
        <StatCard label="Vehículos ingresados" value="18" sub="3 argentinos" color={C.warning} />
        <StatCard label="Alertas activas" value="2" sub="Requieren atención" color={C.danger} />
      </div>
      <div style={{ fontWeight: 600, marginBottom: 12 }}>Alertas activas</div>
      {ALERTAS.map((a, i) => (
        <div key={i} className="card" style={{
          marginBottom: 10, borderLeft: `4px solid ${a.tipo === "SAG" ? C.warning : C.info}`,
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, borderRadius: "0 12px 12px 0"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 20 }}>{a.icon}</span>
            <div>
              <div style={{ fontSize: 14, fontWeight: 500 }}>{a.pasajero} <span style={{ color: C.textMuted, fontWeight: 400 }}>— {a.doc}</span></div>
              <div style={{ fontSize: 13, color: C.textSec }}>{a.msg}</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
            <span className={`badge ${a.badge}`}>{a.tipo}</span>
            <button className="btn btn-sec btn-sm">Ver detalles</button>
          </div>
        </div>
      ))}
      <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
        <button className="btn btn-primary btn-sm" onClick={() => onNav("vehiculo_ingreso")}>🚙 Registrar Ingreso Vehículo</button>
        <button className="btn btn-sec btn-sm" onClick={() => onNav("pdi")}>🔍 Consulta PDI</button>
      </div>
    </div>
  );
}
