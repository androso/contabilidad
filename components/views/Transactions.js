'use client';

import { useApp } from '@/context/AppContext';

export default function Transactions() {
  const { state, openModal, showHelp, formatDate } = useApp();

  return (
    <div className="view-container active">
      <div className="view-header">
        <h2>Gestión de Transacciones</h2>
        <div>
          <button className="btn btn--secondary" onClick={() => showHelp('transactions')}>
            ❓ Ayuda
          </button>
          <button className="btn btn--primary" onClick={() => openModal('transaction')}>
            + Nueva Transacción
          </button>
        </div>
      </div>
      <div className="card">
        <div className="card__body">
          <div className="transactions-list">
            {state.transactions.length === 0 ? (
              <p style={{ textAlign: 'center', padding: '20px' }}>
                No hay transacciones registradas.
              </p>
            ) : (
              state.transactions.map((tx) => (
                <div key={tx.id} className="transaction-item">
                  <div className="transaction-header">
                    <span className="transaction-id">Asiento #{tx.id}</span>
                    <span className="transaction-date">{formatDate(tx.date)}</span>
                  </div>
                  <div className="transaction-description">{tx.description}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

