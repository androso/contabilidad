'use client';

import { useApp } from '@/context/AppContext';

export default function LibroDiario() {
  const { state, showHelp, formatDate, formatCurrency } = useApp();

  const exportReport = (type, format) => {
    alert(`Exportando ${type} en formato ${format}.\n\nEn un sistema completo, esto generaría un archivo ${format.toUpperCase()} con el reporte seleccionado.`);
  };

  return (
    <div className="view-container active">
      <div className="view-header">
        <h2>Libro Diario</h2>
        <div>
          <button className="btn btn--secondary" onClick={() => showHelp('librodiario')}>
            ❓ Ayuda
          </button>
          <button className="btn btn--secondary" onClick={() => exportReport('diario', 'pdf')}>
            Exportar PDF
          </button>
          <button className="btn btn--secondary" onClick={() => exportReport('diario', 'excel')}>
            Exportar Excel
          </button>
        </div>
      </div>
      <div className="card">
        <div className="card__body">
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Asiento</th>
                  <th>Fecha</th>
                  <th>Descripción</th>
                  <th>Cuenta</th>
                  <th className="text-right">Debe</th>
                  <th className="text-right">Haber</th>
                </tr>
              </thead>
              <tbody>
                {state.transactions.map((tx) =>
                  tx.entries.map((entry, idx) => {
                    const account = state.accounts.find(a => a.code === entry.account);
                    return (
                      <tr key={`${tx.id}-${idx}`}>
                        {idx === 0 && (
                          <>
                            <td rowSpan={tx.entries.length}>{tx.id}</td>
                            <td rowSpan={tx.entries.length}>{formatDate(tx.date)}</td>
                            <td rowSpan={tx.entries.length}>{tx.description}</td>
                          </>
                        )}
                        <td>{account ? account.name : entry.account}</td>
                        <td className="text-right">
                          {entry.debe > 0 ? formatCurrency(entry.debe) : '-'}
                        </td>
                        <td className="text-right">
                          {entry.haber > 0 ? formatCurrency(entry.haber) : '-'}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

