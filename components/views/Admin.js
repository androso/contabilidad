'use client';

import { useApp } from '@/context/AppContext';

export default function Admin() {
  const { state, showHelp, formatDateTime } = useApp();

  const handleNewUser = () => {
    alert('Funcionalidad de creación de usuarios.\n\nEn un sistema completo, esto abriría un formulario para crear nuevos usuarios con diferentes roles y permisos.');
  };

  const handleEditCompany = () => {
    alert('Funcionalidad de edición de empresa.\n\nEn un sistema completo, esto permitiría modificar los datos de la empresa actual.');
  };

  const handleNewCompany = () => {
    alert('Funcionalidad de creación de empresa.\n\nEn un sistema completo, esto permitiría agregar nuevas empresas al sistema.');
  };

  return (
    <div className="view-container active">
      <div className="view-header">
        <h2>Administración</h2>
        <button className="btn btn--secondary" onClick={() => showHelp('admin')}>
          ❓ Ayuda
        </button>
      </div>
      <div className="admin-grid">
        <div className="card">
          <div className="card__body">
            <h3>Registro de Auditoría</h3>
            <div className="audit-log">
              {state.auditLog.length === 0 ? (
                <p style={{ textAlign: 'center', padding: '20px' }}>
                  No hay registros de auditoría.
                </p>
              ) : (
                [...state.auditLog].reverse().map((log, idx) => (
                  <div key={idx} className="audit-item">
                    <div>{log.action}</div>
                    <div className="audit-timestamp">{formatDateTime(log.timestamp)}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card__body">
            <h3>Gestión de Usuarios</h3>
            <div className="user-management">
              <button className="btn btn--primary btn--full-width" onClick={handleNewUser}>
                + Nuevo Usuario
              </button>
              <div className="users-list">
                {state.users.map((user) => (
                  <div key={user.id} className="user-item">
                    <div>
                      <div>{user.name}</div>
                      <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
                        {user.email}
                      </div>
                    </div>
                    <span className="status status--info">{user.role}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card__body">
            <h3>Configuración de Empresa</h3>
            <div className="company-config">
              <button className="btn btn--secondary btn--full-width" onClick={handleEditCompany}>
                Editar Empresa
              </button>
              <button className="btn btn--secondary btn--full-width" onClick={handleNewCompany}>
                + Nueva Empresa
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

