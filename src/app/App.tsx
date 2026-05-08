import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AppProvider } from './contexts/AppContext';
import { LoginScreen } from './components/LoginScreen';
/* import { Navigation } from './components/Navigation';
import { Dashboard } from './components/Dashboard';
import { Registros } from './components/Registros';
import { CheckIn } from './components/CheckIn';
import { Pagos } from './components/Pagos';
import { Mercancia } from './components/Mercancia';
import { Reportes } from './components/Reportes';
import { Configuracion } from './components/Configuracion';
import { TicketPage } from './components/TicketPage'; */

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
}

function AppRoutes() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  return (
    <Routes>
      <Route
        path="*"
        element={
          <div className="min-h-screen bg-gray-50">
            <div className="md:pl-20">
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" />} />
                <Route path="/login" element={<Navigate to="/dashboard" />} />
              </Routes>
            </div>
          </div>
        }
      />
    </Routes>
  );
}

export default function App() {
  return (
    <div className="size-full">
      <BrowserRouter>
        <AuthProvider>
          <AppProvider>
            <AppRoutes />
          </AppProvider>
        </AuthProvider>
      </BrowserRouter>
    </div>
  );
}
