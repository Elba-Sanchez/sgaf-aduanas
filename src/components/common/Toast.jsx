import { useEffect } from "react";
import { C } from "../../theme.js";

export function Toast({ msg, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);

  const bg = { success: C.successBg, error: C.dangerBg, info: C.infoBg, warning: C.warningBg };
  const co = { success: C.success, error: C.danger, info: C.info, warning: C.warning };

  return (
    <div
      style={{
        position: "fixed", top: 20, right: 20, zIndex: 999, background: bg[type] || C.infoBg, color: co[type] || C.info,
        border: `1px solid ${co[type] || C.info}30`,
        borderRadius: 10, padding: "12px 18px", fontSize: 14, fontWeight: 500, maxWidth: 320, boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
        animation: "fadeIn 0.3s ease"
      }}
    >
      {msg}
    </div>
  );
}
