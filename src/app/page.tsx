'use client';

import Link from 'next/link';
import { Users, Package, Database, ShieldCheck, ArrowRight } from 'lucide-react';

export default function HomePage() {
  const modulos = [
    {
      titulo: 'Gestión de Usuarios',
      descripcion: 'Administración de credenciales, roles, asignación de permisos y estados de cuenta.',
      icono: Users,
      ruta: '/usuarios',
      badge: 'Activo',
      colorBadge: 'bg-[#52644f] text-[#f2e9e4]',
    },
    {
      titulo: 'Catálogo de Productos',
      descripcion: 'Control de inventario, precios, categorización y consulta de existencias.',
      icono: Package,
      ruta: '/productos',
      badge: 'Siguiente Módulo',
      colorBadge: 'bg-[#775040] text-[#c8c88d]',
    },
    {
      titulo: 'Respaldos y Sistema',
      descripcion: 'Monitoreo de snapshots de TiDB Cloud, logs de auditoría y copias de seguridad.',
      icono: Database,
      ruta: '/respaldos',
      badge: 'Siguiente Módulo',
      colorBadge: 'bg-[#775040] text-[#c8c88d]',
    },
  ];

  return (
    <div className="min-h-screen bg-[#332f2e] text-[#f2e9e4] p-6 font-sans flex items-center justify-center">
      <div className="max-w-5xl w-full space-y-10 my-auto">

        {/* Encabezado Principal */}
        <div className="text-center space-y-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#52644f]/40 text-[#c8c88d] border border-[#52644f]">
            <ShieldCheck className="w-4 h-4" /> otzo-web v1.0
          </span>
          <h1 className="text-4xl font-extrabold text-[#d48b5e] tracking-tight">
            Panel de Administración OTZO
          </h1>
          <p className="text-sm text-[#c8c88d] opacity-90 max-w-xl mx-auto leading-relaxed">
            Plataforma centralizada para la gestión de usuarios, catálogo de productos y respaldos de la base de datos.
          </p>
        </div>

        {/* Tarjetas de Módulos (Sección Central) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {modulos.map((m, idx) => {
            const Icono = m.icono;
            return (
              <div
                key={idx}
                className="bg-[#423b3a] border border-[#775040] rounded-xl p-6 shadow-xl flex flex-col justify-between hover:border-[#d48b5e] transition-all group"
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="p-3 bg-[#332f2e] rounded-xl text-[#d48b5e] border border-[#775040] group-hover:bg-[#52644f] group-hover:text-[#f2e9e4] transition-colors">
                      <Icono className="w-6 h-6" />
                    </div>
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${m.colorBadge}`}>
                      {m.badge}
                    </span>
                  </div>

                  <div>
                    <h2 className="text-lg font-bold text-[#f2e9e4] group-hover:text-[#d48b5e] transition-colors">
                      {m.titulo}
                    </h2>
                    <p className="text-xs text-[#c8c88d] opacity-80 mt-1 leading-relaxed">
                      {m.descripcion}
                    </p>
                  </div>
                </div>

                <div className="pt-6 mt-4 border-t border-[#775040]/40">
                  <Link
                    href={m.ruta}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-[#d48b5e] hover:text-[#f2e9e4] transition-colors"
                  >
                    Ingresar al módulo <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
