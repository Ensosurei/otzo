'use client';

import Link from 'next/link';
import { Users, Package, Database, ArrowRight, Coffee } from 'lucide-react';

export default function HomePage() {
  const modulos = [
    {
      titulo: 'Gestión de Usuarios',
      descripcion: 'Administración de credenciales, roles, asignación de permisos y estados de cuenta.',
      icono: Users,
      ruta: '/usuarios',
      badge: 'Disponible',
      colorBadge: 'bg-[#D1FAE5] text-[#065F46]',
    },
    {
      titulo: 'Catálogo de Productos',
      descripcion: 'Control de inventario, precios, categorización y consulta de existencias.',
      icono: Package,
      ruta: '/productos',
      badge: 'Disponible',
      colorBadge: 'bg-[#D1FAE5] text-[#065F46]',
    },
    {
      titulo: 'Respaldos y Sistema',
      descripcion: 'Monitoreo de snapshots de TiDB Cloud, logs de auditoría y copias de seguridad.',
      icono: Database,
      ruta: '/respaldos',
      badge: 'Próximamente',
      colorBadge: 'bg-[#FEF3C7] text-[#92400E]',
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8F6F0] text-[#2B211B] font-['Plus_Jakarta_Sans',sans-serif] flex flex-col">
      {/* Navbar Superior */}
      <header className="bg-[#2B211B] text-white shadow-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 text-xl font-extrabold text-[#F4EBE1]">
            <Coffee className="w-6 h-6 text-[#D2B48C]" />
            <span>Cafeteria Otzo</span>
          </div>
          <div className="flex items-center gap-4 text-sm font-semibold text-[#D1D5DB]">
            <span className="bg-white/10 px-3 py-1 rounded-full border border-white/10">Admin</span>
          </div>
        </div>
      </header>

      {/* Main Content Centrado */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-6 flex items-center justify-center py-12">
        <div className="w-full space-y-10 my-auto">
          {/* Encabezado */}
          <div className="text-center space-y-3">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#2B211B] tracking-tight">
              Panel de Administración
            </h1>
            <p className="text-sm text-[#6B7280] max-w-lg mx-auto leading-relaxed font-medium">
              Selecciona el módulo que deseas gestionar dentro del sistema de la cafetería.
            </p>
          </div>

          {/* Tarjetas de Módulos */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {modulos.map((m, idx) => {
              const Icono = m.icono;
              return (
                <div
                  key={idx}
                  className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-[#6F4E37] transition-all duration-200 flex flex-col justify-between group"
                >
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="p-3 bg-[#F4EBE1] rounded-xl text-[#6F4E37] group-hover:bg-[#6F4E37] group-hover:text-white transition-colors duration-200">
                        <Icono className="w-6 h-6" />
                      </div>
                      <span className={`text-[11px] font-bold px-3 py-1 rounded-full ${m.colorBadge}`}>
                        {m.badge}
                      </span>
                    </div>

                    <div>
                      <h2 className="text-lg font-bold text-[#2B211B] group-hover:text-[#6F4E37] transition-colors">
                        {m.titulo}
                      </h2>
                      <p className="text-xs text-[#6B7280] mt-1.5 leading-relaxed">
                        {m.descripcion}
                      </p>
                    </div>
                  </div>

                  <div className="pt-6 mt-6 border-t border-[#E5E7EB]">
                    <Link
                      href={m.ruta}
                      className="inline-flex items-center gap-2 text-sm font-bold text-[#6F4E37] group-hover:text-[#563C2A] transition-colors"
                    >
                      Ingresar al módulo <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
