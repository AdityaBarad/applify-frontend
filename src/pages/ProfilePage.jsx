import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { 
  FiUser, FiSettings, FiCreditCard, FiShield, FiMail, FiKey, 
  FiInfo, FiLoader, FiSave, FiTrash2, FiAlertCircle, FiCheckCircle, 
  FiEdit, FiGlobe, FiPhone, FiMapPin, FiCalendar, FiFileText, FiBell,
  FiDownload, FiDollarSign, FiClock
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import SubscriptionStatus from '../components/SubscriptionStatus';
import { supabase } from '../lib/supabaseClient';

function ProfilePage() {
  const { user, updateUserProfile, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userProfile, setUserProfile] = useState({
    fullName: '',
    email: '',
    phone: '',
    location: '',
    avatarUrl: '',
    dateJoined: '',
    lastLogin: ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordError, setPasswordError] = useState('');
  const [activeTab, setActiveTab] = useState('account');
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [formChanged, setFormChanged] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  
  // Get initials from name for avatar fallback
  const getInitials = () => {
    if (!userProfile.fullName) return user?.email?.charAt(0).toUpperCase() || 'U';
    return userProfile.fullName
      .split(' ')
      .map(name => name.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  };
  
  // Format currency with symbol
  const formatCurrency = (amount, currency = 'INR') => {
    const currencySymbols = {
      'INR': '₹',
      'USD': '$',
      'EUR': '€',
      'GBP': '£'
    };
    
    const symbol = currencySymbols[currency] || currency;
    return `${symbol}${parseFloat(amount).toFixed(2)}`;
  };
  
  // Format date in a user-friendly way
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Get transaction status badge style
  const getStatusBadgeClass = (status) => {
    const statusClasses = {
      'completed': 'bg-green-100 text-green-800',
      'success': 'bg-green-100 text-green-800',
      'pending': 'bg-yellow-100 text-yellow-800',
      'failed': 'bg-red-100 text-red-800',
      'refunded': 'bg-blue-100 text-blue-800'
    };
    
    return statusClasses[status?.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // Get user profile from Supabase
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (error) throw error;
        
        if (data) {
          setUserProfile({
            fullName: data.full_name || '',
            email: user.email,
            phone: data.phone || '',
            location: data.location || '',
            // avatarUrl: data.avatarUrl || '',
            // dateJoined: user.created_at || new Date().toISOString(),
            // lastLogin: user.last_sign_in_at || new Date().toISOString(),
          });
        } else {
          setUserProfile({
            fullName: '',
            email: user.email,
            phone: '',
            location: '',
            avatarUrl: '',
            dateJoined: user.created_at || new Date().toISOString(),
            lastLogin: user.last_sign_in_at || new Date().toISOString(),
          });
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast.error('Failed to load your account information');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [user]);
  
  // Fetch transaction history
  useEffect(() => {
    const fetchTransactionHistory = async () => {
      if (!user) return;
      
      try {
        setLoadingTransactions(true);
        
        const { data, error } = await supabase
          .from('payment_transactions')
          .select('*')
          .eq('profile_id', user.id)
          .order('payment_date', { ascending: false });
        
        if (error) throw error;
        
        setTransactions(data || []);
      } catch (error) {
        console.error('Error fetching transaction history:', error);
        toast.error('Failed to load transaction history');
      } finally {
        setLoadingTransactions(false);
      }
    };
    
    if (activeTab === 'subscription') {
      fetchTransactionHistory();
    }
  }, [user, activeTab]);
  
  const handleUserChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setUserProfile(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    setFormChanged(true);
  };
  
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      
      // Update profile in Supabase
      await updateUserProfile({
        fullName: userProfile.fullName,
        phone: userProfile.phone,
        location: userProfile.location
      });
      
      toast.success('Profile information updated successfully');
      setFormChanged(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile: ' + error.message);
    } finally {
      setSaving(false);
    }
  };
  
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');
    
    // Validate password inputs
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }
    
    try {
      setSaving(true);
      
      // Update password in Supabase
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      });
      
      if (error) throw error;
      
      toast.success('Password updated successfully');
      
      // Clear password fields
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      console.error('Error updating password:', error);
      setPasswordError(error.message || 'Failed to update password');
    } finally {
      setSaving(false);
    }
  };
  
  const handleDeleteAccount = async () => {
    if (deleteConfirm !== user.email) {
      toast.error('Email address does not match');
      return;
    }
    
    try {
      setSaving(true);
      
      // Delete user account from Supabase
      const { error } = await supabase.rpc('delete_user_account', {
        user_id: user.id
      });
      
      if (error) throw error;
      
      // Sign out the user
      await logout();
      
      toast.success('Your account has been deleted');
      // Redirect handled by logout function
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error(error.message || 'Failed to delete account');
    } finally {
      setSaving(false);
      setShowDeleteModal(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="spinner-container inline-block mx-auto" style={{width: "40px", height: "40px"}}>
            <div className="spinner"></div>
          </div>
          <p className="text-gray-600 font-medium mt-3">Loading account information...</p>
        </div>
      </div>
    );
  }
  
  return (
  <div className="max-w-6xl mx-auto px-2 py-8 sm:px-8 lg:px-12 bg-gradient-to-br from-blue-50 via-white to-purple-50 min-h-[80vh] rounded-3xl shadow-2xl border border-gray-100">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-8"
      >
        {/* Header section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 flex items-center tracking-tight drop-shadow-sm">
              <FiSettings className="mr-3 text-indigo-600" size={28} />
              Profile & Settings
            </h1>
            <p className="mt-2 text-gray-500 text-base font-medium">
              Manage your personal information and account details
            </p>
          </div>
        </div>
        
  <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Profile summary card */}
          <div className="md:col-span-4 lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 sticky top-24">
              <div className="p-8 bg-gradient-to-br from-indigo-600 to-purple-600 text-white flex flex-col items-center">
                {userProfile.avatarUrl ? (
                  <img 
                    src={userProfile.avatarUrl} 
                    alt={userProfile.fullName || 'User'} 
                    className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg"
                  />
                ) : (
                  <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold border-2 border-white shadow-lg">
                    {getInitials()}
                  </div>
                )}
                <h3 className="text-2xl font-bold mt-4 drop-shadow-sm">
                  {userProfile.fullName || 'User'}
                </h3>
                <p className="text-indigo-100 text-sm mt-1">
                  {userProfile.email}
                </p>
              </div>
              
              <div className="p-5 border-b border-gray-200">
                {/* Removed Account Information section */}
              </div>
              
              {/* Navigation tabs for mobile */}
              <div className="p-4 border-b border-gray-200 md:hidden">
                <div className="flex flex-wrap gap-2">
                  <button 
                    className={`px-3 py-1.5 text-sm font-medium rounded-lg ${
                      activeTab === 'account' 
                        ? 'bg-primary-100 text-primary-700' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    onClick={() => setActiveTab('account')}
                  >
                    Account
                  </button>
                  <button 
                    className={`px-3 py-1.5 text-sm font-medium rounded-lg ${
                      activeTab === 'security' 
                        ? 'bg-primary-100 text-primary-700' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    onClick={() => setActiveTab('security')}
                  >
                    Security
                  </button>
                  {/* Notifications tab removed */}
                  <button 
                    className={`px-3 py-1.5 text-sm font-medium rounded-lg ${
                      activeTab === 'subscription' 
                        ? 'bg-primary-100 text-primary-700' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    onClick={() => setActiveTab('subscription')}
                  >
                    Subscription
                  </button>
                </div>
              </div>
              
              {/* Desktop navigation */}
              <nav className="hidden md:block">
                <ul>
                  <li>
                    <button 
                      className={`w-full flex items-center px-5 py-3 text-sm font-medium ${
                        activeTab === 'account' 
                          ? 'text-primary-600 bg-primary-50 border-l-4 border-primary-600' 
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                      onClick={() => setActiveTab('account')}
                    >
                      <FiUser className={`mr-3 ${activeTab === 'account' ? 'text-primary-600' : 'text-gray-400'}`} />
                      <span>Account Information</span>
                    </button>
                  </li>
                  <li>
                    <button 
                      className={`w-full flex items-center px-5 py-3 text-sm font-medium ${
                        activeTab === 'security' 
                          ? 'text-primary-600 bg-primary-50 border-l-4 border-primary-600' 
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                      onClick={() => setActiveTab('security')}
                    >
                      <FiKey className={`mr-3 ${activeTab === 'security' ? 'text-primary-600' : 'text-gray-400'}`} />
                      <span>Security</span>
                    </button>
                  </li>
                  {/* Notifications tab removed */}
                  <li>
                    <button 
                      className={`w-full flex items-center px-5 py-3 text-sm font-medium ${
                        activeTab === 'subscription' 
                          ? 'text-primary-600 bg-primary-50 border-l-4 border-primary-600' 
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                      onClick={() => setActiveTab('subscription')}
                    >
                      <FiCreditCard className={`mr-3 ${activeTab === 'subscription' ? 'text-primary-600' : 'text-gray-400'}`} />
                      <span>Subscription</span>
                    </button>
                  </li>
                </ul>
                
                {/* Delete Account button removed */}
              </nav>
            </div>
          </div>
          
          {/* Main content area */}
          <div className="md:col-span-8 lg:col-span-9">
            <AnimatePresence mode="wait">
              {activeTab === 'account' && (
                <motion.div
                  key="account"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                    <div className="px-8 py-6 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-purple-50">
                      <h2 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center">
                        <FiUser className="mr-2 text-indigo-500" /> Account Information
                      </h2>
                      <p className="text-base text-gray-500 mt-1">
                        Update your personal information
                      </p>
                    </div>
                    
                    <form onSubmit={handleUpdateProfile} className="p-6">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Full Name
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <FiUser className="text-gray-400" size={16} />
                            </div>
                            <input
                              type="text"
                              name="fullName"
                              value={userProfile.fullName}
                              onChange={handleUserChange}
                              className="form-input pl-10 w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-500 focus:ring-opacity-20"
                              placeholder="Your full name"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Email Address
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <FiMail className="text-gray-400" size={16} />
                            </div>
                            <input
                              type="email"
                              value={userProfile.email}
                              className="form-input pl-10 w-full rounded-lg border-gray-300 bg-gray-50 shadow-sm"
                              disabled
                            />
                          </div>
                          <p className="text-xs text-gray-500 mt-1.5">
                            To change your email address, please contact support
                          </p>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Phone Number
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <FiPhone className="text-gray-400" size={16} />
                            </div>
                            <input
                              type="text"
                              name="phone"
                              value={userProfile.phone}
                              onChange={handleUserChange}
                              className="form-input pl-10 w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-500 focus:ring-opacity-20"
                              placeholder="Your phone number"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Location
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <FiMapPin className="text-gray-400" size={16} />
                            </div>
                            <input
                              type="text"
                              name="location"
                              value={userProfile.location}
                              onChange={handleUserChange}
                              className="form-input pl-10 w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-500 focus:ring-opacity-20"
                              placeholder="City, Country"
                            />
                          </div>
                        </div>
                        
                        {/* Bio field removed */}
                      </div>
                      
                      <div className="flex justify-end mt-8">
                        <button
                          type="submit"
                          disabled={saving || !formChanged}
                          className={`inline-flex items-center px-5 py-2.5 border border-transparent rounded-lg shadow-sm text-white font-medium ${
                            formChanged
                              ? 'bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500'
                              : 'bg-gray-400 cursor-not-allowed'
                          }`}
                        >
                          {saving ? (
                            <>
                              <FiLoader className="animate-spin -ml-1 mr-2 h-4 w-4" />
                              Saving...
                            </>
                          ) : formChanged ? (
                            <>
                              <FiSave className="-ml-1 mr-2 h-4 w-4" />
                              Save Changes
                            </>
                          ) : (
                            <>
                              <FiCheckCircle className="-ml-1 mr-2 h-4 w-4" />
                              Saved
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                </motion.div>
              )}
              
              {activeTab === 'security' && (
                <motion.div
                  key="security"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                      <h2 className="text-xl font-semibold text-gray-800">Security Settings</h2>
                      <p className="text-sm text-gray-500 mt-1">
                        Manage your password and security preferences
                      </p>
                    </div>
                    
                    <div className="p-6">
                      <form onSubmit={handleUpdatePassword} className="mb-10">
                        <h3 className="text-lg font-medium text-gray-800 mb-4">Change Password</h3>
                        
                        <div className="space-y-5">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                              Current Password
                            </label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FiKey className="text-gray-400" size={16} />
                              </div>
                              <input
                                type="password"
                                name="currentPassword"
                                value={passwordData.currentPassword}
                                onChange={handlePasswordChange}
                                className="form-input pl-10 w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-500 focus:ring-opacity-20"
                                placeholder="Enter your current password"
                              />
                            </div>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                              New Password
                            </label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FiKey className="text-gray-400" size={16} />
                              </div>
                              <input
                                type="password"
                                name="newPassword"
                                value={passwordData.newPassword}
                                onChange={handlePasswordChange}
                                className="form-input pl-10 w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-500 focus:ring-opacity-20"
                                placeholder="Enter new password"
                              />
                            </div>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                              Confirm New Password
                            </label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FiKey className="text-gray-400" size={16} />
                              </div>
                              <input
                                type="password"
                                name="confirmPassword"
                                value={passwordData.confirmPassword}
                                onChange={handlePasswordChange}
                                className="form-input pl-10 w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-500 focus:ring-opacity-20"
                                placeholder="Confirm new password"
                              />
                            </div>
                          </div>
                        </div>
                        
                        {passwordError && (
                          <div className="mt-4 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
                            <div className="flex">
                              <FiAlertCircle className="h-5 w-5 text-red-600 mr-2 flex-shrink-0" />
                              <span className="text-red-700 text-sm">{passwordError}</span>
                            </div>
                          </div>
                        )}
                        
                        <div className="mt-6">
                          <button
                            type="submit"
                            disabled={saving || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                            className={`inline-flex items-center px-5 py-2.5 border border-transparent rounded-lg shadow-sm text-white font-medium ${
                              passwordData.currentPassword && passwordData.newPassword && passwordData.confirmPassword
                                ? 'bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500'
                                : 'bg-gray-400 cursor-not-allowed'
                            }`}
                          >
                            {saving ? (
                              <>
                                <FiLoader className="animate-spin -ml-1 mr-2 h-4 w-4" />
                                Updating...
                              </>
                            ) : (
                              <>
                                <FiKey className="-ml-1 mr-2 h-4 w-4" />
                                Update Password
                              </>
                            )}
                          </button>
                        </div>
                      </form>
                      
                      <div className="border-t border-gray-200 pt-8 mt-8">
                        <h3 className="text-lg font-medium text-gray-800 mb-4">Connected Devices</h3>
                        <p className="text-sm text-gray-600 mb-4">
                          These are the devices currently logged into your account. If you don't recognize a device, you can log it out remotely.
                        </p>
                        
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="bg-blue-100 p-2 rounded-full">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                              </div>
                              <div className="ml-3">
                                <p className="text-sm font-medium text-gray-900">Current Browser</p>
                                <p className="text-xs text-gray-500">Last active: Just now</p>
                              </div>
                            </div>
                            <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                              Current
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
              
              {/* Notifications tab and content removed */}
              
              {activeTab === 'subscription' && (
                <motion.div
                  key="subscription"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2 }}
                >
                  <SubscriptionStatus />
                  
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mt-6">
                    <div className="px-6 py-4 border-b border-gray-200">
                      <h2 className="text-xl font-semibold text-gray-800">Billing History</h2>
                      <p className="text-sm text-gray-500 mt-1">
                        View and manage your billing information
                      </p>
                    </div>
                    
                    <div className="p-6">
                      {loadingTransactions ? (
                        <div className="flex items-center justify-center h-32">
                          <div className="text-center">
                            <div className="spinner-container inline-block mx-auto" style={{width: "30px", height: "30px"}}>
                              <div className="spinner"></div>
                            </div>
                            <p className="text-gray-600 font-medium mt-3">Loading transactions...</p>
                          </div>
                        </div>
                      ) : transactions.length > 0 ? (
                        <div className="rounded-lg border border-gray-200 divide-y divide-gray-200">
                          {transactions.map((transaction) => (
                            <div key={transaction.id} className="p-4 flex justify-between items-center">
                              <div>
                                <div className="flex items-center">
                                  <p className="font-medium">
                                    {transaction.metadata?.plan_name || 'Subscription Payment'}
                                  </p>
                                  <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${getStatusBadgeClass(transaction.transaction_status)}`}>
                                    {transaction.transaction_status}
                                  </span>
                                </div>
                                <div className="flex items-center text-sm text-gray-500 mt-1">
                                  <FiCalendar className="mr-1" size={14} />
                                  {formatDate(transaction.payment_date || transaction.created_at)}
                                  {transaction.payment_method && (
                                    <>
                                      <span className="mx-1">•</span>
                                      <span>{transaction.payment_method}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-medium">{formatCurrency(transaction.amount, transaction.currency)}</p>
                                {transaction.receipt_url ? (
                                  <a 
                                    href={transaction.receipt_url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-primary-600 hover:text-primary-800 text-sm flex items-center justify-end"
                                  >
                                    <FiDownload className="mr-1" size={14} />
                                    Receipt
                                  </a>
                                ) : (
                                  <span className="text-gray-400 text-sm">No receipt</span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-10 border border-dashed border-gray-300 rounded-lg">
                          <FiCreditCard className="mx-auto h-10 w-10 text-gray-400" />
                          <p className="mt-2 text-gray-600 font-medium">No transactions found</p>
                          <p className="mt-1 text-gray-500 text-sm">Your billing history will appear here once you make a payment</p>
                        </div>
                      )}
                      
                      <div className="mt-6 flex justify-between items-center">
                        <Link
                          to="/pricing"
                          className="inline-flex items-center px-4 py-2 border border-primary-600 text-primary-600 bg-white hover:bg-primary-50 rounded-lg transition-colors"
                        >
                          <FiCreditCard className="mr-2" />
                          View Plans
                        </Link>
                        
                        {transactions.length > 5 && (
                          <Link
                            to="/billing"
                            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
                          >
                            View All Transactions
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                            </svg>
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        
  {/* Mobile Delete Account Button removed */}
      </motion.div>

  {/* Delete Account Confirmation Modal removed */}
    </div>
  );
}

export default ProfilePage;
