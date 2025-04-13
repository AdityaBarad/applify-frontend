import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { 
  FiUser, FiSettings, FiCreditCard, FiShield, FiMail, FiKey, 
  FiInfo, FiLoader, FiSave, FiTrash2, FiAlertCircle, FiCheckCircle, 
  FiEdit, FiGlobe, FiPhone, FiMapPin, FiCalendar, FiFileText, FiBell
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
    bio: '',
    avatarUrl: '',
    dateJoined: '',
    lastLogin: '',
    notificationPreferences: {
      email: true,
      jobAlerts: true,
      marketingEmails: false,
      applicationUpdates: true
    }
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
  
  // Get initials from name for avatar fallback
  const getInitials = () => {
    if (!userProfile.fullName) return user?.email?.charAt(0).toUpperCase() || 'U';
    return userProfile.fullName
      .split(' ')
      .map(name => name.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
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
            fullName: data.fullName || '',
            email: user.email,
            phone: data.phone || '',
            location: data.location || '',
            // bio: data.bio || '',
            // avatarUrl: data.avatarUrl || '',
            // dateJoined: user.created_at || new Date().toISOString(),
            // lastLogin: user.last_sign_in_at || new Date().toISOString(),
            // notificationPreferences: data.notificationPreferences || {
            //   email: true,
            //   jobAlerts: true,
            //   marketingEmails: false,
            //   applicationUpdates: true
            // }
          });
        } else {
          setUserProfile({
            fullName: '',
            email: user.email,
            phone: '',
            location: '',
            bio: '',
            avatarUrl: '',
            dateJoined: user.created_at || new Date().toISOString(),
            lastLogin: user.last_sign_in_at || new Date().toISOString(),
            notificationPreferences: {
              email: true,
              jobAlerts: true,
              marketingEmails: false,
              applicationUpdates: true
            }
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
  
  const handleUserChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('notificationPreferences.')) {
      const prefName = name.split('.')[1];
      setUserProfile(prev => ({
        ...prev,
        notificationPreferences: {
          ...prev.notificationPreferences,
          [prefName]: checked
        }
      }));
    } else {
      setUserProfile(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
    
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
        location: userProfile.location,
        bio: userProfile.bio,
        notificationPreferences: userProfile.notificationPreferences
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
    <div className="max-w-6xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Header section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center">
              <FiSettings className="mr-3 text-primary-600" /> 
              Account Settings
            </h1>
            <p className="mt-1 text-gray-500">
              Manage your personal information and account preferences
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Profile summary card */}
          <div className="md:col-span-4 lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200 sticky top-24">
              <div className="p-6 bg-gradient-to-r from-primary-600 to-primary-700 text-white">
                <div className="flex items-center mb-4">
                  {userProfile.avatarUrl ? (
                    <img 
                      src={userProfile.avatarUrl} 
                      alt={userProfile.fullName || 'User'} 
                      className="w-16 h-16 rounded-full object-cover border-2 border-white"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-xl font-semibold">
                      {getInitials()}
                    </div>
                  )}
                  <div className="ml-4">
                    <h3 className="text-xl font-semibold">
                      {userProfile.fullName || 'User'}
                    </h3>
                    <p className="text-primary-100 text-sm">
                      {userProfile.email}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="p-5 border-b border-gray-200">
                <h4 className="text-sm uppercase font-semibold text-gray-500 tracking-wider mb-3">
                  Account Information
                </h4>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <FiCalendar className="mt-0.5 mr-2 text-gray-400 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500">Member since</p>
                      <p className="text-sm font-medium">{formatDate(userProfile.dateJoined)}</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <FiGlobe className="mt-0.5 mr-2 text-gray-400 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500">Last login</p>
                      <p className="text-sm font-medium">{formatDate(userProfile.lastLogin)}</p>
                    </div>
                  </div>
                </div>
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
                  <button 
                    className={`px-3 py-1.5 text-sm font-medium rounded-lg ${
                      activeTab === 'notifications' 
                        ? 'bg-primary-100 text-primary-700' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    onClick={() => setActiveTab('notifications')}
                  >
                    Notifications
                  </button>
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
                  <li>
                    <button 
                      className={`w-full flex items-center px-5 py-3 text-sm font-medium ${
                        activeTab === 'notifications' 
                          ? 'text-primary-600 bg-primary-50 border-l-4 border-primary-600' 
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                      onClick={() => setActiveTab('notifications')}
                    >
                      <FiBell className={`mr-3 ${activeTab === 'notifications' ? 'text-primary-600' : 'text-gray-400'}`} />
                      <span>Notifications</span>
                    </button>
                  </li>
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
                
                <div className="p-5 mt-4 border-t border-gray-200">
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="w-full flex items-center justify-center px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition duration-150 text-sm font-medium"
                  >
                    <FiTrash2 className="mr-2" />
                    Delete Account
                  </button>
                </div>
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
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                      <h2 className="text-xl font-semibold text-gray-800">Account Information</h2>
                      <p className="text-sm text-gray-500 mt-1">
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
                        
                        <div className="lg:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Bio
                          </label>
                          <div className="relative">
                            <div className="absolute top-3 left-3 flex items-start pointer-events-none">
                              <FiFileText className="text-gray-400" size={16} />
                            </div>
                            <textarea
                              name="bio"
                              value={userProfile.bio}
                              onChange={handleUserChange}
                              rows="4"
                              className="form-input pl-10 w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-500 focus:ring-opacity-20"
                              placeholder="Tell us a bit about yourself"
                            ></textarea>
                          </div>
                        </div>
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
                      
                      <div className="border-t border-gray-200 pt-8">
                        <h3 className="text-lg font-medium text-gray-800 mb-4">Two-Factor Authentication</h3>
                        <p className="text-sm text-gray-600 mb-4">
                          Add an extra layer of security to your account by enabling two-factor authentication.
                        </p>
                        <button
                          type="button"
                          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                        >
                          <FiShield className="-ml-1 mr-2 h-4 w-4" />
                          Setup 2FA
                        </button>
                      </div>
                      
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
              
              {activeTab === 'notifications' && (
                <motion.div
                  key="notifications"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                      <h2 className="text-xl font-semibold text-gray-800">Notification Preferences</h2>
                      <p className="text-sm text-gray-500 mt-1">
                        Control what type of notifications you receive
                      </p>
                    </div>
                    
                    <div className="p-6">
                      <form onSubmit={handleUpdateProfile}>
                        <h3 className="text-lg font-medium text-gray-800 mb-4">Email Notifications</h3>
                        
                        <div className="space-y-4">
                          <div className="flex items-start">
                            <div className="flex items-center h-5">
                              <input
                                id="email"
                                name="notificationPreferences.email"
                                type="checkbox"
                                checked={userProfile.notificationPreferences.email}
                                onChange={handleUserChange}
                                className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 rounded"
                              />
                            </div>
                            <div className="ml-3 text-sm">
                              <label htmlFor="email" className="font-medium text-gray-700">
                                General Notifications
                              </label>
                              <p className="text-gray-500">
                                Receive notifications about your account, updates and policy changes
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-start">
                            <div className="flex items-center h-5">
                              <input
                                id="jobAlerts"
                                name="notificationPreferences.jobAlerts"
                                type="checkbox"
                                checked={userProfile.notificationPreferences.jobAlerts}
                                onChange={handleUserChange}
                                className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 rounded"
                              />
                            </div>
                            <div className="ml-3 text-sm">
                              <label htmlFor="jobAlerts" className="font-medium text-gray-700">
                                Job Alerts
                              </label>
                              <p className="text-gray-500">
                                Receive notifications about new job opportunities that match your profile
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-start">
                            <div className="flex items-center h-5">
                              <input
                                id="applicationUpdates"
                                name="notificationPreferences.applicationUpdates"
                                type="checkbox"
                                checked={userProfile.notificationPreferences.applicationUpdates}
                                onChange={handleUserChange}
                                className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 rounded"
                              />
                            </div>
                            <div className="ml-3 text-sm">
                              <label htmlFor="applicationUpdates" className="font-medium text-gray-700">
                                Application Updates
                              </label>
                              <p className="text-gray-500">
                                Receive notifications about the status of your job applications
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-start">
                            <div className="flex items-center h-5">
                              <input
                                id="marketingEmails"
                                name="notificationPreferences.marketingEmails"
                                type="checkbox"
                                checked={userProfile.notificationPreferences.marketingEmails}
                                onChange={handleUserChange}
                                className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 rounded"
                              />
                            </div>
                            <div className="ml-3 text-sm">
                              <label htmlFor="marketingEmails" className="font-medium text-gray-700">
                                Marketing Emails
                              </label>
                              <p className="text-gray-500">
                                Receive marketing emails about our products, services, and promotions
                              </p>
                            </div>
                          </div>
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
                                Save Preferences
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
                  </div>
                </motion.div>
              )}
              
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
                      <div className="rounded-lg border border-gray-200 divide-y divide-gray-200">
                        <div className="p-4 flex justify-between items-center">
                          <div>
                            <p className="font-medium">Basic Plan - Monthly</p>
                            <p className="text-sm text-gray-500">May 1, 2023</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">$9.99</p>
                            <a href="#" className="text-primary-600 hover:text-primary-800 text-sm">
                              Download Receipt
                            </a>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-6 flex justify-between items-center">
                        <Link
                          to="/pricing"
                          className="inline-flex items-center px-4 py-2 border border-primary-600 text-primary-600 bg-white hover:bg-primary-50 rounded-lg transition-colors"
                        >
                          <FiCreditCard className="mr-2" />
                          View Plans
                        </Link>
                        
                        <Link
                          to="/billing"
                          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
                        >
                          View All Transactions
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                          </svg>
                        </Link>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        
        {/* Mobile Delete Account Button */}
        <div className="md:hidden mt-6">
          <button
            onClick={() => setShowDeleteModal(true)}
            className="w-full flex items-center justify-center px-4 py-3 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition duration-150 font-medium"
          >
            <FiTrash2 className="mr-2" />
            Delete Account
          </button>
        </div>
      </motion.div>

      {/* Delete Account Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={() => setShowDeleteModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2, type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4"
            >
              <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-auto overflow-hidden">
                <div className="p-6 bg-red-50">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                        <FiAlertCircle className="h-6 w-6 text-red-600" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Delete Account</h3>
                      <p className="text-sm text-red-600">This action cannot be undone</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  <p className="text-sm text-gray-600 mb-6">
                    Are you sure you want to delete your account? All of your data will be permanently removed. This action cannot be undone.
                  </p>
                  
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      To confirm, type your email address below:
                    </label>
                    <input
                      type="email"
                      value={deleteConfirm}
                      onChange={(e) => setDeleteConfirm(e.target.value)}
                      className="form-input w-full rounded-lg border-gray-300 shadow-sm focus:border-red-500 focus:ring focus:ring-red-500 focus:ring-opacity-20"
                      placeholder={user.email}
                    />
                  </div>
                  
                  <div className="flex flex-col sm:flex-row-reverse gap-3">
                    <button 
                      type="button" 
                      className="w-full inline-flex justify-center rounded-lg border border-transparent px-4 py-2.5 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      onClick={handleDeleteAccount}
                      disabled={deleteConfirm !== user.email || saving}
                    >
                      {saving ? 'Deleting...' : 'Delete Account'}
                    </button>
                    <button 
                      type="button" 
                      className="w-full inline-flex justify-center rounded-lg border border-gray-300 px-4 py-2.5 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                      onClick={() => setShowDeleteModal(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ProfilePage;
