import { C } from "../../theme.js";

const TRAMITES = [
  { id: "sag", icon: "🌿", title: "Declaración SAG", desc: "Declara productos vegetales, animales o mascotas", badge: "Obligatorio", bc: "b-green" },
  { id: "menores", icon: "👶", title: "Autorización Menores", desc: "Sube el permiso notarial para menores de edad", badge: "Si aplica", bc: "b-blue" },
  { id: "vehiculo_salida", icon: "🚗", title: "Salida de Vehículo", desc: "Genera el formulario de admisión temporal", badge: "Si aplica", bc: "b-yellow" },
];

export function PasajeroHome({ user, onNav }) {
  return (
    <div className="fade">
      <div style={{ marginBottom: 24 }}>
        <div className="stitle">Bienvenido/a, {user.name.split(" ")[0]} 👋</div>
        <div className="ssub">Completa tus trámites antes de llegar al paso fronterizo Los Libertadores</div>
      </div>
      <div style={{ background: C.navy, borderRadius: 12, padding: 20, marginBottom: 24, color: "#fff" }}>
        <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>📢 Aviso importante</div>
        <div style={{ fontSize: 13, opacity: 0.9 }}>Completa tu declaración SAG con anticipación. Tiempo promedio de cruce hoy:
          <strong> 12 minutos</strong> (normal).</div>
        <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
          <span className="badge" style={{ background: "rgba(255,255,255,0.2)", color: "#fff" }}>🟢 Sistema operativo</span>
          <span className="badge" style={{ background: "rgba(255,255,255,0.2)", color: "#fff" }}>⏱️ Mayor afluencia: 09:30 - 18:00</span>
        </div>
      </div>
      <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 14 }}>Tus trámites disponibles</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 14 }}>
        {TRAMITES.map(t => (
          <div key={t.id} className="card" style={{ cursor: "pointer", transition: "box-shadow 0.2s" }} onClick={() => onNav(t.id)}
            onMouseEnter={e => e.currentTarget.style.boxShadow = "0 4px 16px rgba(27,58,107,0.12)"}
            onMouseLeave={e => e.currentTarget.style.boxShadow = ""}>
            <div style={{ fontSize: 28, marginBottom: 10 }}>{t.icon}</div>
            <span className={`badge ${t.bc}`} style={{ marginBottom: 8 }}>{t.badge}</span>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>{t.title}</div>
            <div style={{ fontSize: 13, color: C.textSec }}>{t.desc}</div>
          </div>
        ))}
      </div>
      <div className="card" style={{ marginTop: 20 }}>
        <div style={{ fontWeight: 600, marginBottom: 4 }}>❓ ¿Primera vez cruzando la frontera?</div>
        <div style={{ fontSize: 13, color: C.textSec, marginBottom: 10 }}>Te guiamos paso a paso en cada trámite.</div>
        <button className="btn btn-sec btn-sm" onClick={() => onNav("ayuda")}>Ver guía completa →</button>
      </div>
    </div>
  );
}
