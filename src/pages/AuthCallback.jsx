import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiCheckCircle, FiAlertCircle, FiLoader } from 'react-icons/fi';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import logo from '../assets/logo.png';

function AuthCallback() {
  const [verificationStatus, setVerificationStatus] = useState('loading');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the current URL hash to extract auth parameters
        const hash = window.location.hash;
        
        // Check if the URL is for email verification
        const isVerificationFlow = window.location.href.includes('type=signup');
        
        // Handle email verification flow
        if (isVerificationFlow) {
          // Let Supabase Auth handle the verification process automatically
          // It will exchange the token in the URL for a session
          const { data, error } = await supabase.auth.getSession();
          
          if (error) {
            console.error('Verification error:', error);
            setVerificationStatus('error');
            setMessage(error.message || 'Email verification failed. The link may have expired.');
            return;
          }
          
          if (data?.session) {
            console.log('Email verified successfully!');
            setVerificationStatus('success');
            setMessage('Your email has been verified successfully!');
            
            // Redirect to dashboard after 3 seconds if already logged in
            setTimeout(() => {
              navigate('/dashboard');
            }, 3000);
            
            return;
          }
        }
        
        // Handle OAuth callback if not email verification
        if (hash && hash.includes('access_token')) {
          setMessage('Logging you in...');
          
          // Supabase will handle this automatically in most cases
          // This is just a fallback
          setTimeout(() => {
            navigate('/dashboard');
          }, 1500);
          
          return;
        }
        
        // If we don't recognize the callback type, show a generic success
        setVerificationStatus('success');
        setMessage('Authentication successful!');
        setTimeout(() => {
          navigate(user ? '/dashboard' : '/login');
        }, 1500);
        
      } catch (error) {
        console.error('Auth callback error:', error);
        setVerificationStatus('error');
        setMessage('Authentication error. Please try again.');
      }
    };
    
    handleAuthCallback();
  }, [navigate, user]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-xl shadow-md p-8">
        <div className="text-center">
          <img className="mx-auto h-16 w-auto" src={logo} alt="Applify Logo" />
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {verificationStatus === 'loading' ? 'Processing' : 
             verificationStatus === 'success' ? 'Success!' : 'Verification Failed'}
          </h2>
        </div>

        <div className="mt-8 text-center">
          <div className="flex justify-center mb-6">
            {verificationStatus === 'loading' && (
              <FiLoader className="h-16 w-16 text-blue-600 animate-spin" />
            )}
            {verificationStatus === 'success' && (
              <FiCheckCircle className="h-16 w-16 text-green-500" />
            )}
            {verificationStatus === 'error' && (
              <FiAlertCircle className="h-16 w-16 text-red-500" />
            )}
          </div>
          
          <p className="text-lg text-gray-700 mb-8">
            {message || 'Processing your request...'}
          </p>

          {verificationStatus === 'error' && (
            <div>
              <p className="text-gray-600 mb-6">
                You can try again by requesting a new verification link from the login page.
              </p>
              <Link to="/login" className="btn-primary w-full block">
                Go to Login
              </Link>
            </div>
          )}
          
          {verificationStatus === 'success' && (
            <div className="text-gray-600">
              <p className="mb-2">Redirecting you automatically...</p>
              <Link to={user ? "/dashboard" : "/login"} className="text-blue-600 hover:underline">
                Click here if you're not redirected
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AuthCallback;
