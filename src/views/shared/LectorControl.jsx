import { useEffect, useRef, useState } from "react";
import { C } from "../../theme.js";
import { mockApi } from "../../services/mockApi.js";
import { decodificarQr } from "../../utils/qr.js";
import { TiempoRespuesta } from "../../components/common/TiempoRespuesta.jsx";


export function LectorControl({ onToast }) {
  const [valor, setValor] = useState("");
  const [resultado, setResultado] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [modoCamara, setModoCamara] = useState(false);
  const inputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    const refocus = () => inputRef.current?.focus();
    refocus();
    window.addEventListener("click", refocus);
    return () => window.removeEventListener("click", refocus);
  }, []);

  useEffect(() => () => detenerCamara(), []);

  const procesarCodigo = async (codigoRaw) => {
    const codigo = codigoRaw.trim();
    if (!codigo) return;
    setValor("");
    setResultado("loading");

    const doc = decodificarQr(codigo);

    if (doc?.tipo === "VEH") {
      await new Promise(r => setTimeout(r, 500));
      const res = {
        origen: "VEH", folio: doc.folio, patente: doc.patente,
        propietario: doc.propietario, rut: doc.rut, valido: true,
      };
      setResultado(res);
      registrar("Vehículo", doc.patente, true);
      onToast(`✅ Documento de vehículo ${doc.patente} validado.`, "success");
      return;
    }

    if (doc?.tipo === "SAG") {
      await new Promise(r => setTimeout(r, 500));
      const res = {
        origen: "SAG", folio: doc.folio, estado: doc.estado, valido: true,
      };
      setResultado(res);
      registrar("Declaración SAG", doc.folio, true);
      onToast(`✅ Comprobante SAG ${doc.folio} validado.`, "success");
      return;
    }

    try {
      const res = await mockApi.consultarPDI(codigo);
      setResultado({ origen: "PDI", ...res, codigo });
      registrar("Cédula/Pasaporte", codigo, !res.alerta);
      if (res.alerta) onToast("⛔ ALERTA PDI: Revisar registro.", "error");
      else onToast("Documento leído y consultado en PDI.", "success");
    } catch (e) {
      setResultado({ origen: "ERROR", error: e.message });
      onToast(e.message, "error");
    }
  };

  const registrar = (tipo, ref, ok) => {
    setHistorial(h => [{ tipo, ref, ok, hora: new Date().toLocaleTimeString("es-CL") }, ...h].slice(0, 6));
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") procesarCodigo(valor);
  };

  const iniciarCamara = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      streamRef.current = stream;
      setModoCamara(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        loopCamara();
      }
    } catch {
      onToast("No se pudo acceder a la cámara. Verifica los permisos del navegador.", "error");
    }
  };

  function detenerCamara() {
    cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    setModoCamara(false);
  }

  const loopCamara = async () => {
    const { default: jsQR } = await import("jsqr");
    const tick = () => {
      const video = videoRef.current, canvas = canvasRef.current;
      if (video && canvas && video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imgData.data, imgData.width, imgData.height);
        if (code?.data) {
          detenerCamara();
          procesarCodigo(code.data);
          return;
        }
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    tick();
  };

  return (
    <div className="fade">
      <div className="stitle">🔦 Lector de Documentos</div>
      <div className="ssub">Compatible con lectores ópticos de código de barras y QR conectados en la caseta (cédulas, pasaportes y formularios preimpresos)</div>

      <div className="g2" style={{ alignItems: "start" }}>
        <div className="card">
          <div style={{
            display: "flex", alignItems: "center", gap: 10, padding: "10px 12px",
            background: C.bg, borderRadius: 10, marginBottom: 14
          }}>
            <span className="pulse" style={{ fontSize: 20 }}>📡</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.navy }}>Lector listo — esperando escaneo</div>
              <div style={{ fontSize: 11, color: C.textMuted }}>Acerque el documento al lector de la caseta, o pegue el código manualmente abajo.</div>
            </div>
          </div>

          <div className="fgroup">
            <label className="flabel">Código leído</label>
            <input
              ref={inputRef}
              type="text"
              autoFocus
              value={valor}
              placeholder="Esperando lectura del escáner..."
              onChange={e => setValor(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={() => setTimeout(() => inputRef.current?.focus(), 150)}
            />
            <div style={{ fontSize: 11, color: C.textMuted, marginTop: 6 }}>
              ¿Cuál es el código? El RUT del pasajero (ej: <strong style={{ fontFamily: "monospace" }}>17882556-1</strong>), consultado directo en PDI.
            </div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn btn-primary btn-sm" onClick={() => procesarCodigo(valor)} disabled={!valor || resultado === "loading"}>
              ✅ Procesar código
            </button>
            {!modoCamara ? (
              <button className="btn btn-sec btn-sm" onClick={iniciarCamara}>📷 Usar cámara</button>
            ) : (
              <button className="btn btn-sec btn-sm" onClick={detenerCamara}>✖️ Cerrar cámara</button>
            )}
          </div>

          {modoCamara && (
            <div className="fade" style={{ marginTop: 14 }}>
              <video ref={videoRef} muted playsInline style={{ width: "100%", borderRadius: 10, background: "#000" }} />
              <canvas ref={canvasRef} style={{ display: "none" }} />
              <div style={{ fontSize: 12, color: C.textSec, marginTop: 6, textAlign: "center" }}>Apunte la cámara al código QR del documento.</div>
            </div>
          )}

          {resultado === "loading" && <div className="pulse" style={{ color: C.textSec, fontSize: 13, marginTop: 12 }}>🔗 Validando documento...</div>}

          {resultado?.origen === "VEH" && (
            <div className="fade" style={{ marginTop: 14, background: C.successBg, border: `1px solid ${C.success}40`, borderRadius: 10, padding: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <span className="semaforo s-verde" /><strong style={{ color: C.success }}>Documento de vehículo válido</strong>
              </div>
              <div className="g2" style={{ fontSize: 13 }}>
                <div><strong>Folio:</strong> {resultado.folio}</div>
                <div><strong>Patente:</strong> {resultado.patente}</div>
                <div><strong>Propietario:</strong> {resultado.propietario}</div>
                <div><strong>RUT:</strong> {resultado.rut}</div>
              </div>
            </div>
          )}

          {resultado?.origen === "SAG" && (
            <div className="fade" style={{
              marginTop: 14, background: resultado.estado === "APROBADO" ? C.successBg : C.dangerBg,
              border: `1px solid ${(resultado.estado === "APROBADO" ? C.success : C.warning)}40`, borderRadius: 10, padding: 16
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <span className={`semaforo ${resultado.estado === "APROBADO" ? "s-verde" : "s-amarillo"}`} />
                <strong style={{ color: resultado.estado === "APROBADO" ? C.success : C.warning }}>Comprobante SAG válido</strong>
              </div>
              <div className="g2" style={{ fontSize: 13 }}>
                <div><strong>Folio:</strong> {resultado.folio}</div>
                <div><strong>Estado:</strong> <span className={`badge ${resultado.estado === "APROBADO" ? "b-green" : "b-yellow"}`}>{resultado.estado}</span></div>
              </div>
            </div>
          )}

          {resultado?.origen === "PDI" && (
            <div className="fade" style={{ marginTop: 14 }}>
              <div style={{
                background: resultado.alerta ? C.dangerBg : C.successBg, border: `1px solid ${resultado.alerta ? C.danger : C.success}40`,
                borderRadius: 10, padding: 16
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  <span className={`semaforo ${resultado.alerta ? "s-rojo" : "s-verde"}`} />
                  <strong style={{ color: resultado.alerta ? C.danger : C.success }}>{resultado.alerta ? "ALERTA ACTIVA" : "Sin alertas"}</strong>
                </div>
                <div className="g2" style={{ fontSize: 13 }}>
                  <div><strong>Documento leído:</strong> {resultado.codigo}</div>
                  <div><strong>Nombre:</strong> {resultado.nombre}</div>
                  <div><strong>Estado:</strong> <span className={`badge ${resultado.habilitado ? "b-green" : "b-red"}`}>
                    {resultado.habilitado ? "Habilitado para cruce" : "NO habilitado"}</span></div>
                </div>
                {resultado.mensaje && <div style={{ marginTop: 10, fontSize: 13, color: resultado.alerta ? C.danger : C.success, fontWeight: 500 }}>{resultado.mensaje}</div>}
              </div>
              <TiempoRespuesta ms={resultado._tiempoMs} />
            </div>
          )}

          {resultado?.origen === "ERROR" && (
            <div style={{ background: C.dangerBg, color: C.danger, padding: "10px 14px", borderRadius: 8, fontSize: 13, marginTop: 12 }}>
              ⚠️ {resultado.error}
            </div>
          )}
        </div>

        <div className="card">
          <div style={{ fontWeight: 600, marginBottom: 12, fontSize: 14 }}>Últimas lecturas</div>
          {historial.length === 0 && <div style={{ fontSize: 13, color: C.textMuted }}>Aún no se han escaneado documentos en esta sesión.</div>}
          {historial.map((h, i) => (
            <div key={i} style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "8px 0", borderBottom: i < historial.length - 1 ? `1px solid ${C.border}` : "none", fontSize: 13
            }}>
              <div>
                <div style={{ fontWeight: 500 }}>{h.tipo}</div>
                <div style={{ color: C.textMuted, fontSize: 12 }}>{h.ref}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <span className={`badge ${h.ok ? "b-green" : "b-red"}`}>{h.ok ? "OK" : "Alerta"}</span>
                <div style={{ color: C.textMuted, fontSize: 11, marginTop: 3 }}>{h.hora}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
