import { useState, useEffect, useCallback } from 'react';
import { FiDownload, FiFilter, FiInfo, FiExternalLink, FiSearch, FiCalendar, FiChevronDown, FiGrid, FiList, FiCheck, FiChevronUp, FiBarChart2, FiPieChart, FiTrendingUp } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import { subscriptionService } from '../lib/supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import { getPlatformColors } from './Dashboard'; // Import the utility function

function JobDetailsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // Platform filter
  const [dateRange, setDateRange] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date_desc');
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState('table'); // table or grid
  const [userPreferredView, setUserPreferredView] = useState('table'); // User's preferred view
  const [showFilters, setShowFilters] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [activeStatusDropdown, setActiveStatusDropdown] = useState(null);
  const [showInsights, setShowInsights] = useState(true); // New state for controlling insights visibility
  const { user, updateJobStatus } = useAuth();
  
  // Status options for dropdown
  const statusOptions = [
    { value: 'Applied', label: 'Applied' },
    { value: 'Screening', label: 'Screening' },
    { value: 'Interview', label: 'Interview' },
    { value: 'Selected', label: 'Selected' },
    { value: 'Rejected', label: 'Rejected' }
  ];
  
  // Function to handle viewport size changes
  const handleResize = useCallback(() => {
    if (window.innerWidth < 768) { // md breakpoint is typically 768px
      setViewMode('grid'); // Force grid view on small screens
    } else {
      setViewMode(userPreferredView); // Use user's preference on larger screens
    }
  }, [userPreferredView]);

  // Set up resize listener
  useEffect(() => {
    handleResize(); // Check on initial render
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [handleResize]);

  // Custom view mode setter that updates both viewMode and userPreferredView
  const handleViewModeChange = (mode) => {
    setUserPreferredView(mode); // Store user preference
    
    // Only apply if we're not on mobile (on mobile we force grid view)
    if (window.innerWidth >= 768) {
      setViewMode(mode);
    }
  };

  // Function to handle status change
  const handleStatusChange = async (jobId, newStatus) => {
    try {
      setStatusUpdating(true);
      await updateJobStatus(jobId, newStatus);
      
      // Update local state to reflect the change immediately
      setJobs(prevJobs => prevJobs.map(job => 
        job.id === jobId ? { ...job, application_status: newStatus } : job
      ));
      
      // Close dropdown
      setActiveStatusDropdown(null);
    } catch (error) {
      console.error('Failed to update application status:', error);
      // Optionally show an error toast/notification here
    } finally {
      setStatusUpdating(false);
    }
  };

  // Toggle status dropdown visibility
  const toggleStatusDropdown = (jobId) => {
    setActiveStatusDropdown(activeStatusDropdown === jobId ? null : jobId);
  };

  useEffect(() => {
    const fetchAppliedJobs = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        // Updated to fetch all jobs by passing a limit parameter
        const { data, error } = await subscriptionService.getAppliedJobs(user.id, { 
          limit: 'all', // Request all jobs without pagination limit
          sortBy: 'date_desc' // Optional: Keep newest jobs first
        });
        
        if (error) {
          console.error('Error fetching applied jobs:', error);
        } else {
          setJobs(data || []);
        }
      } catch (err) {
        console.error('Error in fetchAppliedJobs:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAppliedJobs();
  }, [user]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (activeStatusDropdown && !event.target.closest('.status-dropdown')) {
        setActiveStatusDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activeStatusDropdown]);

  // Filter and sort jobs
  const filteredJobs = jobs
    // Platform filter
    .filter(job => {
      if (filter === 'all') return true;
      return job.platform === filter;
    })
    // Date range filter
    .filter(job => {
      if (dateRange === 'all') return true;
      if (!job.date_applied) return false;
      const jobDate = new Date(job.date_applied);
      const now = new Date();
      if (dateRange === '7') {
        return (now - jobDate) / (1000 * 60 * 60 * 24) <= 7;
      } else if (dateRange === '30') {
        return (now - jobDate) / (1000 * 60 * 60 * 24) <= 30;
      } else if (dateRange === '90') {
        return (now - jobDate) / (1000 * 60 * 60 * 24) <= 90;
      }
      return true;
    })
    // Status filter (case-insensitive, treat missing as 'Applied')
    .filter(job => {
      if (statusFilter === 'all') return true;
      const jobStatus = (job.application_status || 'Applied').toLowerCase();
      const filterStatus = statusFilter.toLowerCase();
      return jobStatus === filterStatus;
    })
    // Search filter
    .filter(job => {
      if (!search) return true;
      return (
        job.job_title?.toLowerCase().includes(search.toLowerCase()) ||
        job.company_name?.toLowerCase().includes(search.toLowerCase()) ||
        job.job_location?.toLowerCase().includes(search.toLowerCase())
      );
    })
    // Sort
    .sort((a, b) => {
      if (sortBy === 'date_desc') {
        return new Date(b.date_applied || 0) - new Date(a.date_applied || 0);
      } else if (sortBy === 'date_asc') {
        return new Date(a.date_applied || 0) - new Date(b.date_applied || 0);
      } else if (sortBy === 'company') {
        return (a.company_name || '').localeCompare(b.company_name || '');
      }
      return 0;
    });

  // Get unique platforms
  // Exclude falsy/unknown platforms
  const platforms = [...new Set(jobs.map(job => job.platform))].filter(Boolean);

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPlatformColor = (platform) => {
    const colors = getPlatformColors(platform);
    return `${colors.bg} ${colors.text} ${colors.border}`;
  };

  const getStatusColor = (status) => {
    const statusMap = {
      Applied: 'bg-green-100 text-green-800 border-green-200',
      Screening: 'bg-blue-100 text-blue-800 border-blue-200',
      Interview: 'bg-purple-100 text-purple-800 border-purple-200',
      Selected: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      Rejected: 'bg-red-100 text-red-800 border-red-200'
    };
    const normalized = (status || 'Applied');
    // Try exact match first
    if (statusMap[normalized]) return statusMap[normalized];
    // Fallback: case-insensitive match
    const found = Object.entries(statusMap).find(([key]) => key.toLowerCase() === normalized.toLowerCase());
    if (found) return found[1];
    return statusMap['Applied'];
  };

  // Status dropdown component
  const StatusDropdown = ({ job }) => (
    <div className="status-dropdown relative">
      <button 
        onClick={() => toggleStatusDropdown(job.id)}
        className={`flex items-center justify-between px-2 py-0.5 text-xs leading-5 font-semibold rounded-full border ${getStatusColor(job.application_status)} w-full`}
        disabled={statusUpdating}
      >
        <span>{job.application_status || 'Applied'}</span>
        <FiChevronDown size={12} className="ml-1" />
      </button>
      
      {activeStatusDropdown === job.id && (
        <div className="absolute right-0 mt-1 w-32 bg-white rounded-md shadow-lg z-10 border border-gray-200">
          <div className="py-1">
            {statusOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleStatusChange(job.id, option.value)}
                className={`flex items-center px-3 py-1.5 text-xs w-full text-left hover:bg-gray-100 ${job.application_status === option.value ? 'bg-gray-50 font-medium' : ''}`}
                disabled={statusUpdating}
              >
                {job.application_status === option.value && (
                  <FiCheck size={12} className="text-green-600 mr-1" />
                )}
                <span className={job.application_status !== option.value ? 'ml-4' : ''}>
                  {option.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  // Job status stats helper function
  const getJobStatusStats = (jobs) => {
    const stats = jobs.reduce((acc, job) => {
      const status = (job.application_status || 'Applied').toLowerCase();
      // Normalize to lower case for counting
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});
    return {
      Applied: stats['applied'] || 0,
      Screening: stats['screening'] || 0,
      Interview: stats['interview'] || 0,
      Selected: stats['selected'] || 0,
      Rejected: stats['rejected'] || 0
    };
  };

  return (
    <div className="max-w-full px-2 sm:px-0">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Applied Jobs</h1>
          <div className="flex items-center">
            <div className="bg-white rounded-md shadow-sm p-1 flex">
              <button
                onClick={() => handleViewModeChange('table')}
                className={`p-1.5 rounded ${userPreferredView === 'table' ? 'bg-primary-50 text-primary-600' : 'text-gray-500 hover:text-gray-700'} ${window.innerWidth < 768 ? 'opacity-50' : ''}`}
                aria-label="Table view"
                disabled={window.innerWidth < 768}
              >
                <FiList size={16} />
              </button>
              <button
                onClick={() => handleViewModeChange('grid')}
                className={`p-1.5 rounded ${userPreferredView === 'grid' ? 'bg-primary-50 text-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
                aria-label="Grid view"
              >
                <FiGrid size={16} />
              </button>
            </div>
          </div>
        </div>
        
        {/* Job Application Stats - with toggle button */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-4">
          <div className="p-3 sm:p-4 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h2 className="text-sm sm:text-base font-medium text-gray-900">Application Insights</h2>
              <p className="text-xs text-gray-500 mt-1">
                A summary of your job application activities
              </p>
            </div>
            <button
              onClick={() => setShowInsights(!showInsights)}
              className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
              aria-label={showInsights ? "Hide insights" : "Show insights"}
            >
              {showInsights ? <FiChevronUp size={18} /> : <FiChevronDown size={18} />}
            </button>
          </div>
          
          <AnimatePresence>
            {showInsights && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="p-3 sm:p-4">
                  <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                    <motion.div 
                      whileHover={{ y: -2, boxShadow: '0 8px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' }}
                      className="p-3 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg text-white"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-xs opacity-90 font-medium mb-0.5">Total Applications</div>
                          <div className="text-2xl font-bold">{jobs.length}</div>
                          <div className="text-xs opacity-80">All time</div>
                        </div>
                        <div className="bg-white/20 p-2 rounded-lg">
                          <FiCalendar size={20} />
                        </div>
                      </div>
                    </motion.div>
                    
                    <motion.div 
                      whileHover={{ y: -2, boxShadow: '0 8px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' }}
                      className="p-3 bg-gradient-to-br from-green-500 to-green-700 rounded-lg text-white"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-xs opacity-90 font-medium mb-0.5">Recent Applications</div>
                          <div className="text-2xl font-bold">
                            {jobs.filter(job => {
                              if (!job.date_applied) return false;
                              const date = new Date(job.date_applied);
                              const now = new Date();
                              const daysDiff = Math.round((now - date) / (1000 * 60 * 60 * 24));
                              return daysDiff <= 7;
                            }).length}
                          </div>
                          <div className="text-xs opacity-80">Last 7 days</div>
                        </div>
                        <div className="bg-white/20 p-2 rounded-lg">
                          <FiBarChart2 size={20} />
                        </div>
                      </div>
                    </motion.div>
                    
                    <motion.div 
                      whileHover={{ y: -2, boxShadow: '0 8px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' }}
                      className="p-3 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-lg text-white"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-xs opacity-90 font-medium mb-0.5">Selected / Interviews</div>
                          <div className="text-2xl font-bold">
                            {(() => {
                              const stats = getJobStatusStats(jobs);
                              const selected = typeof stats.Selected === 'number' ? stats.Selected : 0;
                              const interview = typeof stats.Interview === 'number' ? stats.Interview : 0;
                              return selected + interview;
                            })()}
                          </div>
                          <div className="text-xs opacity-80">Positive responses</div>
                        </div>
                        <div className="bg-white/20 p-2 rounded-lg">
                          <FiTrendingUp size={20} />
                        </div>
                      </div>
                    </motion.div>
                    
                    <motion.div 
                      whileHover={{ y: -2, boxShadow: '0 8px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' }}
                      className="p-3 bg-gradient-to-br from-amber-500 to-amber-700 rounded-lg text-white"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-xs opacity-90 font-medium mb-0.5">Success Rate</div>
                          <div className="text-2xl font-bold">
                            {(() => {
                              const stats = getJobStatusStats(jobs);
                              const selected = typeof stats.Selected === 'number' ? stats.Selected : 0;
                              const interview = typeof stats.Interview === 'number' ? stats.Interview : 0;
                              const positiveResponses = selected + interview;
                              return jobs.length && !isNaN(positiveResponses) ? `${Math.round((positiveResponses / jobs.length) * 100)}%` : '0%';
                            })()}
                          </div>
                          <div className="text-xs opacity-80">Selection rate</div>
                        </div>
                        <div className="bg-white/20 p-2 rounded-lg">
                          <FiPieChart size={20} />
                        </div>
                      </div>
                    </motion.div>
                  </div>
                  
                  {/* Platform-wise application count */}
                  {jobs.length > 0 && (
                    <div className="mt-3 sm:mt-4">
                      <div className="text-xs font-medium text-gray-700 mb-2">Applications Applied on Each Platform</div>
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                        {platforms.map(platform => {
                          // Skip platforms that are falsy (unknown)
                          if (!platform) return null;
                          const count = jobs.filter(job => job.platform === platform).length;
                          const colors = getPlatformColors(platform);
                          return (
                            <div
                              key={platform}
                              className={`border rounded-md p-2 flex flex-col items-start ${colors.bg} ${colors.text} ${colors.border}`}
                            >
                              <div className="flex justify-between items-center w-full">
                                <span className="text-xs font-medium">
                                  {platform.charAt(0).toUpperCase() + platform.slice(1)}
                                </span>
                                <span className="text-sm font-bold">{count}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* Mobile notice for table view */}
        {window.innerWidth < 768 && userPreferredView === 'table' && (
          <div className="mb-2 px-3 py-2 bg-blue-50 border border-blue-100 rounded-md text-xs text-blue-700 flex items-center">
            <FiInfo className="mr-1.5" size={14} />
            <span>Switched to card view for better mobile experience</span>
          </div>
        )}
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-4">
          <div className="p-3 sm:p-4 border-b border-gray-200">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3">
              <div className="relative flex-1 w-full">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="text-gray-400" size={16} />
                </div>
                <input
                  type="text"
                  placeholder="Search jobs by title or company..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 block w-full text-sm"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <button 
                className="flex items-center px-2.5 sm:px-3 py-1.5 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 text-sm whitespace-nowrap"
                onClick={() => setShowFilters(!showFilters)}
              >
                <FiFilter className="mr-1 sm:mr-1.5" size={14} />
                <span className="text-xs sm:text-sm">Filters</span>
                <FiChevronDown className={`ml-1 transform transition-transform ${showFilters ? 'rotate-180' : ''}`} size={14} />
              </button>
            </div>
            
            {/* Filter panel */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="pt-3 mt-3 border-t border-gray-100">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Platform</label>
                        <select
                          value={filter}
                          onChange={e => setFilter(e.target.value)}
                          className="block w-full text-sm appearance-none bg-white border border-gray-300 hover:border-gray-400 px-3 py-1.5 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                        >
                          <option value="all">All Platforms</option>
                          {platforms.map(platform => (
                            <option key={platform} value={platform}>{platform ? platform.charAt(0).toUpperCase() + platform.slice(1) : 'Unknown'}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Date Range</label>
                        <select
                          value={dateRange}
                          onChange={e => setDateRange(e.target.value)}
                          className="block w-full text-sm appearance-none bg-white border border-gray-300 hover:border-gray-400 px-3 py-1.5 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                        >
                          <option value="all">All Time</option>
                          <option value="7">Last 7 days</option>
                          <option value="30">Last 30 days</option>
                          <option value="90">Last 90 days</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
                        <select
                          value={statusFilter}
                          onChange={e => setStatusFilter(e.target.value)}
                          className="block w-full text-sm appearance-none bg-white border border-gray-300 hover:border-gray-400 px-3 py-1.5 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                        >
                          <option value="all">All Statuses</option>
                          <option value="applied">Applied</option>
                          <option value="screening">Screening</option>
                          <option value="interview">Interview</option>
                          <option value="selected">Selected</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Sort By</label>
                        <select
                          value={sortBy}
                          onChange={e => setSortBy(e.target.value)}
                          className="block w-full text-sm appearance-none bg-white border border-gray-300 hover:border-gray-400 px-3 py-1.5 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                        >
                          <option value="date_desc">Date (Newest first)</option>
                          <option value="date_asc">Date (Oldest first)</option>
                          <option value="company">Company name</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            <div className="mt-3 text-xs text-gray-500 flex items-center">
              <FiCalendar className="mr-2" size={12} />
              <span>Showing {filteredJobs.length} job applications</span>
            </div>
          </div>

          {loading ? (
            <div className="p-6 sm:p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mb-3"></div>
              <p className="text-gray-500 font-medium">Loading job applications...</p>
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="p-6 sm:p-8 text-center">
              <div className="mb-4 inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gray-100 text-gray-400">
                <FiInfo className="h-6 w-6 sm:h-8 sm:w-8" />
              </div>
              <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No job applications found</h3>
              <p className="text-sm text-gray-500 max-w-md mx-auto">
                Start applying to jobs to see your applications here.
                You can use the automation features to apply to multiple jobs at once.
              </p>
              <button 
                onClick={() => navigate('/dashboard/automate')}
                className="mt-4 sm:mt-6 px-4 sm:px-5 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
              >
                Start Applying
              </button>
            </div>
          ) : viewMode === 'table' ? (
            <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Job Title</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Platform</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Applied</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredJobs.map((job) => (
                    <motion.tr 
                      key={job.id} 
                      className="hover:bg-gray-50 transition-colors"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      <td className="px-3 py-2.5 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 truncate max-w-[120px] sm:max-w-[180px]">{job.job_title || 'Untitled Job'}</div>
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap">
                        <div className="text-sm text-gray-700 truncate max-w-[100px] sm:max-w-[120px]">{job.company_name || 'Unknown Company'}</div>
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap">
                        <span className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full border ${getPlatformColor(job.platform)}`}>
                          {job.platform ? job.platform.charAt(0).toUpperCase() + job.platform.slice(1) : 'Unknown'}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap text-sm text-gray-500">
                        {job.date_applied ? formatDate(job.date_applied) : 'No date'}
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap">
                        <StatusDropdown job={job} />
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap text-right text-sm font-medium">
                        {job.job_url && (
                          <a 
                            href={job.job_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-primary-600 hover:text-primary-800 flex items-center justify-end"
                          >
                            <span className="mr-1">View</span>
                            <FiExternalLink size={14} />
                          </a>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-2 sm:p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
              {filteredJobs.map(job => (
                <motion.div
                  key={job.id}
                  className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col h-full"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="p-3 flex-1">
                    <div className="flex justify-between">
                      <span className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full border ${getPlatformColor(job.platform)}`}>
                        {job.platform ? job.platform.charAt(0).toUpperCase() + job.platform.slice(1) : 'Unknown'}
                      </span>
                      <div className="w-28">
                        <StatusDropdown job={job} />
                      </div>
                    </div>
                    
                    <h3 className="mt-2 text-sm sm:text-base font-semibold text-gray-900 line-clamp-2">
                      {job.job_title || 'Untitled Job'}
                    </h3>
                    
                    <p className="mt-1 text-xs sm:text-sm text-gray-700">
                      {job.company_name || 'Unknown Company'}
                    </p>
                    
                    <div className="mt-2 flex items-center text-xs text-gray-500">
                      <FiCalendar className="mr-1 flex-shrink-0" size={12} />
                      {job.date_applied ? formatDate(job.date_applied) : 'No date'}
                    </div>

                    <p className="mt-1 text-xs text-gray-500 truncate">
                      {job.job_location || 'No location data'}
                    </p>
                  </div>
                  
                  <div className="border-t border-gray-200 p-2 text-right">
                    {job.job_url && (
                      <a 
                        href={job.job_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs font-medium text-primary-600 hover:text-primary-800 flex items-center justify-end"
                      >
                        <span className="mr-1">View Job</span>
                        <FiExternalLink size={12} />
                      </a>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {!loading && filteredJobs.length > 0 && (
            <div className="px-3 sm:px-4 py-3 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row items-center justify-between">
                <p className="text-xs text-gray-500 mb-2 sm:mb-0">
                  Showing <span className="font-medium">{filteredJobs.length}</span> of <span className="font-medium">{jobs.length}</span> applications
                </p>
                <div className="flex justify-center sm:justify-end w-full sm:w-auto">
                  <button className="px-3 py-1 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50" disabled>
                    Previous
                  </button>
                  <button className="ml-2 px-3 py-1 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50" disabled>
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default JobDetailsPage;
