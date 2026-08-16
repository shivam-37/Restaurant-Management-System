import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import LandingPage from './pages/Landing/LandingPage';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import TermsOfService from './pages/legal/TermsOfService';
import PrivacyPolicy from './pages/legal/PrivacyPolicy';
import Dashboard from './pages/dashboard/Dashboard';
import TableRedirect from './components/TableRedirect';
import OwnerLogin from './pages/auth/OwnerLogin';
import GuestMenu from './pages/GuestMenu';


import RoleRoute from './components/auth/RoleRoute';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/owner/login" element={<OwnerLogin />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/table/:restaurantId/:tableNumber" element={<TableRedirect />} />
            <Route path="/r/:restaurantId/t/:tableNumber" element={<GuestMenu />} />
            <Route path="/dashboard" element={
              <RoleRoute allowedRoles={['owner', 'admin', 'user']}>
                <Dashboard />
              </RoleRoute>
            } />

          </Routes>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
