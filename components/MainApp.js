'use client';

import { useApp } from '@/context/AppContext';
import Header from './Header';
import Navigation from './Navigation';
import Dashboard from './views/Dashboard';
import Transactions from './views/Transactions';
import LibroDiario from './views/LibroDiario';
import LibroMayor from './views/LibroMayor';
import BalanceComprobacion from './views/BalanceComprobacion';
import Inventory from './views/Inventory';
import Accounts from './views/Accounts';
import Reports from './views/Reports';
import Admin from './views/Admin';
import TransactionModal from './modals/TransactionModal';
import HelpModal from './modals/HelpModal';

const views = {
  dashboard: Dashboard,
  transactions: Transactions,
  libroDiario: LibroDiario,
  libroMayor: LibroMayor,
  balanceComprobacion: BalanceComprobacion,
  inventory: Inventory,
  accounts: Accounts,
  reports: Reports,
  admin: Admin,
};

export default function MainApp() {
  const { state } = useApp();
  const CurrentView = views[state.currentView] || Dashboard;

  return (
    <div className="main-app">
      <Header />
      <Navigation />
      <main className="main-content">
        <CurrentView />
      </main>
      <TransactionModal />
      <HelpModal />
    </div>
  );
}

