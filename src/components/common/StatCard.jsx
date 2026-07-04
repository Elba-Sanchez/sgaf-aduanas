import { C } from "../../theme.js";

export function StatCard({ label, value, sub, color }) {
  return (
    <div className="card" style={{ textAlign: "center" }}>
      <div style={{ fontSize: 26, fontWeight: 600, color: color || C.navy }}>{value}</div>
      <div style={{ fontSize: 13, fontWeight: 500, color: color || C.textPrimary, marginTop: 2 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}>{sub}</div>}
    </div>
  );
}
