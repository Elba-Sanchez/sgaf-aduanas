import { useState } from "react";
import { C } from "../../theme.js";
import { generarPdfVehiculoSalida } from "../../utils/pdfGenerator.js";
import { mockApi } from "../../services/mockApi.js";

export function VehiculoSalida({ user, onToast }) {
  const [form, setForm] = useState({ patente: "", marca: "", modelo: "", anio: "", color: "", motor: "", chasis: "", propietario: "", rut: "" });
  const [patenteOk, setPatenteOk] = useState(null);
  const [generado, setGenerado] = useState(false);
  const [folio, setFolio] = useState(null);
  const [loading, setLoading] = useState(false);
  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const validarPatente = (p) => {
    const ok = /^[A-Z]{2}\d{4}$|^[A-Z]{4}\d{2}$/i.test(p.replace(/\s|-/g, ""));
    setPatenteOk(ok); return ok;
  };

  const handleGenerar = async () => {
    if (!validarPatente(form.patente)) { onToast("Formato de patente inválido (ej: AB1234)", "error"); return; }
    if (!form.marca || !form.modelo || !form.propietario) { onToast("Completa todos los campos obligatorios.", "error"); return; }

    setLoading(true);
    try {
      const res = await mockApi.validarVehiculoSalida(form, user);
      setFolio(res.folio);
      setGenerado(true);
      onToast("Trámite de salida registrado exitosamente.", "success");
    } catch (e) {
      onToast(e.message || "Error al registrar el trámite.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDescargar = async () => {
    onToast("Generando documento con código QR...", "info");
    await generarPdfVehiculoSalida(form, folio);
    onToast("Descargando documento PDF...", "success");
  };

  if (generado) {
    return (
      <div className="fade">
        <div className="card" style={{ maxWidth: 600, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>📄</div>
            <div style={{ fontSize: 16, fontWeight: 600 }}>Documento generado</div>
            <div style={{ fontSize: 13, color: C.textSec }}>Formulario de Salida y Admisión Temporal de Vehículos</div>
          </div>
          <div style={{ border: `2px solid ${C.navy}`, borderRadius: 10, padding: 20, marginBottom: 16 }}>
            <div style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              marginBottom: 12, paddingBottom: 10, borderBottom: `1px solid ${C.border}`
            }}>
              <div>
                <div style={{ fontFamily: "'Source Serif 4',serif", fontSize: 15, fontWeight: 600, color: C.navy }}>SERVICIO NACIONAL DE ADUANAS</div>
                <div style={{ fontSize: 12, color: C.textSec }}>Formulario: Salida y Admisión Temporal de Vehículos</div>
              </div>
              <div style={{ fontSize: 11, color: C.textMuted, textAlign: "right" }}>N° {folio}<br />Válido: 180 días</div>
            </div>
            <div className="g2" style={{ fontSize: 13 }}>
              <div><strong>Patente:</strong> {form.patente.toUpperCase()}</div>
              <div><strong>Marca/Modelo:</strong> {form.marca} {form.modelo}</div>
              <div><strong>Año:</strong> {form.anio}</div>
              <div><strong>Color:</strong> {form.color}</div>
              <div><strong>Propietario:</strong> {form.propietario}</div>
              <div><strong>RUT:</strong> {form.rut}</div>
            </div>
            <div style={{ marginTop: 12, fontSize: 11, color: C.textMuted, display: "flex", justifyContent: "space-between" }}>
              <div>COPIA ORIGINAL — Para presentar en Aduana Argentina</div>
              <div>Fecha: {new Date().toLocaleDateString("es-CL")}</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn btn-primary btn-sm" onClick={handleDescargar}>⬇️ Descargar PDF</button>
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
          {[["patente", "Patente *", "AB1234"], ["marca", "Marca *", "Toyota"], ["modelo", "Modelo *", "Corolla"],
          ["anio", "Año", "2022"], ["color", "Color", "Blanco"],
          ["motor", "N° Motor", "123456789"], ["chasis", "N° Chasis (VIN)", "JT2BF22K000001"],
          ["propietario", "Propietario *", "Nombre completo"], ["rut", "RUT propietario *", "12.345.678-9"]].map(([k, lbl, ph]) => (
            <div key={k} className="fgroup">
              <label className="flabel">{lbl}</label>
              {k === "patente" ? (
                <div style={{ position: "relative" }}>
                  <input type="text" placeholder={ph} value={form[k]}
                    onChange={e => { f(k, e.target.value); setPatenteOk(null); }} onBlur={() => form.patente && validarPatente(form.patente)}
                    style={{ borderColor: patenteOk === false ? C.danger : patenteOk === true ? C.success : undefined }} />
                  {patenteOk !== null && <span style={{
                    position: "absolute",
                    right: 10, top: "50%", transform: "translateY(-50%)"
                  }}>{patenteOk ? "✅" : "❌"}</span>}
                </div>
              ) : (
                <input type="text" placeholder={ph} value={form[k]} onChange={e => f(k, e.target.value)} />
              )}
            </div>
          ))}
        </div>
        <button className="btn btn-primary" onClick={handleGenerar} disabled={loading}>
          {loading ? "⏳ Procesando..." : "📄 Generar documento PDF"}
        </button>
      </div>
    </div>
  );
}
