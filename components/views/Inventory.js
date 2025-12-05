'use client';

import { useApp } from '@/context/AppContext';

export default function Inventory() {
  const { state, showHelp, addInventoryItem, formatCurrency } = useApp();

  const handleNewItem = () => {
    const sku = prompt('SKU (código único del producto):');
    if (!sku) return;
    
    const product = prompt('Nombre del producto:');
    if (!product) return;
    
    const stockStr = prompt('Stock inicial (cantidad entera):');
    const stock = parseInt(stockStr, 10);
    if (isNaN(stock) || stock < 0) {
      alert('El stock debe ser un número entero positivo');
      return;
    }
    
    const avgCostStr = prompt('Costo promedio unitario ($):');
    const avgCost = parseFloat(avgCostStr);
    if (isNaN(avgCost) || avgCost < 0) {
      alert('El costo debe ser un número positivo');
      return;
    }

    addInventoryItem({ sku, product, stock, avgCost });
  };

  return (
    <div className="view-container active">
      <div className="view-header">
        <h2>Control de Inventario (Método Perpetuo)</h2>
        <div>
          <button className="btn btn--secondary" onClick={() => showHelp('inventory')}>
            ❓ Ayuda
          </button>
          <button className="btn btn--primary" onClick={handleNewItem}>
            + Nuevo Producto
          </button>
        </div>
      </div>
      <div className="card">
        <div className="card__body">
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>Producto</th>
                  <th className="text-right">Stock</th>
                  <th className="text-right">Costo Promedio</th>
                  <th className="text-right">Valor Total</th>
                </tr>
              </thead>
              <tbody>
                {state.inventory.map((item) => (
                  <tr key={item.sku}>
                    <td>{item.sku}</td>
                    <td>{item.product}</td>
                    <td className="text-right">{item.stock}</td>
                    <td className="text-right">{formatCurrency(item.avgCost)}</td>
                    <td className="text-right">{formatCurrency(item.stock * item.avgCost)}</td>
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

