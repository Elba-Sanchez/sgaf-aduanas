// pdfGenerator.js — Generación real de documentos PDF (reemplaza la descarga simulada)
import { jsPDF } from "jspdf";
import { codificarQrVehiculo, codificarQrSag, codificarQrMenor, generarQrDataUrl } from "./qr.js";

const NAVY = [17, 43, 76];
const GOLD = [176, 141, 87];
const TEXT_SEC = [90, 100, 115];
const BORDER = [210, 214, 220];

function encabezado(doc, subtitulo) {
  doc.setFillColor(...NAVY);
  doc.rect(0, 0, 210, 28, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("SERVICIO NACIONAL DE ADUANAS", 14, 13);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(subtitulo, 14, 20);
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(1.2);
  doc.line(0, 28, 210, 28, "S");
  doc.setTextColor(0, 0, 0);
}

function pie(doc, folio) {
  const y = 285;
  doc.setDrawColor(...BORDER);
  doc.line(14, y - 6, 196, y - 6, "S");
  doc.setFontSize(8);
  doc.setTextColor(...TEXT_SEC);
  doc.text(`Documento generado electrónicamente por SGAF — Sistema de Gestión de Aduanas y Fronteras`, 14, y);
  doc.text(`Folio: ${folio}`, 14, y + 4);
  doc.text(`Emitido: ${new Date().toLocaleString("es-CL")}`, 196, y + 4, { align: "right" });
}

function campo(doc, label, valor, x, y, ancho = 85) {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...TEXT_SEC);
  doc.text(label.toUpperCase(), x, y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(20, 20, 20);
  const texto = valor && String(valor).trim() ? String(valor) : "—";
  doc.text(doc.splitTextToSize(texto, ancho), x, y + 5);
}

/**
 * Documento: Salida y Admisión Temporal de Vehículos
 */
export async function generarPdfVehiculoSalida(form, folio) {
  const doc = new jsPDF();
  encabezado(doc, "Formulario: Salida y Admisión Temporal de Vehículos");

  doc.setFontSize(11);
  doc.setTextColor(...TEXT_SEC);
  doc.text(`N° ${folio}`, 196, 38, { align: "right" });
  doc.text("Válido: 180 días", 196, 43, { align: "right" });

  let y = 45;
  doc.setDrawColor(...BORDER);
  doc.roundedRect(14, y, 182, 90, 2, 2);
  y += 12;

  const filas = [
    ["Patente", form.patente?.toUpperCase()],
    ["Marca / Modelo", `${form.marca || ""} ${form.modelo || ""}`.trim()],
    ["Año", form.anio],
    ["Color", form.color],
    ["N° Motor", form.motor],
    ["N° Chasis (VIN)", form.chasis],
    ["Propietario", form.propietario],
    ["RUT propietario", form.rut],
  ];

  let col = 0;
  filas.forEach(([label, valor]) => {
    const x = 24 + col * 90;
    campo(doc, label, valor, x, y, 80);
    if (col === 1) y += 20;
    col = col === 0 ? 1 : 0;
  });

  y += 10;
  doc.setFontSize(9);
  doc.setTextColor(...TEXT_SEC);
  doc.text("COPIA ORIGINAL — Para presentar en Aduana Argentina", 24, y);
  doc.text(`Fecha: ${new Date().toLocaleDateString("es-CL")}`, 186, y, { align: "right" });

  y += 12;
  try {
    const qrSize = 55;
    const qrX = (210 - qrSize) / 2;
    const qrDataUrl = await generarQrDataUrl(codificarQrVehiculo(form, folio));
    doc.addImage(qrDataUrl, "PNG", qrX, y, qrSize, qrSize);
    doc.setFontSize(8);
    doc.setTextColor(...TEXT_SEC);
    doc.text("Escanee este código en el control fronterizo", 105, y + qrSize + 6, { align: "center" });
    doc.text("para validar la autenticidad del documento.", 105, y + qrSize + 11, { align: "center" });
  } catch (e) {
    console.error("Error generando QR:", e);
  }

  pie(doc, folio);
  doc.save(`salida-vehiculo-${folio}.pdf`);
}

/**
 * Comprobante: Declaración SAG
 */
export async function generarPdfComprobanteSag(estado, form) {
  const doc = new jsPDF();
  encabezado(doc, "Comprobante de Declaración SAG");

  let y = 45;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(...(estado.aprobado ? [30, 130, 76] : [176, 130, 20]));
  doc.text(estado.aprobado ? "DECLARACIÓN ACEPTADA" : "REVISIÓN PRESENCIAL REQUERIDA", 14, y);

  y += 8;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...TEXT_SEC);
  doc.text(doc.splitTextToSize(estado.mensaje || "", 180), 14, y);

  y += 14;
  doc.setDrawColor(...BORDER);
  doc.roundedRect(14, y, 182, 22, 2, 2);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...TEXT_SEC);
  doc.text("FOLIO SAG", 24, y + 9);
  doc.setFontSize(14);
  doc.setTextColor(...NAVY);
  doc.text(estado.folio || "", 24, y + 17);

  y += 34;
  const productos = Object.entries({
    frutas: "Frutas y verduras", carnes: "Carnes y embutidos", lacteos: "Lácteos y huevos",
    mascotas: "Mascotas vivas", semillas: "Semillas y plantas", otro: "Otros productos orgánicos",
  }).filter(([k]) => form?.[k]).map(([, label]) => label);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(20, 20, 20);
  doc.text("Productos declarados:", 14, y);
  y += 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  if (productos.length) {
    productos.forEach((p) => { doc.text(`• ${p}`, 18, y); y += 6; });
  } else {
    doc.text("No se declararon productos restringidos.", 18, y);
    y += 6;
  }

  if (form?.descripcion) {
    y += 4;
    doc.setFont("helvetica", "bold");
    doc.text("Descripción adicional:", 14, y);
    y += 6;
    doc.setFont("helvetica", "normal");
    doc.text(doc.splitTextToSize(form.descripcion, 180), 14, y);
    y += 6;
  }

  y += 12;
  if (y > 205) y = 205; // evita que el QR se corra fuera de la página si hay mucho texto arriba
  try {
    const qrSize = 55;
    const qrX = (210 - qrSize) / 2;
    const qrDataUrl = await generarQrDataUrl(codificarQrSag(estado, form));
    doc.addImage(qrDataUrl, "PNG", qrX, y, qrSize, qrSize);
    doc.setFontSize(8);
    doc.setTextColor(...TEXT_SEC);
    doc.text("Escanee este código en el control fronterizo", 105, y + qrSize + 6, { align: "center" });
    doc.text("para validar la autenticidad del documento.", 105, y + qrSize + 11, { align: "center" });
  } catch (e) {
    console.error("Error generando QR:", e);
  }

  pie(doc, estado.folio);
  doc.save(`comprobante-sag-${estado.folio}.pdf`);
}

