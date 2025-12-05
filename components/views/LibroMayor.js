'use client';

import { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';

// Get the 4-digit parent code for any account code
function getParentCode(code) {
  if (!code) return null;
  // If code is 4 digits or less, return as-is
  if (code.length <= 4) return code;
  // Otherwise, return the first 4 digits
  return code.substring(0, 4);
}

// Check if a code belongs to a parent (starts with parent code)
function isChildOf(childCode, parentCode) {
  return childCode && parentCode && childCode.startsWith(parentCode);
}

export default function LibroMayor() {
  const { state, showHelp, formatDate, formatCurrency } = useApp();
  const [filterAccount, setFilterAccount] = useState('');

  const exportReport = (type, format) => {
    alert(`Exportando ${type} en formato ${format}.\n\nEn un sistema completo, esto generaría un archivo ${format.toUpperCase()} con el reporte seleccionado.`);
  };

  // Get only 4-digit parent accounts for the filter dropdown
  const parentAccounts = useMemo(() => {
    return state.accounts.filter(acc => acc.code.length === 4);
  }, [state.accounts]);

  // Get the parent accounts to show in the ledger
  const accountsToShow = useMemo(() => {
    if (filterAccount) {
      return parentAccounts.filter(a => a.code === filterAccount);
    }
    return parentAccounts;
  }, [filterAccount, parentAccounts]);

  // Group all child account codes under their parent
  const getChildCodes = (parentCode) => {
    return state.accounts
      .filter(acc => isChildOf(acc.code, parentCode))
      .map(acc => acc.code);
  };

  return (
    <div className="view-container active">
      <div className="view-header">
        <h2>Libro Mayor</h2>
        <div>
          <select 
            className="form-control" 
            style={{ width: '350px', marginRight: '10px' }}
            value={filterAccount}
            onChange={(e) => setFilterAccount(e.target.value)}
          >
            <option value="">Todas las cuentas</option>
            {parentAccounts.map((acc) => (
              <option key={acc.code} value={acc.code}>
                {acc.code} - {acc.name}
              </option>
            ))}
          </select>
          <button className="btn btn--secondary" onClick={() => showHelp('libromayor')}>
            ❓ Ayuda
          </button>
          <button className="btn btn--secondary" onClick={() => exportReport('mayor', 'pdf')}>
            Exportar PDF
          </button>
        </div>
      </div>
      <div className="card">
        <div className="card__body">
          <div className="table-container">
            {accountsToShow.map((parentAccount) => {
              if (!parentAccount) return null;
              
              const isDebitNature = ['Activo', 'Gasto'].includes(parentAccount.type);
              const natureLabel = isDebitNature ? 'Deudor' : 'Acreedor';
              
              // Get all child codes for this parent
              const childCodes = getChildCodes(parentAccount.code);
              
              let balance = 0;
              const movements = [];
              
              // Collect movements from all child accounts
              state.transactions.forEach(tx => {
                tx.entries.forEach(entry => {
                  // Check if entry's account is a child of this parent
                  if (childCodes.includes(entry.account)) {
                    if (isDebitNature) {
                      balance += entry.debe - entry.haber;
                    } else {
                      balance += entry.haber - entry.debe;
                    }
                    // Find the specific account name for the entry
                    const specificAccount = state.accounts.find(a => a.code === entry.account);
                    movements.push({ 
                      tx, 
                      entry, 
                      balance,
                      specificAccountName: specificAccount ? specificAccount.name : entry.account
                    });
                  }
                });
              });
              
              if (movements.length === 0 && filterAccount === '') return null;

              return (
                <div key={parentAccount.code}>
                  <h4 style={{ margin: '20px 0 10px 0' }}>
                    {parentAccount.code} - {parentAccount.name}{' '}
                    <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                      ({parentAccount.type} - Saldo {natureLabel})
                    </span>
                  </h4>
                  <table>
                    <thead>
                      <tr>
                        <th>Fecha</th>
                        <th>Asiento</th>
                        <th>Descripción</th>
                        <th>Subcuenta</th>
                        <th className="text-right">Debe</th>
                        <th className="text-right">Haber</th>
                        <th className="text-right">Saldo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {movements.map(({ tx, entry, balance: bal, specificAccountName }, idx) => (
                        <tr key={`${tx.id}-${idx}`}>
                          <td>{formatDate(tx.date)}</td>
                          <td>{tx.id}</td>
                          <td>{tx.description}</td>
                          <td style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                            {specificAccountName}
                          </td>
                          <td className="text-right">
                            {entry.debe > 0 ? formatCurrency(entry.debe) : '-'}
                          </td>
                          <td className="text-right">
                            {entry.haber > 0 ? formatCurrency(entry.haber) : '-'}
                          </td>
                          <td className="text-right">
                            {formatCurrency(Math.abs(bal))} {bal < 0 ? '(-)' : ''}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            })}
            {!filterAccount && accountsToShow.every(acc => {
              if (!acc) return true;
              const childCodes = getChildCodes(acc.code);
              return !state.transactions.some(tx => 
                tx.entries.some(entry => childCodes.includes(entry.account))
              );
            }) && (
              <p style={{ padding: '20px' }}>No hay movimientos registrados. Seleccione una cuenta para ver su libro mayor.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

