import { useState } from "react";
import { C } from "../../theme.js";

export function SolicitudesView({ solicitudes, setSolicitudes, onToast }) {
  const [search, setSearch] = useState("");

  const filtered = solicitudes.filter(sol => {
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    return (
      sol.id.toLowerCase().includes(term) ||
      sol.tipo.toLowerCase().includes(term) ||
      sol.solicitante.toLowerCase().includes(term) ||
      sol.identificacion.toLowerCase().includes(term) ||
      sol.estado.toLowerCase().includes(term) ||
      sol.fecha.toLowerCase().includes(term)
    );
  });

  const cambiarEstado = (id, nuevoEstado) => {
    setSolicitudes(prev =>
      prev.map(sol => (sol.id === id ? { ...sol, estado: nuevoEstado } : sol))
    );
    onToast(`Solicitud ${id} marcada como "${nuevoEstado}".`, "success");
  };

  const estadoBadge = (estado) => {
    switch (estado) {
      case "Pendiente": return <span className="badge b-yellow">⏳ Pendiente</span>;
      case "Aprobado": return <span className="badge b-green">✅ Aprobado</span>;
      case "Rechazado": return <span className="badge b-red">❌ Rechazado</span>;
      default: return <span className="badge b-gray">{estado}</span>;
    }
  };

  return (
    <div className="fade">
      <div className="stitle">📋 Gestión de Solicitudes</div>
      <div className="ssub">Administra las solicitudes de trámites del sistema</div>
      <div className="card">
        <div style={{ display: 'flex', gap: 10, marginBottom: 16, alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Buscar por ID, tipo, solicitante, identificación..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ flex: 1 }}
          />
          <button className="btn btn-sec btn-sm" onClick={() => setSearch('')}>
            Limpiar filtros
          </button>
        </div>

        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Tipo</th>
              <th>Solicitante</th>
              <th>Identificación</th>
              <th>Estado</th>
              <th>Fecha</th>
              <th style={{ width: 160 }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length > 0 ? (
              filtered.map(sol => (
                <tr key={sol.id}>
                  <td style={{ fontFamily: 'monospace' }}>{sol.id}</td>
                  <td>{sol.tipo}</td>
                  <td>{sol.solicitante}</td>
                  <td>{sol.identificacion}</td>
                  <td>{estadoBadge(sol.estado)}</td>
                  <td>{sol.fecha}</td>
                  <td>
                    {sol.estado === "Pendiente" && (
                      <div style={{ display: "flex", gap: 6 }}>
                        <button className="btn btn-success btn-sm" onClick={() => cambiarEstado(sol.id, "Aprobado")}>
                          Aprobar
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => cambiarEstado(sol.id, "Rechazado")}>
                          Rechazar
                        </button>
                      </div>
                    )}
                    {sol.estado !== "Pendiente" && (
                      <span style={{ color: C.textMuted, fontSize: 12 }}>Sin acciones</span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: 20, color: C.textMuted }}>
                  No se encontraron solicitudes con ese criterio.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div style={{ marginTop: 12, fontSize: 13, color: C.textMuted }}>
          Mostrando {filtered.length} de {solicitudes.length} solicitudes
        </div>
      </div>
    </div>
  );
}
