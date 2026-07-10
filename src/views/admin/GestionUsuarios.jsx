import { useState, useEffect } from "react";
import { C } from "../../theme.js";

const ROLES_DISPONIBLES = ["Administrador", "Funcionario", "Funcionario PDI"];

export function GestionUsuarios({ usuarios, setUsuarios, onToast }) {
  const [search, setSearch] = useState("");
  const [editando, setEditando] = useState(null); // null = no se edita, objeto con datos del usuario o nuevo
  const [form, setForm] = useState({ nombre: "", run: "", rol: "", aduana: "", correo: "" });
  const [modo, setModo] = useState("crear"); // "crear" o "editar"
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchUsuarios = async () => {
    const token = sessionStorage.getItem("token");
    const userId = sessionStorage.getItem("userId");
    const userRol = sessionStorage.getItem("userRol");

    if (token) {
      setLoading(true);
      try {
        const response = await fetch("/api/usuarios", {
          headers: {
            "Authorization": `Bearer ${token}`,
            "X-User-Id": userId,
            "X-User-Rol": userRol,
          }
        });
        if (response.ok) {
          const res = await response.json();
          const mapped = res.data.map(u => ({
            id: u.id,
            nombre: u.nombre,
            run: u.run,
            rol: u.rol === "ADMINISTRADOR" ? "Administrador" : u.rol === "FUNCIONARIO" ? "Funcionario" : u.rol === "PDI" ? "Funcionario PDI" : "Pasajero",
            aduana: u.aduana === "LOS_LIBERTADORES" ? "Los Libertadores" : u.aduana === "PINO_HACHADO" ? "Pino Hachado" : u.aduana === "CARDENAL_SAMORE" ? "Cardenal Samoré" : (u.aduana || "—"),
            correo: u.correo,
            activo: u.activo
          }));
          setList(mapped);
          return;
        }
      } catch (err) {
        console.warn("Error cargando usuarios del backend, usando fallback local...", err);
      } finally {
        setLoading(false);
      }
    }
    setList(usuarios);
  };

  useEffect(() => {
    fetchUsuarios();
  }, [usuarios]);

  const filtered = list.filter(u => {
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    return (
      String(u.id).includes(term) ||
      u.nombre.toLowerCase().includes(term) ||
      u.run.toLowerCase().includes(term) ||
      u.rol.toLowerCase().includes(term) ||
      u.aduana.toLowerCase().includes(term) ||
      u.correo.toLowerCase().includes(term)
    );
  });

  const iniciarCrear = () => {
    setForm({ nombre: "", run: "", rol: "", aduana: "", correo: "" });
    setModo("crear");
    setEditando({});
  };

  const iniciarEditar = (user) => {
    setForm({ nombre: user.nombre, run: user.run, rol: user.rol, aduana: user.aduana, correo: user.correo });
    setModo("editar");
    setEditando(user);
  };

  const cancelar = () => {
    setEditando(null);
    setForm({ nombre: "", run: "", rol: "", aduana: "", correo: "" });
  };

  const guardarUsuario = async () => {
    if (!form.nombre.trim() || !form.run.trim() || !form.rol || !form.aduana.trim() || !form.correo.trim()) {
      onToast("Completa todos los campos obligatorios.", "error");
      return;
    }

    const token = sessionStorage.getItem("token");
    const userId = sessionStorage.getItem("userId");
    const userRol = sessionStorage.getItem("userRol");

    const rolEnum = form.rol === "Administrador" ? "ADMINISTRADOR" : form.rol === "Funcionario" ? "FUNCIONARIO" : "PDI";
    const aduanaEnum = form.aduana.toLowerCase().includes("libertadores") ? "LOS_LIBERTADORES" : form.aduana.toLowerCase().includes("hachado") ? "PINO_HACHADO" : "CARDENAL_SAMORE";

    if (token) {
      setLoading(true);
      try {
        if (modo === "crear") {
          const payload = {
            run: form.run.trim(),
            nombre: form.nombre.trim(),
            correo: form.correo.trim(),
            password: "password123", // Clave por defecto
            rol: rolEnum,
            aduana: aduanaEnum
          };

          const response = await fetch("/api/usuarios", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`,
              "X-User-Id": userId,
              "X-User-Rol": userRol,
            },
            body: JSON.stringify(payload)
          });

          if (!response.ok) {
            const errRes = await response.json().catch(() => ({}));
            throw new Error(errRes.error?.message || "Error al crear el usuario.");
          }

          onToast(`Usuario ${form.nombre} creado exitosamente.`, "success");
        } else {
          const payload = {
            run: form.run.trim(),
            nombre: form.nombre.trim(),
            correo: form.correo.trim(),
            rol: rolEnum,
            aduana: aduanaEnum,
            activo: editando.activo !== false
          };

          const response = await fetch(`/api/usuarios/${editando.id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`,
              "X-User-Id": userId,
              "X-User-Rol": userRol,
            },
            body: JSON.stringify(payload)
          });

          if (!response.ok) {
            const errRes = await response.json().catch(() => ({}));
            throw new Error(errRes.error?.message || "Error al actualizar el usuario.");
          }

          onToast(`Usuario ${form.nombre} actualizado.`, "success");
        }
        fetchUsuarios();
        cancelar();
        return;
      } catch (err) {
        onToast(err.message, "error");
        return;
      } finally {
        setLoading(false);
      }
    }

    // Fallback local
    if (modo === "crear") {
      const nuevoId = Math.max(...usuarios.map(u => u.id), 0) + 1;
      const nuevo = {
        id: nuevoId,
        nombre: form.nombre.trim(),
        run: form.run.trim(),
        rol: form.rol,
        aduana: form.aduana.trim(),
        correo: form.correo.trim(),
      };
      setUsuarios(prev => [...prev, nuevo]);
      onToast(`Usuario ${nuevo.nombre} creado exitosamente.`, "success");
    } else {
      setUsuarios(prev =>
        prev.map(u =>
          u.id === editando.id
            ? { ...u, nombre: form.nombre.trim(), run: form.run.trim(), rol: form.rol, aduana: form.aduana.trim(), correo: form.correo.trim() }
            : u
        )
      );
      onToast(`Usuario ${form.nombre} actualizado.`, "success");
    }
    cancelar();
  };

  const eliminarUsuario = async (user) => {
    if (!window.confirm(`¿Eliminar al usuario ${user.nombre} (${user.run})?`)) return;

    const token = sessionStorage.getItem("token");
    const userId = sessionStorage.getItem("userId");
    const userRol = sessionStorage.getItem("userRol");

    if (token) {
      try {
        const response = await fetch(`/api/usuarios/${user.id}`, {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${token}`,
            "X-User-Id": userId,
            "X-User-Rol": userRol,
          }
        });

        if (!response.ok) {
          const errRes = await response.json().catch(() => ({}));
          throw new Error(errRes.error?.message || "Error al eliminar el usuario.");
        }

        onToast(`Usuario ${user.nombre} eliminado.`, "info");
        fetchUsuarios();
        return;
      } catch (err) {
        onToast(err.message, "error");
        return;
      }
    }

    // Fallback local
    setUsuarios(prev => prev.filter(u => u.id !== user.id));
    onToast(`Usuario ${user.nombre} eliminado.`, "info");
  };

  return (
    <div className="fade">
      <div className="stitle">👥 Gestión de Usuarios</div>
      <div className="ssub">Administra las cuentas de los funcionarios del sistema</div>

      <div className="card">
        <div style={{ display: 'flex', gap: 10, marginBottom: 16, alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Buscar por ID, nombre, RUN, rol, aduana o correo..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ flex: 1 }}
          />
          <button className="btn btn-sec btn-sm" onClick={() => setSearch('')}>
            Limpiar
          </button>
          <button className="btn btn-primary btn-sm" onClick={iniciarCrear}>
            + Agregar usuario
          </button>
        </div>

        <table>
          <thead>
            <tr>
              <th style={{ width: 50 }}>ID</th>
              <th>Nombre</th>
              <th>RUN</th>
              <th>Rol</th>
              <th>Aduana</th>
              <th>Correo</th>
              <th style={{ width: 120 }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length > 0 ? (
              filtered.map(u => (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td>{u.nombre}</td>
                  <td>{u.run}</td>
                  <td>{u.rol}</td>
                  <td>{u.aduana}</td>
                  <td>{u.correo}</td>
                  <td>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button className="btn btn-sec btn-sm" onClick={() => iniciarEditar(u)}>Editar</button>
                      <button className="btn btn-danger btn-sm" onClick={() => eliminarUsuario(u)}>Eliminar</button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: 20, color: C.textMuted }}>
                  No se encontraron usuarios con ese criterio.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <div style={{ marginTop: 12, fontSize: 13, color: C.textMuted }}>
          {filtered.length} de {list.length} usuarios
        </div>
      </div>

      {editando !== null && (
        <div className="card fade" style={{ marginTop: 20 }}>
          <div style={{ fontWeight: 600, marginBottom: 14 }}>
            {modo === "crear" ? "Nuevo usuario" : `Editando: ${editando.nombre}`}
          </div>
          <div className="g2">
            <div className="fgroup">
              <label className="flabel">Nombre completo *</label>
              <input type="text" placeholder="Nombre y apellido" value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} />
            </div>
            <div className="fgroup">
              <label className="flabel">RUN *</label>
              <input type="text" placeholder="12.345.678-9" value={form.run} onChange={e => setForm(f => ({ ...f, run: e.target.value }))} />
            </div>
            <div className="fgroup">
              <label className="flabel">Rol *</label>
              <select value={form.rol} onChange={e => setForm(f => ({ ...f, rol: e.target.value }))}>
                <option value="">Seleccionar rol...</option>
                {ROLES_DISPONIBLES.map(rol => (
                  <option key={rol} value={rol}>{rol}</option>
                ))}
              </select>
            </div>
            <div className="fgroup">
              <label className="flabel">Aduana *</label>
              <input type="text" placeholder="Los Libertadores" value={form.aduana} onChange={e => setForm(f => ({ ...f, aduana: e.target.value }))} />
            </div>
            <div className="fgroup" style={{ gridColumn: "1 / -1" }}>
              <label className="flabel">Correo electrónico *</label>
              <input type="email" placeholder="usuario@aduana.cl" value={form.correo} onChange={e => setForm(f => ({ ...f, correo: e.target.value }))} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
            <button className="btn btn-primary" onClick={guardarUsuario}>
              {modo === "crear" ? "Crear usuario" : "Guardar cambios"}
            </button>
            <button className="btn btn-sec" onClick={cancelar}>Cancelar</button>
          </div>
        </div>
      )}
    </div>
  );
}
