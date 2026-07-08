import { useState } from "react";
import { C } from "../../theme.js";
import { mockApi } from "../../services/mockApi.js";
import { Spinner } from "../../components/common/Spinner.jsx";

export function MenoresForm({ onToast }) {
  const [form, setForm] = useState({
    nombreMenor: "", rutMenor: "", fechaNacimiento: "", rutAutorizante: "", vinculo: "", archivoNombre: null, archivoOk: false
  });
  const [estado, setEstado] = useState(null);
  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const simularArchivo = () => {
    f("archivoNombre", "autorizacion_notarial.pdf");
    setTimeout(() => f("archivoOk", true), 1800);
  };

  const handleValidar = async () => {
    if (!form.nombreMenor || !form.rutMenor || !form.rutAutorizante) { onToast("Completa todos los campos requeridos.", "error"); return; }
    if (!form.archivoOk) { onToast("Debes subir la autorización notarial.", "error"); return; }
    setEstado("loading");
    try {
      const res = await mockApi.validarMenor(form.rutMenor);
      setEstado(res);
      onToast(res.aprobado ? "Autorización validada correctamente." : "Autorización requiere revisión manual.", res.aprobado ? "success" : "warning");
    } catch (e) {
      setEstado({ error: e.message });
      onToast(e.message, "error");
    }
  };

  if (estado?.folio) return (
    <div className="fade">
      <div className="card" style={{ maxWidth: 520, margin: "0 auto", textAlign: "center" }}>
        <div style={{ fontSize: 36, marginBottom: 10 }}>{estado.aprobado ? "✅" : "⚠️"}</div>
        <div style={{ fontSize: 17, fontWeight: 600, marginBottom: 6, color: estado.aprobado ? C.success : C.warning }}>
          {estado.aprobado ? "Autorización validada" : "Revisión manual requerida"}
        </div>
        <div style={{ fontSize: 13, color: C.textSec, marginBottom: 16 }}>
          {estado.aprobado
            ? <>El menor <strong>{form.nombreMenor}</strong> puede cruzar la frontera.</>
            : (estado.mensaje ?? "El documento notarial debe ser revisado presencialmente por un funcionario.")}
        </div>
        <div style={{ background: C.bg, borderRadius: 8, padding: "10px 16px", display: "inline-block", marginBottom: 20 }}>
          <div style={{ fontSize: 12, color: C.textMuted }}>Folio de {estado.aprobado ? "autorización" : "seguimiento"}</div>
          <div style={{ fontFamily: "monospace", fontSize: 18, fontWeight: 600, color: C.navy }}>{estado.folio}</div>
        </div>
        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          {estado.aprobado && <button className="btn btn-primary btn-sm">⬇️ Descargar</button>}
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
        <div style={{ fontWeight: 500, marginBottom: 14 }}>Datos del menor</div>
        <div className="g2">
          <div className="fgroup">
            <label className="flabel">Nombre completo *</label>
            <input type="text" placeholder="Pedro Sánchez López" value={form.nombreMenor} onChange={e => f("nombreMenor", e.target.value)} />
          </div>
          <div className="fgroup">
            <label className="flabel">RUT / Pasaporte *</label>
            <input type="text" placeholder="22.333.444-5" value={form.rutMenor} onChange={e => f("rutMenor", e.target.value)} />
          </div>
          <div className="fgroup">
            <label className="flabel">Fecha de nacimiento</label>
            <input type="date" value={form.fechaNacimiento} onChange={e => f("fechaNacimiento", e.target.value)} />
          </div>
          <div className="fgroup">
            <label className="flabel">RUT autorizante *</label>
            <input type="text" placeholder="12.345.678-9" value={form.rutAutorizante} onChange={e => f("rutAutorizante", e.target.value)} />
          </div>
          <div className="fgroup" style={{ gridColumn: "1/-1" }}>
            <label className="flabel">Vínculo con el menor</label>
            <select value={form.vinculo} onChange={e => f("vinculo", e.target.value)}>
              <option value="">Selecciona...</option>
              <option>Padre/Madre</option>
              <option>Tutor legal</option>
              <option>Otro (indicar en documento)</option>
            </select>
          </div>
        </div>
        <div className="fgroup">
          <label className="flabel">Documento notarial *</label>
          <div style={{
            border: `2px dashed ${form.archivoOk ? C.success : C.border}`,
            borderRadius: 10, padding: 18, textAlign: "center", background: form.archivoOk ? C.successBg : C.bg, transition: "all 0.3s"
          }}>
            {form.archivoNombre ? (
              <div>
                <div style={{ fontSize: 13, fontWeight: 500 }}>📎 {form.archivoNombre}</div>
                {form.archivoOk
                  ? <div style={{ color: C.success, fontSize: 13, marginTop: 4 }}>✅ Timbre notarial validado por OCR</div>
                  : <div className="pulse" style={{ color: C.warning, fontSize: 13, marginTop: 4 }}>🔍 Analizando documento...</div>}
              </div>
            ) : (
              <div>
                <div style={{ fontSize: 13, color: C.textSec, marginBottom: 8 }}>PDF, JPG o JPEG — máx 5MB</div>
                <button className="btn btn-sec btn-sm" onClick={simularArchivo}>📎 Seleccionar archivo</button>
              </div>
            )}
          </div>
        </div>
        {estado === "loading" && <div style={{ marginBottom: 12 }}><Spinner /></div>}
        {estado?.error && <div style={{
          background: C.dangerBg, color: C.danger, padding: "10px 14px",
          borderRadius: 8, fontSize: 13, marginBottom: 12
        }}>⚠️ {estado.error}</div>}
        <button className="btn btn-primary" onClick={handleValidar} disabled={estado === "loading"}>Validar autorización</button>
      </div>
    </div>
  );
}
