'use client';

import { useApp } from '@/context/AppContext';

export default function BalanceComprobacion() {
  const { state, showHelp, formatCurrency, calculateBalances } = useApp();

  const balances = calculateBalances();
  let totalDebe = 0, totalHaber = 0;
  let totalSaldoDeudor = 0, totalSaldoAcreedor = 0;

  const accountRows = state.accounts.map(account => {
    const balance = balances[account.code] || { debe: 0, haber: 0 };
    const isDebitNature = ['Activo', 'Gasto'].includes(account.type);

    totalDebe += balance.debe;
    totalHaber += balance.haber;

    let saldoDeudor = 0, saldoAcreedor = 0;
    const diff = balance.debe - balance.haber;

    if (isDebitNature) {
      if (diff > 0) {
        saldoDeudor = diff;
      } else {
        saldoAcreedor = Math.abs(diff);
      }
    } else {
      if (diff < 0) {
        saldoAcreedor = Math.abs(diff);
      } else {
        saldoDeudor = diff;
      }
    }

    totalSaldoDeudor += saldoDeudor;
    totalSaldoAcreedor += saldoAcreedor;

    return { account, balance, saldoDeudor, saldoAcreedor };
  }).filter(row => row.balance.debe > 0 || row.balance.haber > 0);

  const isMovimientosBalanced = Math.abs(totalDebe - totalHaber) < 0.01;
  const isSaldosBalanced = Math.abs(totalSaldoDeudor - totalSaldoAcreedor) < 0.01;
  const isBalanced = isMovimientosBalanced && isSaldosBalanced;

  const exportReport = (type, format) => {
    alert(`Exportando ${type} en formato ${format}.\n\nEn un sistema completo, esto generaría un archivo ${format.toUpperCase()} con el reporte seleccionado.`);
  };

  return (
    <div className="view-container active">
      <div className="view-header">
        <h2>Balance de Comprobación</h2>
        <div>
          <button className="btn btn--secondary" onClick={() => showHelp('balance')}>
            ❓ Ayuda
          </button>
          <button className="btn btn--secondary" onClick={() => exportReport('balance', 'pdf')}>
            Exportar PDF
          </button>
          <button className="btn btn--secondary" onClick={() => exportReport('balance', 'excel')}>
            Exportar Excel
          </button>
        </div>
      </div>
      <div className="card">
        <div className="card__body">
          <div className={`balance-validation ${isBalanced ? 'balanced' : 'unbalanced'}`}>
            {isBalanced ? (
              <>
                ✓ Balance cuadrado correctamente.<br />
                Movimientos: Debe = Haber = {formatCurrency(totalDebe)}<br />
                Saldos: Deudor = Acreedor = {formatCurrency(totalSaldoDeudor)}
              </>
            ) : (
              <>
                ✗{' '}
                {!isMovimientosBalanced && (
                  <>Movimientos descuadrados: Diferencia {formatCurrency(Math.abs(totalDebe - totalHaber))}<br /></>
                )}
                {!isSaldosBalanced && (
                  <>Saldos descuadrados: Diferencia {formatCurrency(Math.abs(totalSaldoDeudor - totalSaldoAcreedor))}</>
                )}
              </>
            )}
          </div>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Cuenta</th>
                  <th>Tipo</th>
                  <th className="text-right">Debe</th>
                  <th className="text-right">Haber</th>
                  <th className="text-right">Saldo Deudor</th>
                  <th className="text-right">Saldo Acreedor</th>
                </tr>
              </thead>
              <tbody>
                {accountRows.map(({ account, balance, saldoDeudor, saldoAcreedor }) => (
                  <tr key={account.code}>
                    <td>{account.code}</td>
                    <td>{account.name}</td>
                    <td>{account.type}</td>
                    <td className="text-right">{formatCurrency(balance.debe)}</td>
                    <td className="text-right">{formatCurrency(balance.haber)}</td>
                    <td className="text-right">{saldoDeudor > 0 ? formatCurrency(saldoDeudor) : '-'}</td>
                    <td className="text-right">{saldoAcreedor > 0 ? formatCurrency(saldoAcreedor) : '-'}</td>
                  </tr>
                ))}
                <tr style={{ fontWeight: 'bold', background: 'var(--color-bg-2)' }}>
                  <td colSpan={3}>TOTALES</td>
                  <td className="text-right">{formatCurrency(totalDebe)}</td>
                  <td className="text-right">{formatCurrency(totalHaber)}</td>
                  <td className="text-right">{formatCurrency(totalSaldoDeudor)}</td>
                  <td className="text-right">{formatCurrency(totalSaldoAcreedor)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

