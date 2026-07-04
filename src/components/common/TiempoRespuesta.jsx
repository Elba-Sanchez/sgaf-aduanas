import { C } from "../../theme.js";

export function TiempoRespuesta({ ms }) {
  if (ms == null) return null;
  const ok = ms < 3000;
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11,
      color: ok ? C.success : C.danger, background: ok ? C.successBg : C.dangerBg, padding: "4px 10px", borderRadius: 99, marginTop: 8
    }}>
      ⚡ Tiempo de respuesta: <strong>{(ms / 1000).toFixed(2)}s</strong> {ok ? "(cumple RNF-R-01 < 3s)" : "(excede umbral)"}
    </div>
  );
}
