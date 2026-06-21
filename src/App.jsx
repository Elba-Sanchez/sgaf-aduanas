import { useState, useEffect } from "react";

const C = {
  navy: "#1B3A6B",
  navyLight: "#2D5BA3",
  gold: "#C8A84B",
  bg: "#F4F6FA",
  white: "#ffffff",
  success: "#1A7A4A",
  successBg: "#E8F5EE",
  danger: "#B91C1C",
  dangerBg: "#FEE2E2",
  warning: "#B45309",
  warningBg: "#FEF3C7",
  info: "#1D4ED8",
  infoBg: "#EFF6FF",
  border: "#D1D9E6",
  textPrimary: "#111827",
  textSec: "#6B7280",
  textMuted: "#9CA3AF",
};

const mockApi = {
  _delay: (ms = 1400) => new Promise((res, rej) =>
    setTimeout(() => Math.random() < 0.08 ? rej(new Error("Error de conexión. Intente nuevamente.")) : res(), ms)),

_medir: async (fn) => {
    const start = performance.now();
    const data = await fn();
    const ms = Math.round(performance.now() - start);
    return { ...data, _tiempoMs: ms };
  },

  validarSag: async () => {
    await mockApi._delay();
    const ok = Math.random() > 0.3;
    return {
      aprobado: ok, folio: "SAG-" + Math.floor(100000 + Math.random() * 900000), mensaje: ok ? "Declaración aceptada automáticamente."
        : "Requiere revisión presencial en andén SAG."
    };
  },

  validarMenor: async () => {
    await mockApi._delay();
    return { aprobado: true, folio: "AU-" + Math.floor(100000 + Math.random() * 900000) };
  },

  consultarPDI: async (rut) => mockApi._medir(async () => {
    await mockApi._delay();
    const alerta = Math.random() > 0.82;
    return {
      nombre: rut === "12345678-9" ? "Juan Carlos Bodoque" : "Zacarías Flores del Campo", alerta, habilitado: !alerta, mensaje: alerta
        ? "ALERTA: Orden de arraigo nacional activo." : "Sin arraigo nacional ni órdenes vigentes."
    };
  }),

  consultarAduanaArg: async () => mockApi._medir(async () => {
    await mockApi._delay();
    return { habilitado: true, diasRestantes: 180, titular: "Alan Brito", modelo: "Toyota Hilux 2022" };
  }),
};

// DATOS INICIALES
const USUARIOS_INIT = [
  { id: 1, nombre: "Tulio Triviño", run: "12.345.678-9", rol: "Administrador", aduana: "Los Libertadores", correo: "tulio@aduana.cl" },
  { id: 2, nombre: "Juanin Juan Harry", run: "15.987.654-3", rol: "Funcionario", aduana: "Pino Hachado", correo: "juanin@aduana.cl" },
  { id: 3, nombre: "Patana Tufillo", run: "18.456.123-K", rol: "Funcionario", aduana: "Los Libertadores", correo: "tulio@aduana.cl" },
];

const SOLICITUDES_INIT = [
  {
    id: "SOL-101", tipo: "Declaración SAG", solicitante: "Joseph Joestar", identificacion: "Pasaporte A998231",
    estado: "Pendiente", fecha: "2026-06-04 10:14"
  },
  {
    id: "SOL-102", tipo: "Validación de menor", solicitante: "Jotaro Kujo", identificacion: "RUT 18.231.992-K",
    estado: "Pendiente", fecha: "2026-06-04 11:02"
  },
  {
    id: "SOL-103", tipo: "Validación de vehículo", solicitante: "Josuke Higashikata", identificacion: "Patente AA-234-BB",
    estado: "Pendiente", fecha: "2026-06-04 11:45"
  },
  {
    id: "SOL-104", tipo: "Declaración SAG", solicitante: "Son Goku", identificacion: "RUT 15.667.123-4",
    estado: "Aprobado", fecha: "2026-06-04 09:12"
  },
  {
    id: "SOL-105", tipo: "Validación de vehículo", solicitante: "Dio Brando", identificacion: "Patente AF-998-LK",
    estado: "Rechazado", fecha: "2026-06-04 08:30"
  },
];

const AUDIT_INIT = [
  { id: 1, timestamp: "2026-06-04 14:22:10", usuario: "tulio@aduana.cl", accion: "Modificación de permisos de usuario ID 2" },
  { id: 2, timestamp: "2026-06-04 14:15:32", usuario: "juanin@aduana.cl", accion: "Aprobación documento Vehículo SOL-103" },
  { id: 3, timestamp: "2026-06-04 13:45:11", usuario: "juanin@aduana.cl", accion: "Consulta RUT 14.552.123-4 en módulo PDI" },
  { id: 4, timestamp: "2026-06-04 12:10:04", usuario: "tulio@aduana.cl", accion: "Ingreso Vehículo Argentino Patente: AC992LL" },
];

