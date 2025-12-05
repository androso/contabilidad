'use client';

import { useApp } from '@/context/AppContext';

export default function Header() {
  const { state, logout } = useApp();

  return (
    <header className="app-header">
      <div className="header-content">
        <h1 className="app-title">Sistema Contable</h1>
        <div className="header-actions">
          <select className="form-control company-select" defaultValue="1">
            <option value="1">{state.currentCompany?.name || 'Demo Company SA de CV'}</option>
          </select>
          <span className="user-info">{state.currentUser?.name}</span>
          <button className="btn btn--secondary btn--sm" onClick={logout}>
            Cerrar Sesión
          </button>
        </div>
      </div>
    </header>
  );
}

