'use client';

import { useApp } from '@/context/AppContext';

export default function Accounts() {
  const { state, showHelp, addAccount, updateAccount } = useApp();

  const handleNewAccount = () => {
    const code = prompt('Código de cuenta:');
    const name = prompt('Nombre de cuenta:');
    const type = prompt('Tipo (Activo/Pasivo/Patrimonio/Ingreso/Gasto):');

    if (code && name && type) {
      addAccount({ code, name, type });
    }
  };

  const handleEditAccount = (code) => {
    const account = state.accounts.find(a => a.code === code);
    if (!account) return;

    const name = prompt('Nuevo nombre:', account.name);
    if (name) {
      updateAccount({ ...account, name });
    }
  };

  const handleImport = () => {
    alert('Funcionalidad de importación de catálogo de cuentas.\n\nEsta característica permitiría importar un catálogo de cuentas desde un archivo CSV o Excel.');
  };

  return (
    <div className="view-container active">
      <div className="view-header">
        <h2>Catálogo de Cuentas</h2>
        <div>
          <button className="btn btn--secondary" onClick={() => showHelp('accounts')}>
            ❓ Ayuda
          </button>
          <button className="btn btn--secondary" onClick={handleImport}>
            Importar
          </button>
          <button className="btn btn--primary" onClick={handleNewAccount}>
            + Nueva Cuenta
          </button>
        </div>
      </div>
      <div className="card">
        <div className="card__body">
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Nombre</th>
                  <th>Tipo</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {state.accounts.map((account) => (
                  <tr key={account.code}>
                    <td>{account.code}</td>
                    <td>{account.name}</td>
                    <td>{account.type}</td>
                    <td>
                      <button 
                        className="btn btn--sm btn--secondary"
                        onClick={() => handleEditAccount(account.code)}
                      >
                        Editar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

