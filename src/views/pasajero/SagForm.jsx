import { useState } from "react";
import { C } from "../../theme.js";
import { mockApi } from "../../services/mockApi.js";
import { Spinner } from "../../components/common/Spinner.jsx";
import { TiempoRespuesta } from "../../components/common/TiempoRespuesta.jsx";
import { generarPdfComprobanteSag } from "../../utils/pdfGenerator.js";
import { siguienteIdSolicitud } from "../../data/initialData.js";

export function SagForm({ user, setSolicitudes, onToast }) {
  const [form, setForm] = useState({ frutas: false, carnes: false, lacteos: false, mascotas: false, semillas: false, otro: false, descripcion: "" });
  const [estado, setEstado] = useState(null); // null | "loading" | { aprobado, folio, mensaje } | { error }
  const declara = Object.values(form).some(v => v === true);

  const registrarSolicitud = (res) => {
    if (!setSolicitudes) return;
    const productosLabels = {
      frutas: "Frutas y verduras", carnes: "Carnes y embutidos", lacteos: "Lácteos y huevos",
      mascotas: "Mascotas vivas", semillas: "Semillas y plantas", otro: "Otros productos orgánicos",
    };
    setSolicitudes(prev => [
      {
        id: siguienteIdSolicitud(prev),
        tipo: "Declaración SAG",
        solicitante: user?.name ?? "Pasajero",
        identificacion: `RUT ${user?.doc ?? "—"}`,
        estado: res.aprobado ? "Aprobado" : "Pendiente",
        fecha: new Date().toLocaleString("sv-SE").slice(0, 16),
        detalle: {
          productos: Object.keys(productosLabels).filter(k => form[k]).map(k => productosLabels[k]),
          descripcion: form.descripcion,
          folio: res.folio,
          mensajeSistema: res.mensaje,
        },
      },
      ...prev,
    ]);
  };

  const handleEnviar = async () => {
    setEstado("loading");
    try {
      const res = await mockApi.validarSag(user?.doc, form);
      setEstado(res);
      registrarSolicitud(res);
      onToast(res.aprobado ? "Declaración aceptada." : "Requiere revisión presencial. Se creó una solicitud para el funcionario.", res.aprobado ? "success" : "warning");
    } catch (e) {
      setEstado({ error: e.message });
      onToast(e.message, "error");
    }
  };

  const check = (k) => setForm(f => ({ ...f, [k]: !f[k] }));

  const handleDescargarComprobante = async () => {
    onToast("Generando comprobante con código QR...", "info");
    await generarPdfComprobanteSag(estado, form);
    onToast("Descargando comprobante PDF...", "success");
  };

  if (estado && estado.folio) return (
    <div className="fade">
      <div className="card" style={{ maxWidth: 560, margin: "0 auto", textAlign: "center" }}>
        <div style={{ fontSize: 36, marginBottom: 10 }}>{estado.aprobado ? "✅" : "⚠️"}</div>
        <div style={{ fontSize: 17, fontWeight: 600, marginBottom: 6, color: estado.aprobado ? C.success : C.warning }}>
          {estado.aprobado ? "Declaración aceptada" : "Revisión presencial requerida"}
        </div>
        <div style={{ fontSize: 13, color: C.textSec, marginBottom: 16 }}>{estado.mensaje}</div>
        <div style={{ background: C.bg, borderRadius: 8, padding: "10px 16px", display: "inline-block", marginBottom: 8 }}>
          <div style={{ fontSize: 12, color: C.textMuted }}>Folio SAG</div>
          <div style={{ fontFamily: "monospace", fontSize: 18, fontWeight: 600, color: C.navy }}>{estado.folio}</div>
        </div>
        <div style={{ marginBottom: 16 }}><TiempoRespuesta ms={estado._tiempoMs} /></div>
        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          <button className="btn btn-primary btn-sm" onClick={handleDescargarComprobante}>⬇️ Descargar comprobante</button>
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
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontWeight: 500, marginBottom: 10 }}>¿Transportas alguno de estos productos?</div>
          <div className="g2">
            {[["frutas", "🍎 Frutas y verduras"], ["carnes", "🥩 Carnes y embutidos"],
            ["lacteos", "🧀 Lácteos y huevos"], ["mascotas", "🐾 Mascotas vivas"], ["semillas", "🌱 Semillas y plantas"],
            ["otro", "📦 Otros productos orgánicos"]].map(([k, lbl]) => (
              <label key={k} style={{
                display: "flex", alignItems: "center", gap: 10, cursor: "pointer", padding: "8px 12px",
                borderRadius: 8, border: `1px solid ${form[k] ? C.navyLight : C.border}`, background: form[k] ? C.infoBg : "#fff", transition: "all 0.15s"
              }}>
                <input type="checkbox" checked={form[k]} onChange={() => check(k)} style={{ width: "auto", accentColor: C.navy }} />
                <span style={{ fontSize: 13 }}>{lbl}</span>
              </label>
            ))}
          </div>
        </div>
        {declara && (
          <div className="fgroup fade">
            <label className="flabel">Descripción adicional (opcional)</label>
            <textarea rows={3} placeholder="Especifica los productos a declarar..." value={form.descripcion}
              onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))} style={{ resize: "vertical" }} />
          </div>
        )}
        {!declara && (
          <div style={{
            background: C.successBg, border: `1px solid ${C.success}40`, borderRadius: 8, padding: "10px 14px",
            fontSize: 13, color: C.success, marginBottom: 14
          }}>
            ✅ Si no marcas ningún producto, declaras que <strong>no transportas</strong> bienes restringidos.
          </div>
        )}
        {estado === "loading" && <div style={{ marginBottom: 12 }}><Spinner /></div>}
        {estado?.error && <div style={{
          background: C.dangerBg, color: C.danger, padding: "10px 14px",
          borderRadius: 8, fontSize: 13, marginBottom: 14
        }}>⚠️ {estado.error}</div>}
        <button className="btn btn-primary" onClick={handleEnviar} disabled={estado === "loading"}>
          {declara ? "📤 Enviar declaración" : "✅ Confirmar sin productos"}
        </button>
      </div>
    </div>
  );
}
