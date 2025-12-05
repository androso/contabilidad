'use client';

import { createContext, useContext, useReducer, useCallback, useEffect, useState } from 'react';

const initialState = {
  currentUser: null,
  currentCompany: null,
  currentView: 'dashboard',
  companies: [],
  users: [],
  accounts: [],
  transactions: [],
  inventory: [],
  auditLog: [],
  modals: {
    transaction: false,
    help: false,
    generic: false
  },
  helpTopic: '',
  genericModalContent: { title: '', content: '' }
};

function appReducer(state, action) {
  switch (action.type) {
    case 'SET_INITIAL_DATA':
      return {
        ...state,
        ...action.payload
      };
    case 'LOGIN':
      return {
        ...state,
        currentUser: action.payload.user,
        currentCompany: action.payload.company
      };
    case 'LOGOUT':
      return {
        ...state,
        currentUser: null,
        currentCompany: null,
        currentView: 'dashboard'
      };
    case 'SET_VIEW':
      return {
        ...state,
        currentView: action.payload
      };
    case 'SET_TRANSACTIONS':
      return {
        ...state,
        transactions: action.payload
      };
    case 'ADD_TRANSACTION':
      return {
        ...state,
        transactions: [...state.transactions, action.payload]
      };
    case 'SET_ACCOUNTS':
      return {
        ...state,
        accounts: action.payload
      };
    case 'ADD_ACCOUNT':
      return {
        ...state,
        accounts: [...state.accounts, action.payload]
      };
    case 'UPDATE_ACCOUNT':
      return {
        ...state,
        accounts: state.accounts.map(acc => 
          acc.code === action.payload.code ? action.payload : acc
        )
      };
    case 'SET_INVENTORY':
      return {
        ...state,
        inventory: action.payload
      };
    case 'ADD_INVENTORY_ITEM':
      return {
        ...state,
        inventory: [...state.inventory, action.payload]
      };
    case 'UPDATE_INVENTORY':
      return {
        ...state,
        inventory: state.inventory.map(item =>
          item.sku === action.payload.sku ? action.payload : item
        )
      };
    case 'SET_AUDIT_LOG':
      return {
        ...state,
        auditLog: action.payload
      };
    case 'ADD_AUDIT_LOG':
      return {
        ...state,
        auditLog: [action.payload, ...state.auditLog]
      };
    case 'OPEN_MODAL':
      return {
        ...state,
        modals: { ...state.modals, [action.payload]: true }
      };
    case 'CLOSE_MODAL':
      return {
        ...state,
        modals: { ...state.modals, [action.payload]: false }
      };
    case 'SET_HELP_TOPIC':
      return {
        ...state,
        helpTopic: action.payload
      };
    case 'SET_GENERIC_MODAL_CONTENT':
      return {
        ...state,
        genericModalContent: action.payload
      };
    default:
      return state;
  }
}

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const [isLoading, setIsLoading] = useState(true);
  const [dbError, setDbError] = useState(null);

  // Initialize database and restore session
  useEffect(() => {
    async function initializeApp() {
      try {
        // Initialize database tables and get the company
        const initRes = await fetch('/api/init');
        const initData = await initRes.json();
        
        if (!initData.success || !initData.company) {
          console.error('Failed to initialize database or no company found');
          setDbError('No se pudo inicializar la base de datos');
          setIsLoading(false);
          return;
        }
        
        const dbCompany = initData.company;
        
        // Restore session from localStorage
        const savedSession = localStorage.getItem('contabilidad_session');
        if (savedSession) {
          try {
            const { user, company } = JSON.parse(savedSession);
            // Validate that the saved company matches the database company
            if (user && company && company.id === dbCompany.id) {
              dispatch({ type: 'LOGIN', payload: { user, company } });
              await loadUserDataDirect(company.id);
            } else if (user) {
              // Company ID mismatch - update with correct company from DB
              const correctedCompany = {
                id: dbCompany.id,
                name: dbCompany.name,
                fiscalYear: dbCompany.fiscal_year
              };
              dispatch({ type: 'LOGIN', payload: { user, company: correctedCompany } });
              // Update localStorage with corrected company
              localStorage.setItem('contabilidad_session', JSON.stringify({
                user,
                company: correctedCompany
              }));
              await loadUserDataDirect(dbCompany.id);
            } else {
              localStorage.removeItem('contabilidad_session');
            }
          } catch (parseError) {
            console.error('Failed to parse saved session:', parseError);
            localStorage.removeItem('contabilidad_session');
          }
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to initialize database:', error);
        setDbError(error.message);
        setIsLoading(false);
      }
    }
    initializeApp();
  }, []);
  
  // Direct data loading function (used during init, before loadUserData is available)
  async function loadUserDataDirect(companyId) {
    try {
      const [accountsRes, transactionsRes, inventoryRes, auditRes] = await Promise.all([
        fetch(`/api/accounts?companyId=${companyId}`),
        fetch(`/api/transactions?companyId=${companyId}`),
        fetch(`/api/inventory?companyId=${companyId}`),
        fetch(`/api/audit?companyId=${companyId}`)
      ]);

      const [accountsData, transactionsData, inventoryData, auditData] = await Promise.all([
        accountsRes.json(),
        transactionsRes.json(),
        inventoryRes.json(),
        auditRes.json()
      ]);

      if (accountsData.success) {
        dispatch({ type: 'SET_ACCOUNTS', payload: accountsData.accounts });
      }
      if (transactionsData.success) {
        dispatch({ type: 'SET_TRANSACTIONS', payload: transactionsData.transactions });
      }
      if (inventoryData.success) {
        dispatch({ type: 'SET_INVENTORY', payload: inventoryData.inventory });
      }
      if (auditData.success) {
        dispatch({ type: 'SET_AUDIT_LOG', payload: auditData.auditLog });
      }
    } catch (error) {
      console.error('Failed to load user data:', error);
    }
  }

  // Load data when user logs in
  const loadUserData = useCallback(async (companyId) => {
    try {
      const [accountsRes, transactionsRes, inventoryRes, auditRes] = await Promise.all([
        fetch(`/api/accounts?companyId=${companyId}`),
        fetch(`/api/transactions?companyId=${companyId}`),
        fetch(`/api/inventory?companyId=${companyId}`),
        fetch(`/api/audit?companyId=${companyId}`)
      ]);

      const [accountsData, transactionsData, inventoryData, auditData] = await Promise.all([
        accountsRes.json(),
        transactionsRes.json(),
        inventoryRes.json(),
        auditRes.json()
      ]);

      if (accountsData.success) {
        dispatch({ type: 'SET_ACCOUNTS', payload: accountsData.accounts });
      }
      if (transactionsData.success) {
        dispatch({ type: 'SET_TRANSACTIONS', payload: transactionsData.transactions });
      }
      if (inventoryData.success) {
        dispatch({ type: 'SET_INVENTORY', payload: inventoryData.inventory });
      }
      if (auditData.success) {
        dispatch({ type: 'SET_AUDIT_LOG', payload: auditData.auditLog });
      }
    } catch (error) {
      console.error('Failed to load user data:', error);
    }
  }, []);

  const login = useCallback(async (email, password) => {
    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      
      if (data.success) {
        dispatch({ type: 'LOGIN', payload: { user: data.user, company: data.company } });
        // Save session to localStorage
        localStorage.setItem('contabilidad_session', JSON.stringify({
          user: data.user,
          company: data.company
        }));
        await loadUserData(data.company.id);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  }, [loadUserData]);

  const logout = useCallback(async () => {
    if (state.currentUser && state.currentCompany) {
      try {
        await fetch('/api/audit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: `Usuario ${state.currentUser.name} cerró sesión`,
            userName: state.currentUser.name,
            companyId: state.currentCompany.id
          })
        });
      } catch (error) {
        console.error('Logout audit error:', error);
      }
    }
    // Clear session from localStorage
    localStorage.removeItem('contabilidad_session');
    dispatch({ type: 'LOGOUT' });
  }, [state.currentUser, state.currentCompany]);

  const setView = useCallback((view) => {
    dispatch({ type: 'SET_VIEW', payload: view });
  }, []);

  const addTransaction = useCallback(async (transaction) => {
    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...transaction,
          companyId: state.currentCompany?.id || 1,
          userName: state.currentUser?.name || 'Sistema'
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        dispatch({ type: 'ADD_TRANSACTION', payload: data.transaction });
        dispatch({ 
          type: 'ADD_AUDIT_LOG', 
          payload: { 
            action: `Transacción #${data.transaction.id} creada: ${data.transaction.description}`,
            timestamp: new Date().toISOString(),
            user: state.currentUser?.name || 'Sistema'
          }
        });
        
        // Reload inventory to get updated values
        if (transaction.inventoryMovements) {
          const inventoryRes = await fetch(`/api/inventory?companyId=${state.currentCompany?.id || 1}`);
          const inventoryData = await inventoryRes.json();
          if (inventoryData.success) {
            dispatch({ type: 'SET_INVENTORY', payload: inventoryData.inventory });
          }
        }
        
        return data.transaction;
      }
      return null;
    } catch (error) {
      console.error('Add transaction error:', error);
      return null;
    }
  }, [state.currentCompany, state.currentUser]);

  const addAccount = useCallback(async (account) => {
    try {
      const response = await fetch('/api/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...account,
          companyId: state.currentCompany?.id || 1,
          userName: state.currentUser?.name || 'Sistema'
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        dispatch({ type: 'ADD_ACCOUNT', payload: data.account });
        dispatch({ 
          type: 'ADD_AUDIT_LOG', 
          payload: { 
            action: `Cuenta ${account.code} - ${account.name} creada`,
            timestamp: new Date().toISOString(),
            user: state.currentUser?.name || 'Sistema'
          }
        });
      }
      return data.success;
    } catch (error) {
      console.error('Add account error:', error);
      return false;
    }
  }, [state.currentCompany, state.currentUser]);

  const updateAccount = useCallback(async (account) => {
    try {
      const response = await fetch('/api/accounts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...account,
          companyId: state.currentCompany?.id || 1,
          userName: state.currentUser?.name || 'Sistema'
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        dispatch({ type: 'UPDATE_ACCOUNT', payload: data.account });
        dispatch({ 
          type: 'ADD_AUDIT_LOG', 
          payload: { 
            action: `Cuenta ${account.code} modificada`,
            timestamp: new Date().toISOString(),
            user: state.currentUser?.name || 'Sistema'
          }
        });
      }
      return data.success;
    } catch (error) {
      console.error('Update account error:', error);
      return false;
    }
  }, [state.currentCompany, state.currentUser]);

  const addInventoryItem = useCallback(async (item) => {
    try {
      const response = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...item,
          companyId: state.currentCompany?.id || 1,
          userName: state.currentUser?.name || 'Sistema'
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        dispatch({ type: 'ADD_INVENTORY_ITEM', payload: data.item });
        dispatch({ 
          type: 'ADD_AUDIT_LOG', 
          payload: { 
            action: `Producto ${item.product} agregado al inventario`,
            timestamp: new Date().toISOString(),
            user: state.currentUser?.name || 'Sistema'
          }
        });
      }
      return data.success;
    } catch (error) {
      console.error('Add inventory item error:', error);
      return false;
    }
  }, [state.currentCompany, state.currentUser]);

  const openModal = useCallback((modalName) => {
    dispatch({ type: 'OPEN_MODAL', payload: modalName });
  }, []);

  const closeModal = useCallback((modalName) => {
    dispatch({ type: 'CLOSE_MODAL', payload: modalName });
  }, []);

  const showHelp = useCallback((topic) => {
    dispatch({ type: 'SET_HELP_TOPIC', payload: topic });
    dispatch({ type: 'OPEN_MODAL', payload: 'help' });
  }, []);

  const calculateBalances = useCallback(() => {
    const balances = {};
    state.transactions.forEach(tx => {
      tx.entries.forEach(entry => {
        if (!balances[entry.account]) {
          balances[entry.account] = { debe: 0, haber: 0 };
        }
        balances[entry.account].debe += entry.debe;
        balances[entry.account].haber += entry.haber;
      });
    });
    return balances;
  }, [state.transactions]);

  const calculateGeneralBalance = useCallback(() => {
    const balances = calculateBalances();
    let totalActivos = 0;
    
    for (const account of state.accounts) {
      const balance = balances[account.code] || { debe: 0, haber: 0 };
      const saldo = balance.debe - balance.haber;
      
      if (account.type === 'Activo') {
        totalActivos += saldo;
      }
    }
    
    return totalActivos;
  }, [state.accounts, calculateBalances]);

  const formatCurrency = useCallback((amount) => {
    return new Intl.NumberFormat('es-SV', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  }, []);

  const formatDate = useCallback((dateStr) => {
    const date = new Date(dateStr + 'T00:00:00');
    return new Intl.DateTimeFormat('es-SV', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  }, []);

  const formatDateTime = useCallback((isoStr) => {
    const date = new Date(isoStr);
    return new Intl.DateTimeFormat('es-SV', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }, []);

  const exportData = useCallback((format = 'json') => {
    const data = {
      company: state.currentCompany,
      accounts: state.accounts,
      transactions: state.transactions,
      inventory: state.inventory,
      exportDate: new Date().toISOString()
    };

    const dataStr = JSON.stringify(data, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `contabilidad-${state.currentCompany?.name || 'export'}-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);

    // Log export action
    fetch('/api/audit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'Datos exportados en formato ' + format,
        userName: state.currentUser?.name || 'Sistema',
        companyId: state.currentCompany?.id || 1
      })
    }).catch(console.error);

    dispatch({ 
      type: 'ADD_AUDIT_LOG', 
      payload: { 
        action: 'Datos exportados en formato ' + format,
        timestamp: new Date().toISOString(),
        user: state.currentUser?.name || 'Sistema'
      }
    });
  }, [state.currentCompany, state.accounts, state.transactions, state.inventory, state.currentUser]);

  const resetDatabase = useCallback(async () => {
    try {
      const response = await fetch('/api/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const data = await response.json();
      
      if (data.success && data.company) {
        // Clear localStorage session
        localStorage.removeItem('contabilidad_session');
        
        // Reset state
        dispatch({ type: 'LOGOUT' });
        dispatch({ type: 'SET_ACCOUNTS', payload: [] });
        dispatch({ type: 'SET_TRANSACTIONS', payload: [] });
        dispatch({ type: 'SET_INVENTORY', payload: [] });
        dispatch({ type: 'SET_AUDIT_LOG', payload: [] });
        
        return { success: true, message: 'Base de datos reiniciada. Por favor, inicia sesión nuevamente.' };
      }
      
      return { success: false, message: data.error || 'Error al reiniciar la base de datos' };
    } catch (error) {
      console.error('Reset database error:', error);
      return { success: false, message: error.message };
    }
  }, []);

  const value = {
    state,
    dispatch,
    isLoading,
    dbError,
    login,
    logout,
    setView,
    addTransaction,
    addAccount,
    updateAccount,
    addInventoryItem,
    openModal,
    closeModal,
    showHelp,
    calculateBalances,
    calculateGeneralBalance,
    formatCurrency,
    formatDate,
    formatDateTime,
    exportData,
    resetDatabase
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
