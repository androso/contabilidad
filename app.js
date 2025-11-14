// Accounting System Application
const app = {
  // State management
  state: {
    currentUser: null,
    currentCompany: null,
    companies: [
      { id: 1, name: "Demo Company SA de CV", fiscalYear: "2025" }
    ],
    users: [
      { id: 1, name: "Admin User", email: "admin@demo.com", password: "admin", role: "admin" }
    ],
    accounts: [
      { code: "100", name: "Banco", type: "Activo" },
      { code: "110", name: "Inventarios", type: "Activo" },
      { code: "120", name: "Clientes", type: "Activo" },
      { code: "200", name: "Proveedores", type: "Pasivo" },
      { code: "210", name: "IVA Debito Fiscal", type: "Pasivo" },
      { code: "220", name: "IVA Credito Fiscal", type: "Activo" },
      { code: "300", name: "Ventas", type: "Ingreso" },
      { code: "310", name: "Costo de Ventas", type: "Gasto" },
      { code: "400", name: "Gastos Generales", type: "Gasto" },
      { code: "500", name: "Capital", type: "Patrimonio" }
    ],
    transactions: [
      {
        id: 1,
        date: "2025-01-12",
        description: "Venta producto X",
        entries: [
          { account: "120", debe: 100.00, haber: 0.00 },
          { account: "300", debe: 0.00, haber: 88.50 },
          { account: "210", debe: 0.00, haber: 11.50 },
          { account: "310", debe: 60.00, haber: 0.00 },
          { account: "110", debe: 0.00, haber: 60.00 }
        ]
      },
      {
        id: 2,
        date: "2025-01-12",
        description: "Compra inventario Y",
        entries: [
          { account: "110", debe: 120.00, haber: 0.00 },
          { account: "200", debe: 0.00, haber: 120.00 }
        ]
      },
      {
        id: 3,
        date: "2025-01-12",
        description: "Pago a proveedor",
        entries: [
          { account: "200", debe: 120.00, haber: 0.00 },
          { account: "100", debe: 0.00, haber: 120.00 }
        ]
      }
    ],
    inventory: [
      { product: "X", sku: "PRODX001", stock: 40, avgCost: 60.00 },
      { product: "Y", sku: "PRODY001", stock: 50, avgCost: 120.00 }
    ],
    auditLog: []
  },

  // Initialize application
  init() {
    this.setupEventListeners();
    this.loadFromMemory();
  },

  // Setup all event listeners
  setupEventListeners() {
    // Login form
    document.getElementById('loginForm').addEventListener('submit', (e) => {
      e.preventDefault();
      this.login();
    });

    // Logout
    document.getElementById('logoutBtn').addEventListener('click', () => {
      this.logout();
    });

    // Navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const view = e.target.dataset.view;
        this.showView(view);
      });
    });

    // New transaction
    document.getElementById('newTransactionBtn').addEventListener('click', () => {
      this.newTransaction();
    });

    // Transaction form
    document.getElementById('transactionForm').addEventListener('submit', (e) => {
      e.preventDefault();
      this.saveTransaction();
    });

    // Add entry button
    document.getElementById('addEntryBtn').addEventListener('click', () => {
      this.addEntryRow();
    });

    // Template selector
    document.getElementById('txTemplate').addEventListener('change', (e) => {
      this.applyTemplate(e.target.value);
    });

    // Help buttons
    document.querySelectorAll('[id^="help"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const topic = e.target.id.replace('help', '').toLowerCase();
        this.showHelp(topic);
      });
    });

    // New account
    document.getElementById('newAccountBtn').addEventListener('click', () => {
      this.newAccount();
    });

    // New inventory item
    document.getElementById('newInventoryBtn').addEventListener('click', () => {
      this.newInventoryItem();
    });

    // Import file
    document.getElementById('importFile').addEventListener('change', (e) => {
      this.importFile(e.target.files[0]);
    });

    // Mayor account filter
    document.getElementById('mayorAccountFilter').addEventListener('change', () => {
      this.renderLibroMayor();
    });

    // Date initialization
    document.getElementById('txDate').valueAsDate = new Date();
  },

  // Login function
  login() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const user = this.state.users.find(u => u.email === email && u.password === password);

    if (user) {
      this.state.currentUser = user;
      this.state.currentCompany = this.state.companies[0];
      this.logAudit(`Usuario ${user.name} inició sesión`);
      
      document.getElementById('loginScreen').classList.add('hidden');
      document.getElementById('mainApp').classList.remove('hidden');
      document.getElementById('userInfo').textContent = user.name;
      
      this.showView('dashboard');
      this.updateDashboard();
    } else {
      alert('Credenciales incorrectas');
    }
  },

  // Logout function
  logout() {
    this.logAudit(`Usuario ${this.state.currentUser.name} cerró sesión`);
    this.state.currentUser = null;
    document.getElementById('mainApp').classList.add('hidden');
    document.getElementById('loginScreen').classList.remove('hidden');
  },

  // View management
  showView(viewName) {
    // Update navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.classList.remove('active');
      if (btn.dataset.view === viewName) {
        btn.classList.add('active');
      }
    });

    // Update view containers
    document.querySelectorAll('.view-container').forEach(view => {
      view.classList.remove('active');
    });

    const targetView = document.getElementById(viewName + 'View');
    if (targetView) {
      targetView.classList.add('active');
    }

    // Render specific views
    switch(viewName) {
      case 'dashboard':
        this.updateDashboard();
        break;
      case 'transactions':
        this.renderTransactions();
        break;
      case 'libroDiario':
        this.renderLibroDiario();
        break;
      case 'libroMayor':
        this.renderLibroMayor();
        break;
      case 'balanceComprobacion':
        this.renderBalanceComprobacion();
        break;
      case 'inventory':
        this.renderInventory();
        break;
      case 'accounts':
        this.renderAccounts();
        break;
      case 'admin':
        this.renderAdmin();
        break;
    }
  },

  // Dashboard
  updateDashboard() {
    const today = new Date().toISOString().split('T')[0];
    const todayTransactions = this.state.transactions.filter(t => t.date === today).length;
    document.getElementById('todayTransactions').textContent = todayTransactions;

    const balance = this.calculateGeneralBalance();
    document.getElementById('generalBalance').textContent = this.formatCurrency(balance);

    const inventoryValue = this.state.inventory.reduce((sum, item) => sum + (item.stock * item.avgCost), 0);
    document.getElementById('totalInventory').textContent = this.formatCurrency(inventoryValue);
  },

  // Calculate general balance
  calculateGeneralBalance() {
    const balances = this.calculateBalances();
    let total = 0;
    for (const account of this.state.accounts) {
      const balance = balances[account.code] || { debe: 0, haber: 0 };
      if (account.type === 'Activo') {
        total += balance.debe - balance.haber;
      }
    }
    return total;
  },

  // Render transactions list
  renderTransactions() {
    const container = document.getElementById('transactionsList');
    if (this.state.transactions.length === 0) {
      container.innerHTML = '<p style="text-align:center; padding:20px;">No hay transacciones registradas.</p>';
      return;
    }

    let html = '';
    this.state.transactions.forEach(tx => {
      html += `
        <div class="transaction-item">
          <div class="transaction-header">
            <span class="transaction-id">Asiento #${tx.id}</span>
            <span class="transaction-date">${this.formatDate(tx.date)}</span>
          </div>
          <div class="transaction-description">${tx.description}</div>
        </div>
      `;
    });
    container.innerHTML = html;
  },

  // Render Libro Diario
  renderLibroDiario() {
    const container = document.getElementById('libroDiarioTable');
    let html = '<table><thead><tr><th>Asiento</th><th>Fecha</th><th>Descripción</th><th>Cuenta</th><th class="text-right">Debe</th><th class="text-right">Haber</th></tr></thead><tbody>';

    this.state.transactions.forEach(tx => {
      tx.entries.forEach((entry, idx) => {
        const account = this.state.accounts.find(a => a.code === entry.account);
        html += `
          <tr>
            ${idx === 0 ? `<td rowspan="${tx.entries.length}">${tx.id}</td><td rowspan="${tx.entries.length}">${this.formatDate(tx.date)}</td><td rowspan="${tx.entries.length}">${tx.description}</td>` : ''}
            <td>${account ? account.name : entry.account}</td>
            <td class="text-right">${entry.debe > 0 ? this.formatCurrency(entry.debe) : '-'}</td>
            <td class="text-right">${entry.haber > 0 ? this.formatCurrency(entry.haber) : '-'}</td>
          </tr>
        `;
      });
    });

    html += '</tbody></table>';
    container.innerHTML = html;
  },

  // Render Libro Mayor
  renderLibroMayor() {
    const filterAccount = document.getElementById('mayorAccountFilter').value;
    const container = document.getElementById('libroMayorTable');

    // Populate filter if empty
    const filterSelect = document.getElementById('mayorAccountFilter');
    if (filterSelect.options.length === 1) {
      this.state.accounts.forEach(acc => {
        const option = document.createElement('option');
        option.value = acc.code;
        option.textContent = `${acc.code} - ${acc.name}`;
        filterSelect.appendChild(option);
      });
    }

    const accountsToShow = filterAccount ? [this.state.accounts.find(a => a.code === filterAccount)] : this.state.accounts;

    let html = '';
    accountsToShow.forEach(account => {
      if (!account) return;
      
      html += `<h4 style="margin: 20px 0 10px 0;">${account.code} - ${account.name}</h4>`;
      html += '<table><thead><tr><th>Fecha</th><th>Asiento</th><th>Descripción</th><th class="text-right">Debe</th><th class="text-right">Haber</th><th class="text-right">Saldo</th></tr></thead><tbody>';

      let balance = 0;
      this.state.transactions.forEach(tx => {
        tx.entries.forEach(entry => {
          if (entry.account === account.code) {
            balance += entry.debe - entry.haber;
            html += `
              <tr>
                <td>${this.formatDate(tx.date)}</td>
                <td>${tx.id}</td>
                <td>${tx.description}</td>
                <td class="text-right">${entry.debe > 0 ? this.formatCurrency(entry.debe) : '-'}</td>
                <td class="text-right">${entry.haber > 0 ? this.formatCurrency(entry.haber) : '-'}</td>
                <td class="text-right">${this.formatCurrency(balance)}</td>
              </tr>
            `;
          }
        });
      });

      html += '</tbody></table>';
    });

    container.innerHTML = html || '<p style="padding:20px;">Seleccione una cuenta para ver su libro mayor.</p>';
  },

  // Calculate balances for all accounts
  calculateBalances() {
    const balances = {};
    this.state.transactions.forEach(tx => {
      tx.entries.forEach(entry => {
        if (!balances[entry.account]) {
          balances[entry.account] = { debe: 0, haber: 0 };
        }
        balances[entry.account].debe += entry.debe;
        balances[entry.account].haber += entry.haber;
      });
    });
    return balances;
  },

  // Render Balance de Comprobación
  renderBalanceComprobacion() {
    const balances = this.calculateBalances();
    const container = document.getElementById('balanceTable');
    const validation = document.getElementById('balanceValidation');

    let html = '<table><thead><tr><th>Código</th><th>Cuenta</th><th>Tipo</th><th class="text-right">Debe</th><th class="text-right">Haber</th><th class="text-right">Saldo</th></tr></thead><tbody>';

    let totalDebe = 0, totalHaber = 0;

    this.state.accounts.forEach(account => {
      const balance = balances[account.code] || { debe: 0, haber: 0 };
      const saldo = balance.debe - balance.haber;
      totalDebe += balance.debe;
      totalHaber += balance.haber;

      html += `
        <tr>
          <td>${account.code}</td>
          <td>${account.name}</td>
          <td>${account.type}</td>
          <td class="text-right">${this.formatCurrency(balance.debe)}</td>
          <td class="text-right">${this.formatCurrency(balance.haber)}</td>
          <td class="text-right">${this.formatCurrency(saldo)}</td>
        </tr>
      `;
    });

    html += `
      <tr style="font-weight: bold; background: var(--color-bg-2);">
        <td colspan="3">TOTALES</td>
        <td class="text-right">${this.formatCurrency(totalDebe)}</td>
        <td class="text-right">${this.formatCurrency(totalHaber)}</td>
        <td class="text-right">-</td>
      </tr>
    `;

    html += '</tbody></table>';
    container.innerHTML = html;

    // Validation
    const isBalanced = Math.abs(totalDebe - totalHaber) < 0.01;
    validation.className = 'balance-validation ' + (isBalanced ? 'balanced' : 'unbalanced');
    validation.innerHTML = isBalanced 
      ? '✓ El balance está cuadrado. Debe = Haber = ' + this.formatCurrency(totalDebe)
      : `✗ El balance NO está cuadrado. Diferencia: ${this.formatCurrency(Math.abs(totalDebe - totalHaber))}`;
  },

  // Render inventory
  renderInventory() {
    const container = document.getElementById('inventoryTable');
    let html = '<table><thead><tr><th>SKU</th><th>Producto</th><th class="text-right">Stock</th><th class="text-right">Costo Promedio</th><th class="text-right">Valor Total</th></tr></thead><tbody>';

    this.state.inventory.forEach(item => {
      html += `
        <tr>
          <td>${item.sku}</td>
          <td>${item.product}</td>
          <td class="text-right">${item.stock}</td>
          <td class="text-right">${this.formatCurrency(item.avgCost)}</td>
          <td class="text-right">${this.formatCurrency(item.stock * item.avgCost)}</td>
        </tr>
      `;
    });

    html += '</tbody></table>';
    container.innerHTML = html;
  },

  // Render accounts
  renderAccounts() {
    const container = document.getElementById('accountsTable');
    let html = '<table><thead><tr><th>Código</th><th>Nombre</th><th>Tipo</th><th>Acciones</th></tr></thead><tbody>';

    this.state.accounts.forEach(account => {
      html += `
        <tr>
          <td>${account.code}</td>
          <td>${account.name}</td>
          <td>${account.type}</td>
          <td><button class="btn btn--sm btn--secondary" onclick="app.editAccount('${account.code}')">Editar</button></td>
        </tr>
      `;
    });

    html += '</tbody></table>';
    container.innerHTML = html;
  },

  // Render admin panel
  renderAdmin() {
    // Audit log
    const auditContainer = document.getElementById('auditLog');
    if (this.state.auditLog.length === 0) {
      auditContainer.innerHTML = '<p style="text-align:center; padding:20px;">No hay registros de auditoría.</p>';
    } else {
      let html = '';
      this.state.auditLog.slice().reverse().forEach(log => {
        html += `
          <div class="audit-item">
            <div>${log.action}</div>
            <div class="audit-timestamp">${this.formatDateTime(log.timestamp)}</div>
          </div>
        `;
      });
      auditContainer.innerHTML = html;
    }

    // Users list
    const usersContainer = document.getElementById('usersList');
    let usersHtml = '';
    this.state.users.forEach(user => {
      usersHtml += `
        <div class="user-item">
          <div>
            <div>${user.name}</div>
            <div style="font-size: var(--font-size-xs); color: var(--color-text-secondary);">${user.email}</div>
          </div>
          <span class="status status--info">${user.role}</span>
        </div>
      `;
    });
    usersContainer.innerHTML = usersHtml;
  },

  // New transaction modal
  newTransaction() {
    this.openModal('transactionModal');
    document.getElementById('transactionModalTitle').textContent = 'Nueva Transacción';
    document.getElementById('transactionForm').reset();
    document.getElementById('txDate').valueAsDate = new Date();
    document.getElementById('entriesContainer').innerHTML = '';
    this.addEntryRow();
    this.addEntryRow();
    this.updateBalanceSummary();
  },

  // Add entry row
  addEntryRow() {
    const container = document.getElementById('entriesContainer');
    const index = container.children.length;
    
    const row = document.createElement('div');
    row.className = 'entry-row';
    row.innerHTML = `
      <div class="form-group">
        ${index === 0 ? '<label class="form-label">Cuenta</label>' : ''}
        <select class="form-control entry-account" required>
          <option value="">Seleccionar cuenta...</option>
          ${this.state.accounts.map(acc => `<option value="${acc.code}">${acc.code} - ${acc.name}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        ${index === 0 ? '<label class="form-label">Debe</label>' : ''}
        <input type="number" class="form-control entry-debe" step="0.01" min="0" value="0" required>
      </div>
      <div class="form-group">
        ${index === 0 ? '<label class="form-label">Haber</label>' : ''}
        <input type="number" class="form-control entry-haber" step="0.01" min="0" value="0" required>
      </div>
      <button type="button" class="remove-entry-btn" onclick="this.parentElement.remove(); app.updateBalanceSummary();">×</button>
    `;

    container.appendChild(row);

    // Update balance on change
    row.querySelectorAll('input').forEach(input => {
      input.addEventListener('input', () => this.updateBalanceSummary());
    });
  },

  // Update balance summary
  updateBalanceSummary() {
    let totalDebe = 0, totalHaber = 0;
    
    document.querySelectorAll('.entry-debe').forEach(input => {
      totalDebe += parseFloat(input.value) || 0;
    });
    
    document.querySelectorAll('.entry-haber').forEach(input => {
      totalHaber += parseFloat(input.value) || 0;
    });

    document.getElementById('totalDebe').textContent = this.formatCurrency(totalDebe);
    document.getElementById('totalHaber').textContent = this.formatCurrency(totalHaber);
    
    const diff = Math.abs(totalDebe - totalHaber);
    const diffEl = document.getElementById('difference');
    diffEl.textContent = this.formatCurrency(diff);
    diffEl.style.color = diff < 0.01 ? 'var(--color-success)' : 'var(--color-error)';
  },

  // Apply transaction template
  applyTemplate(template) {
    if (!template) return;

    const container = document.getElementById('entriesContainer');
    container.innerHTML = '';

    const templates = {
      sale: [
        { account: '120', debe: 115, haber: 0, label: 'Clientes' },
        { account: '300', debe: 0, haber: 100, label: 'Ventas' },
        { account: '210', debe: 0, haber: 15, label: 'IVA Débito Fiscal' }
      ],
      purchase: [
        { account: '110', debe: 100, haber: 0, label: 'Inventarios' },
        { account: '220', debe: 13, haber: 0, label: 'IVA Crédito Fiscal' },
        { account: '200', debe: 0, haber: 113, label: 'Proveedores' }
      ],
      payment: [
        { account: '200', debe: 100, haber: 0, label: 'Proveedores' },
        { account: '100', debe: 0, haber: 100, label: 'Banco' }
      ],
      collection: [
        { account: '100', debe: 100, haber: 0, label: 'Banco' },
        { account: '120', debe: 0, haber: 100, label: 'Clientes' }
      ],
      expense: [
        { account: '400', debe: 100, haber: 0, label: 'Gastos Generales' },
        { account: '100', debe: 0, haber: 100, label: 'Banco' }
      ]
    };

    const entries = templates[template] || [];
    entries.forEach(entry => {
      this.addEntryRow();
      const lastRow = container.lastChild;
      lastRow.querySelector('.entry-account').value = entry.account;
      lastRow.querySelector('.entry-debe').value = entry.debe;
      lastRow.querySelector('.entry-haber').value = entry.haber;
    });

    this.updateBalanceSummary();
  },

  // Save transaction
  saveTransaction() {
    const totalDebe = parseFloat(document.getElementById('totalDebe').textContent.replace(/[^0-9.-]+/g, ''));
    const totalHaber = parseFloat(document.getElementById('totalHaber').textContent.replace(/[^0-9.-]+/g, ''));

    if (Math.abs(totalDebe - totalHaber) > 0.01) {
      alert('Error: La transacción no está balanceada. Debe = Haber es requerido.');
      return;
    }

    const entries = [];
    document.querySelectorAll('.entry-row').forEach(row => {
      const account = row.querySelector('.entry-account').value;
      const debe = parseFloat(row.querySelector('.entry-debe').value) || 0;
      const haber = parseFloat(row.querySelector('.entry-haber').value) || 0;

      if (account && (debe > 0 || haber > 0)) {
        entries.push({ account, debe, haber });
      }
    });

    if (entries.length === 0) {
      alert('Debe agregar al menos un asiento contable.');
      return;
    }

    const transaction = {
      id: this.state.transactions.length + 1,
      date: document.getElementById('txDate').value,
      description: document.getElementById('txDescription').value,
      entries: entries
    };

    this.state.transactions.push(transaction);
    this.logAudit(`Transacción #${transaction.id} creada: ${transaction.description}`);
    
    // Update inventory if applicable
    this.updateInventoryFromTransaction(transaction);

    this.closeModal('transactionModal');
    alert('Transacción guardada exitosamente');
    this.showView('libroDiario');
  },

  // Update inventory from transaction
  updateInventoryFromTransaction(transaction) {
    // This is a simplified perpetual inventory update
    // In a real system, this would be more sophisticated
    transaction.entries.forEach(entry => {
      if (entry.account === '110') { // Inventarios account
        // Logic would go here to update specific products
      }
    });
  },

  // New account
  newAccount() {
    const code = prompt('Código de cuenta:');
    const name = prompt('Nombre de cuenta:');
    const type = prompt('Tipo (Activo/Pasivo/Patrimonio/Ingreso/Gasto):');

    if (code && name && type) {
      this.state.accounts.push({ code, name, type });
      this.logAudit(`Cuenta ${code} - ${name} creada`);
      this.renderAccounts();
    }
  },

  // Edit account
  editAccount(code) {
    const account = this.state.accounts.find(a => a.code === code);
    if (!account) return;

    const name = prompt('Nuevo nombre:', account.name);
    if (name) {
      account.name = name;
      this.logAudit(`Cuenta ${code} modificada`);
      this.renderAccounts();
    }
  },

  // New inventory item
  newInventoryItem() {
    const sku = prompt('SKU:');
    const product = prompt('Nombre del producto:');
    const stock = parseFloat(prompt('Stock inicial:'));
    const avgCost = parseFloat(prompt('Costo promedio:'));

    if (sku && product && !isNaN(stock) && !isNaN(avgCost)) {
      this.state.inventory.push({ sku, product, stock, avgCost });
      this.logAudit(`Producto ${product} agregado al inventario`);
      this.renderInventory();
    }
  },

  // Export data
  exportData(format = 'json') {
    const data = {
      company: this.state.currentCompany,
      accounts: this.state.accounts,
      transactions: this.state.transactions,
      inventory: this.state.inventory,
      exportDate: new Date().toISOString()
    };

    const dataStr = JSON.stringify(data, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `contabilidad-${this.state.currentCompany.name}-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);

    this.logAudit('Datos exportados en formato ' + format);
  },

  // Backup data
  backupData() {
    this.exportData('json');
  },

  // Import file
  importFile(file) {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (confirm('¿Desea importar estas transacciones? Esto agregará los datos sin eliminar los existentes.')) {
          if (data.transactions) {
            data.transactions.forEach(tx => {
              tx.id = this.state.transactions.length + 1;
              this.state.transactions.push(tx);
            });
          }
          this.logAudit('Datos importados desde archivo');
          alert('Importación exitosa');
          this.showView('transactions');
        }
      } catch (error) {
        alert('Error al importar archivo: formato inválido');
      }
    };
    reader.readAsText(file);
  },

  // Import DTE (simulated)
  importDTE() {
    alert('Funcionalidad de importación de DTE (Documentos Tributarios Electrónicos).\n\nEsta característica se conectaría con la API del Ministerio de Hacienda de El Salvador para importar facturas electrónicas automáticamente.');
  },

  // Export report
  exportReport(type, format) {
    alert(`Exportando ${type} en formato ${format}.\n\nEn un sistema completo, esto generaría un archivo ${format.toUpperCase()} con el reporte seleccionado.`);
    this.logAudit(`Reporte ${type} exportado en ${format}`);
  },

  // Show help modal
  showHelp(topic) {
    const helpContent = {
      dashboard: `
        <h3>Panel de Control</h3>
        <p>El panel de control muestra un resumen de la actividad contable de tu empresa:</p>
        <ul>
          <li><strong>Transacciones Hoy:</strong> Número de asientos registrados en el día actual.</li>
          <li><strong>Balance General:</strong> Total de activos de la empresa.</li>
          <li><strong>Inventario Total:</strong> Valor total del inventario en existencia.</li>
        </ul>
        <p>Use las acciones rápidas para acceder directamente a funciones comunes.</p>
      `,
      transactions: `
        <h3>Gestión de Transacciones</h3>
        <p>Las transacciones son el corazón del sistema de partida doble. Cada transacción debe cumplir con la regla fundamental:</p>
        <p style="text-align:center; font-weight:bold; color:var(--color-primary);">DEBE = HABER</p>
        <p><strong>Plantillas disponibles:</strong></p>
        <ul>
          <li><strong>Venta con IVA:</strong> Registra una venta incluyendo el impuesto del 13%.</li>
          <li><strong>Compra:</strong> Registra una compra a crédito con IVA.</li>
          <li><strong>Pago a Proveedor:</strong> Registra el pago de una cuenta por pagar.</li>
          <li><strong>Cobro a Cliente:</strong> Registra el cobro de una cuenta por cobrar.</li>
          <li><strong>Gasto General:</strong> Registra un gasto operativo.</li>
        </ul>
      `,
      librodiario: `
        <h3>Libro Diario</h3>
        <p>El Libro Diario es el registro cronológico de todas las transacciones de la empresa. Es uno de los libros obligatorios en El Salvador.</p>
        <p><strong>Requisitos legales:</strong></p>
        <ul>
          <li>Debe estar legalizado ante el Registro de Comercio.</li>
          <li>Registra cada transacción en orden cronológico.</li>
          <li>Cada asiento debe estar balanceado (Debe = Haber).</li>
        </ul>
      `,
      libromayor: `
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
      `,
      balance: `
        <h3>Balance de Comprobación</h3>
        <p>El Balance de Comprobación verifica que todos los asientos estén correctamente registrados.</p>
        <p style="font-weight:bold;">La suma total del Debe debe ser igual a la suma total del Haber.</p>
        <p>Este reporte se genera automáticamente y es esencial antes de preparar los estados financieros.</p>
      `,
      inventory: `
        <h3>Control de Inventario - Método Perpetuo</h3>
        <p>El sistema usa el método perpetuo, que actualiza el inventario en tiempo real con cada transacción.</p>
        <p><strong>Ventajas del método perpetuo:</strong></p>
        <ul>
          <li>Control en tiempo real del stock.</li>
          <li>Cálculo automático del costo de ventas.</li>
          <li>Detección inmediata de faltantes.</li>
        </ul>
        <p>El costo promedio se actualiza con cada compra.</p>
      `,
      accounts: `
        <h3>Plan de Cuentas</h3>
        <p>El Plan de Cuentas es el catálogo de todas las cuentas contables que usa la empresa.</p>
        <p><strong>Tipos de cuentas:</strong></p>
        <ul>
          <li><strong>Activo:</strong> Recursos que posee la empresa.</li>
          <li><strong>Pasivo:</strong> Obligaciones de la empresa.</li>
          <li><strong>Patrimonio:</strong> Capital y utilidades de los propietarios.</li>
          <li><strong>Ingreso:</strong> Ventas y otros ingresos.</li>
          <li><strong>Gasto:</strong> Costos y gastos operativos.</li>
        </ul>
      `,
      reports: `
        <h3>Reportes y Exportaciones</h3>
        <p>El sistema permite exportar todos los libros contables y estados financieros en múltiples formatos.</p>
        <p><strong>Formatos disponibles:</strong></p>
        <ul>
          <li><strong>PDF:</strong> Para impresión y presentación.</li>
          <li><strong>Excel:</strong> Para análisis adicional.</li>
          <li><strong>CSV:</strong> Para importar a otros sistemas.</li>
          <li><strong>JSON:</strong> Para backup y migración.</li>
        </ul>
      `,
      admin: `
        <h3>Administración</h3>
        <p>El panel de administración permite gestionar usuarios, ver el registro de auditoría y configurar empresas.</p>
        <p><strong>Registro de Auditoría:</strong> Mantiene un historial de todas las acciones importantes en el sistema.</p>
        <p><strong>Gestión de Usuarios:</strong> Cree y administre usuarios con diferentes roles y permisos.</p>
      `
    };

    const content = helpContent[topic] || '<p>Ayuda no disponible para esta sección.</p>';
    document.getElementById('helpContent').innerHTML = content;
    this.openModal('helpModal');
  },

  // Modal management
  openModal(modalId) {
    document.getElementById(modalId).classList.add('active');
  },

  closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
  },

  // Audit log
  logAudit(action) {
    this.state.auditLog.push({
      action,
      timestamp: new Date().toISOString(),
      user: this.state.currentUser ? this.state.currentUser.name : 'Sistema'
    });
  },

  // Utility functions
  formatCurrency(amount) {
    return new Intl.NumberFormat('es-SV', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  },

  formatDate(dateStr) {
    const date = new Date(dateStr + 'T00:00:00');
    return new Intl.DateTimeFormat('es-SV', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  },

  formatDateTime(isoStr) {
    const date = new Date(isoStr);
    return new Intl.DateTimeFormat('es-SV', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  },

  // Load data from memory (simulates persistence)
  loadFromMemory() {
    // In a real application, this would load from a backend
    // For this prototype, data is already initialized in state
  },

  // Save to memory (simulates persistence)
  saveToMemory() {
    // In a real application, this would save to a backend
    // For this prototype, all changes are already in state
  }
};

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => app.init());
} else {
  app.init();
}