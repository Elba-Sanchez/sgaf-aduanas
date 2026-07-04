import { C } from "../../theme.js";

export function Spinner() {
  return <span className="pulse" style={{ color: C.textMuted }}> Procesando...</span>;
}
