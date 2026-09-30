'use client';

import React, { useState, FormEvent, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage(): React.JSX.Element {
  const router = useRouter();

  // Estados tipados en TSX
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    // Redirección hacia la ruta de productos (/productos)
    router.push('/productos');
  };

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setPassword(e.target.value);
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <div className="brand-header">
          <div className="brand-icon">
            <i className="fa-solid fa-mug-hot"></i>
          </div>
          <h2>Cafeteria Cuellar</h2>
          <p>Panel de Administración</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">
              <i className="fa-regular fa-envelope"></i> Correo Electrónico
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={handleEmailChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">
              <i className="fa-solid fa-lock"></i> Contraseña
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={handlePasswordChange}
              required
            />
          </div>

          <button type="submit" className="className btn btn-primary btn-block">
            <i className="fa-solid fa-right-to-bracket"></i> Iniciar Sesión
          </button>
        </form>
      </div>
    </div>
  );
}