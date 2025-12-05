'use client';

import { useState } from 'react';
import { useApp } from '@/context/AppContext';

export default function LoginScreen() {
  const { login } = useApp();
  const [email, setEmail] = useState('admin@demo.com');
  const [password, setPassword] = useState('admin');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const success = login(email, password);
    if (!success) {
      setError('Credenciales incorrectas');
    }
  };

  return (
    <div className="login-screen">
      <div className="login-container">
        <h1>Sistema de Contabilidad</h1>
        <p className="login-subtitle">Sistema de Partida Doble para El Salvador</p>
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email" className="form-label">Correo Electrónico</label>
            <input
              type="email"
              id="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password" className="form-label">Contraseña</label>
            <input
              type="password"
              id="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && (
            <p style={{ color: 'var(--color-error)', marginBottom: 'var(--space-16)', fontSize: 'var(--font-size-sm)' }}>
              {error}
            </p>
          )}
          <button type="submit" className="btn btn--primary btn--full-width">
            Iniciar Sesión
          </button>
        </form>
      </div>
    </div>
  );
}

