import { useState, useEffect } from 'react';
import { FiBarChart2, FiPieChart, FiCalendar, FiLoader, FiTrendingUp, FiRefreshCw } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { getPlatformColors } from '../pages/Dashboard'; // Import the utility function

function ApplicationAnalytics() {
  const [stats, setStats] = useState(null);
  // Add separate period state for automation runs
  const [automationPeriod, setAutomationPeriod] = useState('month');
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(null);
  // Add refresh functionality 
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { user, getApplicationStats, currentSession } = useAuth();

  // Responsive view state
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'card'
  const [userPreferredView, setUserPreferredView] = useState('table');

  // Update these variables near the top of your component
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50); // Increased from 20 to 50
  const [customPageSize, setCustomPageSize] = useState(50);
  const [totalPages, setTotalPages] = useState(1);

  // Add state for debugging
  const [debugMode, setDebugMode] = useState(false);
  // Add state for sessions
  const [automationSessions, setAutomationSessions] = useState([]);
  const [loadingAutomation, setLoadingAutomation] = useState(false);

  // Responsive handler
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setViewMode('card');
      } else {
        setViewMode(userPreferredView);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [userPreferredView]);

  const handleViewModeChange = (mode) => {
    setUserPreferredView(mode);
    if (window.innerWidth >= 768) setViewMode(mode);
  };
  
  useEffect(() => {
    if (!user) return;
    const fetchStats = async () => {
      try {
        setLoading(true);
        // Always fetch all-time stats
        const data = await getApplicationStats('all');
        setStats(data);
      } catch (error) {
        console.error('Error fetching application stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [user, getApplicationStats, refreshTrigger]);
  
  // Add separate effect for automation runs with different period
  useEffect(() => {
    if (!user) return;
    
    const fetchAutomationSessions = async () => {
      try {
        setLoadingAutomation(true);
        const data = await getApplicationStats(automationPeriod);
        
        if (data) {
          // If we have raw session data, manually check if currentSession is among them
          if (currentSession && automationPeriod === 'day') {
            // Check if the current active session is already in the data
            const hasCurrentSession = data.recentSessions?.some(s => s.id === currentSession.id);
            
            if (!hasCurrentSession && currentSession.id) {
              console.log("Adding current active session to the list");
              // Add the current session to the list if it's not there already
              data.recentSessions = [currentSession, ...(data.recentSessions || [])];
            }
          }
          
          // Filter sessions based on automationPeriod
          const filteredSessions = filterSessionsByPeriod(data.recentSessions || [], automationPeriod);
          setAutomationSessions(filteredSessions);
          setTotalPages(Math.ceil(filteredSessions.length / pageSize));
          
          if (debugMode) {
            console.log(`Filtered sessions for ${automationPeriod}:`, filteredSessions.length);
            console.log("Current active session:", currentSession);
          }
        }
      } catch (error) {
        console.error('Error fetching automation sessions:', error);
      } finally {
        setLoadingAutomation(false);
      }
    };
    
    fetchAutomationSessions();
  }, [user, automationPeriod, getApplicationStats, pageSize, debugMode, refreshTrigger, currentSession]); 
  
  // Improve the helper function to filter sessions by period with better date handling
  const filterSessionsByPeriod = (sessions, period) => {
    if (!sessions || !sessions.length) return [];
    
    const today = new Date();
    const oneDay = 24 * 60 * 60 * 1000; // milliseconds in a day
    const oneWeek = 7 * oneDay;

    // For debugging
    if (debugMode) {
      console.log("Current period:", period);
      console.log("Today's date:", today.toISOString());
      console.log("Sessions to filter:", sessions.length);
    }

    // Special case: If the current session exists and period is 'day', always include it
    if (currentSession && period === 'day') {
      if (debugMode) console.log("Including current session in 'today' results");
    }

    return sessions.filter(session => {
      // Always include the current active session for "today" filter
      if (currentSession && period === 'day' && session.id === currentSession.id) {
        if (debugMode) console.log(`Including active session ${session.id}`);
        return true;
      }

      try {
        const sessionDate = new Date(session.session_start);

        switch (period) {
          case 'day': {
            // Compare year, month, and date directly
            const isToday =
              sessionDate.getFullYear() === today.getFullYear() &&
              sessionDate.getMonth() === today.getMonth() &&
              sessionDate.getDate() === today.getDate();
            if (debugMode) {
              console.log(`Session ${session.id} date:`, sessionDate.toISOString(), 'Today:', today.toISOString());
              console.log(`Date parts: session ${sessionDate.getFullYear()}-${sessionDate.getMonth()}-${sessionDate.getDate()} vs today ${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`);
              console.log(`isToday: ${isToday}`);
            }
            return isToday;
          }
          case 'week':
            // For week, check if session is within last 7 days
            return (today.getTime() - sessionDate.getTime()) < oneWeek;
          case 'month':
            // For month, check if session is in current month
            return sessionDate.getMonth() === today.getMonth() && 
                  sessionDate.getFullYear() === today.getFullYear();
          case 'all':
          default:
            // Return all sessions
            return true;
        }
      } catch (error) {
        console.error(`Error parsing date for session ${session.id}:`, error);
        return false;
      }
    });
  };
  
  useEffect(() => {
    // Debug the stats when they change
    if (stats && debugMode) {
      console.log('Stats loaded:', stats);
      console.log('Total sessions found:', stats.recentSessions?.length || 0);
      console.log('First session:', stats.recentSessions?.[0]);
    }
  }, [stats, debugMode]);
  
  useEffect(() => {
    if (automationSessions?.length) {
      setTotalPages(Math.ceil(automationSessions.length / pageSize));
    }
  }, [automationSessions, pageSize]);
  
  const handlePeriodChange = (newPeriod) => {
    setPeriod(newPeriod);
  };
  
  // Add handler for automation period changes
  const handleAutomationPeriodChange = (newPeriod) => {
    setAutomationPeriod(newPeriod);
  };

  // Replace COLORS array with platform-specific colors
  // const COLORS = ['#4f46e5', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
  
  // Prepare platform data for bar display using all-time stats
  const preparePlatformData = () => {
    if (!stats || !Array.isArray(stats.recentSessions) || stats.recentSessions.length === 0) return [];

    // Group all-time sessions by platform
    const platformCounts = stats.recentSessions.reduce((acc, session) => {
      const platform = session.platform || 'unknown';
      if (!acc[platform]) {
        acc[platform] = {
          count: 0,
          jobs: 0
        };
      }
      acc[platform].count += 1;
      acc[platform].jobs += (session.jobs_applied || 0);
      return acc;
    }, {});

    const totalSessions = stats.recentSessions.length;

    return Object.entries(platformCounts).map(([platform, data]) => {
      const platformColor = getPlatformColors(platform);
      const percentage = totalSessions > 0 ? Math.round((data.count / totalSessions) * 100) : 0;
      return {
        name: platform.charAt(0).toUpperCase() + platform.slice(1),
        count: data.count,
        jobs: data.jobs,
        percentage,
        color: platformColor.hex || platformColor.bg.replace('bg-', '').split('-')[0]
      };
    }).sort((a, b) => b.count - a.count);
  };

  const handlePieEnter = (_, index) => {
    setActiveIndex(index);
  };

  const handlePieLeave = () => {
    setActiveIndex(null);
  };
  
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
  
    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={12}
        fontWeight="medium"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };
  
  // Add function to manually refresh data
  const refreshData = () => {
    setRefreshTrigger(prev => prev + 1);
    setLoadingAutomation(true);
  };
  
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-center justify-center h-64">
        <FiLoader className="animate-spin text-primary-600 mr-3" size={24} />
        <span className="text-gray-600 font-medium">Loading analytics data...</span>
      </div>
    );
  }
  
  // If no data or no applications for all time
  if (!stats || stats.totalJobsApplied === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200 px-5 py-4">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <FiBarChart2 className="mr-2 text-primary-600" />
            Application Analytics
          </h3>
        </div>
        <div className="p-10 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 text-gray-400 mb-4">
            <FiBarChart2 size={28} />
          </div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">
            No Application Data Yet
          </h3>
          <p className="text-gray-500 max-w-sm mx-auto mb-6">
            Start applying to jobs to see detailed analytics about your application activity.
          </p>
        </div>
      </div>
    );
  }

  // Check if there's data specifically for the selected period
  const hasPeriodData = () => {
    // If there are any sessions or jobs applied in the period, return true
    if (!stats) return false;
    if (Array.isArray(stats.recentSessions) && stats.recentSessions.length > 0) {
      // If any session in recentSessions has jobs_applied > 0, consider as data
      const hasJobs = stats.recentSessions.some(s => (s.jobs_applied || 0) > 0);
      return hasJobs || stats.totalJobsApplied > 0;
    }
    // Fallback: check totalJobsApplied
    return stats.totalJobsApplied > 0;
  };

  // If we have stats but no data for the selected period
  if (!hasPeriodData()) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <FiBarChart2 className="mr-2 text-primary-600" />
            Application Analytics
          </h3>
          
          <div className="inline-flex rounded-md shadow-sm" role="group">
            <button
              onClick={() => handlePeriodChange('day')}
              className={`px-3 py-1.5 text-xs font-medium rounded-l-md border ${
                period === 'day' 
                  ? 'bg-primary-50 text-primary-700 border-primary-300' 
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => handlePeriodChange('week')}
              className={`px-3 py-1.5 text-xs font-medium border-t border-b ${
                period === 'week'
                  ? 'bg-primary-50 text-primary-700 border-primary-300'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              This Week
            </button>
            <button
              onClick={() => handlePeriodChange('month')}
              className={`px-3 py-1.5 text-xs font-medium ${
                period === 'month'
                  ? 'bg-primary-50 text-primary-700 border-primary-300'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              This Month
            </button>
            <button
              onClick={() => handlePeriodChange('all')}
              className={`px-3 py-1.5 text-xs font-medium rounded-r-md border ${
                period === 'all'
                  ? 'bg-primary-50 text-primary-700 border-primary-300'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              All Time
            </button>
          </div>
        </div>
        
        <div className="p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 text-gray-400 mb-4">
            <FiCalendar size={28} />
          </div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">
            No Data For {period === 'day' ? 'Today' : 
                        period === 'week' ? 'This Week' : 
                        period === 'month' ? 'This Month' : 'All Time'}
          </h3>
          <p className="text-gray-500 max-w-sm mx-auto mb-4">
            You haven't applied to any jobs during this time period. Try selecting a different time range or check back later.
          </p>
          
          <button
            onClick={() => handlePeriodChange('all')}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            View All Time Data
          </button>
        </div>
      </div>
    );
  }
  
  const pieData = preparePlatformData();
  
  return (
    <div className="space-y-6">
      {/* Application Analytics Section */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden scale-95 transform origin-top"
      >
        <div className="border-b border-gray-200 px-4 py-3 flex items-center">
          <h3 className="text-base font-medium text-gray-900 flex items-center">
            <FiBarChart2 className="mr-1 text-primary-600" />
            Application Analytics
          </h3>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
            {/* 1. Automation Runs */}
            <motion.div 
              whileHover={{ y: -2, boxShadow: '0 8px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' }}
              className="p-3 bg-gradient-to-br from-secondary-500 to-secondary-700 rounded-lg text-white"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs opacity-90 font-medium mb-0.5">Automation Runs</div>
                  <div className="text-2xl font-bold">{stats.totalSessions}</div>
                  <div className="text-xs opacity-80">Sessions started</div>
                </div>
                <div className="bg-white/20 p-2 rounded-lg">
                  <FiTrendingUp size={20} />
                </div>
              </div>
            </motion.div>
            {/* 2. Avg. Jobs per Run */}
            <motion.div 
              whileHover={{ y: -2, boxShadow: '0 8px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' }}
              className="p-3 bg-gradient-to-br from-purple-500 to-purple-700 rounded-lg text-white"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs opacity-90 font-medium mb-0.5">Avg. Jobs per Run</div>
                  <div className="text-2xl font-bold">
                    {stats.totalSessions > 0 ? (stats.totalJobsApplied / stats.totalSessions).toFixed(1) : 0}
                  </div>
                  <div className="text-xs opacity-80">Jobs per session</div>
                </div>
                <div className="bg-white/20 p-2 rounded-lg">
                  <FiPieChart size={20} />
                </div>
              </div>
            </motion.div>
            {/* 3. Completed Automations */}
            <motion.div 
              whileHover={{ y: -2, boxShadow: '0 8px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' }}
              className="p-3 bg-gradient-to-br from-green-500 to-green-700 rounded-lg text-white"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs opacity-90 font-medium mb-0.5">Completed Automations</div>
                  <div className="text-2xl font-bold">
                    {Array.isArray(stats.recentSessions)
                      ? stats.recentSessions.filter(s => s.status === 'completed').length
                      : 0}
                  </div>
                  <div className="text-xs opacity-80">Completed sessions</div>
                </div>
                <div className="bg-white/20 p-2 rounded-lg">
                  <FiBarChart2 size={20} />
                </div>
              </div>
            </motion.div>
          </div>
          {/* Platform Distribution using status bars instead of pie chart */}
          {stats && Array.isArray(stats.recentSessions) && stats.recentSessions.length > 0 && (
            <div className="border border-gray-200 rounded-lg p-3 mb-5">
              <h4 className="text-xs font-semibold text-gray-800 mb-2 flex items-center">
                <FiPieChart className="mr-1 text-primary-600" /> Platform Distribution
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {preparePlatformData().map((platform) => {
                  const platformColors = getPlatformColors(platform.name.toLowerCase());
                  return (
                    <div key={platform.name} className={`border rounded-md p-2 ${platformColors.bg} ${platformColors.text} ${platformColors.border}`}>
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-medium">{platform.name}</span>
                        <span className="text-sm font-bold">{platform.count}</span>
                      </div>
                      <div className="w-full bg-white bg-opacity-50 rounded-full h-1.5 mt-1.5">
                        <div 
                          className={`h-1.5 rounded-full ${platformColors.bg.replace('100', '500')}`}
                          style={{ width: `${platform.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Session History Section */}
      {stats && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
        >
          <div className="bg-gray-50 p-3 border-b border-gray-200 flex flex-wrap items-center justify-between">
            <div className="flex items-center">
              <h4 className="text-xs font-semibold text-gray-800 flex items-center mb-2 sm:mb-0">
                <FiCalendar className="mr-1 text-primary-600" /> Session History
                <span className="ml-1.5 text-xs font-normal text-gray-500">
                  ({automationSessions.length})
                </span>
              </h4>
              {/* Add refresh button */}
              <button 
                onClick={refreshData} 
                className="ml-2 p-1.5 text-xs rounded-full text-gray-500 hover:bg-gray-200 transition-colors"
                title="Refresh sessions"
                disabled={loadingAutomation}
              >
                <FiRefreshCw 
                  className={`${loadingAutomation ? 'animate-spin text-primary-500' : ''}`} 
                  size={14} 
                />
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {/* View mode toggle for desktop */}
              <div className="hidden md:flex bg-white rounded-md shadow-sm p-1 mr-2">
                <button
                  onClick={() => handleViewModeChange('table')}
                  className={`p-1.5 rounded ${userPreferredView === 'table' ? 'bg-primary-50 text-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
                  aria-label="Table view"
                  disabled={window.innerWidth < 768}
                >
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V3"/></svg>
                </button>
                <button
                  onClick={() => handleViewModeChange('card')}
                  className={`p-1.5 rounded ${userPreferredView === 'card' ? 'bg-primary-50 text-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
                  aria-label="Card view"
                >
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/></svg>
                </button>
              </div>
              {/* Add separate time filter for Automation Runs */}
              <div className="inline-flex rounded-md shadow-sm" role="group">
                <button
                  onClick={() => handleAutomationPeriodChange('day')}
                  className={`px-2 py-0.5 text-xs font-medium rounded-l-md border ${
                    automationPeriod === 'day' 
                      ? 'bg-primary-50 text-primary-700 border-primary-300' 
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Today
                </button>
                <button
                  onClick={() => handleAutomationPeriodChange('week')}
                  className={`px-2 py-0.5 text-xs font-medium border-t border-b ${
                    automationPeriod === 'week'
                      ? 'bg-primary-50 text-primary-700 border-primary-300'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Week
                </button>
                <button
                  onClick={() => handleAutomationPeriodChange('month')}
                  className={`px-2 py-0.5 text-xs font-medium ${
                    automationPeriod === 'month'
                      ? 'bg-primary-50 text-primary-700 border-primary-300'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Month
                </button>
                <button
                  onClick={() => handleAutomationPeriodChange('all')}
                  className={`px-2 py-0.5 text-xs font-medium rounded-r-md border ${
                    automationPeriod === 'all'
                      ? 'bg-primary-50 text-primary-700 border-primary-300'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  All
                </button>
              </div>
              {/* Page size selector */}
              <div className="flex items-center space-x-1">
                <label htmlFor="pageSize" className="text-xs text-gray-600">
                  Show:
                </label>
                <select 
                  id="pageSize"
                  value={pageSize}
                  onChange={(e) => {
                    const newSize = Number(e.target.value);
                    setPageSize(newSize);
                    setCustomPageSize(newSize);
                    setPage(1);
                  }}
                  className="text-xs border border-gray-300 rounded py-0.5 px-1"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
            </div>
          </div>
          {loadingAutomation ? (
            <div className="p-6 text-center">
              <FiLoader className="animate-spin text-primary-600 mx-auto mb-2" size={20} />
              <p className="text-sm text-gray-600">Loading sessions...</p>
            </div>
          ) : automationSessions.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-sm text-gray-500">
                {currentSession ? 
                  'Processing your current automation...' : 
                  'No sessions found for this period.'
                }
              </p>
              {!currentSession && (
                <div className="mt-2 space-y-2">
                  <button
                    onClick={() => handleAutomationPeriodChange('all')}
                    className="inline-flex items-center px-2 py-1 text-xs font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700"
                  >
                    View All Time
                  </button>
                  <div>
                    <button
                      onClick={refreshData}
                      className="inline-flex items-center px-2 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                    >
                      <FiRefreshCw className="mr-1" size={12} />
                      Refresh Data
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              {viewMode === 'table' ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        {/* Removed ID column */}
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Platform</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jobs</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {automationSessions
                        .slice((page - 1) * pageSize, page * pageSize)
                        .map((session) => (
                          <tr key={session.id} className="hover:bg-gray-50 transition-colors">
                            {/* Removed ID cell */}
                            <td className="px-3 py-2 whitespace-nowrap">
                              <span className={`px-1.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full 
                                ${getPlatformColors(session.platform).bg} ${getPlatformColors(session.platform).text}`}
                              >
                                {session.platform.charAt(0).toUpperCase() + session.platform.slice(1)}
                              </span>
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-600">
                              {new Date(session.session_start).toLocaleDateString('en-US', {
                                month: 'short', 
                                day: 'numeric',
                                hour: '2-digit', 
                                minute: '2-digit'
                              })}
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap text-xs">
                              <div className="flex items-center">
                                <span className="font-medium text-gray-900">{session.jobs_applied || 0}</span>
                                <span className="mx-1 text-gray-500">/</span>
                                <span className="text-gray-600">{session.jobs_requested || 0}</span>
                              </div>
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap">
                              <span className={`px-1.5 py-0.5 inline-flex text-xs leading-5 font-medium rounded-full 
                                ${session.status === 'completed' ? 'bg-green-100 text-green-800' : 
                                session.status === 'started' ? 'bg-blue-100 text-blue-800' : 
                                'bg-red-100 text-red-800'}`}>
                                {session.status}
                              </span>
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-600">
                              {session.session_end ? 
                                (() => {
                                  const start = new Date(session.session_start).getTime();
                                  const end = new Date(session.session_end).getTime();
                                  const durationMin = Math.floor((end - start) / 60000);
                                  return `${durationMin} min`;
                                })() : 
                                '—'}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 p-2">
                  {automationSessions
                    .slice((page - 1) * pageSize, page * pageSize)
                    .map((session) => (
                      <div key={session.id} className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col h-full">
                        <div className="p-3 flex-1">
                          <div className="flex justify-between items-center mb-2">
                            <span className={`px-1.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full 
                              ${getPlatformColors(session.platform).bg} ${getPlatformColors(session.platform).text}`}
                            >
                              {session.platform.charAt(0).toUpperCase() + session.platform.slice(1)}
                            </span>
                            <span className={`px-1.5 py-0.5 inline-flex text-xs leading-5 font-medium rounded-full 
                              ${session.status === 'completed' ? 'bg-green-100 text-green-800' : 
                              session.status === 'started' ? 'bg-blue-100 text-blue-800' : 
                              'bg-red-100 text-red-800'}`}>
                              {session.status}
                            </span>
                          </div>
                          <div className="text-xs text-gray-600 mb-1">
                            {new Date(session.session_start).toLocaleDateString('en-US', {
                              month: 'short', 
                              day: 'numeric',
                              hour: '2-digit', 
                              minute: '2-digit'
                            })}
                          </div>
                          <div className="flex items-center text-xs mb-1">
                            <span className="font-medium text-gray-900">{session.jobs_applied || 0}</span>
                            <span className="mx-1 text-gray-500">/</span>
                            <span className="text-gray-600">{session.jobs_requested || 0}</span>
                            <span className="ml-2 text-gray-400">jobs</span>
                          </div>
                          <div className="text-xs text-gray-500">
                            Duration: {session.session_end ? (() => {
                              const start = new Date(session.session_start).getTime();
                              const end = new Date(session.session_end).getTime();
                              const durationMin = Math.floor((end - start) / 60000);
                              return `${durationMin} min`;
                            })() : '—'}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
              {/* Pagination controls - more compact */}
              <div className="py-2 px-3 bg-gray-50 border-t border-gray-200 flex flex-wrap items-center justify-between">
                <div className="mb-1 sm:mb-0">
                  <p className="text-xs text-gray-600">
                    {Math.min(pageSize, automationSessions.length - (page - 1) * pageSize)} of {automationSessions.length} sessions
                  </p>
                </div>
                <div className="flex flex-wrap items-center space-x-1">
                  {/* Simplified pagination controls */}
                  <button
                    onClick={() => setPage(1)}
                    disabled={page === 1}
                    className={`px-1.5 py-0.5 text-xs font-medium rounded border ${
                      page === 1 ? 'bg-gray-100 text-gray-400' : 'bg-white text-primary-600 hover:bg-gray-50'
                    }`}
                  >
                    First
                  </button>
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className={`px-2 py-0.5 text-xs font-medium rounded border ${
                      page === 1 ? 'bg-gray-100 text-gray-400' : 'bg-white text-primary-600 hover:bg-gray-50'
                    }`}
                  >
                    Prev
                  </button>
                  <span className="text-xs px-1">
                    {page} / {totalPages}
                  </span>
                  <button
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page >= totalPages}
                    className={`px-2 py-0.5 text-xs font-medium rounded border ${
                      page >= totalPages ? 'bg-gray-100 text-gray-400' : 'bg-white text-primary-600 hover:bg-gray-50'
                    }`}
                  >
                    Next
                  </button>
                  <button
                    onClick={() => setPage(totalPages)}
                    disabled={page >= totalPages}
                    className={`px-1.5 py-0.5 text-xs font-medium rounded border ${
                      page >= totalPages ? 'bg-gray-100 text-gray-400' : 'bg-white text-primary-600 hover:bg-gray-50'
                    }`}
                  >
                    Last
                  </button>
                </div>
              </div>
            </>
          )}
        </motion.div>
      )}
      {/* Only show debug section if debugMode is enabled through URL or other means, not through UI button */}
      {debugMode && stats && (
        <div className="mb-4 border border-yellow-200 bg-yellow-50 rounded-lg p-3 mx-4 text-xs">
          <h4 className="text-xs font-semibold text-yellow-800 mb-1">Debug Information</h4>
          <div className="space-y-1">
            <div>User: {user?.id || 'Not available'}</div>
            <div>Charts: Automation: {automationPeriod}</div>
            <div>Sessions: {automationSessions?.length || 0} / {stats.recentSessions?.length || 0} total</div>
            <div>Current Session: {currentSession ? `ID: ${currentSession.id} (${currentSession.status})` : 'None'}</div>
            <div>Today's Date: {new Date().toLocaleString()}</div>
            <div>Today (ISO): {new Date().toISOString()}</div>
            {automationSessions[0] && (
              <>
                <div>First Session: {new Date(automationSessions[0].session_start).toLocaleString()}</div>
                <div>Session (ISO): {new Date(automationSessions[0].session_start).toISOString()}</div>
              </>
            )}
            <div className="flex justify-between">
              <button 
                onClick={refreshData}
                className="text-blue-600 underline text-xs font-medium flex items-center"
              >
                <FiRefreshCw className="mr-1" size={10} />
                Refresh
              </button>
              <button 
                onClick={() => {
                  console.log('Stats:', stats);
                  console.log('Current session:', currentSession);
                  console.log('All sessions:', stats.recentSessions);
                  console.log('Filtered sessions:', automationSessions);
                  // Date debugging
                  const today = new Date();
                  const todayStr = today.toLocaleDateString();
                  console.log('Today in local format:', todayStr);
                  if (stats.recentSessions && stats.recentSessions.length > 0) {
                    stats.recentSessions.slice(0, 5).forEach(session => {
                      const sessionDate = new Date(session.session_start);
                      const sessionDateStr = sessionDate.toLocaleDateString();
                      console.log(
                        'Session ID:', session.id, 
                        'Date:', sessionDate.toLocaleString(),
                        'String format:', sessionDateStr,
                        'Match today?', sessionDateStr === todayStr
                      );
                    });
                  }
                }} 
                className="text-blue-600 underline text-xs"
              >
                Debug Sessions
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ApplicationAnalytics;
