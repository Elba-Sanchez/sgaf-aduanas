import { C } from "../../theme.js";

export function ProgressBar({ value, color }) {
  return (
    <div style={{ background: C.border, borderRadius: 99, height: 7, width: "100%" }}>
      <div style={{ background: color || C.navy, borderRadius: 99, height: 7, width: `${value}%`, transition: "width 0.6s ease" }} />
    </div>
  );
}
