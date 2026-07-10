import { useState, useEffect } from "react";
import { C } from "../../theme.js";

export function AuditoriaView({ logs }) {
  const [search, setSearch] = useState("");
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchLogs = async () => {
    const token = sessionStorage.getItem("token");
    const userId = sessionStorage.getItem("userId");
    const userRol = sessionStorage.getItem("userRol");

    if (token) {
      setLoading(true);
      try {
        const desde = new Date();
        desde.setDate(desde.getDate() - 30);
        const desdeStr = desde.toISOString();

        const response = await fetch(`/api/auditoria/eventos?desde=${encodeURIComponent(desdeStr)}&size=100`, {
          headers: {
            "Authorization": `Bearer ${token}`,
            "X-User-Id": userId,
            "X-User-Rol": userRol,
          }
        });
        if (response.ok) {
          const res = await response.json();
          const mapped = res.data.eventos.map((evt, idx) => ({
            id: idx + 1,
            timestamp: new Date(evt.timestamp).toLocaleString("es-CL"),
            usuario: `${evt.usuario_rol} (${evt.usuario_id || "sistema"})`,
            accion: `${evt.accion} en ${evt.entidad}: ${evt.detalle || ""}`,
          }));
          setList(mapped);
          return;
        }
      } catch (err) {
        console.warn("Error cargando eventos de auditoría del backend, usando fallback local...", err);
      } finally {
        setLoading(false);
      }
    }
    setList(logs);
  };

  useEffect(() => {
    fetchLogs();
  }, [logs]);

  const filtered = list.filter(log => {
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    return (
      String(log.id).includes(term) ||
      log.timestamp.toLowerCase().includes(term) ||
      log.usuario.toLowerCase().includes(term) ||
      log.accion.toLowerCase().includes(term)
    );
  });

  return (
    <div className="fade">
      <div className="stitle">🔐 Auditoría del Sistema</div>
      <div className="ssub">
        Registro histórico de acciones realizadas por los usuarios
      </div>
      <div className="card">
        <div style={{ display: 'flex', gap: 10, marginBottom: 16, alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Buscar por ID, fecha, usuario o acción..."
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
              <th style={{ width: 60 }}>ID</th>
              <th>Fecha y Hora</th>
              <th>Usuario</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length > 0 ? (
              filtered.map(log => (
                <tr key={log.id}>
                  <td>{log.id}</td>
                  <td>{log.timestamp}</td>
                  <td>{log.usuario}</td>
                  <td>{log.accion}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', padding: 20, color: C.textMuted }}>
                  No se encontraron registros de auditoría.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div style={{ marginTop: 12, fontSize: 13, color: C.textMuted }}>
          Mostrando {filtered.length} de {list.length} registros
        </div>
      </div>
    </div>
  );
}
