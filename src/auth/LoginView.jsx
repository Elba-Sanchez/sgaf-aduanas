import { useState } from "react";
import { C } from "../theme.js";
import { USERS_LOGIN } from "../data/initialData.js";

export function LoginView({ onLogin }) {
  const [doc, setDoc] = useState("");
  const [pass, setPass] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const handleLogin = () => {
    setErr("");
    setLoading(true);
    setTimeout(() => {
      const u = USERS_LOGIN[doc.toLowerCase()];
      if (u && u.pass === pass) {
        onLogin({ role: u.role, name: u.name, doc });
      } else {
        setErr("RUT/pasaporte o contraseña incorrectos.");
      }
      setLoading(false);
    }, 900);
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: `linear-gradient(135deg, ${C.navy} 0%, ${C.navyLight} 100%)`
    }}>
      <div className="fade" style={{ width: "100%", maxWidth: 420, padding: "0 16px" }}>
        <div className="card" style={{ padding: 36 }}>
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <div style={{
              width: 60, height: 60, background: C.navy, borderRadius: 14, display: "flex",
              alignItems: "center", justifyContent: "center", margin: "0 auto 12px", fontSize: 26
            }}>🛃</div>
            <div style={{ fontFamily: "'Source Serif 4',serif", fontSize: 22, fontWeight: 600, color: C.navy }}>SGAF</div>
            <div style={{ fontSize: 12, color: C.textSec, marginTop: 3 }}>Sistema de Gestión Aduanera Fronteriza</div>
            <div style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}>Paso Los Libertadores · Chile</div>
          </div>
          <div className="fgroup">
            <label className="flabel">RUT / Pasaporte</label>
            <input type="text" placeholder="ej. 12345678-9 / a123456" value={doc} onChange={e => setDoc(e.target.value)} />
          </div>
          <div className="fgroup">
            <label className="flabel">Clave única / Contraseña</label>
            <input type="password" placeholder="••••••••" value={pass} onChange={e => setPass(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleLogin()} />
          </div>
          {err && <div style={{ background: C.dangerBg, color: C.danger, padding: "10px 14px", borderRadius: 8, fontSize: 13, marginBottom: 14 }}>{err}</div>}
          <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center", padding: 11, fontSize: 15 }}
            onClick={handleLogin} disabled={loading}>
            {loading ? "Verificando..." : "Ingresar al sistema"}
          </button>
          {/* Cuentas demo — ocultas para la presentación, no se borraron.
              Para volver a mostrarlas, descomenta este bloque.
          <div style={{ marginTop: 20, padding: 12, background: C.bg, borderRadius: 8, fontSize: 12, color: C.textSec, lineHeight: 1.7 }}>
            <strong>Cuentas demo:</strong><br />
            Pasajero: <code>12345678-9</code> / <code>pasajero123</code><br />
            Funcionario: <code>87654321-0</code> / <code>func123</code><br />
            Admin: <code>admin</code> / <code>admin123</code><br />
            PDI: <code>pdi001</code> / <code>pdi123</code>
          </div>
          */}
        </div>
      </div>
    </div>
  );
}
