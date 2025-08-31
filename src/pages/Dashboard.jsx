import { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { 
  FiMenu, FiX, FiHome, FiSettings, FiLogOut, FiBell, 
  FiUser, FiCreditCard, FiBriefcase, FiFile, FiChevronDown,
  FiBarChart2, FiHelpCircle, FiGrid, FiMessageSquare,
  FiZap, FiClock, FiTarget, FiActivity
} from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import logo from '../assets/logo-blue.png'; // Use blue logo for dashboard

// Platform-specific color utility - updating with more professional color scheme
export const getPlatformColors = (platform) => {
  const colorMap = {
    linkedin: {
      bg: 'bg-blue-100',
      text: 'text-blue-800',
      border: 'border-blue-200',
      gradient: {
        from: 'from-blue-600',
        to: 'to-blue-700'
      },
      shadow: 'shadow-blue-300/30',
      icon: 'text-blue-600',
      hex: '#2563eb' // blue-600
    },
    indeed: {
      bg: 'bg-emerald-100',
      text: 'text-emerald-800',
      border: 'border-emerald-200',
      gradient: {
        from: 'from-emerald-600',
        to: 'to-teal-700'
      },
      shadow: 'shadow-emerald-300/30',
      icon: 'text-emerald-600',
      hex: '#059669' // emerald-600
    },
    internshala: {
      bg: 'bg-red-100',
      text: 'text-red-800',
      border: 'border-red-200',
      gradient: {
        from: 'from-red-600',
        to: 'to-rose-700'
      },
      shadow: 'shadow-red-300/30',
      icon: 'text-red-600',
      hex: '#dc2626' // red-600
    },
    unstop: {
      bg: 'bg-amber-100',
      text: 'text-amber-800',
      border: 'border-amber-200',
      gradient: {
        from: 'from-amber-500',
        to: 'to-orange-600'
      },
      shadow: 'shadow-amber-300/30',
      icon: 'text-amber-600',
      hex: '#d97706' // amber-600
    },
    naukri: {
      bg: 'bg-purple-100',
      text: 'text-purple-800',
      border: 'border-purple-200',
      gradient: {
        from: 'from-purple-600',
        to: 'to-fuchsia-700'
      },
      shadow: 'shadow-purple-300/30',
      icon: 'text-purple-600',
      hex: '#9333ea' // purple-600
    }
  };

  return colorMap[platform?.toLowerCase()] || {
    bg: 'bg-slate-100',
    text: 'text-slate-800',
    border: 'border-slate-200',
    gradient: {
      from: 'from-slate-600',
      to: 'to-slate-700'
    },
    shadow: 'shadow-slate-300/30',
    icon: 'text-slate-600',
    hex: '#475569' // slate-600
  };
};

function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const { user, logout, subscription } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Mock notifications for UI demo
  useEffect(() => {
    setNotifications([
      { id: 1, text: "New features added: Resume parser", time: "1 hour ago", read: false },
      { id: 2, text: "Your subscription will expire in 7 days", time: "2 days ago", read: true }
    ]);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  // Extract first letter of email for avatar
  const getInitial = () => {
    return user?.email?.charAt(0).toUpperCase() || 'U';
  };

  // Get current page title
  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('/automate')) return 'Automate Job Applications';
    if (path.includes('/jobs')) return 'Applied Jobs';
    if (path.includes('/manage')) return 'Sessions';
    if (path.includes('/telegram')) return 'Latest Opportunities';
    if (path.includes('/resume')) return 'Resume Builder';
    if (path.includes('/profile')) return 'Account Settings';
    if (path.includes('/billing')) return 'Billing & Subscription';
    return 'Dashboard';
  };

  // Get user's subscription plan name
  const getPlanName = () => {
    if (!subscription) return 'Free Plan';
    
    if (subscription.subscription_plans?.name) {
      return `${subscription.subscription_plans.name} Plan`;
    }
    
    // Default to Premium Plan as currently active
    return 'Premium Plan';
  };

  // Menu links configuration
  const menuLinks = [
    { path: "/dashboard/automate", icon: FiZap, label: "Automate" },
    { path: "/dashboard/jobs", icon: FiBriefcase, label: "Applied Jobs" },
    { path: "/dashboard/job-dating", icon: FiBarChart2, label: "Job Dating (Beta)" },
    { path: "/dashboard/manage", icon: FiActivity, label: "Sessions" },
    { path: "/dashboard/telegram", icon: FiTarget, label: "Opportunities" },
    { path: "/dashboard/resume", icon: FiFile, label: "Resume" },
    { divider: true },
    { path: "/dashboard/profile", icon: FiUser, label: "Account" },
    { path: "/pricing", icon: FiCreditCard, label: "Subscription" }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex overflow-hidden">
      {/* Desktop Sidebar */}
      <aside 
        className={`hidden md:flex flex-col bg-white shadow-sm border-r border-gray-200 transition-all duration-300 ${
          sidebarOpen ? 'w-64' : 'w-20'
        } z-20 fixed h-full`}
      >
        <div className={`p-4 flex items-center ${sidebarOpen ? 'justify-between' : 'justify-center'} border-b border-gray-100`}>
          {sidebarOpen ? (
            <div className="flex items-center">
              <img src={logo} alt="JobAutoPilot Logo" className="h-10 w-auto mr-2" />
              <h1 className="text-2xl font-bold">
                <span className="gradient-text">Applify</span>
              </h1>
            </div>
          ) : (
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)} 
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Toggle sidebar"
            >
              <FiMenu size={22} />
            </button>
          )}
          {sidebarOpen && (
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)} 
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Toggle sidebar"
            >
              <FiX size={22} />
            </button>
          )}
        </div>
        
        <div className="flex flex-col flex-1 overflow-y-auto py-6">
          <nav className="px-3 space-y-1">
            {menuLinks.map((item, index) => 
              item.divider ? (
                <div key={`divider-${index}`} className="border-t border-gray-100 my-3"></div>
              ) : (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) => `
                    sidebar-link group
                    ${isActive ? 'bg-primary-50 text-primary-700' : ''}
                    ${sidebarOpen ? 'justify-start' : 'justify-center'}
                  `}
                >
                  {!sidebarOpen ? (
                    <div className="flex justify-center items-center w-full" style={{margin: 0, padding: 0}}>
                      <item.icon size={20} style={{margin: 0, marginRight: 0}} />
                    </div>
                  ) : (
                    <>
                      <item.icon size={20} className="mr-3" />
                      <span>{item.label}</span>
                    </>
                  )}
                </NavLink>
              )
            )}
            {/* Add this where the sidebar navigation items are defined */}
            <NavLink
              to="/dashboard/how-to-use"
              className={({ isActive }) => `
                sidebar-link group
                ${isActive ? 'bg-primary-50 text-primary-700' : ''}
                ${sidebarOpen ? 'justify-start' : 'justify-center'}
              `}
            >
              {!sidebarOpen ? (
                <div className="flex justify-center items-center w-full" style={{margin: 0, padding: 0}}>
                  <FiHelpCircle size={20} style={{margin: 0, marginRight: 0}} />
                </div>
              ) : (
                <>
                  <FiHelpCircle size={20} className="mr-3" />
                  <span>How to Use</span>
                </>
              )}
            </NavLink>
          </nav>
        </div>
      </aside>

      {/* Mobile menu */}
      <div className="md:hidden">
        <AnimatePresence>
          {mobileMenuOpen && (
            <>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 bg-black bg-opacity-50 z-20"
                onClick={() => setMobileMenuOpen(false)}
              />
              <motion.div
                initial={{ x: -300 }}
                animate={{ x: 0 }}
                exit={{ x: -300 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg z-30 overflow-y-auto"
              >
                <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                  <div className="flex items-center">
                    <img src={logo} alt="JobAutoPilot Logo" className="h-10 w-auto mr-2" />
                    <h1 className="text-2xl font-bold">
                      <span className="gradient-text">Applify</span>
                    </h1>
                  </div>
                  <button onClick={() => setMobileMenuOpen(false)} className="p-2 rounded-lg hover:bg-gray-100">
                    <FiX size={24} />
                  </button>
                </div>
                
                {user && (
                  <div className="p-4 border-b border-gray-100">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-medium">
                        {getInitial()}
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">{user.email}</p>
                        <p className="text-xs text-gray-500">{getPlanName()}</p>
                      </div>
                    </div>
                  </div>
                )}
                
                <nav className="p-4 space-y-1">
                  {menuLinks.map((item, index) => 
                    item.divider ? (
                      <div key={`mob-divider-${index}`} className="border-t border-gray-100 my-3"></div>
                    ) : (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => `
                          flex items-center px-3 py-2.5 rounded-lg font-medium transition-colors
                          ${isActive ? 'bg-primary-50 text-primary-700' : 'text-gray-700 hover:bg-gray-100'}
                        `}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <item.icon size={20} className="mr-3" />
                        <span>{item.label}</span>
                      </NavLink>
                    )
                  )}
                </nav>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Main Content */}
      <div className={`flex-1 ${sidebarOpen ? 'md:ml-64' : 'md:ml-20'} transition-all duration-300`}>
        {/* Top Bar */}
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
          <div className="flex items-center justify-between px-4 sm:px-6 py-2.5">
            <div className="flex items-center">
              <button 
                onClick={() => setMobileMenuOpen(true)} 
                className="p-1.5 rounded-lg mr-3 hover:bg-gray-100 transition-colors md:hidden"
                aria-label="Open menu"
              >
                <FiMenu size={20} />
              </button>
              <h2 className="text-base sm:text-lg font-medium">{getPageTitle()}</h2>
            </div>
            
            <div className="flex items-center space-x-2">
              {/* Notifications */}
              <div className="relative">
                <button 
                  className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors relative"
                  onClick={() => setNotificationOpen(!notificationOpen)}
                >
                  <FiBell size={18} />
                  {notifications.some(n => !n.read) && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                  )}
                </button>
                
                <AnimatePresence>
                  {notificationOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-20"
                    >
                      <div className="px-4 py-3 border-b border-gray-200">
                        <h3 className="font-semibold text-gray-800">Notifications</h3>
                      </div>
                      {notifications.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">
                          No new notifications
                        </div>
                      ) : (
                        <div className="max-h-64 overflow-y-auto">
                          {notifications.map((notification) => (
                            <div 
                              key={notification.id} 
                              className={`px-4 py-3 hover:bg-gray-50 border-b border-gray-100 ${!notification.read ? 'bg-blue-50' : ''}`}
                            >
                              <p className="text-sm text-gray-800">{notification.text}</p>
                              <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="px-4 py-2 bg-gray-50 text-center">
                        <button className="text-xs text-blue-600 hover:text-blue-800 font-medium">
                          Mark all as read
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              {/* User Menu */}
              <div className="relative">
                <button 
                  className="flex items-center space-x-1 rounded-lg hover:bg-gray-100 transition-colors p-1"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                >
                  <div className="w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-medium text-sm">
                    {getInitial()}
                  </div>
                  <FiChevronDown size={14} className="text-gray-500" />
                </button>
                
                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-20"
                    >
                      <div className="px-4 py-3 border-b border-gray-200">
                        <p className="font-medium text-gray-800">{user?.email}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {getPlanName()}
                        </p>
                      </div>
                      <div className="py-1">
                        <NavLink 
                          to="/dashboard/profile" 
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <FiUser className="mr-3 text-gray-500" size={16} />
                          Profile
                        </NavLink>
                        <NavLink 
                          to="/pricing" 
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <FiCreditCard className="mr-3 text-gray-500" size={16} />
                          Subscription
                        </NavLink>
                        <NavLink 
                          to="/dashboard/settings" 
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <FiSettings className="mr-3 text-gray-500" size={16} />
                          Settings
                        </NavLink>
                        <button 
                          onClick={handleLogout}
                          className="w-full text-left flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          <FiLogOut className="mr-3 text-red-500" size={16} />
                          Logout
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="px-4 sm:px-6 md:px-8 py-6">
          <Outlet />
        </main>

        <div className="px-4 py-2">
          <span className="text-xs text-gray-500">© 2023 Applify</span>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;