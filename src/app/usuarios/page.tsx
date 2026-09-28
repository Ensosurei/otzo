'use client';

import { useEffect, useState, useMemo } from 'react';
import { fetchTiDB } from '@/lib/tidb-client';
import { Usuario, RolUsuario } from '@/types';
import { UserPlus, Shield, CheckCircle2, XCircle, RefreshCw, Pencil, Trash2, X, Check, KeyRound, AlertCircle, Search, Filter } from 'lucide-react';

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Estados de Búsqueda y Filtro por Rol
  const [busqueda, setBusqueda] = useState('');
  const [filtroRol, setFiltroRol] = useState<string>('TODOS');

  // Formulario para nuevo usuario
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rol, setRol] = useState<RolUsuario>('Capturista');
  const [guardando, setGuardando] = useState(false);
  const [errorForm, setErrorForm] = useState<string | null>(null);

  // Estado para edición
  const [usuarioEditando, setUsuarioEditando] = useState<Usuario | null>(null);
  const [editNombre, setEditNombre] = useState('');
  const [editCorreo, setEditCorreo] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editRol, setEditRol] = useState<RolUsuario>('Capturista');
  const [editEstado, setEditEstado] = useState<'Activo' | 'Inactivo'>('Activo');
  const [actualizando, setActualizando] = useState(false);
  const [errorEditForm, setErrorEditForm] = useState<string | null>(null);

  const cargarUsuarios = async () => {
    setCargando(true);
    setError(null);
    try {
      const data = await fetchTiDB<Usuario[]>('/usuarios');
      setUsuarios(data);
    } catch (err: any) {
      setError(err.message || 'Error al obtener usuarios');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const esCorreoValido = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // Filtrado de usuarios según búsqueda de coincidencias y rol seleccionado
  const usuariosFiltrados = useMemo(() => {
    return usuarios.filter((u) => {
      const termino = busqueda.toLowerCase().trim();
      const coincideTexto =
        !termino ||
        u.nombre.toLowerCase().includes(termino) ||
        u.username.toLowerCase().includes(termino) ||
        u.correo.toLowerCase().includes(termino);

      const coincideRol = filtroRol === 'TODOS' || u.rol === filtroRol;

      return coincideTexto && coincideRol;
    });
  }, [usuarios, busqueda, filtroRol]);

  const handleCrear = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorForm(null);

    if (!nombre.trim() || !correo.trim() || !username.trim() || !password.trim()) {
      setErrorForm('Todos los campos son obligatorios.');
      return;
    }

    if (!esCorreoValido(correo.trim())) {
      setErrorForm('Por favor, ingresa un correo electrónico válido.');
      return;
    }

    if (password.length < 6) {
      setErrorForm('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setGuardando(true);
    try {
      await fetchTiDB('/usuarios', {
        method: 'POST',
        body: JSON.stringify({
          nombre: nombre.trim(),
          correo: correo.trim(),
          username: username.trim(),
          password: password,
          rol,
          estado: 'Activo'
        }),
      });
      setNombre('');
      setCorreo('');
      setUsername('');
      setPassword('');
      setErrorForm(null);
      cargarUsuarios();
    } catch (err: any) {
      setErrorForm(err.message || 'Error al guardar el usuario.');
    } finally {
      setGuardando(false);
    }
  };

  const abrirEdicion = (u: Usuario) => {
    setUsuarioEditando(u);
    setEditNombre(u.nombre);
    setEditCorreo(u.correo);
    setEditUsername(u.username);
    setEditPassword('');
    setEditRol(u.rol);
    setEditEstado(u.estado || 'Activo');
    setErrorEditForm(null);
  };

  const handleActualizar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usuarioEditando) return;
    setErrorEditForm(null);

    if (!editNombre.trim() || !editCorreo.trim() || !editUsername.trim()) {
      setErrorEditForm('Nombre, correo y username no pueden estar vacíos.');
      return;
    }

    if (!esCorreoValido(editCorreo.trim())) {
      setErrorEditForm('Por favor, ingresa un correo electrónico válido.');
      return;
    }

    if (editPassword && editPassword.length < 6) {
      setErrorEditForm('Si cambias la contraseña, debe tener al menos 6 caracteres.');
      return;
    }

    setActualizando(true);
    try {
      const bodyData: any = {
        nombre: editNombre.trim(),
        correo: editCorreo.trim(),
        username: editUsername.trim(),
        rol: editRol,
        estado: editEstado,
      };

      if (editPassword.trim() !== '') {
        bodyData.password = editPassword;
      }

      await fetchTiDB(`/usuarios/${usuarioEditando.id}`, {
        method: 'PUT',
        body: JSON.stringify(bodyData),
      });
      setUsuarioEditando(null);
      cargarUsuarios();
    } catch (err: any) {
      setErrorEditForm(err.message || 'Error al actualizar usuario.');
    } finally {
      setActualizando(false);
    }
  };

  const handleEliminar = async (id: number | string, nombreUsuario: string) => {
    if (!confirm(`¿Estás seguro de que deseas eliminar al usuario "${nombreUsuario}"?`)) {
      return;
    }
    try {
      await fetchTiDB(`/usuarios/${id}`, {
        method: 'DELETE',
      });
      cargarUsuarios();
    } catch (err: any) {
      alert('Error al eliminar usuario: ' + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#332f2e] text-[#f2e9e4] p-6 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Encabezado */}
        <div className="flex justify-between items-center border-b border-[#775040] pb-4">
          <div>
            <h1 className="text-2xl font-bold text-[#d48b5e] flex items-center gap-2">
              <Shield className="w-6 h-6 text-[#c8c88d]" /> Control de Usuarios
            </h1>
            <p className="text-sm text-[#c8c88d] opacity-80 mt-1">
              Gestión de accesos, credenciales y permisos del sistema otzo_db
            </p>
          </div>
          <button
            onClick={cargarUsuarios}
            className="flex items-center gap-2 text-sm bg-[#52644f] hover:bg-[#52644f]/80 text-[#f2e9e4] px-4 py-2 rounded-lg transition"
          >
            <RefreshCw className={`w-4 h-4 ${cargando ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
        </div>

        {/* Barra de Búsqueda de Coincidencias y Filtro por Rol */}
        <div className="bg-[#423b3a] border border-[#775040] p-4 rounded-xl shadow-lg flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-2/3">
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por nombre, usuario (@username) o correo..."
              className="w-full rounded-lg bg-[#332f2e] border border-[#775040] pl-9 pr-3 py-2 text-sm text-[#f2e9e4] focus:outline-none focus:border-[#d48b5e]"
            />
            <Search className="w-4 h-4 text-[#c8c88d] absolute left-3 top-2.5 opacity-60" />
            {busqueda && (
              <button
                onClick={() => setBusqueda('')}
                className="absolute right-3 top-2.5 text-xs text-[#c8c88d] hover:text-[#f2e9e4]"
              >
                Limpiar
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <Filter className="w-4 h-4 text-[#c8c88d]" />
            <select
              value={filtroRol}
              onChange={(e) => setFiltroRol(e.target.value)}
              className="w-full md:w-auto rounded-lg bg-[#332f2e] border border-[#775040] px-3 py-2 text-sm text-[#f2e9e4] focus:outline-none focus:border-[#d48b5e]"
            >
              <option value="TODOS">Todos los Roles</option>
              <option value="Administrador">Administrador</option>
              <option value="Capturista">Capturista</option>
              <option value="Auditor">Auditor</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Formulario de registro / edición */}
          <div className="bg-[#423b3a] border border-[#775040] p-6 rounded-xl shadow-lg h-fit">
            {usuarioEditando ? (
              <>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold flex items-center gap-2 text-[#d48b5e]">
                    <Pencil className="w-5 h-5 text-[#c8c88d]" /> Editar Usuario
                  </h2>
                  <button
                    onClick={() => setUsuarioEditando(null)}
                    className="text-[#c8c88d] hover:text-[#f2e9e4] p-1"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {errorEditForm && (
                  <div className="mb-4 p-3 bg-red-950/60 border border-red-800/80 rounded-lg text-xs text-red-200 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorEditForm}</span>
                  </div>
                )}

                <form onSubmit={handleActualizar} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#c8c88d] uppercase mb-1">Nombre</label>
                    <input
                      type="text"
                      value={editNombre}
                      onChange={(e) => setEditNombre(e.target.value)}
                      className="w-full rounded-lg bg-[#332f2e] border border-[#775040] px-3 py-2 text-sm text-[#f2e9e4] focus:outline-none focus:border-[#d48b5e]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#c8c88d] uppercase mb-1">Correo</label>
                    <input
                      type="email"
                      value={editCorreo}
                      onChange={(e) => setEditCorreo(e.target.value)}
                      className="w-full rounded-lg bg-[#332f2e] border border-[#775040] px-3 py-2 text-sm text-[#f2e9e4] focus:outline-none focus:border-[#d48b5e]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#c8c88d] uppercase mb-1">Username</label>
                    <input
                      type="text"
                      value={editUsername}
                      onChange={(e) => setEditUsername(e.target.value)}
                      className="w-full rounded-lg bg-[#332f2e] border border-[#775040] px-3 py-2 text-sm text-[#f2e9e4] focus:outline-none focus:border-[#d48b5e]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#c8c88d] uppercase mb-1">
                      Nueva Contraseña <span className="text-[10px] text-[#c8c88d]/60 font-normal">(Opcional)</span>
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        value={editPassword}
                        onChange={(e) => setEditPassword(e.target.value)}
                        className="w-full rounded-lg bg-[#332f2e] border border-[#775040] px-3 py-2 pl-9 text-sm text-[#f2e9e4] focus:outline-none focus:border-[#d48b5e]"
                        placeholder="Dejar en blanco para conservar"
                      />
                      <KeyRound className="w-4 h-4 text-[#c8c88d] absolute left-2.5 top-2.5 opacity-60" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#c8c88d] uppercase mb-1">Rol</label>
                    <select
                      value={editRol}
                      onChange={(e) => setEditRol(e.target.value as RolUsuario)}
                      className="w-full rounded-lg bg-[#332f2e] border border-[#775040] px-3 py-2 text-sm text-[#f2e9e4] focus:outline-none focus:border-[#d48b5e]"
                    >
                      <option value="Administrador">Administrador</option>
                      <option value="Capturista">Capturista</option>
                      <option value="Auditor">Auditor</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#c8c88d] uppercase mb-1">Estado</label>
                    <select
                      value={editEstado}
                      onChange={(e) => setEditEstado(e.target.value as 'Activo' | 'Inactivo')}
                      className="w-full rounded-lg bg-[#332f2e] border border-[#775040] px-3 py-2 text-sm text-[#f2e9e4] focus:outline-none focus:border-[#d48b5e]"
                    >
                      <option value="Activo">Activo</option>
                      <option value="Inactivo">Inactivo</option>
                    </select>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button
                      type="submit"
                      disabled={actualizando}
                      className="flex-1 bg-[#d48b5e] hover:bg-[#d48b5e]/80 text-[#332f2e] font-bold py-2 rounded-lg text-sm transition disabled:opacity-50 flex justify-center items-center gap-1"
                    >
                      <Check className="w-4 h-4" /> {actualizando ? 'Guardando...' : 'Actualizar'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setUsuarioEditando(null)}
                      className="bg-[#332f2e] hover:bg-[#332f2e]/70 text-[#c8c88d] font-semibold py-2 px-3 rounded-lg text-sm transition border border-[#775040]"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <>
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-[#d48b5e]">
                  <UserPlus className="w-5 h-5 text-[#c8c88d]" /> Registrar Usuario
                </h2>

                {errorForm && (
                  <div className="mb-4 p-3 bg-red-950/60 border border-red-800/80 rounded-lg text-xs text-red-200 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorForm}</span>
                  </div>
                )}

                <form onSubmit={handleCrear} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#c8c88d] uppercase mb-1">Nombre</label>
                    <input
                      type="text"
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      className="w-full rounded-lg bg-[#332f2e] border border-[#775040] px-3 py-2 text-sm text-[#f2e9e4] focus:outline-none focus:border-[#d48b5e]"
                      placeholder="Ej. Carlos Mendoza"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#c8c88d] uppercase mb-1">Correo</label>
                    <input
                      type="email"
                      value={correo}
                      onChange={(e) => setCorreo(e.target.value)}
                      className="w-full rounded-lg bg-[#332f2e] border border-[#775040] px-3 py-2 text-sm text-[#f2e9e4] focus:outline-none focus:border-[#d48b5e]"
                      placeholder="carlos@otzo.com"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#c8c88d] uppercase mb-1">Username</label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full rounded-lg bg-[#332f2e] border border-[#775040] px-3 py-2 text-sm text-[#f2e9e4] focus:outline-none focus:border-[#d48b5e]"
                      placeholder="cmendoza"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#c8c88d] uppercase mb-1">Contraseña</label>
                    <div className="relative">
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full rounded-lg bg-[#332f2e] border border-[#775040] px-3 py-2 pl-9 text-sm text-[#f2e9e4] focus:outline-none focus:border-[#d48b5e]"
                        placeholder="Mínimo 6 caracteres"
                      />
                      <KeyRound className="w-4 h-4 text-[#c8c88d] absolute left-2.5 top-2.5 opacity-60" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#c8c88d] uppercase mb-1">Rol</label>
                    <select
                      value={rol}
                      onChange={(e) => setRol(e.target.value as RolUsuario)}
                      className="w-full rounded-lg bg-[#332f2e] border border-[#775040] px-3 py-2 text-sm text-[#f2e9e4] focus:outline-none focus:border-[#d48b5e]"
                    >
                      <option value="Administrador">Administrador</option>
                      <option value="Capturista">Capturista</option>
                      <option value="Auditor">Auditor</option>
                    </select>
                  </div>
                  <button
                    type="submit"
                    disabled={guardando}
                    className="w-full bg-[#d48b5e] hover:bg-[#d48b5e]/80 text-[#332f2e] font-bold py-2 rounded-lg text-sm transition mt-2 disabled:opacity-50"
                  >
                    {guardando ? 'Guardando...' : 'Guardar Usuario'}
                  </button>
                </form>
              </>
            )}
          </div>

          {/* Tabla de Usuarios Filtrados */}
          <div className="lg:col-span-2 bg-[#423b3a] border border-[#775040] rounded-xl shadow-lg overflow-hidden">
            <div className="p-4 border-b border-[#775040] bg-[#332f2e]/50 flex justify-between items-center">
              <h2 className="font-semibold text-[#d48b5e]">Usuarios Registrados</h2>
              <span className="text-xs text-[#c8c88d] opacity-75">
                {usuariosFiltrados.length} resultado(s)
              </span>
            </div>

            {cargando ? (
              <div className="p-8 text-center text-[#c8c88d] text-sm animate-pulse">
                Cargando usuarios desde TiDB Cloud...
              </div>
            ) : error ? (
              <div className="p-8 text-center text-[#d48b5e] text-sm">
                <p>Ocurrió un error al cargar la información.</p>
                <p className="text-xs opacity-75 mt-1">{error}</p>
              </div>
            ) : usuariosFiltrados.length === 0 ? (
              <div className="p-8 text-center text-[#c8c88d] opacity-60 text-sm">
                No se encontraron usuarios con ese criterio de búsqueda o filtro.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#775040] bg-[#332f2e]/40 text-xs font-semibold text-[#c8c88d] uppercase">
                      <th className="p-3">Usuario</th>
                      <th className="p-3">Contacto</th>
                      <th className="p-3">Rol</th>
                      <th className="p-3">Estado</th>
                      <th className="p-3 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#775040]/40 text-sm">
                    {usuariosFiltrados.map((u) => (
                      <tr key={u.id} className="hover:bg-[#332f2e]/30 transition">
                        <td className="p-3">
                          <div className="font-medium text-[#f2e9e4]">{u.nombre}</div>
                          <div className="text-xs text-[#c8c88d] opacity-80">@{u.username}</div>
                        </td>
                        <td className="p-3 text-[#f2e9e4] opacity-90">{u.correo}</td>
                        <td className="p-3">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#52644f] text-[#f2e9e4]">
                            {u.rol}
                          </span>
                        </td>
                        <td className="p-3">
                          {u.estado === 'Activo' ? (
                            <span className="inline-flex items-center gap-1 text-xs text-[#c8c88d] font-medium">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Activo
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs text-[#d48b5e] font-medium opacity-80">
                              <XCircle className="w-3.5 h-3.5" /> Inactivo
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => abrirEdicion(u)}
                              title="Editar usuario"
                              className="p-1.5 rounded-lg bg-[#332f2e] hover:bg-[#52644f] text-[#c8c88d] hover:text-[#f2e9e4] transition border border-[#775040]"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleEliminar(u.id, u.nombre)}
                              title="Eliminar usuario"
                              className="p-1.5 rounded-lg bg-[#332f2e] hover:bg-red-900/60 text-[#d48b5e] hover:text-red-200 transition border border-[#775040]"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}