// theme.js — Paleta de colores y estilos globales de la aplicación SGAF

export const C = {
  navy: "#1B3A6B",
  navyLight: "#2D5BA3",
  gold: "#C8A84B",
  bg: "#F4F6FA",
  white: "#ffffff",
  success: "#1A7A4A",
  successBg: "#E8F5EE",
  danger: "#B91C1C",
  dangerBg: "#FEE2E2",
  warning: "#B45309",
  warningBg: "#FEF3C7",
  info: "#1D4ED8",
  infoBg: "#EFF6FF",
  border: "#D1D9E6",
  textPrimary: "#111827",
  textSec: "#6B7280",
  textMuted: "#9CA3AF",
};

export const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Source+Serif+4:wght@400;600&family=DM+Sans:wght@400;500;600&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'DM Sans', sans-serif; background: ${C.bg}; color: ${C.textPrimary}; min-height: 100vh; }
  input, select, textarea, button { font-family: inherit; font-size: 14px; }
  button { cursor: pointer; }
  .fade { animation: fadeIn 0.25s ease; }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
  .pulse { animation: pulse 2s infinite; }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.45} }
  .badge { display:inline-flex;align-items:center;gap:4px;padding:2px 9px;border-radius:99px;font-size:11px;font-weight:500; }
  .b-green { background:${C.successBg};color:${C.success}; }
  .b-red   { background:${C.dangerBg};color:${C.danger}; }
  .b-yellow{ background:${C.warningBg};color:${C.warning}; }
  .b-blue  { background:${C.infoBg};color:${C.info}; }
  .b-gray  { background:#F3F4F6;color:#374151; }
  input[type=text],input[type=password],input[type=date],input[type=number],input[type=email],select,textarea {
    width:100%;padding:9px 12px;border:1px solid ${C.border};border-radius:8px;background:#fff;color:${C.textPrimary};
    outline:none;transition:border-color 0.2s;
  }
  input:focus,select:focus,textarea:focus{border-color:${C.navyLight};box-shadow:0 0 0 3px rgba(45,91,163,0.1);}
  .btn{display:inline-flex;align-items:center;gap:6px;padding:9px 18px;border-radius:8px;font-size:14px;font-weight:500;border:none;
  transition:all 0.15s;}
  .btn:active{transform:scale(0.97);}
  .btn-primary{background:${C.navy};color:#fff;} .btn-primary:hover{background:${C.navyLight};}
  .btn-sec{background:#fff;color:${C.navy};border:1px solid ${C.border};} .btn-sec:hover{background:${C.bg};}
  .btn-success{background:${C.success};color:#fff;}
  .btn-danger{background:${C.danger};color:#fff;}
  .btn-gold{background:${C.gold};color:#fff;}
  .btn-sm{padding:6px 12px;font-size:13px;}
  .card{background:#fff;border-radius:12px;border:1px solid ${C.border};padding:20px;}
  .nav-item{display:flex;align-items:center;gap:10px;padding:9px 13px;border-radius:8px;cursor:pointer;font-size:14px;color:${C.textSec};
  transition:all 0.15s;border:none;background:none;width:100%;text-align:left;}
  .nav-item:hover{background:${C.bg};color:${C.textPrimary};}
  .nav-item.active{background:${C.navy};color:#fff;font-weight:500;}
  .stitle{font-size:20px;font-weight:600;color:${C.textPrimary};margin-bottom:4px;}
  .ssub{font-size:14px;color:${C.textSec};margin-bottom:20px;}
  .flabel{font-size:13px;font-weight:500;color:${C.textSec};margin-bottom:5px;display:block;}
  .fgroup{margin-bottom:15px;}
  .g2{display:grid;grid-template-columns:1fr 1fr;gap:16px;}
  .g3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;}
  .g4{display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:12px;}
  @media(max-width:640px){.g2,.g3,.g4{grid-template-columns:1fr;}}
  .semaforo{width:18px;height:18px;border-radius:50%;display:inline-block;}
  .s-verde{background:#22C55E;box-shadow:0 0 7px #22C55E88;}
  .s-rojo{background:#EF4444;box-shadow:0 0 7px #EF444488;}
  table{width:100%;border-collapse:collapse;font-size:13px;}
  th{padding:9px 12px;text-align:left;font-weight:600;color:${C.textSec};border-bottom:1px solid ${C.border};background:${C.bg};}
  td{padding:9px 12px;border-bottom:1px solid ${C.border};}
  tr:last-child td{border-bottom:none;}
  tr:hover td{background:#FAFBFE;}
`;
