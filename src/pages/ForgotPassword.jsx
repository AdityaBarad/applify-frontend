import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiMail, FiArrowLeft, FiLoader, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import { supabase } from '../lib/supabaseClient';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    
    if (!email) {
      setError('Please enter your email address');
      return;
    }
    
    try {
      setLoading(true);
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) throw error;
      
      setSuccessMessage('Password reset link has been sent to your email address.');
    } catch (error) {
      console.error('Password reset error:', error);
      setError(error.message || 'Failed to send password reset link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-xl shadow-md p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Reset Password</h2>
          <p className="mt-2 text-gray-600">
            Enter your email address and we'll send you a link to reset your password
          </p>
        </div>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 flex items-start">
            <FiAlertCircle className="mr-2 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
        
        {successMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4 flex items-start">
            <FiCheckCircle className="mr-2 mt-0.5" />
            <span>{successMessage}</span>
          </div>
        )}
        
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email address
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiMail className="text-gray-400" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="form-input pl-10"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                  Sending link...
                </>
              ) : (
                'Send reset link'
              )}
            </button>
          </div>
        </form>
        
        <div className="mt-6 text-center">
          <Link to="/login" className="text-blue-600 hover:text-blue-500 flex items-center justify-center">
            <FiArrowLeft className="mr-1" />
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
