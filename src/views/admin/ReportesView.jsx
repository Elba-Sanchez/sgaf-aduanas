import { useState } from "react";
import { C } from "../../theme.js";
import { StatCard } from "../../components/common/StatCard.jsx";

export function ReportesView({ onToast }) {
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
