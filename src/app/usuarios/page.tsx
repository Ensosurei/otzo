'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import UserMenu from '@/components/UserMenu';
import { usePermisos } from '@/lib/permisos';
import { fetchTiDB } from '@/lib/tidb-client';
import { Usuario, RolUsuario } from '@/types';
import {
  UserPlus,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Pencil,
  Trash2,
  X,
  Check,
  KeyRound,
  AlertCircle,
  Search,
  Filter,
  Coffee,
  ArrowLeft,
} from 'lucide-react';

export default function UsuariosPage() {
  const { puedeEditarUsuarios, puedeVerUsuarios, cargado } = usePermisos();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filtros y Búsqueda
  const [busqueda, setBusqueda] = useState('');
  const [filtroRol, setFiltroRol] = useState<string>('TODOS');

  // Formulario Crear
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rol, setRol] = useState<RolUsuario>('Capturista');
  const [guardando, setGuardando] = useState(false);
  const [errorForm, setErrorForm] = useState<string | null>(null);

  // Modal / Formulario Editar
  const [usuarioEditando, setUsuarioEditando] = useState<Usuario | null>(null);
  const [editNombre, setEditNombre] = useState('');
  const [editCorreo, setEditCorreo] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editRol, setEditRol] = useState<RolUsuario>('Capturista');
  const [editEstado, setEditEstado] = useState<'Activo' | 'Inactivo'>('Activo');
  const [actualizando, setActualizando] = useState(false);
  const [errorEditForm, setErrorEditForm] = useState<string | null>(null);

  // Control de visibilidad del modal de creación
  const [mostrarModalCrear, setMostrarModalCrear] = useState(false);

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

  const esCorreoValido = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

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
    if (!puedeEditarUsuarios) return;
    setErrorForm(null);

    if (!nombre.trim() || !correo.trim() || !username.trim() || !password.trim()) {
      setErrorForm('Todos los campos son obligatorios.');
      return;
    }

    if (!esCorreoValido(correo.trim())) {
      setErrorForm('Ingresa un correo electrónico válido.');
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
          password,
          rol,
          estado: 'Activo',
        }),
      });
      setNombre('');
      setCorreo('');
      setUsername('');
      setPassword('');
      setMostrarModalCrear(false);
      cargarUsuarios();
    } catch (err: any) {
      setErrorForm(err.message || 'Error al guardar usuario.');
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
    if (!puedeEditarUsuarios) return;
    if (!usuarioEditando) return;
    setErrorEditForm(null);

    if (!editNombre.trim() || !editCorreo.trim() || !editUsername.trim()) {
      setErrorEditForm('Nombre, correo y username son requeridos.');
      return;
    }

    if (!esCorreoValido(editCorreo.trim())) {
      setErrorEditForm('Ingresa un correo electrónico válido.');
      return;
    }

    if (editPassword && editPassword.length < 6) {
      setErrorEditForm('La contraseña debe tener al menos 6 caracteres.');
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
    if (!puedeEditarUsuarios) return;
    if (!confirm(`¿Estás seguro de eliminar a "${nombreUsuario}"?`)) return;
    try {
      await fetchTiDB(`/usuarios/${id}`, { method: 'DELETE' });
      cargarUsuarios();
    } catch (err: any) {
      alert('Error al eliminar: ' + err.message);
    }
  };

  if (cargado && !puedeVerUsuarios) {
    return (
      <div className="min-h-screen bg-[#F8F6F0] text-[#2B211B] flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-[#E5E7EB] text-center max-w-md w-full space-y-4">
          <div className="w-16 h-16 bg-[#FEE2E2] text-[#EF4444] rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-extrabold text-[#2B211B]">Acceso Restringido</h1>
          <p className="text-sm text-[#6B7280]">
            No cuentas con permisos para consultar la gestión de usuarios.
          </p>
          <Link
            href="/dashboard"
            className="inline-block w-full py-2.5 bg-[#6F4E37] text-white rounded-lg text-sm font-bold hover:bg-[#563C2A] transition"
          >
            Volver al Panel Principal
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F6F0] text-[#2B211B] font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Navbar Superior */}
      <header className="bg-[#2B211B] text-white shadow-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-3 text-xl font-extrabold text-[#F4EBE1] hover:opacity-90 transition">
            <Coffee className="w-6 h-6 text-[#D2B48C]" />
            <span>Cafeteria Otzo</span>
          </Link>
          <div className="flex items-center gap-4 text-sm font-semibold text-[#D1D5DB]">
            <UserMenu />
          </div>
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Header de la página */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div className="space-y-1">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6B7280] hover:text-[#6F4E37] transition-colors mb-1"
              title="Volver al menú principal"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Volver al Panel Principal
            </Link>
            <h1 className="text-2xl font-extrabold text-[#2B211B] leading-none">Gestión de Usuarios</h1>
            <p className="text-xs text-[#6B7280]">Administra las cuentas y roles del personal de la cafetería</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={cargarUsuarios}
              className="p-2.5 rounded-lg border border-[#E5E7EB] bg-white text-[#2B211B] hover:bg-[#F3F4F6] transition shadow-sm"
              title="Actualizar datos"
            >
              <RefreshCw className={`w-4 h-4 ${cargando ? 'animate-spin' : ''}`} />
            </button>
            {puedeEditarUsuarios && (
              <button
                onClick={() => setMostrarModalCrear(true)}
                className="flex items-center gap-2 bg-[#6F4E37] hover:bg-[#563C2A] text-white font-bold px-4 py-2.5 rounded-lg text-sm transition shadow-sm"
              >
                <UserPlus className="w-4 h-4" /> Añadir Usuario
              </button>
            )}
          </div>
        </div>

        {/* Filtros y Búsqueda */}
        <div className="bg-white p-4 rounded-xl border border-[#E5E7EB] shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:w-2/3">
            <Search className="w-4 h-4 text-[#6B7280] absolute left-3 top-3" />
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por nombre, correo o @usuario..."
              className="w-full pl-9 pr-3 py-2 text-sm bg-[#F8F6F0] border border-[#E5E7EB] rounded-lg outline-none focus:border-[#6F4E37] text-[#2B211B]"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <Filter className="w-4 h-4 text-[#6B7280]" />
            <select
              value={filtroRol}
              onChange={(e) => setFiltroRol(e.target.value)}
              className="w-full md:w-auto px-3 py-2 text-sm bg-[#F8F6F0] border border-[#E5E7EB] rounded-lg outline-none focus:border-[#6F4E37] text-[#2B211B] font-medium"
            >
              <option value="TODOS">Todos los Roles</option>
              <option value="Administrador">Administrador</option>
              <option value="Capturista">Capturista</option>
              <option value="Auditor">Auditor</option>
            </select>
          </div>
        </div>

        {/* Tabla CRUD */}
        <div className="bg-white border border-[#E5E7EB] rounded-xl shadow-sm overflow-hidden">
          {cargando ? (
            <div className="p-12 text-center text-[#6B7280] text-sm animate-pulse">
              Cargando usuarios...
            </div>
          ) : error ? (
            <div className="p-12 text-center text-[#EF4444] text-sm">
              <p className="font-bold">Error de conexión</p>
              <p className="text-xs text-[#6B7280] mt-1">{error}</p>
            </div>
          ) : usuariosFiltrados.length === 0 ? (
            <div className="p-12 text-center text-[#6B7280] text-sm">
              No se encontraron coincidencias para la búsqueda.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#FAF8F5] border-b border-[#E5E7EB] text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">
                    <th className="p-4">Usuario</th>
                    <th className="p-4">Contacto</th>
                    <th className="p-4">Rol</th>
                    <th className="p-4">Estado</th>
                    {puedeEditarUsuarios && <th className="p-4 text-right">Acciones</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB] text-sm">
                  {usuariosFiltrados.map((u) => (
                    <tr key={u.id} className="hover:bg-[#FAF8F5] transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-[#2B211B]">{u.nombre}</div>
                        <div className="text-xs text-[#6B7280]">@{u.username}</div>
                      </td>
                      <td className="p-4 text-[#1F2937]">{u.correo}</td>
                      <td className="p-4">
                        <span className="inline-block bg-[#F3F4F6] text-[#1F2937] px-3 py-1 rounded-full text-xs font-semibold">
                          {u.rol}
                        </span>
                      </td>
                      <td className="p-4">
                        {u.estado === 'Activo' ? (
                          <span className="inline-flex items-center gap-1.5 bg-[#D1FAE5] text-[#065F46] px-3 py-1 rounded-full text-xs font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Disponible
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 bg-[#FEE2E2] text-[#991B1B] px-3 py-1 rounded-full text-xs font-bold">
                            <XCircle className="w-3.5 h-3.5" /> Inactivo
                          </span>
                        )}
                      </td>
                      {puedeEditarUsuarios && (
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => abrirEdicion(u)}
                              className="p-2 rounded-lg bg-[#F4EBE1] text-[#6F4E37] hover:bg-[#6F4E37] hover:text-white transition"
                              title="Editar"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleEliminar(u.id, u.nombre)}
                              className="p-2 rounded-lg bg-[#FEE2E2] text-[#EF4444] hover:bg-[#EF4444] hover:text-white transition"
                              title="Eliminar"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Modal Crear Usuario */}
      {mostrarModalCrear && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-150 font-['Plus_Jakarta_Sans',sans-serif]">
            <div className="p-5 border-b border-[#E5E7EB] flex justify-between items-center bg-[#FAF8F5]">
              <h3 className="font-extrabold text-[#2B211B] flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-[#6F4E37]" /> Añadir Nuevo Usuario
              </h3>
              <button onClick={() => setMostrarModalCrear(false)} className="text-[#6B7280] hover:text-[#2B211B]">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCrear} className="p-5 space-y-4">
              {errorForm && (
                <div className="p-3 bg-[#FEE2E2] text-[#991B1B] text-xs rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorForm}</span>
                </div>
              )}
              <div>
                <label className="block text-xs font-bold text-[#2B211B] mb-1">Nombre Completo</label>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full p-2.5 text-sm border border-[#E5E7EB] rounded-lg outline-none focus:border-[#6F4E37]"
                  placeholder="Ej. Carlos Mendoza"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#2B211B] mb-1">Correo Electrónico</label>
                <input
                  type="email"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  className="w-full p-2.5 text-sm border border-[#E5E7EB] rounded-lg outline-none focus:border-[#6F4E37]"
                  placeholder="carlos@otzo.com"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#2B211B] mb-1">Nombre de Usuario</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full p-2.5 text-sm border border-[#E5E7EB] rounded-lg outline-none focus:border-[#6F4E37]"
                  placeholder="cmendoza"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#2B211B] mb-1">Contraseña</label>
                <div className="relative">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-2.5 pl-9 text-sm border border-[#E5E7EB] rounded-lg outline-none focus:border-[#6F4E37]"
                    placeholder="Mínimo 6 caracteres"
                  />
                  <KeyRound className="w-4 h-4 text-[#6B7280] absolute left-3 top-3" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#2B211B] mb-1">Rol</label>
                <select
                  value={rol}
                  onChange={(e) => setRol(e.target.value as RolUsuario)}
                  className="w-full p-2.5 text-sm border border-[#E5E7EB] rounded-lg outline-none focus:border-[#6F4E37]"
                >
                  <option value="Administrador">Administrador</option>
                  <option value="Capturista">Capturista</option>
                  <option value="Auditor">Auditor</option>
                </select>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setMostrarModalCrear(false)}
                  className="flex-1 py-2.5 border border-[#E5E7EB] rounded-lg text-sm font-bold text-[#2B211B] hover:bg-[#F3F4F6]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardando}
                  className="flex-1 py-2.5 bg-[#6F4E37] hover:bg-[#563C2A] text-white rounded-lg text-sm font-bold transition disabled:opacity-50"
                >
                  {guardando ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Editar Usuario */}
      {usuarioEditando && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-150 font-['Plus_Jakarta_Sans',sans-serif]">
            <div className="p-5 border-b border-[#E5E7EB] flex justify-between items-center bg-[#FAF8F5]">
              <h3 className="font-extrabold text-[#2B211B] flex items-center gap-2">
                <Pencil className="w-5 h-5 text-[#6F4E37]" /> Editar Usuario
              </h3>
              <button onClick={() => setUsuarioEditando(null)} className="text-[#6B7280] hover:text-[#2B211B]">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleActualizar} className="p-5 space-y-4">
              {errorEditForm && (
                <div className="p-3 bg-[#FEE2E2] text-[#991B1B] text-xs rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorEditForm}</span>
                </div>
              )}
              <div>
                <label className="block text-xs font-bold text-[#2B211B] mb-1">Nombre Completo</label>
                <input
                  type="text"
                  value={editNombre}
                  onChange={(e) => setEditNombre(e.target.value)}
                  className="w-full p-2.5 text-sm border border-[#E5E7EB] rounded-lg outline-none focus:border-[#6F4E37]"
                />
              </div>
              <div>
                <label className="block text-[#2B211B] text-xs font-bold mb-1">Correo Electrónico</label>
                <input
                  type="email"
                  value={editCorreo}
                  onChange={(e) => setEditCorreo(e.target.value)}
                  className="w-full p-2.5 text-sm border border-[#E5E7EB] rounded-lg outline-none focus:border-[#6F4E37]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#2B211B] mb-1">Nombre de Usuario</label>
                <input
                  type="text"
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value)}
                  className="w-full p-2.5 text-sm border border-[#E5E7EB] rounded-lg outline-none focus:border-[#6F4E37]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#2B211B] mb-1">
                  Nueva Contraseña <span className="font-normal text-[#6B7280]">(Opcional)</span>
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                    className="w-full p-2.5 pl-9 text-sm border border-[#E5E7EB] rounded-lg outline-none focus:border-[#6F4E37]"
                    placeholder="Dejar en blanco para conservar"
                  />
                  <KeyRound className="w-4 h-4 text-[#6B7280] absolute left-3 top-3" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#2B211B] mb-1">Rol</label>
                <select
                  value={editRol}
                  onChange={(e) => setEditRol(e.target.value as RolUsuario)}
                  className="w-full p-2.5 text-sm border border-[#E5E7EB] rounded-lg outline-none focus:border-[#6F4E37]"
                >
                  <option value="Administrador">Administrador</option>
                  <option value="Capturista">Capturista</option>
                  <option value="Auditor">Auditor</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#2B211B] mb-1">Estado</label>
                <select
                  value={editEstado}
                  onChange={(e) => setEditEstado(e.target.value as 'Activo' | 'Inactivo')}
                  className="w-full p-2.5 text-sm border border-[#E5E7EB] rounded-lg outline-none focus:border-[#6F4E37]"
                >
                  <option value="Activo">Disponible (Activo)</option>
                  <option value="Inactivo">Inactivo</option>
                </select>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setUsuarioEditando(null)}
                  className="flex-1 py-2.5 border border-[#E5E7EB] rounded-lg text-sm font-bold text-[#2B211B] hover:bg-[#F3F4F6]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={actualizando}
                  className="flex-1 py-2.5 bg-[#6F4E37] hover:bg-[#563C2A] text-white rounded-lg text-sm font-bold transition disabled:opacity-50 flex items-center justify-center gap-1"
                >
                  <Check className="w-4 h-4" /> {actualizando ? 'Guardando...' : 'Actualizar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
