import { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { 
  FiMenu, FiX, FiHome, FiSettings, FiLogOut, FiBell, 
  FiUser, FiCreditCard, FiBriefcase, FiFile, FiChevronDown,
  FiBarChart2, FiHelpCircle, FiGrid
} from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const { user, logout } = useAuth();
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
    if (path.includes('/manage')) return 'Application Analytics';
    if (path.includes('/resume')) return 'Resume Builder';
    if (path.includes('/profile')) return 'Account Settings';
    if (path.includes('/billing')) return 'Billing & Subscription';
    return 'Dashboard';
  };

  // Menu links configuration
  const menuLinks = [
    { path: "/dashboard/automate", icon: FiHome, label: "Automate" },
    { path: "/dashboard/jobs", icon: FiBriefcase, label: "Applied Jobs" },
    { path: "/dashboard/manage", icon: FiBarChart2, label: "Analytics" },
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
        <div className="p-4 flex items-center justify-between border-b border-gray-100">
          {sidebarOpen && (
            <h1 className="text-xl font-bold">
              <span className="gradient-text">JobAutoPilot</span>
            </h1>
          )}
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)} 
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? <FiX size={22} /> : <FiMenu size={22} />}
          </button>
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
                  <item.icon size={20} />
                  {sidebarOpen && <span>{item.label}</span>}
                  {!sidebarOpen && (
                    <span className="absolute left-full ml-3 transform -translate-x-3 px-2 py-1 bg-gray-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                      {item.label}
                    </span>
                  )}
                </NavLink>
              )
            )}
          </nav>
          
          <div className="px-3 mt-auto">
            <button 
              onClick={handleLogout} 
              className={`sidebar-link w-full text-left text-red-600 hover:bg-red-50 flex ${sidebarOpen ? 'justify-start' : 'justify-center'} group`}
            >
              <FiLogOut size={20} />
              {sidebarOpen && <span>Logout</span>}
              {!sidebarOpen && (
                <span className="absolute left-full ml-3 transform -translate-x-3 px-2 py-1 bg-gray-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                  Logout
                </span>
              )}
            </button>
          </div>
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
                  <h1 className="text-xl font-bold">
                    <span className="gradient-text">JobAutoPilot</span>
                  </h1>
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
                        <p className="text-xs text-gray-500">Free Plan</p>
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

                  <button 
                    onClick={handleLogout} 
                    className="w-full flex items-center px-3 py-2.5 mt-6 rounded-lg font-medium text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <FiLogOut size={20} className="mr-3" />
                    <span>Logout</span>
                  </button>
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
          <div className="flex items-center justify-between px-4 sm:px-6 py-4">
            <div className="flex items-center">
              <button 
                onClick={() => setMobileMenuOpen(true)} 
                className="p-2 rounded-lg mr-3 hover:bg-gray-100 transition-colors md:hidden"
                aria-label="Open menu"
              >
                <FiMenu size={22} />
              </button>
              <h2 className="text-lg sm:text-xl font-semibold">{getPageTitle()}</h2>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Notifications */}
              <div className="relative">
                <button 
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative"
                  onClick={() => setNotificationOpen(!notificationOpen)}
                >
                  <FiBell size={20} />
                  {notifications.some(n => !n.read) && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
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
                  className="flex items-center space-x-1 rounded-lg hover:bg-gray-100 transition-colors p-1.5"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                >
                  <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-medium">
                    {getInitial()}
                  </div>
                  <FiChevronDown size={16} className="text-gray-500" />
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
                        <p className="text-xs text-gray-500 mt-1">Free plan user</p>
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
      </div>
    </div>
  );
}

export default Dashboard;