import './globals.css';
import { AppProvider } from '@/context/AppContext';

export const metadata = {
  title: 'Sistema de Contabilidad - El Salvador',
  description: 'Sistema de Partida Doble para El Salvador',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  );
}

