// qr.js — Generación de códigos QR de verificación para documentos SGAF
import QRCode from "qrcode";

/**
 * Codifica los datos esenciales de un documento en un string compacto
 * que luego puede ser leído por el escáner del funcionario/PDI.
 * Formato: SGAF|<tipo>|<folio>|<campo1>|<campo2>...
 */
export function codificarQrVehiculo(form, folio) {
  return [
    "SGAF", "VEH", folio,
    form.patente?.toUpperCase() || "",
    form.propietario || "",
    form.rut || "",
  ].join("|");
}

export function codificarQrSag(estado) {
  return [
    "SGAF", "SAG", estado.folio || "",
    estado.aprobado ? "APROBADO" : "REVISION",
  ].join("|");
}

export function codificarQrMenor(estado, form) {
  return [
    "SGAF", "AUT", estado.folio || "",
    form.nombreMenor || "",
    form.rutMenor || "",
    estado.aprobado ? "APROBADO" : "REVISION",
  ].join("|");
}

/**
 * Decodifica un string de QR generado por las funciones anteriores.
 * Devuelve null si el formato no corresponde a un documento SGAF válido.
 */
export function decodificarQr(texto) {
  if (!texto || typeof texto !== "string") return null;
  const partes = texto.split("|");
  if (partes[0] !== "SGAF") return null;

  const tipo = partes[1];
  if (tipo === "VEH") {
    return {
      tipo: "VEH",
      folio: partes[2] || "",
      patente: partes[3] || "",
      propietario: partes[4] || "",
      rut: partes[5] || "",
    };
  }
  if (tipo === "SAG") {
    return {
      tipo: "SAG",
      folio: partes[2] || "",
      estado: partes[3] || "",
    };
  }
  if (tipo === "AUT") {
    return {
      tipo: "AUT",
      folio: partes[2] || "",
      nombreMenor: partes[3] || "",
      rutMenor: partes[4] || "",
      estado: partes[5] || "",
    };
  }
  return null;
}

/**
 * Genera un QR como Data URL (PNG en base64) listo para insertar en un <img>
 * o en un PDF vía doc.addImage().
 */
export async function generarQrDataUrl(texto) {
  return QRCode.toDataURL(texto, {
    margin: 1,
    width: 240,
    color: { dark: "#112B4C", light: "#FFFFFF" },
  });
}
