'use client';

import React, { useState, FormEvent, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Coffee, Mail, Lock, LogIn } from 'lucide-react';

export default function LoginPage(): React.JSX.Element {
  const router = useRouter();

  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    // Redirección hacia el panel general de módulos (/dashboard)
    router.push('/dashboard');
  };

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setPassword(e.target.value);
  };

  return (
    <div className="min-h-screen bg-[#F8F6F0] text-[#2B211B] font-['Plus_Jakarta_Sans',sans-serif] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white border border-[#E5E7EB] rounded-2xl shadow-xl p-8 space-y-6">

        {/* Encabezado */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-[#F4EBE1] text-[#6F4E37] rounded-2xl flex items-center justify-center mx-auto shadow-sm">
            <Coffee className="w-8 h-8 text-[#6F4E37]" />
          </div>
          <h2 className="text-2xl font-extrabold text-[#2B211B]">Cafeteria Otzo</h2>
          <p className="text-xs text-[#6B7280]">Ingresa tus credenciales para acceder al sistema</p>
        </div>

        {/* Formulario */}
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-1">
            <label htmlFor="email" className="text-xs font-bold text-[#2B211B] flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-[#6F4E37]" /> Correo Electrónico
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={handleEmailChange}
              placeholder="admin@otzo.com"
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E7EB] bg-[#FAF8F5] text-sm focus:outline-none focus:border-[#6F4E37] transition"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="password" className="text-xs font-bold text-[#2B211B] flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-[#6F4E37]" /> Contraseña
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={handlePasswordChange}
              placeholder="••••••••"
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E7EB] bg-[#FAF8F5] text-sm focus:outline-none focus:border-[#6F4E37] transition"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-[#6F4E37] hover:bg-[#563C2A] text-white font-bold rounded-xl text-sm transition shadow-sm flex items-center justify-center gap-2 mt-2"
          >
            <LogIn className="w-4 h-4" /> Iniciar Sesión
          </button>
        </form>

      </div>
    </div>
  );
}
