'use client';

import { useRef } from 'react';
import { useApp } from '@/context/AppContext';

export default function Reports() {
  const { showHelp, exportData } = useApp();
  const fileInputRef = useRef(null);

  const exportReport = (type, format) => {
    alert(`Exportando ${type} en formato ${format}.\n\nEn un sistema completo, esto generaría un archivo ${format.toUpperCase()} con el reporte seleccionado.`);
  };

  const handleImportFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        if (confirm('¿Desea importar estas transacciones? Esto agregará los datos sin eliminar los existentes.')) {
          alert('Importación exitosa');
        }
      } catch (error) {
        alert('Error al importar archivo: formato inválido');
      }
    };
    reader.readAsText(file);
  };

  const importDTE = () => {
    alert('Funcionalidad de importación de DTE (Documentos Tributarios Electrónicos).\n\nEsta característica se conectaría con la API del Ministerio de Hacienda de El Salvador para importar facturas electrónicas automáticamente.');
  };

  return (
    <div className="view-container active">
      <div className="view-header">
        <h2>Reportes y Exportaciones</h2>
        <button className="btn btn--secondary" onClick={() => showHelp('reports')}>
          ❓ Ayuda
        </button>
      </div>
      <div className="reports-grid">
        <div className="card">
          <div className="card__body">
            <h3>Libros Contables</h3>
            <div className="report-actions">
              <button className="btn btn--secondary btn--full-width" onClick={() => exportReport('diario', 'pdf')}>
                Libro Diario (PDF)
              </button>
              <button className="btn btn--secondary btn--full-width" onClick={() => exportReport('mayor', 'pdf')}>
                Libro Mayor (PDF)
              </button>
              <button className="btn btn--secondary btn--full-width" onClick={() => exportReport('balance', 'excel')}>
                Balance de Comprobación (Excel)
              </button>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card__body">
            <h3>Estados Financieros</h3>
            <div className="report-actions">
              <button className="btn btn--secondary btn--full-width" onClick={() => exportReport('estado-resultados', 'pdf')}>
                Estado de Resultados
              </button>
              <button className="btn btn--secondary btn--full-width" onClick={() => exportReport('balance-general', 'pdf')}>
                Balance General
              </button>
              <button className="btn btn--secondary btn--full-width" onClick={() => exportReport('flujo-efectivo', 'pdf')}>
                Flujo de Efectivo
              </button>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card__body">
            <h3>Exportaciones</h3>
            <div className="report-actions">
              <button className="btn btn--secondary btn--full-width" onClick={() => exportData('json')}>
                Exportar JSON
              </button>
              <button className="btn btn--secondary btn--full-width" onClick={() => exportData('csv')}>
                Exportar CSV
              </button>
              <button className="btn btn--secondary btn--full-width" onClick={() => exportData('json')}>
                Respaldo Completo
              </button>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card__body">
            <h3>Importaciones</h3>
            <div className="report-actions">
              <input 
                type="file" 
                ref={fileInputRef}
                accept=".json,.csv" 
                style={{ display: 'none' }}
                onChange={handleImportFile}
              />
              <button 
                className="btn btn--secondary btn--full-width" 
                onClick={() => fileInputRef.current?.click()}
              >
                Importar Transacciones
              </button>
              <button className="btn btn--secondary btn--full-width" onClick={importDTE}>
                Importar DTE
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

