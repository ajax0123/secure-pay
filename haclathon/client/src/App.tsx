import { Navigate, Route, Routes } from 'react-router-dom';
import { ReactNode } from 'react';
import { AppLayout } from './components/layout/AppLayout';
import { AdminRoute } from './components/shared/AdminRoute';
import { ProtectedRoute } from './components/shared/ProtectedRoute';
import { ToastContainer } from './components/shared/ToastContainer';
import { useSocket } from './hooks/useSocket';
import { useAuth } from './context/AuthContext';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { AdminUsersPage } from './pages/AdminUsersPage';
import { DashboardPage } from './pages/DashboardPage';
import { DisputePage } from './pages/DisputePage';
import { FraudReportPage } from './pages/FraudReportPage';
import { LoginPage } from './pages/LoginPage';
import { SessionsPage } from './pages/SessionsPage';
import { SignupPage } from './pages/SignupPage';
import { TransactionsPage } from './pages/TransactionsPage';

const ProtectedShell = ({ children }: { children: ReactNode }) => {
  useSocket();
  return <AppLayout>{children}</AppLayout>;
};

const UserRoute = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  if (user?.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }
  return <>{children}</>;
};

function App() {
  return (
    <>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        <Route
          path="/dashboard"
          element={
            <UserRoute>
              <ProtectedShell>
                <DashboardPage />
              </ProtectedShell>
            </UserRoute>
          }
        />
        <Route
          path="/transactions"
          element={
            <UserRoute>
              <ProtectedShell>
                <TransactionsPage />
              </ProtectedShell>
            </UserRoute>
          }
        />
        <Route
          path="/fraud-report"
          element={
            <ProtectedRoute>
              <ProtectedShell>
                <FraudReportPage />
              </ProtectedShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/sessions"
          element={
            <ProtectedRoute>
              <ProtectedShell>
                <SessionsPage />
              </ProtectedShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dispute"
          element={
            <ProtectedRoute>
              <ProtectedShell>
                <DisputePage />
              </ProtectedShell>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <AdminRoute>
              <ProtectedShell>
                <AdminDashboardPage />
              </ProtectedShell>
            </AdminRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <AdminRoute>
              <ProtectedShell>
                <AdminUsersPage />
              </ProtectedShell>
            </AdminRoute>
          }
        />

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
      <ToastContainer />
    </>
  );
}

export default App;
