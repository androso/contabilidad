'use client';

import { useApp } from '@/context/AppContext';

const helpContent = {
  dashboard: {
    title: 'Panel de Control',
    content: `
      <h3>Panel de Control</h3>
      <p>El panel de control muestra un resumen de la actividad contable de tu empresa:</p>
      <ul>
        <li><strong>Transacciones Hoy:</strong> Número de asientos registrados en el día actual.</li>
        <li><strong>Balance General:</strong> Total de activos de la empresa.</li>
        <li><strong>Inventario Total:</strong> Valor total del inventario en existencia.</li>
      </ul>
      <p>Use las acciones rápidas para acceder directamente a funciones comunes.</p>
    `
  },
  transactions: {
    title: 'Gestión de Transacciones',
    content: `
      <h3>Gestión de Transacciones - Sistema Perpetuo</h3>
      <p>Las transacciones son el corazón del sistema de partida doble. Cada transacción debe cumplir con la regla fundamental:</p>
      <p style="text-align:center; font-weight:bold; color:var(--color-primary);">DEBE = HABER</p>
      <p><strong>IVA El Salvador:</strong> 13% según Ley de IVA (Decreto 296)</p>
      <p><strong>Plantillas disponibles:</strong></p>
      <ul>
        <li><strong>Venta al Contado + IVA:</strong> Registra venta en efectivo con IVA por Pagar (13%) + costo de ventas.</li>
        <li><strong>Venta al Crédito + IVA:</strong> Registra venta a crédito (Cuentas por Cobrar) con IVA por Pagar (13%) + costo de ventas.</li>
        <li><strong>Compra al Contado + IVA:</strong> Registra compra pagada en efectivo con Crédito Fiscal IVA (13%).</li>
        <li><strong>Compra al Crédito + IVA:</strong> Registra compra a crédito (Proveedores) con Crédito Fiscal IVA (13%).</li>
        <li><strong>Pago a Proveedor:</strong> Registra el pago de una cuenta por pagar.</li>
        <li><strong>Cobro a Cliente:</strong> Registra el cobro de una cuenta por cobrar.</li>
        <li><strong>Gasto General + IVA:</strong> Registra un gasto operativo (servicios públicos) con Crédito Fiscal IVA.</li>
      </ul>
      <p><strong>Método Perpetuo:</strong> Cada venta registra automáticamente el costo de ventas y la salida de inventario.</p>
    `
  },
  librodiario: {
    title: 'Libro Diario',
    content: `
      <h3>Libro Diario</h3>
      <p>El Libro Diario es el registro cronológico de todas las transacciones de la empresa. Es uno de los libros obligatorios en El Salvador.</p>
      <p><strong>Requisitos legales:</strong></p>
      <ul>
        <li>Debe estar legalizado ante el Registro de Comercio.</li>
        <li>Registra cada transacción en orden cronológico.</li>
        <li>Cada asiento debe estar balanceado (Debe = Haber).</li>
      </ul>
    `
  },
  libromayor: {
    title: 'Libro Mayor',
    content: `
      <h3>Libro Mayor</h3>
      <p>El Libro Mayor organiza las transacciones por cuenta contable, mostrando el movimiento y saldo de cada una.</p>
      <p>Use el filtro para ver el mayor de una cuenta específica o ver todas las cuentas.</p>
      <p>El saldo de cada cuenta se calcula automáticamente según su naturaleza:</p>
      <ul>
        <li><strong>Activo:</strong> Debe - Haber</li>
        <li><strong>Pasivo y Patrimonio:</strong> Haber - Debe</li>
        <li><strong>Ingresos:</strong> Haber - Debe</li>
        <li><strong>Gastos:</strong> Debe - Haber</li>
      </ul>
    `
  },
  balance: {
    title: 'Balance de Comprobación',
    content: `
      <h3>Balance de Comprobación</h3>
      <p>El Balance de Comprobación verifica que todos los asientos estén correctamente registrados.</p>
      <p style="font-weight:bold;">La suma total del Debe debe ser igual a la suma total del Haber.</p>
      <p>Este reporte se genera automáticamente y es esencial antes de preparar los estados financieros.</p>
    `
  },
  inventory: {
    title: 'Control de Inventario',
    content: `
      <h3>Control de Inventario - Método Perpetuo</h3>
      <p>El sistema usa el método perpetuo, que actualiza el inventario en tiempo real con cada transacción.</p>
      <p><strong>Ventajas del método perpetuo:</strong></p>
      <ul>
        <li>Control en tiempo real del stock.</li>
        <li>Cálculo automático del costo de ventas.</li>
        <li>Detección inmediata de faltantes.</li>
      </ul>
      <p>El costo promedio se actualiza con cada compra.</p>
    `
  },
  accounts: {
    title: 'Catálogo de Cuentas',
    content: `
      <h3>Catálogo de Cuentas</h3>
      <p>El Catálogo de Cuentas es el listado organizado de todas las cuentas contables que usa la empresa, estructurado según normas de El Salvador.</p>
      <p><strong>Estructura del código:</strong></p>
      <ul>
        <li><strong>1 - Activo:</strong> Recursos que posee la empresa (corriente y no corriente).</li>
        <li><strong>2 - Pasivo:</strong> Obligaciones de la empresa.</li>
        <li><strong>3 - Patrimonio:</strong> Capital, reservas y utilidades.</li>
        <li><strong>4 - Cuentas de Resultado Deudor:</strong> Compras, gastos de venta, administración y financieros.</li>
        <li><strong>5 - Cuentas de Resultado Acreedor:</strong> Ventas e ingresos.</li>
        <li><strong>6 - Cuenta de Cierre:</strong> Pérdidas y Ganancias.</li>
      </ul>
      <p><strong>Nota:</strong> Las cuentas con códigos más largos son subcuentas más detalladas.</p>
    `
  },
  reports: {
    title: 'Reportes y Exportaciones',
    content: `
      <h3>Reportes y Exportaciones</h3>
      <p>El sistema permite exportar todos los libros contables y estados financieros en múltiples formatos.</p>
      <p><strong>Formatos disponibles:</strong></p>
      <ul>
        <li><strong>PDF:</strong> Para impresión y presentación.</li>
        <li><strong>Excel:</strong> Para análisis adicional.</li>
        <li><strong>CSV:</strong> Para importar a otros sistemas.</li>
        <li><strong>JSON:</strong> Para backup y migración.</li>
      </ul>
    `
  },
  admin: {
    title: 'Administración',
    content: `
      <h3>Administración</h3>
      <p>El panel de administración permite gestionar usuarios, ver el registro de auditoría y configurar empresas.</p>
      <p><strong>Registro de Auditoría:</strong> Mantiene un historial de todas las acciones importantes en el sistema.</p>
      <p><strong>Gestión de Usuarios:</strong> Cree y administre usuarios con diferentes roles y permisos.</p>
    `
  }
};

export default function HelpModal() {
  const { state, closeModal } = useApp();
  
  const topic = helpContent[state.helpTopic] || { 
    title: 'Ayuda', 
    content: '<p>Ayuda no disponible para esta sección.</p>' 
  };

  if (!state.modals.help) return null;

  return (
    <div className="modal active">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{topic.title}</h2>
          <button className="modal-close" onClick={() => closeModal('help')}>
            &times;
          </button>
        </div>
        <div 
          className="modal-body"
          dangerouslySetInnerHTML={{ __html: topic.content }}
        />
      </div>
    </div>
  );
}

