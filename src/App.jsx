import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import EmailVerification from './pages/EmailVerification';
import AutomatePage from './pages/AutomatePage';
import ManagePage from './pages/ManagePage';
import JobDetailsPage from './pages/JobDetailsPage';
import AutomationForm from './pages/AutomationForm';
import PricingPage from './pages/PricingPage';
import ProfilePage from './pages/ProfilePage';
import ResumePage from './pages/ResumePage';

// Import styles
import './styles/global.css';
import './styles/spinner.css';

function PrivateRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster 
          position="top-right"
          toastOptions={{
            style: {
              borderRadius: '8px',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
              padding: '16px',
              fontSize: '14px'
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: 'white',
              }
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: 'white',
              }
            }
          }}
        />

        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/email-verification" element={<EmailVerification />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route 
            path="/dashboard/*" 
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/dashboard/automate/:platform" 
            element={
              <PrivateRoute>
                <AutomationForm />
              </PrivateRoute>
            } 
          />
          <Route path="/dashboard" element={<Dashboard />}>
            <Route index element={<Navigate to="/dashboard/automate" replace />} />
            <Route path="automate" element={<AutomatePage />} />
            <Route path="manage" element={<ManagePage />} />
            <Route path="jobs" element={<JobDetailsPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="resume" element={<ResumePage />} />
            <Route path="billing" element={<ManagePage />} /> {/* Replace with actual billing page when created */}
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;