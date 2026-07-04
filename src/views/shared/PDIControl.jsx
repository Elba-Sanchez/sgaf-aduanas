import { useState } from "react";
import { C } from "../../theme.js";
import { mockApi } from "../../services/mockApi.js";
import { TiempoRespuesta } from "../../components/common/TiempoRespuesta.jsx";

export function PDIControl({ onToast }) {
  const [rut, setRut] = useState("");
  const [estado, setEstado] = useState(null);

  const handleConsultar = async () => {
    if (!rut) { onToast("Ingresa el RUT o número de documento.", "error"); return; }
    setEstado("loading");
    try {
      const res = await mockApi.consultarPDI(rut.replace(/\s/g, ""));
      setEstado(res);
      if (res.alerta) onToast("⛔ ALERTA PDI: Revisar registro.", "error");
      else onToast("Consulta PDI completada sin alertas.", "success");
    } catch (e) {
      setEstado({ error: e.message });
      onToast(e.message, "error");
    }
  };

  return (
    <div className="fade">
      <div className="stitle">🔍 Control PDI</div>
      <div className="ssub">Consulta de antecedentes en la base de datos de la Policía de Investigaciones</div>
      <div className="card" style={{ maxWidth: 560 }}>
        <div className="fgroup">
          <label className="flabel">RUT / Número de pasaporte</label>
          <div style={{ display: "flex", gap: 10 }}>
            <input type="text" placeholder="ej. 12345678-9 o Pasaporte ARG-X9821" value={rut} onChange={e => setRut(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleConsultar()} />
            <button className="btn btn-primary" onClick={handleConsultar} disabled={estado === "loading"} style={{ flexShrink: 0 }}>
              {estado === "loading" ? "⏳..." : "🔍 Consultar"}
            </button>
          </div>
        </div>
        {estado === "loading" && <div className="pulse" style={{ color: C.textSec, fontSize: 13 }}>🔗 Conectando con nodo PDI Central...</div>}
        {estado?.nombre && (
          <div className="fade">
            <div style={{
              background: estado.alerta ? C.dangerBg : C.successBg, border: `1px solid ${estado.alerta ? C.danger : C.success}40`
              , borderRadius: 10, padding: 16
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <span className={`semaforo ${estado.alerta ? "s-rojo" : "s-verde"}`} />
                <strong style={{ color: estado.alerta ? C.danger : C.success }}>
                  {estado.alerta ? "ALERTA ACTIVA" : "Sin alertas"}
                </strong>
              </div>
              <div className="g2" style={{ fontSize: 13 }}>
                <div><strong>Nombre:</strong> {estado.nombre}</div>
                <div><strong>Estado:</strong> <span className={`badge ${estado.habilitado ? "b-green" : "b-red"}`}>
                  {estado.habilitado ? "Habilitado para cruce" : "NO habilitado"}</span></div>
              </div>
              {estado.mensaje && <div style={{ marginTop: 10, fontSize: 13, color: estado.alerta ? C.danger : C.success, fontWeight: 500 }}>{estado.mensaje}</div>}
            </div>
            <TiempoRespuesta ms={estado._tiempoMs} />
          </div>
        )}
        {estado?.error && <div style={{
          background: C.dangerBg, color: C.danger, padding: "10px 14px",
          borderRadius: 8, fontSize: 13, marginTop: 10
        }}>⚠️ {estado.error}</div>}
      </div>
    </div>
  );
}