/**
 * Comprobante: Autorización de Salida de Menores
 */
export async function generarPdfMenor(estado, form) {
  const doc = new jsPDF();
  encabezado(doc, "Comprobante de Autorización de Menor");

  let y = 45;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(...(estado.aprobado ? [30, 130, 76] : [176, 130, 20]));
  doc.text(estado.aprobado ? "AUTORIZACIÓN VALIDADA" : "REVISIÓN MANUAL REQUERIDA", 14, y);

  y += 8;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...TEXT_SEC);
  doc.text(doc.splitTextToSize(estado.mensaje || "", 180), 14, y);

  y += 14;
  doc.setDrawColor(...BORDER);
  doc.roundedRect(14, y, 182, 22, 2, 2);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...TEXT_SEC);
  doc.text("FOLIO DE AUTORIZACIÓN", 24, y + 9);
  doc.setFontSize(14);
  doc.setTextColor(...NAVY);
  doc.text(estado.folio || "", 24, y + 17);

  y += 34;
  doc.setDrawColor(...BORDER);
  doc.roundedRect(14, y, 182, 60, 2, 2);
  y += 12;
  const filas = [
    ["Nombre del menor", form?.nombreMenor],
    ["RUT / Pasaporte del menor", form?.rutMenor],
    ["Fecha de nacimiento", form?.fechaNacimiento],
    ["RUT autorizante", form?.rutAutorizante],
    ["Vínculo con el menor", form?.vinculo],
  ];
  let col = 0;
  filas.forEach(([label, valor]) => {
    const x = 24 + col * 90;
    campo(doc, label, valor, x, y, 80);
    if (col === 1) y += 20;
    col = col === 0 ? 1 : 0;
  });

  y = Math.max(y, 195);
  try {
    const qrSize = 55;
    const qrX = (210 - qrSize) / 2;
    const qrDataUrl = await generarQrDataUrl(codificarQrMenor(estado, form));
    doc.addImage(qrDataUrl, "PNG", qrX, y, qrSize, qrSize);
    doc.setFontSize(8);
    doc.setTextColor(...TEXT_SEC);
    doc.text("Escanee este código en el control fronterizo", 105, y + qrSize + 6, { align: "center" });
    doc.text("para validar la autenticidad del documento.", 105, y + qrSize + 11, { align: "center" });
  } catch (e) {
    console.error("Error generando QR:", e);
  }

  pie(doc, estado.folio);
  doc.save(`autorizacion-menor-${estado.folio}.pdf`);
}

