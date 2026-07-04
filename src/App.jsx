import { useState } from "react";
import { CSS } from "./theme.js";
import { DEFAULT_VIEW_BY_ROLE } from "./auth/rbac.js";
import { USUARIOS_INIT, SOLICITUDES_INIT, AUDIT_INIT } from "./data/initialData.js";

import { LoginView } from "./auth/LoginView.jsx";
import { AppShell } from "./components/layout/AppShell.jsx";
import { Toast } from "./components/common/Toast.jsx";
import { ViewRouter } from "./ViewRouter.jsx";

export default function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState(null);
  const [toast, setToast] = useState(null);

  // Estado compartido (CRUDs) — vive aquí porque varias vistas de admin lo leen/escriben
  const [usuarios, setUsuarios] = useState(USUARIOS_INIT);
  const [solicitudes, setSolicitudes] = useState(SOLICITUDES_INIT);
  const [auditLogs] = useState(AUDIT_INIT);

  const showToast = (msg, type = "info") => setToast({ msg, type });

  const handleLogin = (u) => {
    setUser(u);
    setView(DEFAULT_VIEW_BY_ROLE[u.role] || "pasajero");
  };

  const handleLogout = () => { setUser(null); setView(null); };

  if (!user) return (
    <>
      <style>{CSS}</style>
      <LoginView onLogin={handleLogin} />
    </>
  );

  return (
    <>
      <style>{CSS}</style>
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      <AppShell user={user} currentView={view} onNav={setView} onLogout={handleLogout}>
        <ViewRouter
          view={view}
          user={user}
          onNav={setView}
          onToast={showToast}
          appState={{ usuarios, setUsuarios, solicitudes, setSolicitudes, auditLogs }}
        />
      </AppShell>
    </>
  );
}
