import { type ReactElement } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useApp } from './context/AppContext';

import LoginPage        from './pages/LoginPage';
import DashboardPage    from './pages/DashboardPage';
import BillingPage      from './pages/BillingPage';
import InventoryPage    from './pages/InventoryPage';
import CustomersPage    from './pages/CustomersPage';
import CustomerDetailPage from './pages/CustomerDetailPage';
import BooksPage        from './pages/BooksPage';
import ConversionPage   from './pages/ConversionPage';
import ProfilePage      from './pages/ProfilePage';
import SettingsPage     from './pages/SettingsPage';

/** Wraps a page so only authenticated users can see it. */
function ProtectedRoute({ children }: { children: ReactElement }) {
  const { user } = useApp();
  return user ? children : <Navigate to="/login" replace />;
}

/** All application routes defined in one place. */
export default function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<LoginPage />} />

      {/* Protected */}
      <Route path="/"            element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path="/billing"     element={<ProtectedRoute><BillingPage /></ProtectedRoute>} />
      <Route path="/inventory"   element={<ProtectedRoute><InventoryPage /></ProtectedRoute>} />
      <Route path="/customers"   element={<ProtectedRoute><CustomersPage /></ProtectedRoute>} />
      <Route path="/customers/:id" element={<ProtectedRoute><CustomerDetailPage /></ProtectedRoute>} />
      <Route path="/books"       element={<ProtectedRoute><BooksPage /></ProtectedRoute>} />
      <Route path="/conversion"  element={<ProtectedRoute><ConversionPage /></ProtectedRoute>} />
      <Route path="/profile"     element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      <Route path="/settings"    element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