/**
 * Reporte administrativo (Flujo Fronterizo / Declaraciones SAG / Consultas PDI)
 */
export function generarPdfReporte(tipo, data, desde, hasta) {
  const doc = new jsPDF();
  const titulos = {
    flujo: "Reporte: Flujo Fronterizo",
    sag: "Reporte: Declaraciones SAG",
    pdi: "Reporte: Consultas PDI",
  };
  encabezado(doc, titulos[tipo] || "Reporte");

  let y = 42;
  doc.setFontSize(10);
  doc.setTextColor(...TEXT_SEC);
  doc.text(`Periodo: ${desde} al ${hasta}`, 14, y);
  y += 12;

  const filasPorTipo = {
    flujo: [["Ingresos", data.ingresos], ["Salidas", data.salidas], ["Vehículos", data.vehiculos], ["Alertas", data.alertas]],
    sag: [["Declaraciones", data.declaraciones], ["Aprobadas", data.aprobadas], ["Rechazadas", data.rechazadas], ["Revisiones", data.revisiones]],
    pdi: [["Consultas realizadas", data.consultas], ["Alertas generadas", data.alertas]],
  };
  const filas = filasPorTipo[tipo] || filasPorTipo.flujo;

  filas.forEach(([label, valor]) => {
    doc.setDrawColor(...BORDER);
    doc.line(14, y, 196, y, "S");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(20, 20, 20);
    doc.text(label, 16, y + 7);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...NAVY);
    doc.text(String(valor), 190, y + 7, { align: "right" });
    y += 12;
  });
  doc.line(14, y, 196, y, "S");

  const folio = `REP-${Date.now().toString().slice(-8)}`;
  pie(doc, folio);
  doc.save(`reporte-${tipo}-${desde}-a-${hasta}.pdf`);
}

/**
 * Exportación CSV de reporte (descarga real vía Blob)
 */
export function generarCsvReporte(tipo, data, desde, hasta) {
  const filasPorTipo = {
    flujo: [["Ingresos", data.ingresos], ["Salidas", data.salidas], ["Vehículos", data.vehiculos], ["Alertas", data.alertas]],
    sag: [["Declaraciones", data.declaraciones], ["Aprobadas", data.aprobadas], ["Rechazadas", data.rechazadas], ["Revisiones", data.revisiones]],
    pdi: [["Consultas realizadas", data.consultas], ["Alertas generadas", data.alertas]],
  };
  const filas = filasPorTipo[tipo] || filasPorTipo.flujo;
  const lineas = [
    `Reporte;${tipo}`,
    `Periodo;${desde} al ${hasta}`,
    "",
    "Indicador;Valor",
    ...filas.map(([label, valor]) => `${label};${valor}`),
  ];
  const csv = "\uFEFF" + lineas.join("\r\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `reporte-${tipo}-${desde}-a-${hasta}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
