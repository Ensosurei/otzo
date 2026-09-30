'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, LogOut, User } from 'lucide-react';

interface SesionUsuario {
  nombre?: string;
  username?: string;
  rol?: string;
}

export default function UserMenu() {
  const router = useRouter();
  const [usuario, setUsuario] = useState<SesionUsuario | null>(null);
  const [abierto, setAbierto] = useState<boolean>(false);
  const contenedorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const guardado = localStorage.getItem('usuario_otzo');
      if (guardado) setUsuario(JSON.parse(guardado));
    } catch {
      setUsuario(null);
    }
  }, []);

  useEffect(() => {
    const handleClickFuera = (e: MouseEvent) => {
      if (contenedorRef.current && !contenedorRef.current.contains(e.target as Node)) {
        setAbierto(false);
      }
    };
    document.addEventListener('mousedown', handleClickFuera);
    return () => document.removeEventListener('mousedown', handleClickFuera);
  }, []);

  const cerrarSesion = (): void => {
    void window.fetch('/api/session', { method: 'DELETE', keepalive: true }).catch(() => undefined);
    localStorage.removeItem('usuario_otzo');
    setAbierto(false);
    router.push('/');
  };

  const primerNombre = usuario?.nombre?.split(' ')[0] || usuario?.username || 'Usuario';

  return (
    <div className="relative" ref={contenedorRef}>
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-3 py-1 rounded-full border border-white/10 transition"
      >
        <User className="w-3.5 h-3.5" />
        <span>{primerNombre}</span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${abierto ? 'rotate-180' : ''}`} />
      </button>

      {abierto && (
        <div className="absolute right-0 mt-2 w-56 bg-white text-[#2B211B] rounded-xl shadow-xl border border-[#E5E7EB] overflow-hidden z-50">
          <div className="px-4 py-3 border-b border-[#E5E7EB]">
            <p className="text-sm font-bold truncate">{usuario?.nombre || 'Sin sesión'}</p>
            <p className="text-xs text-[#6B7280] truncate">
              {usuario?.rol || '—'}{usuario?.username ? ` · ${usuario.username}` : ''}
            </p>
          </div>
          <button
            type="button"
            onClick={cerrarSesion}
            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 transition"
          >
            <LogOut className="w-4 h-4" /> Cerrar sesión
          </button>
        </div>
      )}
    </div>
  );
}
