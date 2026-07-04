import { C } from "../../theme.js";

const PASOS = [
  { icon: "🌿", title: "Declaración SAG", desc: "Indica si transportas frutas, carnes, lácteos, mascotas u otros productos orgánicos. Es obligatorio para todo viajero." },
  { icon: "👶", title: "Autorización de menores", desc: "Si viajas con menores de edad sin ambos padres, debes presentar un permiso notarial firmado por el ausente." },
  { icon: "🚗", title: "Salida de vehículo", desc: "Si sales de Chile con un vehículo particular, necesitas el formulario de 'Salida y Admisión Temporal' para presentar en Argentina." },
  { icon: "🛂", title: "Control migratorio", desc: "Presenta tu cédula de identidad o pasaporte vigente en el control de Policía Internacional." },
];

const FAQS = [
  { q: "¿Cuánto demora el cruce?", a: "En temporada normal, el proceso completo toma entre 10 y 20 minutos. En alta temporada (verano / fines de semana largos) puede extenderse hasta 45 minutos." },
  { q: "¿Necesito visa para Argentina?", a: "Ciudadanos chilenos solo necesitan cédula de identidad vigente. Otras nacionalidades deben consultar los requisitos migratorios argentinos." },
  { q: "¿Qué productos no puedo llevar?", a: "Están prohibidos productos cárnicos frescos, frutas sin certificación, lácteos no industriales y plantas con tierra. El SAG realiza inspecciones aleatorias." },
  { q: "¿Cómo obtengo el permiso para un menor?", a: "Debes obtener una autorización notarial firmada por el padre/madre ausente. Luego súbela en el módulo 'Autorización Menores'." },
  { q: "¿Puedo llevar mi mascota?", a: "Sí, pero debes declararla en el formulario SAG. Se requiere certificado sanitario y vacunas al día." },
];

export function AyudaView() {
  return (
    <div className="fade">
      <div className="stitle">❓ Centro de Ayuda</div>
      <div className="ssub">Guía para cruzar el Paso Los Libertadores sin contratiempos</div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ fontWeight: 600, marginBottom: 12 }}>📌 Pasos antes de llegar a la frontera</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {PASOS.map((item, i) => (
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
        {FAQS.map((faq, i) => (
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
