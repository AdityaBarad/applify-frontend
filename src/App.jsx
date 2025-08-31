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
import HowToUsePage from './pages/HowToUsePage';
import TelegramOpportunitiesPage from './pages/TelegramOpportunitiesPage';
import AuthCallback from './pages/AuthCallback';
import JobDatingPage from './pages/JobDatingPage';

import PrivacyPolicy from './pages/PrivacyPolicy';

// Import styles
import './styles/global.css';
import './styles/spinner.css';
import { useEffect } from 'react';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  
  // If still loading auth state, don't redirect yet
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>;
  }
  
  // Redirect to login if not authenticated
  return user ? children : <Navigate to="/login" />;
}

function App() {
  useEffect(() => {
    document.title = 'Applify - Automated Job Applications';
  }, []);

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
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/email-verification" element={<EmailVerification />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          
          {/* Protected dashboard routes */}
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>}>
            <Route index element={<AutomatePage />} />
            <Route path="automate" element={<AutomatePage />} />
            <Route path="manage" element={<ManagePage />} />
            <Route path="jobs" element={<JobDetailsPage />} />
            <Route path="telegram" element={<TelegramOpportunitiesPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="resume" element={<ResumePage />} />
            <Route path="how-to-use" element={<HowToUsePage />} />
            <Route path="job-dating" element={<JobDatingPage />} />
            <Route path="billing" element={<ManagePage />} />
          </Route>
          
          {/* Protected standalone routes */}
          <Route path="/dashboard/automate/:platform" element={<PrivateRoute><AutomationForm /></PrivateRoute>} />
          
          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;