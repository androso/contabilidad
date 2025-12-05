'use client';

import { useState } from 'react';
import { useApp } from '@/context/AppContext';

export default function Dashboard() {
  const { state, setView, openModal, showHelp, formatCurrency, exportData, resetDatabase } = useApp();
  const [isResetting, setIsResetting] = useState(false);

  const today = new Date().toISOString().split('T')[0];
  const todayTransactions = state.transactions.filter(t => t.date === today).length;

  // Calculate balances for all accounts from transactions
  const calculateBalances = () => {
    const balances = {};
    state.transactions.forEach(tx => {
      tx.entries.forEach(entry => {
        if (!balances[entry.account]) {
          balances[entry.account] = { debe: 0, haber: 0 };
        }
        balances[entry.account].debe += entry.debe;
        balances[entry.account].haber += entry.haber;
      });
    });
    return balances;
  };

  // Calculate totals by account type
  const calculateTotals = () => {
    const balances = calculateBalances();
    let totalActivos = 0;
    let totalPasivos = 0;
    let totalPatrimonio = 0;

    for (const account of state.accounts) {
      const balance = balances[account.code] || { debe: 0, haber: 0 };
      
      if (account.type === 'Activo') {
        // Activos: saldo deudor (Debe - Haber)
        totalActivos += balance.debe - balance.haber;
      } else if (account.type === 'Pasivo') {
        // Pasivos: saldo acreedor (Haber - Debe)
        totalPasivos += balance.haber - balance.debe;
      } else if (account.type === 'Patrimonio') {
        // Patrimonio: saldo acreedor (Haber - Debe)
        totalPatrimonio += balance.haber - balance.debe;
      }
    }

    return { totalActivos, totalPasivos, totalPatrimonio };
  };

  const { totalActivos, totalPasivos, totalPatrimonio } = calculateTotals();

  // Inventario: suma de (stock × costo promedio) de la tabla de inventario
  const inventoryValue = state.inventory.reduce((sum, item) => sum + (item.stock * item.avgCost), 0);

  const handleNewTransaction = () => {
    setView('transactions');
    openModal('transaction');
  };

  const handleResetDatabase = async () => {
    const confirmed = window.confirm(
      '⚠️ ADVERTENCIA: Esto eliminará TODOS los datos y reiniciará la base de datos.\n\n' +
      '• Se eliminarán todas las transacciones\n' +
      '• Se eliminarán todas las cuentas personalizadas\n' +
      '• Se reiniciará el inventario\n' +
      '• Tendrás que iniciar sesión nuevamente\n\n' +
      '¿Estás seguro de que deseas continuar?'
    );
    
    if (!confirmed) return;
    
    setIsResetting(true);
    const result = await resetDatabase();
    setIsResetting(false);
    
    if (result.success) {
      alert('✅ ' + result.message);
    } else {
      alert('❌ Error: ' + result.message);
    }
  };

  return (
    <div className="view-container active">
      <div className="view-header">
        <h2>Panel de Control</h2>
        <button className="btn btn--primary" onClick={() => showHelp('dashboard')}>❓ Ayuda</button>
      </div>
      <div className="dashboard-grid">
        <div className="card dashboard-card">
          <div className="card__body">
            <h3>Transacciones Hoy</h3>
            <p className="dashboard-metric">{todayTransactions}</p>
          </div>
        </div>
        <div className="card dashboard-card">
          <div className="card__body">
            <h3>Total Activos</h3>
            <p className="dashboard-metric">{formatCurrency(totalActivos)}</p>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginTop: '8px' }}>
              Pasivos: {formatCurrency(totalPasivos)}<br />
              Patrimonio: {formatCurrency(totalPatrimonio)}
            </p>
          </div>
        </div>
        <div className="card dashboard-card">
          <div className="card__body">
            <h3>Inventario Total</h3>
            <p className="dashboard-metric">{formatCurrency(inventoryValue)}</p>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginTop: '8px' }}>
              {state.inventory.length} producto{state.inventory.length !== 1 ? 's' : ''} en stock
            </p>
          </div>
        </div>
        <div className="card dashboard-card">
          <div className="card__body">
            <h3>Estado</h3>
            <p className="status status--success">Sistema Operativo</p>
          </div>
        </div>
      </div>
      <div className="quick-actions">
        <h3>Acciones Rápidas</h3>
        <div className="action-buttons">
          <button className="btn btn--primary" onClick={handleNewTransaction}>
            Nueva Transacción
          </button>
          <button className="btn btn--secondary" onClick={() => setView('libroDiario')}>
            Ver Libro Diario
          </button>
          <button className="btn btn--secondary" onClick={() => setView('balanceComprobacion')}>
            Balance de Comprobación
          </button>
          <button className="btn btn--secondary" onClick={() => exportData()}>
            Exportar Datos
          </button>
        </div>
      </div>
      
      {/* Database Reset Section */}
      <div style={{ 
        marginTop: 'var(--space-32)', 
        padding: 'var(--space-16)', 
        background: 'var(--color-bg-2)', 
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--color-error)'
      }}>
        <h3 style={{ color: 'var(--color-error)', marginBottom: 'var(--space-8)' }}>⚠️ Zona de Peligro</h3>
        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-16)' }}>
          Reiniciar la base de datos eliminará todos los datos y restaurará los valores iniciales.
        </p>
        <button 
          className="btn" 
          style={{ 
            background: 'var(--color-error)', 
            color: 'white',
            opacity: isResetting ? 0.7 : 1
          }}
          onClick={handleResetDatabase}
          disabled={isResetting}
        >
          {isResetting ? '⏳ Reiniciando...' : '🗑️ Reiniciar Base de Datos'}
        </button>
      </div>
    </div>
  );
}

