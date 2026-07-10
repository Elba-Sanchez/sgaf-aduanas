import { ACCESO_PERMITIDO } from "./auth/rbac.js";
import { AccesoDenegado } from "./components/common/AccesoDenegado.jsx";
import { C } from "./theme.js";

import { PasajeroHome } from "./views/pasajero/PasajeroHome.jsx";
import { SagForm } from "./views/pasajero/SagForm.jsx";
import { MenoresForm } from "./views/pasajero/MenoresForm.jsx";
import { VehiculoSalida } from "./views/pasajero/VehiculoSalida.jsx";

import { FuncionarioPanel } from "./views/funcionario/FuncionarioPanel.jsx";
import { VehiculoIngreso } from "./views/funcionario/VehiculoIngreso.jsx";

import { PDIControl } from "./views/shared/PDIControl.jsx";
import { LectorControl } from "./views/shared/LectorControl.jsx";
import { AyudaView } from "./views/shared/AyudaView.jsx";

import { AdminDashboard } from "./views/admin/AdminDashboard.jsx";
import { SolicitudesView } from "./views/admin/SolicitudesView.jsx";
import { GestionUsuarios } from "./views/admin/GestionUsuarios.jsx";
import { AuditoriaView } from "./views/admin/AuditoriaView.jsx";
import { ReportesView } from "./views/admin/ReportesView.jsx";

// Este componente centraliza el ruteo entre vistas y aplica el control de
// acceso por roles (RBAC) de forma independiente al menú lateral: aunque
// el menú oculte una opción, esta verificación evita el acceso directo.
export function ViewRouter({ view, user, onNav, onToast, appState }) {
  const { usuarios, setUsuarios, solicitudes, setSolicitudes, auditLogs } = appState;

  const permitido = ACCESO_PERMITIDO[user.role] || [];
  if (!permitido.includes(view)) {
    return <AccesoDenegado view={view} role={user.role} />;
  }

  switch (view) {
    case "pasajero": return <PasajeroHome user={user} onNav={onNav} />;
    case "sag": return <SagForm user={user} onToast={onToast} />;
    case "menores": return <MenoresForm user={user} setSolicitudes={setSolicitudes} onToast={onToast} />;
    case "vehiculo_salida": return <VehiculoSalida user={user} setSolicitudes={setSolicitudes} onToast={onToast} />;

    case "funcionario": return <FuncionarioPanel user={user} onNav={onNav} solicitudes={solicitudes} setSolicitudes={setSolicitudes} onToast={onToast} />;
    case "vehiculo_ingreso": return <VehiculoIngreso onToast={onToast} />;
    case "pdi": return <PDIControl onToast={onToast} />;
    case "lector": return <LectorControl onToast={onToast} />;

    case "admin": return <AdminDashboard onNav={onNav} />;
    case "solicitudes": return <SolicitudesView solicitudes={solicitudes} setSolicitudes={setSolicitudes} onToast={onToast} />;
    case "usuarios": return <GestionUsuarios usuarios={usuarios} setUsuarios={setUsuarios} onToast={onToast} />;
    case "auditoria": return <AuditoriaView logs={auditLogs} />;
    case "reportes": return <ReportesView onToast={onToast} />;

    case "ayuda": return <AyudaView />;

    default: return <div style={{ padding: 20, color: C.textSec }}>Vista no encontrada.</div>;
  }
}
