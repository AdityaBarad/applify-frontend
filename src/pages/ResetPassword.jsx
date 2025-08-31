import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiLock, FiAlertCircle, FiLoader, FiCheckCircle } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';
import logo from '../assets/logo-blue.png';

function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [validToken, setValidToken] = useState(false);
  const [processingToken, setProcessingToken] = useState(true);
  const { updatePassword } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

// ...existing code...

useEffect(() => {
  const checkToken = async () => {
    try {
      setProcessingToken(true);
      console.log("Processing reset token...");
      
      // Get the full URL for debugging
      const fullUrl = window.location.href;
      console.log("Full URL:", fullUrl);
      
      // Parse the URL for the token
      const hash = location.hash;
      const queryParams = new URLSearchParams(location.search);
      
      // Look for tokens in different places
      const tokenFromHash = hash && hash.substring(1).includes('access_token') 
        ? new URLSearchParams(hash.substring(1)).get('access_token') 
        : null;
      
      const tokenFromQuery = queryParams.get('token') || 
                           queryParams.get('access_token') ||
                           queryParams.get('reset_token');
      
      const typeFromQuery = queryParams.get('type');
      
      console.log("Token detection results:");
      console.log("- Hash token:", tokenFromHash ? "Found" : "Not found");
      console.log("- Query token:", tokenFromQuery ? "Found" : "Not found");
      console.log("- Type parameter:", typeFromQuery || "Not found");
      
      // Improved recovery URL detection
      const isRecoveryUrl = (typeFromQuery === 'recovery' || 
                           hash.includes('type=recovery') ||
                           location.pathname.includes('reset-password') ||
                           location.pathname.includes('recovery'));
      
      // Direct approach - try to verify OTP with the token from URL
      if (tokenFromQuery && (typeFromQuery === 'recovery' || isRecoveryUrl)) {
        console.log('Using direct OTP verification with query token');
        try {
          const { data, error } = await supabase.auth.verifyOtp({
            token_hash: tokenFromQuery,
            type: 'recovery',
          });
          
          if (!error) {
            console.log('Successfully verified OTP token');
            setValidToken(true);
            return;
          } else {
            console.error('OTP verification error:', error);
          }
        } catch (e) {
          console.error('Exception during OTP verification:', e);
        }
      }
      
      // Try with hash token if query token failed
      if (tokenFromHash) {
        console.log('Trying hash token');
        const refreshToken = new URLSearchParams(hash.substring(1)).get('refresh_token');
        
        try {
          const { data, error } = await supabase.auth.setSession({
            access_token: tokenFromHash,
            refresh_token: refreshToken,
          });
          
          if (!error && data?.session) {
            console.log('Successfully set session with hash token');
            setValidToken(true);
            return;
          } else {
            console.error('Hash token error:', error);
          }
        } catch (e) {
          console.error('Exception during hash token usage:', e);
        }
      }
      
      // Last resort - check for existing session
      const { data, error } = await supabase.auth.getSession();
      
      if (!error && data?.session) {
        console.log('Found existing valid session');
        setValidToken(true);
        return;
      }
      
      // If all verification methods failed
      console.error('All token verification methods failed');
      setError('Unable to verify your password reset link. Please try sending the reset request from same browser window');
      
    } catch (err) {
      console.error('Error processing reset token:', err);
      setError('An error occurred while processing your reset link. Please try again.');
    } finally {
      setProcessingToken(false);
    }
  };
  
  checkToken();
}, [location]);

// ...existing code...

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    
    try {
      setLoading(true);
      
      // Update the password
      const { error } = await supabase.auth.updateUser({ password });
      
      if (error) {
        throw error;
      }
      
      setMessage('Password updated successfully! You will be redirected to login.');
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        // Sign out the user after password reset to clear the recovery session
        supabase.auth.signOut().then(() => {
          navigate('/login');
        });
      }, 3000);
    } catch (error) {
      console.error('Update password error:', error);
      setError(error.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-xl shadow-md p-8">
        <div className="text-center">
          <img className="mx-auto h-16 w-auto" src={logo} alt="Applify Logo" />
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Set new password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Create a new secure password for your account
          </p>
        </div>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-4 mb-4 flex items-start">
            <FiAlertCircle className="mr-2 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
        
        {message && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mt-4 mb-4 flex items-start">
            <FiCheckCircle className="mr-2 mt-0.5" />
            <span>{message}</span>
          </div>
        )}
        
        {processingToken ? (
          <div className="mt-8 text-center">
            <FiLoader className="animate-spin h-10 w-10 text-blue-600 mx-auto" />
            <p className="mt-4 text-gray-600">Verifying your reset link...</p>
          </div>
        ) : validToken ? (
          <form className="space-y-6 mt-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                New password
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="form-input pl-10"
                  placeholder="Enter new password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">
                Confirm new password
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="text-gray-400" />
                </div>
                <input
                  id="confirm-password"
                  name="confirm-password"
                  type="password"
                  required
                  className="form-input pl-10"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>
            
            <div>
              <button
                type="submit"
                className="btn-primary w-full flex justify-center items-center"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <FiLoader className="animate-spin -ml-1 mr-2 h-5 w-5" />
                    Updating...
                  </>
                ) : (
                  'Update password'
                )}
              </button>
            </div>
          </form>
        ) : (
          <div className="mt-6 text-center">
            <p>Please use the link from your email to reset your password.</p>
            <Link to="/forgot-password" className="mt-4 font-medium text-blue-600 hover:text-blue-500 inline-block">
              Request a new reset link
            </Link>
          </div>
        )}
        
        <div className="mt-6 text-center">
          <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;
