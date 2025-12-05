'use client';

import { useApp } from '@/context/AppContext';
import LoginScreen from '@/components/LoginScreen';
import MainApp from '@/components/MainApp';

export default function Home() {
  const { state, isLoading, dbError } = useApp();

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="loading-content">
          <div className="spinner"></div>
          <p>Conectando a la base de datos...</p>
        </div>
      </div>
    );
  }

  if (dbError) {
    return (
      <div className="error-screen">
        <div className="error-content">
          <h2>Error de Conexión</h2>
          <p>No se pudo conectar a la base de datos.</p>
          <p className="error-detail">{dbError}</p>
          <p>Verifica que DATABASE_URL esté configurado en tu archivo .env</p>
        </div>
      </div>
    );
  }

  if (!state.currentUser) {
    return <LoginScreen />;
  }

  return <MainApp />;
}

