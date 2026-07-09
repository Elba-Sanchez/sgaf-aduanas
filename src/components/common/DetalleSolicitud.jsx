import { C } from "../../theme.js";
import { generarPdfComprobanteSag, generarPdfMenor, generarPdfVehiculoSalida } from "../../utils/pdfGenerator.js";

// Debe reflejar los mismos labels usados en SagForm.jsx / DetalleSolicitud
const PRODUCTOS_KEY = {
  "Frutas y verduras": "frutas", "Carnes y embutidos": "carnes", "Lácteos y huevos": "lacteos",
  "Mascotas vivas": "mascotas", "Semillas y plantas": "semillas", "Otros productos orgánicos": "otro",
};

const Campo = ({ label, value }) => (
  <div><strong>{label}:</strong> {value || "—"}</div>
);

export function DetalleSolicitud({ solicitud, onToast }) {
  const { tipo, detalle = {}, estado, motivoRechazo } = solicitud;

  const descargar = async () => {
    onToast?.("Generando documento con código QR...", "info");
    if (tipo === "Declaración SAG") {
      const form = { descripcion: detalle.descripcion };
      Object.values(PRODUCTOS_KEY).forEach((k) => { form[k] = false; });
      (detalle.productos || []).forEach((label) => { const k = PRODUCTOS_KEY[label]; if (k) form[k] = true; });
      await generarPdfComprobanteSag({ aprobado: estado === "Aprobado", mensaje: detalle.mensajeSistema, folio: detalle.folio ?? solicitud.id }, form);
    } else if (tipo === "Validación de menor") {
      await generarPdfMenor({ aprobado: estado === "Aprobado", mensaje: detalle.mensajeSistema, folio: detalle.folio ?? solicitud.id }, detalle);
    } else if (tipo === "Validación de vehículo") {
      await generarPdfVehiculoSalida(detalle, detalle.folio ?? solicitud.id);
    }
    onToast?.("Descargando documento PDF...", "success");
  };

  return (
    <div>
      <div style={{ border: `1px solid ${C.border}`, borderRadius: 10, padding: 16, marginBottom: 14, background: C.bg }}>
        {tipo === "Declaración SAG" && (
          <>
            <div style={{ fontWeight: 600, marginBottom: 8, fontSize: 13 }}>Productos declarados</div>
            {detalle.productos?.length ? (
              <ul style={{ margin: "0 0 10px 18px", fontSize: 13 }}>
                {detalle.productos.map((p, i) => <li key={i}>{p}</li>)}
              </ul>
            ) : (
              <div style={{ fontSize: 13, color: C.textSec, marginBottom: 10 }}>No se declararon productos restringidos.</div>
            )}
            {detalle.descripcion && (
              <div style={{ fontSize: 13, marginBottom: 4 }}><strong>Descripción adicional:</strong> {detalle.descripcion}</div>
            )}
          </>
        )}

        {tipo === "Validación de menor" && (
          <div className="g2" style={{ fontSize: 13, rowGap: 8 }}>
            <Campo label="Nombre del menor" value={detalle.nombreMenor} />
            <Campo label="RUT / Pasaporte del menor" value={detalle.rutMenor} />
            <Campo label="Fecha de nacimiento" value={detalle.fechaNacimiento} />
            <Campo label="RUT autorizante" value={detalle.rutAutorizante} />
            <Campo label="Vínculo con el menor" value={detalle.vinculo} />
          </div>
        )}

        {tipo === "Validación de vehículo" && (
          <div className="g2" style={{ fontSize: 13, rowGap: 8 }}>
            <Campo label="Patente" value={detalle.patente} />
            <Campo label="Marca / Modelo" value={`${detalle.marca || ""} ${detalle.modelo || ""}`.trim()} />
            <Campo label="Año" value={detalle.anio} />
            <Campo label="Color" value={detalle.color} />
            <Campo label="Propietario" value={detalle.propietario} />
            <Campo label="RUT propietario" value={detalle.rut} />
          </div>
        )}

        {(detalle.folio || detalle.mensajeSistema) && (
          <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px dashed ${C.border}`, fontSize: 12, color: C.textMuted }}>
            {detalle.folio && <div>Folio del sistema: <strong style={{ fontFamily: "monospace" }}>{detalle.folio}</strong></div>}
            {detalle.mensajeSistema && <div style={{ marginTop: 2 }}>Resultado automático: {detalle.mensajeSistema}</div>}
          </div>
        )}
      </div>

      {estado === "Rechazado" && motivoRechazo && (
        <div style={{ background: C.dangerBg, color: C.danger, borderRadius: 8, padding: "10px 14px", fontSize: 13, marginBottom: 14 }}>
          <strong>Motivo del rechazo:</strong> {motivoRechazo}
        </div>
      )}

      {estado === "Aprobado" ? (
        <button className="btn btn-sec btn-sm" onClick={descargar}>⬇️ Descargar documento con QR</button>
      ) : (
        <div style={{ fontSize: 12, color: C.textMuted }}>
          El documento con código QR estará disponible una vez que la solicitud sea aprobada.
        </div>
      )}
    </div>
  );
}
