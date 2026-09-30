'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import UserMenu from '@/components/UserMenu';
import { usePermisos } from '@/lib/permisos';
import { fetchTiDB } from '@/lib/tidb-client';
import {
  PlusCircle,
  Pencil,
  Trash2,
  Search,
  Package,
  RefreshCw,
  X,
  Check,
  AlertCircle,
  Filter,
  Coffee,
  ArrowLeft,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

type CategoriaProducto = 'Bebida' | 'Alimento' | 'Servicio';

interface Producto {
  id: number;
  nombre: string;
  descripcion?: string;
  precio: number;
  categoria: CategoriaProducto;
  disponible: boolean | number;
}

export default function ProductosPage() {
  const { puedeEditarProductos, puedeVerProductos, cargado } = usePermisos();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filtros y Búsqueda
  const [busqueda, setBusqueda] = useState<string>('');
  const [filtroCategoria, setFiltroCategoria] = useState<string>('TODAS');

  // Modal / Formulario Crear
  const [mostrarModalCrear, setMostrarModalCrear] = useState<boolean>(false);
  const [nombre, setNombre] = useState<string>('');
  const [descripcion, setDescripcion] = useState<string>('');
  const [precio, setPrecio] = useState<string>('');
  const [categoria, setCategoria] = useState<CategoriaProducto>('Bebida');
  const [disponible, setDisponible] = useState<boolean>(true);
  const [guardando, setGuardando] = useState<boolean>(false);
  const [errorForm, setErrorForm] = useState<string | null>(null);

  // Modal / Formulario Editar
  const [productoEditando, setProductoEditando] = useState<Producto | null>(null);
  const [editNombre, setEditNombre] = useState<string>('');
  const [editDescripcion, setEditDescripcion] = useState<string>('');
  const [editPrecio, setEditPrecio] = useState<string>('');
  const [editCategoria, setEditCategoria] = useState<CategoriaProducto>('Bebida');
  const [editDisponible, setEditDisponible] = useState<boolean>(true);
  const [actualizando, setActualizando] = useState<boolean>(false);
  const [errorEditForm, setErrorEditForm] = useState<string | null>(null);

  const cargarProductos = async () => {
    setCargando(true);
    setError(null);
    try {
      const datos = await fetchTiDB<Producto[]>('/productos');
      setProductos(datos || []);
    } catch (err: any) {
      setError(err.message || 'Error al obtener productos');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarProductos();
  }, []);

  const productosFiltrados = useMemo(() => {
    return productos.filter((p) => {
      const termino = busqueda.toLowerCase().trim();
      const coincideTexto =
        !termino ||
        p.nombre.toLowerCase().includes(termino) ||
        (p.descripcion && p.descripcion.toLowerCase().includes(termino));

      const coincideCategoria =
        filtroCategoria === 'TODAS' || p.categoria === filtroCategoria;

      return coincideTexto && coincideCategoria;
    });
  }, [productos, busqueda, filtroCategoria]);

  const handleCrear = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!puedeEditarProductos) return;
    setErrorForm(null);

    if (!nombre.trim() || !precio.trim()) {
      setErrorForm('El nombre y el precio son obligatorios.');
      return;
    }

    if (isNaN(Number(precio)) || Number(precio) <= 0) {
      setErrorForm('Ingresa un precio válido mayor a 0.');
      return;
    }

    setGuardando(true);
    try {
      await fetchTiDB('/productos', {
        method: 'POST',
        body: JSON.stringify({
          nombre: nombre.trim(),
          descripcion: descripcion.trim(),
          precio: Number(precio),
          categoria,
          disponible: disponible ? 1 : 0,
        }),
      });

      setNombre('');
      setDescripcion('');
      setPrecio('');
      setCategoria('Bebida');
      setDisponible(true);
      setMostrarModalCrear(false);
      cargarProductos();
    } catch (err: any) {
      setErrorForm(err.message || 'Error al guardar el producto.');
    } finally {
      setGuardando(false);
    }
  };

  const abrirEdicion = (p: Producto) => {
    setProductoEditando(p);
    setEditNombre(p.nombre);
    setEditDescripcion(p.descripcion || '');
    setEditPrecio(String(p.precio));
    setEditCategoria(p.categoria);
    setEditDisponible(Boolean(p.disponible));
    setErrorEditForm(null);
  };

  const handleActualizar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productoEditando || !puedeEditarProductos) return;
    setErrorEditForm(null);

    if (!editNombre.trim() || !editPrecio.trim()) {
      setErrorEditForm('El nombre y el precio son obligatorios.');
      return;
    }

    if (isNaN(Number(editPrecio)) || Number(editPrecio) <= 0) {
      setErrorEditForm('Ingresa un precio válido mayor a 0.');
      return;
    }

    setActualizando(true);
    try {
      await fetchTiDB(`/productos/${productoEditando.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          nombre: editNombre.trim(),
          descripcion: editDescripcion.trim(),
          precio: Number(editPrecio),
          categoria: editCategoria,
          disponible: editDisponible ? 1 : 0,
        }),
      });

      setProductoEditando(null);
      cargarProductos();
    } catch (err: any) {
      setErrorEditForm(err.message || 'Error al actualizar el producto.');
    } finally {
      setActualizando(false);
    }
  };

  const handleEliminar = async (id: number, nombreProducto: string) => {
    if (!puedeEditarProductos) return;
    if (!confirm(`¿Estás seguro de eliminar "${nombreProducto}" del menú?`)) return;

    try {
      await fetchTiDB(`/productos/${id}`, { method: 'DELETE' });
      cargarProductos();
    } catch (err: any) {
      alert('Error al eliminar: ' + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F6F0] text-[#2B211B] font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Navbar Superior */}
      <header className="bg-[#2B211B] text-white shadow-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 text-xl font-extrabold text-[#F4EBE1] hover:opacity-90 transition"
          >
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
            <h1 className="text-2xl font-extrabold text-[#2B211B] leading-none">
              Gestión de Productos
            </h1>
            <p className="text-xs text-[#6B7280]">
              Administra el catálogo de ítems, precios y categorías de la cafetería
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={cargarProductos}
              className="p-2.5 rounded-lg border border-[#E5E7EB] bg-white text-[#2B211B] hover:bg-[#F3F4F6] transition shadow-sm"
              title="Actualizar datos"
            >
              <RefreshCw className={`w-4 h-4 ${cargando ? 'animate-spin' : ''}`} />
            </button>
            {puedeEditarProductos && (
              <button
                onClick={() => setMostrarModalCrear(true)}
                className="flex items-center gap-2 bg-[#6F4E37] hover:bg-[#563C2A] text-white font-bold px-4 py-2.5 rounded-lg text-sm transition shadow-sm"
              >
                <PlusCircle className="w-4 h-4" /> Añadir Producto
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
              placeholder="Buscar producto por nombre o descripción..."
              className="w-full pl-9 pr-3 py-2 text-sm bg-[#F8F6F0] border border-[#E5E7EB] rounded-lg outline-none focus:border-[#6F4E37] text-[#2B211B]"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <Filter className="w-4 h-4 text-[#6B7280]" />
            <select
              value={filtroCategoria}
              onChange={(e) => setFiltroCategoria(e.target.value)}
              className="w-full md:w-auto px-3 py-2 text-sm bg-[#F8F6F0] border border-[#E5E7EB] rounded-lg outline-none focus:border-[#6F4E37] text-[#2B211B] font-medium"
            >
              <option value="TODAS">Todas las Categorías</option>
              <option value="Bebida">Bebida</option>
              <option value="Alimento">Alimento</option>
              <option value="Servicio">Servicio</option>
            </select>
          </div>
        </div>

        {/* Tabla CRUD */}
        <div className="bg-white border border-[#E5E7EB] rounded-xl shadow-sm overflow-hidden">
          {cargando ? (
            <div className="p-12 text-center text-[#6B7280] text-sm animate-pulse">
              Cargando catálogo...
            </div>
          ) : error ? (
            <div className="p-12 text-center text-[#EF4444] text-sm">
              <p className="font-bold">Error de conexión</p>
              <p className="text-xs text-[#6B7280] mt-1">{error}</p>
            </div>
          ) : productosFiltrados.length === 0 ? (
            <div className="p-12 text-center text-[#6B7280] text-sm">
              No se encontraron coincidencias para la búsqueda.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#FAF8F5] border-b border-[#E5E7EB] text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">
                    <th className="p-4">Producto</th>
                    <th className="p-4">Categoría</th>
                    <th className="p-4">Precio</th>
                    <th className="p-4">Estado</th>
                    {puedeEditarProductos && <th className="p-4 text-right">Acciones</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB] text-sm">
                  {productosFiltrados.map((p) => (
                    <tr key={p.id} className="hover:bg-[#FAF8F5] transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-[#2B211B]">{p.nombre}</div>
                        {p.descripcion && (
                          <div className="text-xs text-[#6B7280]">{p.descripcion}</div>
                        )}
                      </td>
                      <td className="p-4">
                        <span className="inline-block bg-[#F3F4F6] text-[#1F2937] px-3 py-1 rounded-full text-xs font-semibold">
                          {p.categoria}
                        </span>
                      </td>
                      <td className="p-4 font-bold text-[#6F4E37]">
                        ${Number(p.precio).toFixed(2)}
                      </td>
                      <td className="p-4">
                        {p.disponible ? (
                          <span className="inline-flex items-center gap-1.5 bg-[#D1FAE5] text-[#065F46] px-3 py-1 rounded-full text-xs font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Disponible
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 bg-[#FEE2E2] text-[#991B1B] px-3 py-1 rounded-full text-xs font-bold">
                            <XCircle className="w-3.5 h-3.5" /> Agotado
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        {puedeEditarProductos ? (

                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => abrirEdicion(p)}
                              className="p-2 rounded-lg bg-[#F4EBE1] text-[#6F4E37] hover:bg-[#6F4E37] hover:text-white transition"
                              title="Editar"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleEliminar(p.id, p.nombre)}
                              className="p-2 rounded-lg bg-[#FEE2E2] text-[#EF4444] hover:bg-[#EF4444] hover:text-white transition"
                              title="Eliminar"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-[#6B7280] italic">Solo lectura</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Modal Crear Producto */}
      {mostrarModalCrear && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-150 font-['Plus_Jakarta_Sans',sans-serif]">
            <div className="p-5 border-b border-[#E5E7EB] flex justify-between items-center bg-[#FAF8F5]">
              <h3 className="font-extrabold text-[#2B211B] flex items-center gap-2">
                <Package className="w-5 h-5 text-[#6F4E37]" /> Añadir Nuevo Producto
              </h3>
              <button
                onClick={() => setMostrarModalCrear(false)}
                className="text-[#6B7280] hover:text-[#2B211B]"
              >
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
                <label className="block text-xs font-bold text-[#2B211B] mb-1">
                  Nombre del Producto
                </label>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full p-2.5 text-sm border border-[#E5E7EB] rounded-lg outline-none focus:border-[#6F4E37]"
                  placeholder="Ej. Café Americano"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#2B211B] mb-1">
                  Descripción
                </label>
                <textarea
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  className="w-full p-2.5 text-sm border border-[#E5E7EB] rounded-lg outline-none focus:border-[#6F4E37]"
                  placeholder="Descripción breve del producto..."
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#2B211B] mb-1">
                    Precio ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={precio}
                    onChange={(e) => setPrecio(e.target.value)}
                    className="w-full p-2.5 text-sm border border-[#E5E7EB] rounded-lg outline-none focus:border-[#6F4E37]"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#2B211B] mb-1">
                    Categoría
                  </label>
                  <select
                    value={categoria}
                    onChange={(e) => setCategoria(e.target.value as CategoriaProducto)}
                    className="w-full p-2.5 text-sm border border-[#E5E7EB] rounded-lg outline-none focus:border-[#6F4E37]"
                  >
                    <option value="Bebida">Bebida</option>
                    <option value="Alimento">Alimento</option>
                    <option value="Servicio">Servicio</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#2B211B] mb-1">Estado</label>
                <select
                  value={disponible ? '1' : '0'}
                  onChange={(e) => setDisponible(e.target.value === '1')}
                  className="w-full p-2.5 text-sm border border-[#E5E7EB] rounded-lg outline-none focus:border-[#6F4E37]"
                >
                  <option value="1">Disponible</option>
                  <option value="0">Agotado</option>
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

      {/* Modal Editar Producto */}
      {productoEditando && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-150 font-['Plus_Jakarta_Sans',sans-serif]">
            <div className="p-5 border-b border-[#E5E7EB] flex justify-between items-center bg-[#FAF8F5]">
              <h3 className="font-extrabold text-[#2B211B] flex items-center gap-2">
                <Pencil className="w-5 h-5 text-[#6F4E37]" /> Editar Producto
              </h3>
              <button
                onClick={() => setProductoEditando(null)}
                className="text-[#6B7280] hover:text-[#2B211B]"
              >
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
                <label className="block text-xs font-bold text-[#2B211B] mb-1">
                  Nombre del Producto
                </label>
                <input
                  type="text"
                  value={editNombre}
                  onChange={(e) => setEditNombre(e.target.value)}
                  className="w-full p-2.5 text-sm border border-[#E5E7EB] rounded-lg outline-none focus:border-[#6F4E37]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#2B211B] mb-1">
                  Descripción
                </label>
                <textarea
                  value={editDescripcion}
                  onChange={(e) => setEditDescripcion(e.target.value)}
                  className="w-full p-2.5 text-sm border border-[#E5E7EB] rounded-lg outline-none focus:border-[#6F4E37]"
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#2B211B] mb-1">
                    Precio ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={editPrecio}
                    onChange={(e) => setEditPrecio(e.target.value)}
                    className="w-full p-2.5 text-sm border border-[#E5E7EB] rounded-lg outline-none focus:border-[#6F4E37]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#2B211B] mb-1">
                    Categoría
                  </label>
                  <select
                    value={editCategoria}
                    onChange={(e) => setEditCategoria(e.target.value as CategoriaProducto)}
                    className="w-full p-2.5 text-sm border border-[#E5E7EB] rounded-lg outline-none focus:border-[#6F4E37]"
                  >
                    <option value="Bebida">Bebida</option>
                    <option value="Alimento">Alimento</option>
                    <option value="Servicio">Servicio</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#2B211B] mb-1">Estado</label>
                <select
                  value={editDisponible ? '1' : '0'}
                  onChange={(e) => setEditDisponible(e.target.value === '1')}
                  className="w-full p-2.5 text-sm border border-[#E5E7EB] rounded-lg outline-none focus:border-[#6F4E37]"
                >
                  <option value="1">Disponible</option>
                  <option value="0">Agotado</option>
                </select>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setProductoEditando(null)}
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
