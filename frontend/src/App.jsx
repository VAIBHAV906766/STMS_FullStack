import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import { roleHomePath, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import CustomerDashboard from './pages/CustomerDashboard';
import OwnerDashboard from './pages/OwnerDashboard';
import DriverDashboard from './pages/DriverDashboard';
import BookingFormPage from './pages/BookingFormPage';
import PendingBookingsPage from './pages/PendingBookingsPage';
import InvoicePage from './pages/InvoicePage';
import PaymentPage from './pages/PaymentPage';
import NotFoundPage from './pages/NotFoundPage';

const AppLayout = () => {
  const location = useLocation();
  const isAuthPage = ['/login', '/signup'].includes(location.pathname);

  return (
    <div className="app-shell">
      {!isAuthPage ? <Navbar /> : null}
      <main className="container main-content">
        <Outlet />
      </main>
    </div>
  );
};

const HomeRedirect = () => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={roleHomePath(user.role)} replace />;
};

const App = () => {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<HomeRedirect />} />

        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        <Route
          path="/customer/dashboard"
          element={
            <ProtectedRoute allowedRoles={['CUSTOMER']}>
              <CustomerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customer/bookings/new"
          element={
            <ProtectedRoute allowedRoles={['CUSTOMER']}>
              <BookingFormPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customer/invoices"
          element={
            <ProtectedRoute allowedRoles={['CUSTOMER']}>
              <InvoicePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customer/payment/:invoiceId"
          element={
            <ProtectedRoute allowedRoles={['CUSTOMER']}>
              <PaymentPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/owner/dashboard"
          element={
            <ProtectedRoute allowedRoles={['OWNER']}>
              <OwnerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/owner/pending-bookings"
          element={
            <ProtectedRoute allowedRoles={['OWNER']}>
              <PendingBookingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/owner/invoices"
          element={
            <ProtectedRoute allowedRoles={['OWNER']}>
              <InvoicePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/driver/dashboard"
          element={
            <ProtectedRoute allowedRoles={['DRIVER']}>
              <DriverDashboard />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
};

export default App;
