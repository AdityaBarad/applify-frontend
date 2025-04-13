import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiMail, FiLoader, FiCheckCircle, FiAlertCircle, FiRefreshCw, FiTool } from 'react-icons/fi';
import { supabase } from '../lib/supabaseClient';
import { testEmailVerification } from '../utils/supabaseConfigChecker';

function EmailVerification() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(60);
  const [debugging, setDebugging] = useState(false);
  const [debugInfo, setDebugInfo] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';

  useEffect(() => {
    if (!email) {
      navigate('/register');
      return;
    }

    // Set up a countdown timer for resend
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    
    return () => clearTimeout(timer);
  }, [countdown, email, navigate]);

  const handleResendVerification = async () => {
    if (countdown > 0) return;
    
    try {
      setLoading(true);
      setError('');
      console.log("Resending verification to:", email);
      
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/email-verification`,
        }
      });
      
      if (error) throw error;
      
      setCountdown(60);
      toast.success("Verification email resent");
    } catch (error) {
      console.error('Resend verification error:', error);
      setError(error.message || 'Failed to resend verification email');
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    navigate('/login');
  };

  const runDiagnostics = async () => {
    setDebugging(true);
    try {
      const testResult = await testEmailVerification(email);
      setDebugInfo(testResult);
    } catch (err) {
      setDebugInfo({ error: err.message });
    } finally {
      setDebugging(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-xl shadow-md p-8">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <FiMail className="h-12 w-12 text-blue-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Verify your email</h2>
          <p className="mt-2 text-gray-600">
            We've sent a verification link to <span className="font-medium">{email}</span>
          </p>
        </div>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 flex items-start">
            <FiAlertCircle className="mr-2 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
        
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
          <div className="flex">
            <FiCheckCircle className="h-5 w-5 text-blue-500 mr-2" />
            <div>
              <p className="text-sm text-blue-700">
                Please check your email and click on the verification link to activate your account.
              </p>
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <button
            onClick={handleResendVerification}
            disabled={countdown > 0 || loading}
            className={`w-full flex items-center justify-center py-2 px-4 border rounded-md shadow-sm text-sm font-medium 
              ${countdown > 0 ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}
          >
            {loading ? (
              <>
                <FiLoader className="animate-spin -ml-1 mr-2 h-5 w-5" />
                Sending...
              </>
            ) : (
              <>
                <FiRefreshCw className="-ml-1 mr-2 h-5 w-5" />
                Resend verification email {countdown > 0 ? `(${countdown}s)` : ''}
              </>
            )}
          </button>
          
          <button
            onClick={handleContinue}
            className="w-full flex items-center justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            I've verified my email, continue to login
          </button>
        </div>
        
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>
            If you don't see the email, check your spam folder. If you still need help, contact{' '}
            <a href="mailto:support@jobautopilot.com" className="text-blue-600 hover:text-blue-500">
              support@jobautopilot.com
            </a>
          </p>
        </div>

        <details className="mt-8 text-sm text-gray-500">
          <summary className="cursor-pointer text-blue-600">Troubleshooting options</summary>
          <div className="mt-2 p-4 bg-gray-50 rounded-md">
            <button
              onClick={runDiagnostics}
              disabled={debugging}
              className="flex items-center text-sm text-blue-600"
            >
              {debugging ? (
                <FiLoader className="animate-spin mr-2" />
              ) : (
                <FiTool className="mr-2" />
              )}
              Run email diagnostics
            </button>
            
            {debugInfo && (
              <pre className="mt-2 p-2 bg-gray-100 text-xs overflow-auto max-h-40 rounded">
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            )}
            
            <p className="mt-4 text-xs">
              If you're not receiving emails, please make sure:
              <ul className="list-disc pl-5 mt-1">
                <li>You entered the correct email address</li>
                <li>The email is not in your spam folder</li>
                <li>Your email provider is not blocking messages from our service</li>
              </ul>
            </p>
          </div>
        </details>
      </div>
    </div>
  );
}

export default EmailVerification;
