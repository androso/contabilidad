'use client';

import { useApp } from '@/context/AppContext';

const navItems = [
  { id: 'dashboard', label: 'Inicio' },
  { id: 'transactions', label: 'Transacciones' },
  { id: 'libroDiario', label: 'Libro Diario' },
  { id: 'libroMayor', label: 'Libro Mayor' },
  { id: 'balanceComprobacion', label: 'Balance de Comprobación' },
  { id: 'inventory', label: 'Inventario' },
  { id: 'accounts', label: 'Catálogo de Cuentas' },
];

export default function Navigation() {
  const { state, setView } = useApp();

  return (
    <nav className="main-nav">
      {navItems.map((item) => (
        <button
          key={item.id}
          className={`nav-btn ${state.currentView === item.id ? 'active' : ''}`}
          onClick={() => setView(item.id)}
        >
          {item.label}
        </button>
      ))}
    </nav>
  );
}

