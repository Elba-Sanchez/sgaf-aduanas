import { C } from "../../theme.js";

const NAV_MAP = {
  pasajero: [
    { id: "pasajero", icon: "🏠", label: "Inicio" },
    { id: "sag", icon: "🌿", label: "Declaración SAG" },
    { id: "menores", icon: "👶", label: "Autorización Menores" },
    { id: "vehiculo_salida", icon: "🚗", label: "Salida Vehículo" },
    { id: "ayuda", icon: "❓", label: "Ayuda" },
  ],
  funcionario: [
    { id: "funcionario", icon: "🖥️", label: "Panel Control" },
    { id: "vehiculo_ingreso", icon: "🚙", label: "Ingreso Vehículos" },
    { id: "pdi", icon: "🔍", label: "Control PDI" },
  ],
  admin: [
    { id: "admin", icon: "📊", label: "Dashboard" },
    { id: "solicitudes", icon: "📋", label: "Solicitudes" },
    { id: "usuarios", icon: "👥", label: "Gestión Usuarios" },
    { id: "auditoria", icon: "🔐", label: "Auditoría" },
    { id: "reportes", icon: "📈", label: "Reportes" },
  ],
  pdi: [{ id: "pdi", icon: "🔍", label: "Control PDI" }],
};

const ROLE_LABEL = {
  pasajero: "Pasajero/Turista",
  funcionario: "Funcionario Aduanas",
  admin: "Administrador",
  pdi: "Funcionario PDI",
};

export function AppShell({ user, currentView, onNav, onLogout, children }) {
  const navItems = NAV_MAP[user.role] || [];

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <aside style={{
        width: 220, background: C.white, borderRight: `1px solid ${C.border}`, display: "flex", flexDirection: "column",
        position: "sticky", top: 0, height: "100vh", overflowY: "auto"
      }}>
        <div style={{ padding: "18px 14px 14px", borderBottom: `1px solid ${C.border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 34, height: 34, background: C.navy, borderRadius: 8, display: "flex", alignItems: "center",
              justifyContent: "center", fontSize: 16
            }}>🛃</div>
            <div>
              <div style={{ fontFamily: "'Source Serif 4',serif", fontSize: 14, fontWeight: 600, color: C.navy }}>SGAF</div>
              <div style={{ fontSize: 10, color: C.textMuted }}>Aduanas Chile</div>
            </div>
          </div>
        </div>
        <div style={{ padding: "10px 10px 8px", borderBottom: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 5, paddingLeft: 4 }}>Sesión activa</div>
          <div style={{ padding: "7px 10px", background: C.bg, borderRadius: 8 }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: C.textPrimary }}>{user.name}</div>
            <span className="badge b-blue" style={{ marginTop: 4, fontSize: 10 }}>{ROLE_LABEL[user.role]}</span>
          </div>
        </div>
        <nav style={{ flex: 1, padding: "8px 8px" }}>
          {navItems.map(n => (
            <button key={n.id} className={`nav-item ${currentView === n.id ? "active" : ""}`} onClick={() => onNav(n.id)}>
              <span>{n.icon}</span>{n.label}
            </button>
          ))}
        </nav>
        <div style={{ padding: "8px 8px 14px" }}>
          <div style={{ padding: "8px 12px", fontSize: 12, color: C.textMuted, borderTop: `1px solid ${C.border}`, paddingTop: 12 }}>
            <div>Paso Los Libertadores</div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
              <span className="semaforo s-verde" />
              <span style={{ color: C.success, fontWeight: 500 }}>Sistema operativo</span>
            </div>
          </div>
          <button className="nav-item" onClick={onLogout} style={{ color: C.danger, marginTop: 4 }}>
            <span>🚪</span>Cerrar sesión
          </button>
        </div>
      </aside>
      <main style={{ flex: 1, padding: "28px 32px", overflowY: "auto", maxWidth: "100%" }}>
        {children}
      </main>
    </div>
  );
}
