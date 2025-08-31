import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiMail, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import { supabase } from '../lib/supabaseClient';
import logo from '../assets/logo.png';

function EmailVerification() {
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState(null);
  const location = useLocation();
  const email = location.state?.email || '';

  useEffect(() => {
    document.title = 'Verify Your Email - Applify';
  }, []);

  const handleResendEmail = async () => {
    if (!email) {
      setError('No email address found. Please try registering again.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const { error: resendError } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        }
      });

      if (resendError) throw resendError;
      
      setEmailSent(true);
    } catch (err) {
      console.error('Error sending verification email:', err);
      setError(err.message || 'Failed to resend verification email. Please try again later.');
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
            Verify Your Email
          </h2>
        </div>

        <div className="mt-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-100 p-3 rounded-full">
              <FiMail className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          
          <p className="text-lg text-gray-700">
            We've sent a verification email to:
          </p>
          <p className="text-lg font-semibold text-blue-600 mt-1 mb-4">
            {email || 'your email address'}
          </p>
          
          <p className="text-gray-600 mb-6">
            Please check your inbox and click on the verification link to complete your registration.
            If you don't see it, check your spam folder.
          </p>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 flex items-center">
              <FiAlertCircle className="mr-2" />
              <span>{error}</span>
            </div>
          )}

          {emailSent && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 flex items-center">
              <FiCheckCircle className="mr-2" />
              <span>Verification email resent successfully!</span>
            </div>
          )}

          <button
            type="button"
            onClick={handleResendEmail}
            disabled={loading || !email}
            className={`mt-4 btn-secondary w-full ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Sending...' : 'Resend Verification Email'}
          </button>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already verified?{' '}
              <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EmailVerification;
