'use client';

import { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';

// Templates that affect inventory
const inventoryTemplates = ['sale', 'saleCash', 'purchase', 'purchaseCash'];

export default function TransactionModal() {
  const { state, closeModal, addTransaction, formatCurrency, setView } = useApp();
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [template, setTemplate] = useState('');
  const [entries, setEntries] = useState([
    { account: '', debe: 0, haber: 0 },
    { account: '', debe: 0, haber: 0 }
  ]);
  
  // Inventory-related state
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [salePrice, setSalePrice] = useState(0);

  useEffect(() => {
    if (state.modals.transaction) {
      setDate(new Date().toISOString().split('T')[0]);
      setDescription('');
      setTemplate('');
      setEntries([
        { account: '', debe: 0, haber: 0 },
        { account: '', debe: 0, haber: 0 }
      ]);
      setSelectedProduct('');
      setQuantity(1);
      setSalePrice(0);
    }
  }, [state.modals.transaction]);

  // Check if current template affects inventory
  const affectsInventory = inventoryTemplates.includes(template);
  const isSaleTemplate = template === 'sale' || template === 'saleCash';
  const isPurchaseTemplate = template === 'purchase' || template === 'purchaseCash';

  // Get selected product details
  const product = state.inventory.find(p => p.sku === selectedProduct);

  // Recalculate entries when product, quantity, or price changes
  useEffect(() => {
    if (!affectsInventory || !product) return;

    const cost = product.avgCost * quantity;
    const salePriceTotal = salePrice * quantity;
    const iva = isSaleTemplate ? salePriceTotal * 0.13 : cost * 0.13;
    
    if (isSaleTemplate) {
      const totalWithIva = salePriceTotal + iva;
      const isCash = template === 'saleCash';
      
      setEntries([
        { account: isCash ? '110101' : '110201', debe: totalWithIva, haber: 0 },
        { account: isCash ? '510201' : '510202', debe: 0, haber: salePriceTotal },
        { account: '210405', debe: 0, haber: iva },
        { account: '410101', debe: cost, haber: 0 },
        { account: '110401', debe: 0, haber: cost }
      ]);
    } else if (isPurchaseTemplate) {
      const purchaseCost = (salePrice || product.avgCost) * quantity;
      const purchaseIva = purchaseCost * 0.13;
      const totalWithIva = purchaseCost + purchaseIva;
      const isCash = template === 'purchaseCash';
      
      setEntries([
        { account: '110401', debe: purchaseCost, haber: 0 },
        { account: '110801', debe: purchaseIva, haber: 0 },
        { account: isCash ? '110101' : '210101', debe: 0, haber: totalWithIva }
      ]);
    }
  }, [selectedProduct, quantity, salePrice, template, product, affectsInventory, isSaleTemplate, isPurchaseTemplate]);

  const handleTemplateChange = (templateName) => {
    setTemplate(templateName);
    setSelectedProduct('');
    setQuantity(1);
    setSalePrice(0);
    
    if (!templateName || inventoryTemplates.includes(templateName)) {
      // For inventory templates, entries will be calculated when product is selected
      if (!inventoryTemplates.includes(templateName)) {
        setEntries([
          { account: '', debe: 0, haber: 0 },
          { account: '', debe: 0, haber: 0 }
        ]);
      }
    } else {
      // Non-inventory templates
      const templates = {
        payment: [
          { account: '210101', debe: 100, haber: 0 },
          { account: '110101', debe: 0, haber: 100 }
        ],
        collection: [
          { account: '110101', debe: 100, haber: 0 },
          { account: '110201', debe: 0, haber: 100 }
        ],
        expense: [
          { account: '410313', debe: 100, haber: 0 },
          { account: '110801', debe: 13, haber: 0 },
          { account: '110101', debe: 0, haber: 113 }
        ]
      };
      if (templates[templateName]) {
        setEntries(templates[templateName].map(e => ({ ...e })));
      }
    }
  };

  const addEntry = () => {
    setEntries([...entries, { account: '', debe: 0, haber: 0 }]);
  };

  const removeEntry = (index) => {
    setEntries(entries.filter((_, i) => i !== index));
  };

  const updateEntry = (index, field, value) => {
    const newEntries = [...entries];
    newEntries[index] = { 
      ...newEntries[index], 
      [field]: field === 'account' ? value : parseFloat(value) || 0 
    };
    setEntries(newEntries);
  };

  const totalDebe = entries.reduce((sum, e) => sum + (e.debe || 0), 0);
  const totalHaber = entries.reduce((sum, e) => sum + (e.haber || 0), 0);
  const difference = Math.abs(totalDebe - totalHaber);
  const isBalanced = difference < 0.01;

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!isBalanced) {
      alert('Error: La transacción no está balanceada. Debe = Haber es requerido.');
      return;
    }

    const validEntries = entries.filter(
      entry => entry.account && (entry.debe > 0 || entry.haber > 0)
    );

    if (validEntries.length === 0) {
      alert('Debe agregar al menos un asiento contable.');
      return;
    }

    // Validate inventory selection for inventory templates
    if (affectsInventory && !selectedProduct) {
      alert('Debe seleccionar un producto del inventario.');
      return;
    }

    if (isSaleTemplate && product && quantity > product.stock) {
      alert(`Stock insuficiente. Stock disponible: ${product.stock}`);
      return;
    }

    // Prepare inventory movements
    let inventoryMovements = undefined;
    if (affectsInventory && product) {
      inventoryMovements = [{
        sku: product.sku,
        quantity: isPurchaseTemplate ? quantity : -quantity, // Positive for purchase, negative for sale
        unitCost: isPurchaseTemplate ? (salePrice || product.avgCost) : product.avgCost
      }];
    }

    addTransaction({
      date,
      description,
      entries: validEntries,
      inventoryMovements
    });

    closeModal('transaction');
    alert('Transacción guardada exitosamente');
    setView('libroDiario');
  };

  if (!state.modals.transaction) return null;

  return (
    <div className="modal active">
      <div className="modal-content modal-large">
        <div className="modal-header">
          <h2>Nueva Transacción</h2>
          <button className="modal-close" onClick={() => closeModal('transaction')}>
            &times;
          </button>
        </div>
        <div className="modal-body">
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Fecha</label>
                <input
                  type="date"
                  className="form-control"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>
              <div className="form-group" style={{ flex: 2 }}>
                <label className="form-label">Plantilla</label>
                <select
                  className="form-control"
                  value={template}
                  onChange={(e) => handleTemplateChange(e.target.value)}
                >
                  <option value="">Manual</option>
                  <option value="saleCash">Venta al Contado + IVA</option>
                  <option value="sale">Venta al Crédito + IVA</option>
                  <option value="purchaseCash">Compra al Contado + IVA</option>
                  <option value="purchase">Compra al Crédito + IVA</option>
                  <option value="payment">Pago a Proveedor</option>
                  <option value="collection">Cobro a Cliente</option>
                  <option value="expense">Gasto General + IVA</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Descripción</label>
              <input
                type="text"
                className="form-control"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>
            
            {/* Product selection for inventory templates */}
            {affectsInventory && (
              <div style={{ 
                background: 'var(--color-bg-2)', 
                padding: 'var(--space-16)', 
                borderRadius: 'var(--radius-md)',
                marginBottom: 'var(--space-16)'
              }}>
                <h4 style={{ marginBottom: 'var(--space-12)' }}>
                  {isSaleTemplate ? '📦 Producto a Vender' : '📥 Producto a Comprar'}
                </h4>
                <div className="form-row">
                  <div className="form-group" style={{ flex: 2 }}>
                    <label className="form-label">Producto</label>
                    <select
                      className="form-control"
                      value={selectedProduct}
                      onChange={(e) => setSelectedProduct(e.target.value)}
                      required={affectsInventory}
                    >
                      <option value="">Seleccionar producto...</option>
                      {state.inventory.map((item) => (
                        <option key={item.sku} value={item.sku}>
                          {item.product} - Stock: {item.stock} - Costo: {formatCurrency(item.avgCost)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Cantidad</label>
                    <input
                      type="number"
                      className="form-control"
                      min="1"
                      max={isSaleTemplate && product ? product.stock : undefined}
                      value={quantity}
                      onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    />
                  </div>
                  {isSaleTemplate && (
                    <div className="form-group">
                      <label className="form-label">Precio Venta (sin IVA)</label>
                      <input
                        type="number"
                        className="form-control"
                        step="0.01"
                        min="0"
                        value={salePrice}
                        onChange={(e) => setSalePrice(parseFloat(e.target.value) || 0)}
                        placeholder="Precio unitario"
                      />
                    </div>
                  )}
                  {isPurchaseTemplate && (
                    <div className="form-group">
                      <label className="form-label">Costo Unitario (sin IVA)</label>
                      <input
                        type="number"
                        className="form-control"
                        step="0.01"
                        min="0"
                        value={salePrice || (product?.avgCost || 0)}
                        onChange={(e) => setSalePrice(parseFloat(e.target.value) || 0)}
                        placeholder="Costo unitario"
                      />
                    </div>
                  )}
                </div>
                {product && (
                  <div style={{ 
                    marginTop: 'var(--space-8)', 
                    fontSize: 'var(--font-size-sm)',
                    color: 'var(--color-text-secondary)'
                  }}>
                    {isSaleTemplate && (
                      <>
                        <strong>Resumen:</strong> {quantity} × {formatCurrency(salePrice)} = {formatCurrency(salePrice * quantity)} + IVA ({formatCurrency(salePrice * quantity * 0.13)}) = <strong>{formatCurrency(salePrice * quantity * 1.13)}</strong>
                        <br />
                        Costo de venta: {quantity} × {formatCurrency(product.avgCost)} = {formatCurrency(product.avgCost * quantity)}
                        {quantity > product.stock && (
                          <span style={{ color: 'var(--color-error)', marginLeft: '10px' }}>
                            ⚠️ Stock insuficiente
                          </span>
                        )}
                      </>
                    )}
                    {isPurchaseTemplate && (
                      <>
                        <strong>Resumen:</strong> {quantity} × {formatCurrency(salePrice || product.avgCost)} = {formatCurrency((salePrice || product.avgCost) * quantity)} + IVA ({formatCurrency((salePrice || product.avgCost) * quantity * 0.13)}) = <strong>{formatCurrency((salePrice || product.avgCost) * quantity * 1.13)}</strong>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
            
            <h4>Asientos Contables</h4>
            <div style={{ marginTop: 'var(--space-16)' }}>
              {entries.map((entry, index) => (
                <div key={index} className="entry-row">
                  <div className="form-group">
                    {index === 0 && <label className="form-label">Cuenta</label>}
                    <select
                      className="form-control"
                      value={entry.account}
                      onChange={(e) => updateEntry(index, 'account', e.target.value)}
                      required
                    >
                      <option value="">Seleccionar cuenta...</option>
                      {state.accounts.map((acc) => (
                        <option key={acc.code} value={acc.code}>
                          {acc.code} - {acc.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    {index === 0 && <label className="form-label">Debe</label>}
                    <input
                      type="number"
                      className="form-control"
                      step="0.01"
                      min="0"
                      value={entry.debe}
                      onChange={(e) => updateEntry(index, 'debe', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    {index === 0 && <label className="form-label">Haber</label>}
                    <input
                      type="number"
                      className="form-control"
                      step="0.01"
                      min="0"
                      value={entry.haber}
                      onChange={(e) => updateEntry(index, 'haber', e.target.value)}
                    />
                  </div>
                  <button
                    type="button"
                    className="remove-entry-btn"
                    onClick={() => removeEntry(index)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <button type="button" className="btn btn--secondary" onClick={addEntry}>
              + Agregar Asiento
            </button>
            <div className="balance-summary">
              <div>Debe: <span>{formatCurrency(totalDebe)}</span></div>
              <div>Haber: <span>{formatCurrency(totalHaber)}</span></div>
              <div>
                Diferencia:{' '}
                <span style={{ color: isBalanced ? 'var(--color-success)' : 'var(--color-error)' }}>
                  {formatCurrency(difference)}
                </span>
              </div>
            </div>
            <div className="modal-actions">
              <button
                type="button"
                className="btn btn--secondary"
                onClick={() => closeModal('transaction')}
              >
                Cancelar
              </button>
              <button type="submit" className="btn btn--primary">
                Guardar Transacción
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