const USERS_LOGIN = {
  "12345678-9": { pass: "pasajero123", role: "pasajero", name: "María González" },
  "87654321-0": { pass: "func123", role: "funcionario", name: "Carlos Rodríguez" },
  "admin": { pass: "admin123", role: "admin", name: "Administrador SGAF" },
  "pdi001": { pass: "pdi123", role: "pdi", name: "Insp. Pedro Vásquez (PDI)" },
};

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Source+Serif+4:wght@400;600&family=DM+Sans:wght@400;500;600&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'DM Sans', sans-serif; background: ${C.bg}; color: ${C.textPrimary}; min-height: 100vh; }
  input, select, textarea, button { font-family: inherit; font-size: 14px; }
  button { cursor: pointer; }
  .fade { animation: fadeIn 0.25s ease; }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
  .pulse { animation: pulse 2s infinite; }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.45} }
  .badge { display:inline-flex;align-items:center;gap:4px;padding:2px 9px;border-radius:99px;font-size:11px;font-weight:500; }
  .b-green { background:${C.successBg};color:${C.success}; }
  .b-red   { background:${C.dangerBg};color:${C.danger}; }
  .b-yellow{ background:${C.warningBg};color:${C.warning}; }
  .b-blue  { background:${C.infoBg};color:${C.info}; }
  .b-gray  { background:#F3F4F6;color:#374151; }
  input[type=text],input[type=password],input[type=date],input[type=number],input[type=email],select,textarea {
    width:100%;padding:9px 12px;border:1px solid ${C.border};border-radius:8px;background:#fff;color:${C.textPrimary};
    outline:none;transition:border-color 0.2s;
  }
  input:focus,select:focus,textarea:focus{border-color:${C.navyLight};box-shadow:0 0 0 3px rgba(45,91,163,0.1);}
  .btn{display:inline-flex;align-items:center;gap:6px;padding:9px 18px;border-radius:8px;font-size:14px;font-weight:500;border:none;
  transition:all 0.15s;}
  .btn:active{transform:scale(0.97);}
  .btn-primary{background:${C.navy};color:#fff;} .btn-primary:hover{background:${C.navyLight};}
  .btn-sec{background:#fff;color:${C.navy};border:1px solid ${C.border};} .btn-sec:hover{background:${C.bg};}
  .btn-success{background:${C.success};color:#fff;}
  .btn-danger{background:${C.danger};color:#fff;}
  .btn-gold{background:${C.gold};color:#fff;}
  .btn-sm{padding:6px 12px;font-size:13px;}
  .card{background:#fff;border-radius:12px;border:1px solid ${C.border};padding:20px;}
  .nav-item{display:flex;align-items:center;gap:10px;padding:9px 13px;border-radius:8px;cursor:pointer;font-size:14px;color:${C.textSec};
  transition:all 0.15s;border:none;background:none;width:100%;text-align:left;}
  .nav-item:hover{background:${C.bg};color:${C.textPrimary};}
  .nav-item.active{background:${C.navy};color:#fff;font-weight:500;}
  .stitle{font-size:20px;font-weight:600;color:${C.textPrimary};margin-bottom:4px;}
  .ssub{font-size:14px;color:${C.textSec};margin-bottom:20px;}
  .flabel{font-size:13px;font-weight:500;color:${C.textSec};margin-bottom:5px;display:block;}
  .fgroup{margin-bottom:15px;}
  .g2{display:grid;grid-template-columns:1fr 1fr;gap:16px;}
  .g3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;}
  .g4{display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:12px;}
  @media(max-width:640px){.g2,.g3,.g4{grid-template-columns:1fr;}}
  .semaforo{width:18px;height:18px;border-radius:50%;display:inline-block;}
  .s-verde{background:#22C55E;box-shadow:0 0 7px #22C55E88;}
  .s-rojo{background:#EF4444;box-shadow:0 0 7px #EF444488;}
  table{width:100%;border-collapse:collapse;font-size:13px;}
  th{padding:9px 12px;text-align:left;font-weight:600;color:${C.textSec};border-bottom:1px solid ${C.border};background:${C.bg};}
  td{padding:9px 12px;border-bottom:1px solid ${C.border};}
  tr:last-child td{border-bottom:none;}
  tr:hover td{background:#FAFBFE;}
`;

// COMPONENTES COMPARTIDOS

function Toast({ msg, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 4000); return () => clearTimeout(t); }, []);
  const bg = { success: C.successBg, error: C.dangerBg, info: C.infoBg, warning: C.warningBg };
  const co = { success: C.success,   error: C.danger,   info: C.info,   warning: C.warning };
  return (
    <div style={{
      position: "fixed", top: 20, right: 20, zIndex: 999, background: bg[type] || C.infoBg, color: co[type] || C.info,
      border: `1px solid ${co[type] || C.info}30`,
      borderRadius: 10, padding: "12px 18px", fontSize: 14, fontWeight: 500, maxWidth: 320, boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
      animation: "fadeIn 0.3s ease"
    }}>
      {msg}
    </div>
  );
}

function StatCard({ label, value, sub, color }) {
  return (
    <div className="card" style={{ textAling: "center" }}>
      <div style={{ fontSize: 26, fontWeight: 600, color: color || C.navy }}>{value}</div>
      <div style={{ fontSize: 13, fontWeight: 500, color: color || C.textPrimary, marginTop: 2 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

function ProgressBar({ value, color }) {
  return (
    <div style={{ background: C.border, borderRadius: 99, height: 7, width: "100%" }}>
      <div style={{ background: color || C.navy, borderRadius: 99, height: 7, width: `${value}%`, transition: "width 0.6s ease" }} />
    </div>
  );
}

function Spinner() {
  return <span className="pulse" style={{ color: C.textMuted }}> Procesando...</span>;
}

function TiempoRespuesta({ ms }) {
  if (ms == null) return null;
  const ok = ms < 3000;
  return (
    <div style={{ display:"inline-flex",alignItems:"center",gap:6,fontSize:11,
    color:ok?C.success:C.danger,background:ok?C.successBg:C.dangerBg,padding:"4px 10px",borderRadius:99,marginTop:8 }}>
      ⚡ Tiempo de respuesta: <strong>{(ms/1000).toFixed(2)}s</strong> {ok ? "(cumple RNF-R-01 < 3s)" : "(excede umbral)"}
    </div>
  );
}

// RBAC - Control de acceso por roles
const ACCESO_PERMITIDO = {
  pasajero:    ["pasajero", "sag", "menores", "vehiculo_salida", "ayuda"],
  funcionario: ["funcionario", "vehiculo_ingreso", "pdi"],
  admin:       ["admin", "solicitudes", "usuarios", "auditoria", "reportes"],
  pdi:         ["pdi"],
};

function AccesoDenegado({ view, role }) {
  return (
    <div className="fade" style={{ display:"flex",alignItems:"center",justifyContent:"center",minHeight:"60vh" }}>
      <div className="card" style={{ maxWidth:460,textAlign:"center",borderLeft:`4px solid ${C.danger}` }}>
        <div style={{ fontSize:36,marginBottom:10 }}>⛔</div>
        <div style={{ fontSize:17,fontWeight:600,color:C.danger,marginBottom:6 }}>Acceso denegado</div>
        <div style={{ fontSize:13,color:C.textSec,marginBottom:14 }}>
          Tu rol actual (<strong>{role}</strong>) no tiene permisos para acceder al recurso solicitado
          (<code>{view}</code>). Esta restricción se aplica según control de acceso basado en roles (RBAC).
        </div>
        <span className="badge b-red">RNF-S-02 · Control de acceso por roles</span>
      </div>
    </div>
  );
}

// LOGIN 

function LoginView({ onLogin }) {
  const [doc, setDoc] = useState("");
  const [pass, setPass] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const handleLogin = () => {
    setErr(""); setLoading(true);
    setTimeout(() => {
      const u = USERS_LOGIN[doc.toLowerCase()];
      if (u && u.pass === pass) { onLogin({ role: u.role, name: u.name, doc }); }
      else { setErr("RUT/documento o contraseña incorrectos."); }
      setLoading(false);
    }, 900);
  };

  return (
    <div style={{ minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",
    background:`linear-gradient(135deg, ${C.navy} 0%, ${C.navyLight} 100%)` }}>
      <div className="fade" style={{ width:"100%",maxWidth:420,padding:"0 16px" }}>
        <div className="card" style={{ padding:36 }}>
          <div style={{ textAlign:"center",marginBottom:28 }}>
            <div style={{ width:60,height:60,background:C.navy,borderRadius:14,display:"flex",
              alignItems:"center",justifyContent:"center",margin:"0 auto 12px",fontSize:26 }}>🛃</div>
            <div style={{ fontFamily:"'Source Serif 4',serif",fontSize:22,fontWeight:600,color:C.navy }}>SGAF</div>
            <div style={{ fontSize:12,color:C.textSec,marginTop:3 }}>Sistema de Gestión Aduanera Fronteriza</div>
            <div style={{ fontSize:11,color:C.textMuted,marginTop:2 }}>Paso Los Libertadores · Chile</div>
          </div>
          <div className="fgroup">
            <label className="flabel">RUT / Pasaporte</label>
            <input type="text" placeholder="ej. 12345678-9 o admin" value={doc} onChange={e => setDoc(e.target.value)} />
          </div>
          <div className="fgroup">
            <label className="flabel">Contraseña</label>
            <input type="password" placeholder="••••••••" value={pass} onChange={e => setPass(e.target.value)} 
            onKeyDown={e => e.key === "Enter" && handleLogin()} />
          </div>
          {err && <div style={{ background:C.dangerBg,color:C.danger,padding:"10px 14px",borderRadius:8,fontSize:13,marginBottom:14 }}>{err}</div>}
          <button className="btn btn-primary" style={{ width:"100%",justifyContent:"center",padding:11,fontSize:15 }}
           onClick={handleLogin} disabled={loading}>
            {loading ? "Verificando..." : "Ingresar al sistema"}
          </button>
          <div style={{ marginTop:20,padding:12,background:C.bg,borderRadius:8,fontSize:12,color:C.textSec,lineHeight:1.7 }}>
            <strong>Cuentas demo:</strong><br />
            Pasajero: <code>12345678-9</code> / <code>pasajero123</code><br />
            Funcionario: <code>87654321-0</code> / <code>func123</code><br />
            Admin: <code>admin</code> / <code>admin123</code><br />
            PDI: <code>pdi001</code> / <code>pdi123</code>
          </div>
        </div>
      </div>
    </div>
  );
}

// APP SHELL (Sidebar)
function AppShell({ user, currentView, onNav, onLogout, children }) {
  const navMap = {
    pasajero:   [{ id:"pasajero",icon:"🏠",label:"Inicio" },{ id:"sag",icon:"🌿",label:"Declaración SAG" },
      { id:"menores",icon:"👶",label:"Autorización Menores" },{ id:"vehiculo_salida",icon:"🚗",label:"Salida Vehículo" },
      { id:"ayuda",icon:"❓",label:"Ayuda" }],
    funcionario:[{ id:"funcionario",icon:"🖥️",label:"Panel Control" },{ id:"vehiculo_ingreso",icon:"🚙",label:"Ingreso Vehículos" },
      { id:"pdi",icon:"🔍",label:"Control PDI" }],
    admin:      [{ id:"admin",icon:"📊",label:"Dashboard" },
      { id:"solicitudes",icon:"📋",label:"Solicitudes" },
      { id:"usuarios",icon:"👥",label:"Gestión Usuarios" },
      { id:"auditoria",icon:"🔐",label:"Auditoría" },{ id:"reportes",icon:"📈",label:"Reportes" }],
    pdi:        [{ id:"pdi",icon:"🔍",label:"Control PDI" }],
  };
  const roleLabel = { pasajero:"Pasajero/Turista",funcionario:"Funcionario Aduanas",admin:"Administrador",pdi:"Funcionario PDI" };
  const navItems = navMap[user.role] || [];

  return (
    <div style={{ display:"flex",minHeight:"100vh" }}>
      <aside style={{ width:220,background:C.white,borderRight:`1px solid ${C.border}`,display:"flex",flexDirection:"column",
      position:"sticky",top:0,height:"100vh",overflowY:"auto" }}>
        <div style={{ padding:"18px 14px 14px",borderBottom:`1px solid ${C.border}` }}>
          <div style={{ display:"flex",alignItems:"center",gap:10 }}>
            <div style={{ width:34,height:34,background:C.navy,borderRadius:8,display:"flex",alignItems:"center",
              justifyContent:"center",fontSize:16 }}>🛃</div>
            <div>
              <div style={{ fontFamily:"'Source Serif 4',serif",fontSize:14,fontWeight:600,color:C.navy }}>SGAF</div>
              <div style={{ fontSize:10,color:C.textMuted }}>Aduanas Chile</div>
            </div>
          </div>
        </div>
        <div style={{ padding:"10px 10px 8px",borderBottom:`1px solid ${C.border}` }}>
          <div style={{ fontSize:11,color:C.textMuted,marginBottom:5,paddingLeft:4 }}>Sesión activa</div>
          <div style={{ padding:"7px 10px",background:C.bg,borderRadius:8 }}>
            <div style={{ fontSize:13,fontWeight:500,color:C.textPrimary }}>{user.name}</div>
            <span className="badge b-blue" style={{ marginTop:4,fontSize:10 }}>{roleLabel[user.role]}</span>
          </div>
        </div>
        <nav style={{ flex:1,padding:"8px 8px" }}>
          {navItems.map(n => (
            <button key={n.id} className={`nav-item ${currentView===n.id?"active":""}`} onClick={() => onNav(n.id)}>
              <span>{n.icon}</span>{n.label}
            </button>
          ))}
        </nav>
        <div style={{ padding:"8px 8px 14px" }}>
          <div style={{ padding:"8px 12px",fontSize:12,color:C.textMuted,borderTop:`1px solid ${C.border}`,paddingTop:12 }}>
            <div>Paso Los Libertadores</div>
            <div style={{ display:"flex",alignItems:"center",gap:6,marginTop:4 }}>
              <span className="semaforo s-verde" />
              <span style={{ color:C.success,fontWeight:500 }}>Sistema operativo</span>
            </div>
          </div>
          <button className="nav-item" onClick={onLogout} style={{ color:C.danger,marginTop:4 }}>
            <span>🚪</span>Cerrar sesión
          </button>
        </div>
      </aside>
      <main style={{ flex:1,padding:"28px 32px",overflowY:"auto",maxWidth:"100%" }}>
        {children}
      </main>
    </div>
  );
}

// VISTA: PASAJERO HOME
function PasajeroHome({ user, onNav }) {
  const tramites = [
    { id:"sag", icon:"🌿", title:"Declaración SAG", desc:"Declara productos vegetales, animales o mascotas", badge:"Obligatorio", bc:"b-green" },
    { id:"menores", icon:"👶", title:"Autorización Menores", desc:"Sube el permiso notarial para menores de edad", badge:"Si aplica", bc:"b-blue" },
    { id:"vehiculo_salida", icon:"🚗", title:"Salida de Vehículo", desc:"Genera el formulario de admisión temporal", badge:"Si aplica", bc:"b-yellow" },
  ];
  return (
    <div className="fade">
      <div style={{ marginBottom:24 }}>
        <div className="stitle">Bienvenido/a, {user.name.split(" ")[0]} 👋</div>
        <div className="ssub">Completa tus trámites antes de llegar al paso fronterizo Los Libertadores</div>
      </div>
      <div style={{ background:C.navy,borderRadius:12,padding:20,marginBottom:24,color:"#fff" }}>
        <div style={{ fontSize:15,fontWeight:600,marginBottom:6 }}>📢 Aviso importante</div>
        <div style={{ fontSize:13,opacity:0.9 }}>Completa tu declaración SAG con anticipación. Tiempo promedio de cruce hoy: 
          <strong>12 minutos</strong> (normal).</div>
        <div style={{ marginTop:10,display:"flex",gap:8,flexWrap:"wrap" }}>
          <span className="badge" style={{ background:"rgba(255,255,255,0.2)",color:"#fff" }}>🟢 Sistema operativo</span>
          <span className="badge" style={{ background:"rgba(255,255,255,0.2)",color:"#fff" }}>⏱️ Mayor afluencia: 09:30 - 18:00</span>
        </div>
      </div>
      <div style={{ fontSize:15,fontWeight:600,marginBottom:14 }}>Tus trámites disponibles</div>
      <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:14 }}>
        {tramites.map(t => (
          <div key={t.id} className="card" style={{ cursor:"pointer",transition:"box-shadow 0.2s" }} onClick={() => onNav(t.id)}
               onMouseEnter={e => e.currentTarget.style.boxShadow="0 4px 16px rgba(27,58,107,0.12)"}
               onMouseLeave={e => e.currentTarget.style.boxShadow=""}>
            <div style={{ fontSize:28,marginBottom:10 }}>{t.icon}</div>
            <span className={`badge ${t.bc}`} style={{ marginBottom:8 }}>{t.badge}</span>
            <div style={{ fontWeight:600,marginBottom:4 }}>{t.title}</div>
            <div style={{ fontSize:13,color:C.textSec }}>{t.desc}</div>
          </div>
        ))}
      </div>
      <div className="card" style={{ marginTop:20 }}>
        <div style={{ fontWeight:600,marginBottom:4 }}>❓ ¿Primera vez cruzando la frontera?</div>
        <div style={{ fontSize:13,color:C.textSec,marginBottom:10 }}>Te guiamos paso a paso en cada trámite.</div>
        <button className="btn btn-sec btn-sm" onClick={() => onNav("ayuda")}>Ver guía completa →</button>
      </div>
    </div>
  );
}

// VISTA: DECLARACIÓN SAG
function SagForm({ onToast }) {
  const [form, setForm] = useState({ frutas:false,carnes:false,lacteos:false,mascotas:false,semillas:false,otro:false,descripcion:"" });
  const [estado, setEstado] = useState(null); // null | "loading" | { aprobado, folio, mensaje } | { error }
  const declara = Object.values(form).some(v => v === true);

  const handleEnviar = async () => {
    setEstado("loading");
    try {
      const res = await mockApi.validarSAG();
      setEstado(res);
      onToast(res.aprobado ? "Declaración aceptada." : "Requiere revisión presencial.", res.aprobado ? "success" : "warning");
    } catch (e) {
      setEstado({ error: e.message });
      onToast(e.message, "error");
    }
  };

  const check = (k) => setForm(f => ({ ...f, [k]: !f[k] }));

  if (estado && estado.folio) return (
    <div className="fade">
      <div className="card" style={{ maxWidth:560,margin:"0 auto",textAlign:"center" }}>
        <div style={{ fontSize:36,marginBottom:10 }}>{estado.aprobado ? "✅" : "⚠️"}</div>
        <div style={{ fontSize:17,fontWeight:600,marginBottom:6,color:estado.aprobado?C.success:C.warning }}>
          {estado.aprobado ? "Declaración aceptada" : "Revisión presencial requerida"}
        </div>
        <div style={{ fontSize:13,color:C.textSec,marginBottom:16 }}>{estado.mensaje}</div>
        <div style={{ background:C.bg,borderRadius:8,padding:"10px 16px",display:"inline-block",marginBottom:8 }}>
          <div style={{ fontSize:12,color:C.textMuted }}>Folio SAG</div>
          <div style={{ fontFamily:"monospace",fontSize:18,fontWeight:600,color:C.navy }}>{estado.folio}</div>
        </div>
        <div style={{ marginBottom:16 }}><TiempoRespuesta ms={estado._tiempoMs} /></div>
        <div style={{ display:"flex",gap:10,justifyContent:"center" }}>
          <button className="btn btn-primary btn-sm">⬇️ Descargar comprobante</button>
          <button className="btn btn-sec btn-sm" onClick={() => setEstado(null)}>← Volver</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fade">
      <div className="stitle">🌿 Declaración SAG</div>
      <div className="ssub">Indica si transportas alguno de los siguientes productos</div>
      <div className="card">
        <div style={{ marginBottom:16 }}>
          <div style={{ fontWeight:500,marginBottom:10 }}>¿Transportas alguno de estos productos?</div>
          <div className="g2">
            {[["frutas","🍎 Frutas y verduras"],["carnes","🥩 Carnes y embutidos"],
            ["lacteos","🧀 Lácteos y huevos"],["mascotas","🐾 Mascotas vivas"],["semillas","🌱 Semillas y plantas"],
            ["otro","📦 Otros productos orgánicos"]].map(([k,lbl]) => (
              <label key={k} style={{ display:"flex",alignItems:"center",gap:10,cursor:"pointer",padding:"8px 12px",
              borderRadius:8,border:`1px solid ${form[k]?C.navyLight:C.border}`,background:form[k]?C.infoBg:"#fff",transition:"all 0.15s" }}>
                <input type="checkbox" checked={form[k]} onChange={() => check(k)} style={{ width:"auto",accentColor:C.navy }} />
                <span style={{ fontSize:13 }}>{lbl}</span>
              </label>
            ))}
          </div>
        </div>
        {declara && (
          <div className="fgroup fade">
            <label className="flabel">Descripción adicional (opcional)</label>
            <textarea rows={3} placeholder="Especifica los productos a declarar..." value={form.descripcion} 
            onChange={e => setForm(f=>({...f,descripcion:e.target.value}))} style={{ resize:"vertical" }} />
          </div>
        )}
        {!declara && (
          <div style={{ background:C.successBg,border:`1px solid ${C.success}40`,borderRadius:8,padding:"10px 14px",
          fontSize:13,color:C.success,marginBottom:14 }}>
            ✅ Si no marcas ningún producto, declaras que <strong>no transportas</strong> bienes restringidos.
          </div>
        )}
        {estado === "loading" && <div style={{ marginBottom:12 }}><Spinner /></div>}
        {estado?.error && <div style={{ background:C.dangerBg,color:C.danger,padding:"10px 14px",
          borderRadius:8,fontSize:13,marginBottom:14 }}>⚠️ {estado.error}</div>}
        <button className="btn btn-primary" onClick={handleEnviar} disabled={estado==="loading"}>
          {declara ? "📤 Enviar declaración" : "✅ Confirmar sin productos"}
        </button>
      </div>
    </div>
  );
}

// VISTA: AUTORIZACIÓN MENORES
function MenoresForm({ onToast }) {
  const [form, setForm] = useState({ nombreMenor:"",rutMenor:"",
    fechaNacimiento:"",rutAutorizante:"",vinculo:"",archivoNombre:null,archivoOk:false });
  const [estado, setEstado] = useState(null);
  const f = (k,v) => setForm(p => ({...p,[k]:v}));

  const simularArchivo = () => {
    f("archivoNombre","autorizacion_notarial.pdf");
    setTimeout(() => f("archivoOk",true), 1800);
  };

  const handleValidar = async () => {
    if (!form.nombreMenor || !form.rutMenor || !form.rutAutorizante) { onToast("Completa todos los campos requeridos.", "error"); return; }
    if (!form.archivoOk) { onToast("Debes subir la autorización notarial.", "error"); return; }
    setEstado("loading");
    try {
      const res = await mockApi.validarMenor();
      setEstado(res);
      onToast("Autorización validada correctamente.", "success");
    } catch (e) {
      setEstado({ error: e.message });
      onToast(e.message, "error");
    }
  };

  if (estado?.folio) return (
    <div className="fade">
      <div className="card" style={{ maxWidth:520,margin:"0 auto",textAlign:"center" }}>
        <div style={{ fontSize:36,marginBottom:10 }}>✅</div>
        <div style={{ fontSize:17,fontWeight:600,marginBottom:6,color:C.success }}>Autorización validada</div>
        <div style={{ fontSize:13,color:C.textSec,marginBottom:16 }}>El menor <strong>{form.nombreMenor}</strong> puede cruzar la frontera.</div>
        <div style={{ background:C.bg,borderRadius:8,padding:"10px 16px",display:"inline-block",marginBottom:20 }}>
          <div style={{ fontSize:12,color:C.textMuted }}>Folio de autorización</div>
          <div style={{ fontFamily:"monospace",fontSize:18,fontWeight:600,color:C.navy }}>{estado.folio}</div>
        </div>
        <div style={{ display:"flex",gap:10,justifyContent:"center" }}>
          <button className="btn btn-primary btn-sm">⬇️ Descargar</button>
          <button className="btn btn-sec btn-sm" onClick={() => setEstado(null)}>← Volver</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fade">
      <div className="stitle">👶 Autorización de Menores</div>
      <div className="ssub">Sube el permiso notarial para el cruce fronterizo de menores de edad</div>
      <div className="card">
        <div style={{ fontWeight:500,marginBottom:14 }}>Datos del menor</div>
        <div className="g2">
          <div className="fgroup">
            <label className="flabel">Nombre completo *</label>
            <input type="text" placeholder="Pedro Sánchez López" value={form.nombreMenor} onChange={e => f("nombreMenor",e.target.value)} />
          </div>
          <div className="fgroup">
            <label className="flabel">RUT / Pasaporte *</label>
            <input type="text" placeholder="22.333.444-5" value={form.rutMenor} onChange={e => f("rutMenor",e.target.value)} />
          </div>
          <div className="fgroup">
            <label className="flabel">Fecha de nacimiento</label>
            <input type="date" value={form.fechaNacimiento} onChange={e => f("fechaNacimiento",e.target.value)} />
          </div>
          <div className="fgroup">
            <label className="flabel">RUT autorizante *</label>
            <input type="text" placeholder="12.345.678-9" value={form.rutAutorizante} onChange={e => f("rutAutorizante",e.target.value)} />
          </div>
          <div className="fgroup" style={{ gridColumn:"1/-1" }}>
            <label className="flabel">Vínculo con el menor</label>
            <select value={form.vinculo} onChange={e => f("vinculo",e.target.value)}>
              <option value="">Selecciona...</option>
              <option>Padre/Madre</option>
              <option>Tutor legal</option>
              <option>Otro (indicar en documento)</option>
            </select>
          </div>
        </div>
        <div className="fgroup">
          <label className="flabel">Documento notarial *</label>
          <div style={{ border:`2px dashed ${form.archivoOk?C.success:C.border}`,
          borderRadius:10,padding:18,textAlign:"center",background:form.archivoOk?C.successBg:C.bg,transition:"all 0.3s" }}>
            {form.archivoNombre ? (
              <div>
                <div style={{ fontSize:13,fontWeight:500 }}>📎 {form.archivoNombre}</div>
                {form.archivoOk
                  ? <div style={{ color:C.success,fontSize:13,marginTop:4 }}>✅ Timbre notarial validado por OCR</div>
                  : <div className="pulse" style={{ color:C.warning,fontSize:13,marginTop:4 }}>🔍 Analizando documento...</div>}
              </div>
            ) : (
              <div>
                <div style={{ fontSize:13,color:C.textSec,marginBottom:8 }}>PDF, JPG o JPEG — máx 5MB</div>
                <button className="btn btn-sec btn-sm" onClick={simularArchivo}>📎 Seleccionar archivo</button>
              </div>
            )}
          </div>
        </div>
        {estado === "loading" && <div style={{ marginBottom:12 }}><Spinner /></div>}
        {estado?.error && <div style={{ background:C.dangerBg,color:C.danger,padding:"10px 14px",
          borderRadius:8,fontSize:13,marginBottom:12 }}>⚠️ {estado.error}</div>}
        <button className="btn btn-primary" onClick={handleValidar} disabled={estado==="loading"}>Validar autorización</button>
      </div>
    </div>
  );
}


// VISTA: SALIDA VEHÍCULO
function VehiculoSalida({ onToast }) {
  const [form, setForm] = useState({ patente:"",marca:"",modelo:"",anio:"",color:"",motor:"",chasis:"",propietario:"",rut:"" });
  const [patenteOk, setPatenteOk] = useState(null);
  const [generado, setGenerado] = useState(false);
  const f = (k,v) => setForm(p=>({...p,[k]:v}));

  const validarPatente = (p) => {
    const ok = /^[A-Z]{2}\d{4}$|^[A-Z]{4}\d{2}$/i.test(p.replace(/\s|-/g,""));
    setPatenteOk(ok); return ok;
  };

  const handleGenerar = () => {
    if (!validarPatente(form.patente)) { onToast("Formato de patente inválido (ej: AB1234)","error"); return; }
    if (!form.marca||!form.modelo||!form.propietario) { onToast("Completa todos los campos obligatorios.","error"); return; }
    setGenerado(true); onToast("Documento generado exitosamente.","success");
  };

  if (generado) {
    const folio = Math.floor(100000+Math.random()*900000);
    return (
      <div className="fade">
        <div className="card" style={{ maxWidth:600,margin:"0 auto" }}>
          <div style={{ textAlign:"center",marginBottom:20 }}>
            <div style={{ fontSize:32,marginBottom:8 }}>📄</div>
            <div style={{ fontSize:16,fontWeight:600 }}>Documento generado</div>
            <div style={{ fontSize:13,color:C.textSec }}>Formulario de Salida y Admisión Temporal de Vehículos</div>
          </div>
          <div style={{ border:`2px solid ${C.navy}`,borderRadius:10,padding:20,marginBottom:16 }}>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",
              marginBottom:12,paddingBottom:10,borderBottom:`1px solid ${C.border}` }}>
              <div>
                <div style={{ fontFamily:"'Source Serif 4',serif",fontSize:15,fontWeight:600,color:C.navy }}>SERVICIO NACIONAL DE ADUANAS</div>
                <div style={{ fontSize:12,color:C.textSec }}>Formulario: Salida y Admisión Temporal de Vehículos</div>
              </div>
              <div style={{ fontSize:11,color:C.textMuted,textAlign:"right" }}>N° {folio}<br />Válido: 180 días</div>
            </div>
            <div className="g2" style={{ fontSize:13 }}>
              <div><strong>Patente:</strong> {form.patente.toUpperCase()}</div>
              <div><strong>Marca/Modelo:</strong> {form.marca} {form.modelo}</div>
              <div><strong>Año:</strong> {form.anio}</div>
              <div><strong>Color:</strong> {form.color}</div>
              <div><strong>Propietario:</strong> {form.propietario}</div>
              <div><strong>RUT:</strong> {form.rut}</div>
            </div>
            <div style={{ marginTop:12,fontSize:11,color:C.textMuted,display:"flex",justifyContent:"space-between" }}>
              <div>COPIA ORIGINAL — Para presentar en Aduana Argentina</div>
              <div>Fecha: {new Date().toLocaleDateString("es-CL")}</div>
            </div>
          </div>
          <div style={{ display:"flex",gap:10 }}>
            <button className="btn btn-primary btn-sm">⬇️ Descargar PDF</button>
            <button className="btn btn-sec btn-sm" onClick={() => setGenerado(false)}>← Volver</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fade">
      <div className="stitle">🚗 Formulario Salida de Vehículo</div>
      <div className="ssub">Genera el documento "Salida y Admisión Temporal de Vehículos" para cruzar a Argentina</div>
      <div className="card">
        <div className="g2">
          {[["patente","Patente *","AB1234"],["marca","Marca *","Toyota"],["modelo","Modelo *","Corolla"],
          ["anio","Año","2022"],["color","Color","Blanco"],
          ["motor","N° Motor","123456789"],["chasis","N° Chasis (VIN)","JT2BF22K000001"],
          ["propietario","Propietario *","Nombre completo"],["rut","RUT propietario *","12.345.678-9"]].map(([k,lbl,ph]) => (
            <div key={k} className="fgroup">
              <label className="flabel">{lbl}</label>
              {k==="patente" ? (
                <div style={{ position:"relative" }}>
                  <input type="text" placeholder={ph} value={form[k]} 
                  onChange={e=>{f(k,e.target.value);setPatenteOk(null);}} onBlur={()=>form.patente&&validarPatente(form.patente)} 
                  style={{ borderColor:patenteOk===false?C.danger:patenteOk===true?C.success:undefined }} />
                  {patenteOk!==null&&<span style={{ position:"absolute",
                    right:10,top:"50%",transform:"translateY(-50%)" }}>{patenteOk?"✅":"❌"}</span>}
                </div>
              ) : (
                <input type="text" placeholder={ph} value={form[k]} onChange={e=>f(k,e.target.value)} />
              )}
            </div>
          ))}
        </div>
        <button className="btn btn-primary" onClick={handleGenerar}>📄 Generar documento PDF</button>
      </div>
    </div>
  );
}

// VISTA: PANEL FUNCIONARIO
function FuncionarioPanel({ user, onNav }) {
  const alertas = [
    { tipo:"SAG",pasajero:"Ana López",doc:"12.456.789-0",msg:"Declaró productos de origen animal",badge:"b-yellow",icon:"⚠️" },
    { tipo:"PDI",pasajero:"Carlos Méndez",doc:"Pasaporte ARG-X4521",msg:"Consulta de antecedentes pendiente",badge:"b-blue",icon:"🔍" },
  ];
  return (
    <div className="fade">
      <div className="stitle">🖥️ Panel de Control — Funcionario</div>
      <div className="ssub">Bienvenido/a, {user.name}. Ventanilla 3 — Activa</div>
      <div className="g4" style={{ marginBottom:20 }}>
        <StatCard label="Atenciones hoy" value="47" sub="↑ 12% vs ayer" color={C.navy} />
        <StatCard label="Declaraciones SAG" value="23" sub="5 con productos" color={C.success} />
        <StatCard label="Vehículos ingresados" value="18" sub="3 argentinos" color={C.warning} />
        <StatCard label="Alertas activas" value="2" sub="Requieren atención" color={C.danger} />
      </div>
      <div style={{ fontWeight:600,marginBottom:12 }}>Alertas activas</div>
      {alertas.map((a,i) => (
        <div key={i} className="card" style={{ marginBottom:10,borderLeft:`4px solid ${a.tipo==="SAG"?C.warning:C.info}`,
        display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,borderRadius:"0 12px 12px 0" }}>
          <div style={{ display:"flex",alignItems:"center",gap:12 }}>
            <span style={{ fontSize:20 }}>{a.icon}</span>
            <div>
              <div style={{ fontSize:14,fontWeight:500 }}>{a.pasajero} <span style={{ color:C.textMuted,fontWeight:400 }}>— {a.doc}</span></div>
              <div style={{ fontSize:13,color:C.textSec }}>{a.msg}</div>
            </div>
          </div>
          <div style={{ display:"flex",gap:8,flexShrink:0 }}>
            <span className={`badge ${a.badge}`}>{a.tipo}</span>
            <button className="btn btn-sec btn-sm">Ver detalles</button>
          </div>
        </div>
      ))}
      <div style={{ display:"flex",gap:12,marginTop:20 }}>
        <button className="btn btn-primary btn-sm" onClick={()=>onNav("vehiculo_ingreso")}>🚙 Registrar Ingreso Vehículo</button>
        <button className="btn btn-sec btn-sm" onClick={()=>onNav("pdi")}>🔍 Consulta PDI</button>
      </div>
    </div>
  );
}


// VISTA: INGRESO VEHÍCULOS (Funcionario)
function VehiculoIngreso({ onToast }) {
  const [folio, setFolio] = useState("");
  const [estado, setEstado] = useState(null);

  const handleScan = async () => {
    if (!folio) { onToast("Ingresa el folio o escanea el código.","error"); return; }
    setEstado("loading");
    try {
      const res = await mockApi.consultarAduanaArg();
      const fechaLimite = new Date(); fechaLimite.setDate(fechaLimite.getDate()+180);
      setEstado({ ok:true, ...res, patente:"ARG-"+folio.slice(-4).toUpperCase(), pais:"Argentina", fechaLimite:fechaLimite.toLocaleDateString("es-CL") });
      onToast("Vehículo validado. Ingreso autorizado.","success");
    } catch(e) {
      setEstado({ ok:false, error:e.message });
      onToast(e.message,"error");
    }
  };

  return (
    <div className="fade">
      <div className="stitle">🚙 Registro Ingreso Vehículos Extranjeros</div>
      <div className="ssub">Valida el documento de admisión temporal emitido por Aduana Argentina</div>
      <div className="card" style={{ maxWidth:580 }}>
        <div className="fgroup">
          <label className="flabel">Folio / Código del documento argentino</label>
          <div style={{ display:"flex",gap:10 }}>
            <input type="text" placeholder="ARG-2024-XK9..." value={folio} onChange={e=>setFolio(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleScan()} />
            <button className="btn btn-primary" onClick={handleScan} disabled={estado==="loading"} style={{ flexShrink:0 }}>
              {estado==="loading"?"⏳...":"🔍 Validar"}
            </button>
          </div>
        </div>
        {estado==="loading" && <div className="pulse" style={{ color:C.textSec,fontSize:13,marginTop:8 }}>🔗 Consultando Aduana Argentina (Horcones)...</div>}
        {estado?.ok && (
          <div className="fade">
            <div style={{ background:C.successBg,border:`1px solid ${C.success}40`,borderRadius:10,padding:16,marginBottom:14 }}>
              <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:10 }}>
                <span className="semaforo s-verde" />
                <strong style={{ color:C.success }}>Documento válido — Ingreso autorizado</strong>
              </div>
              <div className="g2" style={{ fontSize:13 }}>
                <div><strong>Patente:</strong> {estado.patente}</div>
                <div><strong>Titular:</strong> {estado.titular}</div>
                <div><strong>Modelo:</strong> {estado.modelo}</div>
                <div><strong>Días restantes:</strong> <span style={{ color:C.success,fontWeight:500 }}>{estado.diasRestantes} días</span></div>
                <div><strong>País:</strong> {estado.pais}</div>
                <div><strong>Plazo límite:</strong> <span style={{ color:C.warning,fontWeight:500 }}>{estado.fechaLimite}</span></div>
              </div>
            </div>
            <button className="btn btn-success btn-sm">✅ Registrar ingreso</button>
          </div>
        )}
        {estado?.error && (
          <div style={{ background:C.dangerBg,border:`1px solid ${C.danger}40`,borderRadius:10,padding:14,marginTop:10 }}>
            <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:6 }}>
              <span className="semaforo s-rojo" />
              <strong style={{ color:C.danger }}>Error de validación</strong>
            </div>
            <div style={{ fontSize:13,color:C.danger }}>{estado.error}</div>
          </div>
        )}
      </div>
    </div>
  );
}

// VISTA: CONTROL PDI
function PDIControl({ onToast }) {
  const [rut, setRut] = useState("");
  const [estado, setEstado] = useState(null);

  const handleConsultar = async () => {
    if (!rut) { onToast("Ingresa el RUT o número de documento.","error"); return; }
    setEstado("loading");
    try {
      const res = await mockApi.consultarPDI(rut.replace(/\s/g,""));
      setEstado(res);
      if (res.alerta) onToast("⛔ ALERTA PDI: Revisar registro.","error");
      else onToast("Consulta PDI completada sin alertas.","success");
    } catch(e) {
      setEstado({ error:e.message });
      onToast(e.message,"error");
    }
  };

  return (
    <div className="fade">
      <div className="stitle">🔍 Control PDI</div>
      <div className="ssub">Consulta de antecedentes en la base de datos de la Policía de Investigaciones</div>
      <div className="card" style={{ maxWidth:560 }}>
        <div className="fgroup">
          <label className="flabel">RUT / Número de pasaporte</label>
          <div style={{ display:"flex",gap:10 }}>
            <input type="text" placeholder="ej. 12345678-9 o Pasaporte ARG-X9821" value={rut} onChange={e=>setRut(e.target.value)} 
            onKeyDown={e=>e.key==="Enter"&&handleConsultar()} />
            <button className="btn btn-primary" onClick={handleConsultar} disabled={estado==="loading"} style={{ flexShrink:0 }}>
              {estado==="loading"?"⏳...":"🔍 Consultar"}
            </button>
          </div>
        </div>
        {estado==="loading" && <div className="pulse" style={{ color:C.textSec,fontSize:13 }}>🔗 Conectando con nodo PDI Central...</div>}
        {estado?.nombre && (
          <div className="fade">
            <div style={{ background:estado.alerta?C.dangerBg:C.successBg,border:`1px solid ${estado.alerta?C.danger:C.success}40`
            ,borderRadius:10,padding:16 }}>
              <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:10 }}>
                <span className={`semaforo ${estado.alerta?"s-rojo":"s-verde"}`} />
                <strong style={{ color:estado.alerta?C.danger:C.success }}>
                  {estado.alerta ? "ALERTA ACTIVA" : "Sin alertas"}
                </strong>
              </div>
              <div className="g2" style={{ fontSize:13 }}>
                <div><strong>Nombre:</strong> {estado.nombre}</div>
                <div><strong>Estado:</strong> <span className={`badge ${estado.habilitado?"b-green":"b-red"}`}>
                  {estado.habilitado?"Habilitado para cruce":"NO habilitado"}</span></div>
              </div>
              {estado.mensaje && <div style={{ marginTop:10,fontSize:13,color:estado.alerta?C.danger:C.success,fontWeight:500 }}>{estado.mensaje}</div>}
            </div>
            <TiempoRespuesta ms={estado._tiempoMs} />   {/* ← AGREGA ESTA LÍNEA */}
          </div>
        )}
        {estado?.error && <div style={{ background:C.dangerBg,color:C.danger,padding:"10px 14px",
          borderRadius:8,fontSize:13,marginTop:10 }}>⚠️ {estado.error}</div>}
      </div>
    </div>
  );
}

// VISTA: ADMIN — DASHBOARD
function AdminDashboard({ onNav }) {
  const now = new Date();
  const flujo = Array.from({length:12},(_,i) => ({ hora:`${7+i}:00`,ing:Math.floor(30+Math.random()*80),sal:Math.floor(20+Math.random()*70) }));
  const maxV = Math.max(...flujo.map(h=>h.ing+h.sal));

  return (
    <div className="fade">
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20 }}>
        <div>
          <div className="stitle">📊 Dashboard — Paso Los Libertadores</div>
          <div className="ssub">{now.toLocaleDateString("es-CL",{weekday:"long",year:"numeric",month:"long",day:"numeric"})}</div>
        </div>
        <span className="badge b-green pulse">🟢 Sistema operativo</span>
      </div>
      <div className="g4" style={{ marginBottom:24 }}>
        <StatCard label="Ingresos hoy" value="847" sub="↑ 8% vs ayer" color={C.navy} />
        <StatCard label="Salidas hoy" value="712" sub="↓ 2% vs ayer" color={C.navyLight} />
        <StatCard label="Vehículos" value="312" sub="63 extranjeros" color={C.success} />
        <StatCard label="Alertas activas" value="4" sub="2 SAG · 2 PDI" color={C.danger} />
      </div>
      <div className="card" style={{ marginBottom:20 }}>
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14 }}>
          <div style={{ fontWeight:600 }}>Flujo en tiempo real — Hoy</div>
          <div style={{ display:"flex",gap:12,fontSize:12 }}>
            <span style={{ display:"flex",alignItems:"center",gap:5 }}><span 
            style={{ width:12,height:12,background:C.navy,borderRadius:2,display:"inline-block" }}/>Ingresos</span>
            <span style={{ display:"flex",alignItems:"center",gap:5 }}><span 
            style={{ width:12,height:12,background:C.gold,borderRadius:2,display:"inline-block" }}/>Salidas</span>
          </div>
        </div>
        <div style={{ display:"flex",alignItems:"flex-end",gap:3,height:130,overflowX:"auto" }}>
          {flujo.map((h,i) => (
            <div key={i} style={{ flex:1,minWidth:32,display:"flex",flexDirection:"column",alignItems:"center",gap:2 }}>
              <div style={{ width:"90%",display:"flex",flexDirection:"column",alignItems:"center",gap:1 }}>
                <div style={{ width:"100%",height:Math.round(h.ing/maxV*100),background:C.navy,borderRadius:"3px 3px 0 0",minHeight:3 }} />
                <div style={{ width:"100%",height:Math.round(h.sal/maxV*100),background:C.gold,borderRadius:"0 0 3px 3px",minHeight:3 }} />
              </div>
              <div style={{ fontSize:10,color:C.textMuted,marginTop:2 }}>{h.hora}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="g2">
        <div className="card">
          <div style={{ fontWeight:600,marginBottom:12 }}>Ocupación por ventanilla</div>
          {[["V1",85],["V2",72],["V3",91],["V4",43],["V5",67]].map(([v,pct]) => (
            <div key={v} style={{ marginBottom:10 }}>
              <div style={{ display:"flex",justifyContent:"space-between",fontSize:13,marginBottom:4 }}>
                <span>Ventanilla {v}</span>
                <span style={{ fontWeight:500,color:pct>80?C.danger:pct>60?C.warning:C.success }}>{pct}%</span>
              </div>
              <ProgressBar value={pct} color={pct>80?C.danger:pct>60?C.warning:C.success} />
            </div>
          ))}
        </div>
        <div className="card">
          <div style={{ fontWeight:600,marginBottom:12 }}>Estado de integraciones</div>
          {[["API PDI","Activo",true],["API SAG","Activo",true],["Aduana Argentina","Activo",true],
          ["Sistema de Reportes","Activo",true],["Escáner Ventanilla 4","Fuera de línea",false]].map(([n,s,ok],i)=>(
            <div key={i} style={{ display:"flex",justifyContent:"space-between",alignItems:"center",
            padding:"7px 0",borderBottom:i<4?`1px solid ${C.border}`:"none",fontSize:13 }}>
              <span>{n}</span>
              <span className={`badge ${ok?"b-green":"b-red"}`}>{ok?"🟢":"🔴"} {s}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{ marginTop:20 }}>
        <button className="btn btn-primary btn-sm" onClick={()=>onNav("reportes")}>📈 Ver reportes y exportar</button>
      </div>
    </div>
  );
}


// VISTA: SOLICITUDES (Admin)

function SolicitudesView({ solicitudes, setSolicitudes, onToast }) {
  const [search, setSearch] = useState("");
  const [accionId, setAccionId] = useState(null); // id de la solicitud cuyo estado se va a cambiar

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

  const cambiarEstado = (id, nuevoEstado) => {
    setSolicitudes(prev =>
      prev.map(sol => (sol.id === id ? { ...sol, estado: nuevoEstado } : sol))
    );
    setAccionId(null);
    onToast(`Solicitud ${id} marcada como "${nuevoEstado}".`, "success");
  };

  const estadoBadge = (estado) => {
    switch (estado) {
      case "Pendiente": return <span className="badge b-yellow">⏳ Pendiente</span>;
      case "Aprobado":  return <span className="badge b-green">✅ Aprobado</span>;
      case "Rechazado": return <span className="badge b-red">❌ Rechazado</span>;
      default:          return <span className="badge b-gray">{estado}</span>;
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
          <button
            className="btn btn-sec btn-sm"
            onClick={() => setSearch('')}
          >
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
              <th style={{ width: 160 }}>Acciones</th>
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
                  <td>{estadoBadge(sol.estado)}</td>
                  <td>{sol.fecha}</td>
                  <td>
                    {sol.estado === "Pendiente" && (
                      <div style={{ display: "flex", gap: 6 }}>
                        <button
                          className="btn btn-success btn-sm"
                          onClick={() => cambiarEstado(sol.id, "Aprobado")}
                        >
                          Aprobar
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => cambiarEstado(sol.id, "Rechazado")}
                        >
                          Rechazar
                        </button>
                      </div>
                    )}
                    {sol.estado !== "Pendiente" && (
                      <span style={{ color: C.textMuted, fontSize: 12 }}>Sin acciones</span>
                    )}
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
    </div>
  );
}

// VISTA: GESTIÓN USUARIOS (Admin, CRUD)

function GestionUsuarios({ usuarios, setUsuarios, onToast }) {
  const [search, setSearch] = useState("");
  const [editando, setEditando] = useState(null); // null = no se edita, objeto con datos del usuario o nuevo
  const [form, setForm] = useState({ nombre: "", run: "", rol: "", aduana: "", correo: "" });
  const [modo, setModo] = useState("crear"); // "crear" o "editar"

  const rolesDisponibles = ["Administrador", "Funcionario", "Funcionario PDI"];

  // Filtrar usuarios según búsqueda
  const filtered = usuarios.filter(u => {
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    return (
      String(u.id).includes(term) ||
      u.nombre.toLowerCase().includes(term) ||
      u.run.toLowerCase().includes(term) ||
      u.rol.toLowerCase().includes(term) ||
      u.aduana.toLowerCase().includes(term) ||
      u.correo.toLowerCase().includes(term)
    );
  });

  // Iniciar creación de nuevo usuario
  const iniciarCrear = () => {
    setForm({ nombre: "", run: "", rol: "", aduana: "", correo: "" });
    setModo("crear");
    setEditando({}); // objeto vacío para indicar que se está creando
  };

  // Iniciar edición de usuario existente
  const iniciarEditar = (user) => {
    setForm({ nombre: user.nombre, run: user.run, rol: user.rol, aduana: user.aduana, correo: user.correo });
    setModo("editar");
    setEditando(user);
  };

  // Cancelar edición/creación
  const cancelar = () => {
    setEditando(null);
    setForm({ nombre: "", run: "", rol: "", aduana: "", correo: "" });
  };

  // Guardar usuario (crear o actualizar)
  const guardarUsuario = () => {
    // Validación básica
    if (!form.nombre.trim() || !form.run.trim() || !form.rol || !form.aduana.trim() || !form.correo.trim()) {
      onToast("Completa todos los campos obligatorios.", "error");
      return;
    }

    if (modo === "crear") {
      const nuevoId = Math.max(...usuarios.map(u => u.id), 0) + 1;
      const nuevo = {
        id: nuevoId,
        nombre: form.nombre.trim(),
        run: form.run.trim(),
        rol: form.rol,
        aduana: form.aduana.trim(),
        correo: form.correo.trim(),
      };
      setUsuarios(prev => [...prev, nuevo]);
      onToast(`Usuario ${nuevo.nombre} creado exitosamente.`, "success");
    } else {
      setUsuarios(prev =>
        prev.map(u =>
          u.id === editando.id
            ? { ...u, nombre: form.nombre.trim(), run: form.run.trim(), rol: form.rol, aduana: form.aduana.trim(), correo: form.correo.trim() }
            : u
        )
      );
      onToast(`Usuario ${form.nombre} actualizado.`, "success");
    }
    cancelar();
  };

  // Eliminar usuario
  const eliminarUsuario = (user) => {
    if (window.confirm(`¿Eliminar al usuario ${user.nombre} (${user.run})?`)) {
      setUsuarios(prev => prev.filter(u => u.id !== user.id));
      onToast(`Usuario ${user.nombre} eliminado.`, "info");
    }
  };

  return (
    <div className="fade">
      <div className="stitle">👥 Gestión de Usuarios</div>
      <div className="ssub">Administra las cuentas de los funcionarios del sistema</div>

      <div className="card">
        {/* Barra de búsqueda y botón agregar */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 16, alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Buscar por ID, nombre, RUN, rol, aduana o correo..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ flex: 1 }}
          />
          <button className="btn btn-sec btn-sm" onClick={() => setSearch('')}>
            Limpiar
          </button>
          <button className="btn btn-primary btn-sm" onClick={iniciarCrear}>
            + Agregar usuario
          </button>
        </div>

        {/* Tabla de usuarios */}
        <table>
          <thead>
            <tr>
              <th style={{ width: 50 }}>ID</th>
              <th>Nombre</th>
              <th>RUN</th>
              <th>Rol</th>
              <th>Aduana</th>
              <th>Correo</th>
              <th style={{ width: 120 }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length > 0 ? (
              filtered.map(u => (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td>{u.nombre}</td>
                  <td>{u.run}</td>
                  <td>{u.rol}</td>
                  <td>{u.aduana}</td>
                  <td>{u.correo}</td>
                  <td>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button className="btn btn-sec btn-sm" onClick={() => iniciarEditar(u)}>Editar</button>
                      <button className="btn btn-danger btn-sm" onClick={() => eliminarUsuario(u)}>Eliminar</button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: 20, color: C.textMuted }}>
                  No se encontraron usuarios con ese criterio.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <div style={{ marginTop: 12, fontSize: 13, color: C.textMuted }}>
          {filtered.length} de {usuarios.length} usuarios
        </div>
      </div>

      {/* Formulario de creación/edición (aparece como tarjeta debajo) */}
      {editando !== null && (
        <div className="card fade" style={{ marginTop: 20 }}>
          <div style={{ fontWeight: 600, marginBottom: 14 }}>
            {modo === "crear" ? "Nuevo usuario" : `Editando: ${editando.nombre}`}
          </div>
          <div className="g2">
            <div className="fgroup">
              <label className="flabel">Nombre completo *</label>
              <input
                type="text"
                placeholder="Nombre y apellido"
                value={form.nombre}
                onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
              />
            </div>
            <div className="fgroup">
              <label className="flabel">RUN *</label>
              <input
                type="text"
                placeholder="12.345.678-9"
                value={form.run}
                onChange={e => setForm(f => ({ ...f, run: e.target.value }))}
              />
            </div>
            <div className="fgroup">
              <label className="flabel">Rol *</label>
              <select value={form.rol} onChange={e => setForm(f => ({ ...f, rol: e.target.value }))}>
                <option value="">Seleccionar rol...</option>
                {rolesDisponibles.map(rol => (
                  <option key={rol} value={rol}>{rol}</option>
                ))}
              </select>
            </div>
            <div className="fgroup">
              <label className="flabel">Aduana *</label>
              <input
                type="text"
                placeholder="Los Libertadores"
                value={form.aduana}
                onChange={e => setForm(f => ({ ...f, aduana: e.target.value }))}
              />
            </div>
            <div className="fgroup" style={{ gridColumn: "1 / -1" }}>
              <label className="flabel">Correo electrónico *</label>
              <input
                type="email"
                placeholder="usuario@aduana.cl"
                value={form.correo}
                onChange={e => setForm(f => ({ ...f, correo: e.target.value }))}
              />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
            <button className="btn btn-primary" onClick={guardarUsuario}>
              {modo === "crear" ? "Crear usuario" : "Guardar cambios"}
            </button>
            <button className="btn btn-sec" onClick={cancelar}>Cancelar</button>
          </div>
        </div>
      )}
    </div>
  );
}


// VISTA: AUDITORÍA

function AuditoriaView({ logs }) {
  const [search, setSearch] = useState("");

  const filtered = logs.filter(log => {
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    return (
      String(log.id).includes(term) ||
      log.timestamp.toLowerCase().includes(term) ||
      log.usuario.toLowerCase().includes(term) ||
      log.accion.toLowerCase().includes(term)
    );
  });

  return (
    <div className="fade">
      <div className="stitle"> Auditoría del Sistema</div>
      <div className="ssub">
        Registro histórico de acciones realizadas por los usuarios
      </div>
      <div className="card">
        <div style={{ display: 'flex', gap: 10, marginBottom: 16, alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Buscar por ID, fecha, usuario o acción..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ flex: 1 }}
          />
          <button
            className="btn btn-sec btn-sm"
            onClick={() => setSearch('')}
          >
            Limpiar filtros
          </button>
        </div>

        <table>
          <thead>
            <tr>
              <th style={{ width: 60 }}>ID</th>
              <th>Fecha y Hora</th>
              <th>Usuario</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length > 0 ? (
              filtered.map(log => (
                <tr key={log.id}>
                  <td>{log.id}</td>
                  <td>{log.timestamp}</td>
                  <td>{log.usuario}</td>
                  <td>{log.accion}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', padding: 20, color: C.textMuted }}>
                  No se encontraron registros de auditoría.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div style={{ marginTop: 12, fontSize: 13, color: C.textMuted }}>
          Mostrando {filtered.length} de {logs.length} registros
        </div>
      </div>
    </div>
  );
}

// VISTA: REPORTES

function ReportesView({ onToast }) {
  const [tipo, setTipo] = useState("flujo");
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [reporteGenerado, setReporteGenerado] = useState(null);
  const [loading, setLoading] = useState(false);

  const generarReporte = () => {
    if (!desde || !hasta) {
      onToast("Selecciona ambas fechas.", "error");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      // Datos simulados por tipo
      const data = {
        flujo: {
          ingresos: Math.floor(500 + Math.random() * 2000),
          salidas: Math.floor(400 + Math.random() * 1800),
          vehiculos: Math.floor(100 + Math.random() * 500),
          alertas: Math.floor(Math.random() * 10),
        },
        sag: {
          declaraciones: Math.floor(100 + Math.random() * 500),
          aprobadas: Math.floor(80 + Math.random() * 300),
          rechazadas: Math.floor(10 + Math.random() * 50),
          revisiones: Math.floor(5 + Math.random() * 30),
        },
        pdi: {
          consultas: Math.floor(200 + Math.random() * 800),
          alertas: Math.floor(Math.random() * 15),
        },
      };
      setReporteGenerado({ tipo, data: data[tipo] || data.flujo, desde, hasta });
      setLoading(false);
      onToast("Reporte generado correctamente.", "success");
    }, 1200);
  };

  const exportar = (formato) => {
    onToast(`Exportando reporte en formato ${formato.toUpperCase()}...`, "info");
    setTimeout(() => {
      onToast("Reporte descargado (simulación).", "success");
    }, 800);
  };

  const renderResultados = () => {
    if (!reporteGenerado) return null;
    const { tipo, data, desde, hasta } = reporteGenerado;

    return (
      <div className="fade" style={{ marginTop: 20 }}>
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div>
              <div style={{ fontWeight: 600 }}>Resultados del reporte</div>
              <div style={{ fontSize: 13, color: C.textSec }}>
                Periodo: {desde} al {hasta} — Tipo: {tipo === "flujo" ? "Flujo Fronterizo" : tipo === "sag" ? "Declaraciones SAG" : "Consultas PDI"}
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn btn-sec btn-sm" onClick={() => exportar("pdf")}>📄 Exportar PDF</button>
              <button className="btn btn-sec btn-sm" onClick={() => exportar("csv")}>📊 Exportar CSV</button>
            </div>
          </div>

          {tipo === "flujo" && (
            <>
              <div className="g4" style={{ marginBottom: 16 }}>
                <StatCard label="Ingresos" value={data.ingresos} color={C.navy} />
                <StatCard label="Salidas" value={data.salidas} color={C.navyLight} />
                <StatCard label="Vehículos" value={data.vehiculos} color={C.success} />
                <StatCard label="Alertas" value={data.alertas} color={C.danger} />
              </div>
              <div style={{ marginTop: 10 }}>
                <div style={{ fontWeight: 500, fontSize: 13, marginBottom: 8 }}>Comparativa Ingresos vs Salidas</div>
                <div style={{ display: "flex", gap: 20, alignItems: "flex-end", height: 80 }}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{
                      width: 40, background: C.navy,
                      height: Math.round(data.ingresos / Math.max(data.ingresos, data.salidas, 1) * 60),
                      borderRadius: "3px 3px 0 0", margin: "0 auto"
                    }} />
                    <div style={{ fontSize: 10, marginTop: 4 }}>Ingresos</div>
                    <div style={{ fontSize: 11, fontWeight: 500 }}>{data.ingresos}</div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{
                      width: 40, background: C.gold,
                      height: Math.round(data.salidas / Math.max(data.ingresos, data.salidas, 1) * 60),
                      borderRadius: "3px 3px 0 0", margin: "0 auto"
                    }} />
                    <div style={{ fontSize: 10, marginTop: 4 }}>Salidas</div>
                    <div style={{ fontSize: 11, fontWeight: 500 }}>{data.salidas}</div>
                  </div>
                </div>
              </div>
            </>
          )}

          {tipo === "sag" && (
            <div className="g4" style={{ marginBottom: 16 }}>
              <StatCard label="Declaraciones" value={data.declaraciones} color={C.navy} />
              <StatCard label="Aprobadas" value={data.aprobadas} color={C.success} />
              <StatCard label="Rechazadas" value={data.rechazadas} color={C.danger} />
              <StatCard label="Revisiones" value={data.revisiones} color={C.warning} />
            </div>
          )}

          {tipo === "pdi" && (
            <div className="g2" style={{ marginBottom: 16 }}>
              <StatCard label="Consultas realizadas" value={data.consultas} color={C.navy} />
              <StatCard label="Alertas generadas" value={data.alertas} color={C.danger} />
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="fade">
      <div className="stitle">📈 Reportes</div>
      <div className="ssub">Genera reportes personalizados del sistema aduanero</div>
      <div className="card">
        <div className="g2">
          <div className="fgroup">
            <label className="flabel">Tipo de reporte</label>
            <select value={tipo} onChange={e => setTipo(e.target.value)}>
              <option value="flujo">Flujo Fronterizo</option>
              <option value="sag">Declaraciones SAG</option>
              <option value="pdi">Consultas PDI</option>
            </select>
          </div>
          <div></div>
          <div className="fgroup">
            <label className="flabel">Desde</label>
            <input type="date" value={desde} onChange={e => setDesde(e.target.value)} />
          </div>
          <div className="fgroup">
            <label className="flabel">Hasta</label>
            <input type="date" value={hasta} onChange={e => setHasta(e.target.value)} />
          </div>
        </div>
        <button className="btn btn-primary" onClick={generarReporte} disabled={loading}>
          {loading ? "Generando..." : "📋 Generar reporte"}
        </button>
        {renderResultados()}
      </div>
    </div>
  );
}

// VISTA: AYUDA

function AyudaView() {
  return (
    <div className="fade">
      <div className="stitle">❓ Centro de Ayuda</div>
      <div className="ssub">Guía para cruzar el Paso Los Libertadores sin contratiempos</div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ fontWeight: 600, marginBottom: 12 }}>📌 Pasos antes de llegar a la frontera</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[
            { icon: "🌿", title: "Declaración SAG", desc: "Indica si transportas frutas, carnes, lácteos, mascotas u otros productos orgánicos. Es obligatorio para todo viajero." },
            { icon: "👶", title: "Autorización de menores", desc: "Si viajas con menores de edad sin ambos padres, debes presentar un permiso notarial firmado por el ausente." },
            { icon: "🚗", title: "Salida de vehículo", desc: "Si sales de Chile con un vehículo particular, necesitas el formulario de 'Salida y Admisión Temporal' para presentar en Argentina." },
            { icon: "🛂", title: "Control migratorio", desc: "Presenta tu cédula de identidad o pasaporte vigente en el control de Policía Internacional." },
          ].map((item, i) => (
            <div key={i} style={{ display: "flex", gap: 12, padding: 10, background: C.bg, borderRadius: 8 }}>
              <div style={{ fontSize: 24, minWidth: 32 }}>{item.icon}</div>
              <div>
                <div style={{ fontWeight: 500, fontSize: 14 }}>{item.title}</div>
                <div style={{ fontSize: 13, color: C.textSec }}>{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ fontWeight: 600, marginBottom: 12 }}>❔ Preguntas frecuentes</div>
        {[
          { q: "¿Cuánto demora el cruce?", a: "En temporada normal, el proceso completo toma entre 10 y 20 minutos. En alta temporada (verano / fines de semana largos) puede extenderse hasta 45 minutos." },
          { q: "¿Necesito visa para Argentina?", a: "Ciudadanos chilenos solo necesitan cédula de identidad vigente. Otras nacionalidades deben consultar los requisitos migratorios argentinos." },
          { q: "¿Qué productos no puedo llevar?", a: "Están prohibidos productos cárnicos frescos, frutas sin certificación, lácteos no industriales y plantas con tierra. El SAG realiza inspecciones aleatorias." },
          { q: "¿Cómo obtengo el permiso para un menor?", a: "Debes obtener una autorización notarial firmada por el padre/madre ausente. Luego súbela en el módulo 'Autorización Menores'." },
          { q: "¿Puedo llevar mi mascota?", a: "Sí, pero debes declararla en el formulario SAG. Se requiere certificado sanitario y vacunas al día." },
        ].map((faq, i) => (
          <details key={i} style={{ marginBottom: 8, borderBottom: i < 4 ? `1px solid ${C.border}` : "none", paddingBottom: 8 }}>
            <summary style={{ cursor: "pointer", fontSize: 14, fontWeight: 500, color: C.textPrimary }}>
              {faq.q}
            </summary>
            <div style={{ fontSize: 13, color: C.textSec, marginTop: 6, paddingLeft: 4 }}>{faq.a}</div>
          </details>
        ))}
      </div>

      <div className="card">
        <div style={{ fontWeight: 600, marginBottom: 12 }}>📞 Contacto y emergencias</div>
        <div className="g2">
          <div>
            <div style={{ fontSize: 13, fontWeight: 500 }}>Aduana Los Libertadores</div>
            <div style={{ fontSize: 13, color: C.textSec }}>+56 34 258 9100</div>
            <div style={{ fontSize: 13, color: C.textSec }}>consultas@aduana.cl</div>
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 500 }}>SAG (Servicio Agrícola Ganadero)</div>
            <div style={{ fontSize: 13, color: C.textSec }}>+56 34 258 9120</div>
            <div style={{ fontSize: 13, color: C.textSec }}>sag.libertadores@sag.gob.cl</div>
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 500 }}>PDI – Paso Fronterizo</div>
            <div style={{ fontSize: 13, color: C.textSec }}>+56 34 258 9140</div>
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 500 }}>Emergencias</div>
            <div style={{ fontSize: 13, color: C.textSec }}>133 (Carabineros) / 131 (Ambulancia)</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// APP PRINCIPAL
export default function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState(null);
  const [toast, setToast] = useState(null);

  // Estado compartido (CRUDs)
  const [usuarios, setUsuarios] = useState(USUARIOS_INIT);
  const [solicitudes, setSolicitudes] = useState(SOLICITUDES_INIT);
  const [auditLogs] = useState(AUDIT_INIT);

  const showToast = (msg, type="info") => setToast({ msg, type });

  const handleLogin = (u) => {
    setUser(u);
    const defaultView = { pasajero:"pasajero", funcionario:"funcionario", admin:"admin", pdi:"pdi" };
    setView(defaultView[u.role] || "pasajero");
  };

  const handleLogout = () => { setUser(null); setView(null); };

  const renderView = () => {
    // RBAC: verifica que el rol activo tenga permiso real para esta vista,
    // sin depender únicamente de que el menú la oculte.
    const permitido = ACCESO_PERMITIDO[user.role] || [];
    if (!permitido.includes(view)) {
      return <AccesoDenegado view={view} role={user.role} />;
    }
    switch(view) {
      case "pasajero":        return <PasajeroHome user={user} onNav={setView} />;
      case "sag":             return <SagForm onToast={showToast} />;
      case "menores":         return <MenoresForm onToast={showToast} />;
      case "vehiculo_salida": return <VehiculoSalida onToast={showToast} />;
      case "funcionario":     return <FuncionarioPanel user={user} onNav={setView} />;
      case "vehiculo_ingreso":return <VehiculoIngreso onToast={showToast} />;
      case "pdi":             return <PDIControl onToast={showToast} />;
      case "admin":           return <AdminDashboard onNav={setView} />;
      case "solicitudes":     return <SolicitudesView solicitudes={solicitudes} setSolicitudes={setSolicitudes} onToast={showToast} />;
      case "usuarios":        return <GestionUsuarios usuarios={usuarios} setUsuarios={setUsuarios} onToast={showToast} />;
      case "auditoria":       return <AuditoriaView logs={auditLogs} />;
      case "reportes":        return <ReportesView onToast={showToast} />;
      case "ayuda":           return <AyudaView />;
      default:                return <div style={{ padding:20,color:C.textSec }}>Vista no encontrada.</div>;
    }
  };

  if (!user) return (
    <>
      <style>{CSS}</style>
      <LoginView onLogin={handleLogin} />
    </>
  );

  return (
    <>
      <style>{CSS}</style>
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      <AppShell user={user} currentView={view} onNav={setView} onLogout={handleLogout}>
        {renderView()}
      </AppShell>
    </>
  );
}