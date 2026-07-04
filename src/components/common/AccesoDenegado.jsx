import { C } from "../../theme.js";

export function AccesoDenegado({ view, role }) {
  return (
    <div className="fade" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
      <div className="card" style={{ maxWidth: 460, textAlign: "center", borderLeft: `4px solid ${C.danger}` }}>
        <div style={{ fontSize: 36, marginBottom: 10 }}>⛔</div>
        <div style={{ fontSize: 17, fontWeight: 600, color: C.danger, marginBottom: 6 }}>Acceso denegado</div>
        <div style={{ fontSize: 13, color: C.textSec, marginBottom: 14 }}>
          Tu rol actual (<strong>{role}</strong>) no tiene permisos para acceder al recurso solicitado
          (<code>{view}</code>). Esta restricción se aplica según control de acceso basado en roles (RBAC).
        </div>
        <span className="badge b-red">RNF-S-02 · Control de acceso por roles</span>
      </div>
    </div>
  );
}
