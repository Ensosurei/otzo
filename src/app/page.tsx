import Link from 'next/link';
import { Users } from 'lucide-react';

export default function HomePage() {
  return (
    <main className="max-w-4xl mx-auto p-8 font-sans space-y-6">
      <div className="border-b pb-4">
        <h1 className="text-3xl font-bold text-gray-900">Base de Datos otzo_db</h1>
        <p className="mt-2 text-gray-600">
          Panel de administración y control conectado a TiDB Cloud.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link className="p-6 border rounded-xl hover:border-blue-500 hover:shadow-md transition bg-white block group" href="/usuarios">
          <Users className="w-8 h-8 text-blue-600 mb-2 group-hover:scale-105 transition-transform"/>
          <h2 className="text-xl font-semibold text-gray-800">Gestión de Usuarios</h2>
          <p className="text-sm text-gray-500 mt-1">
            Administración de cuentas, roles y estados de los usuarios del sistema.
          </p>
        </Link>
      </div>
    </main>
  );
}
