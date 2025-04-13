import { useState, useEffect } from 'react';
import { FiDownload, FiFilter, FiInfo, FiExternalLink, FiSearch, FiCalendar, FiChevronDown, FiGrid, FiList } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import { subscriptionService } from '../lib/supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';

function JobDetailsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState('table'); // table or grid
  const [showFilters, setShowFilters] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const fetchAppliedJobs = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const { data, error } = await subscriptionService.getAppliedJobs(user.id);
        
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

  // Filter jobs by platform
  const filteredJobs = jobs.filter(job => {
    if (filter === 'all') return true;
    return job.platform === filter;
  }).filter(job => {
    if (!search) return true;
    return (
      job.job_title?.toLowerCase().includes(search.toLowerCase()) ||
      job.company_name?.toLowerCase().includes(search.toLowerCase()) ||
      job.job_location?.toLowerCase().includes(search.toLowerCase())
    );
  });

  // Get unique platforms
  const platforms = [...new Set(jobs.map(job => job.platform))];

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
    const colors = {
      linkedin: 'bg-blue-100 text-blue-800 border-blue-200',
      indeed: 'bg-purple-100 text-purple-800 border-purple-200',
      internshala: 'bg-green-100 text-green-800 border-green-200',
      unstop: 'bg-amber-100 text-amber-800 border-amber-200',
      naukri: 'bg-indigo-100 text-indigo-800 border-indigo-200'
    };
    
    return colors[platform] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusColor = (status) => {
    const statusMap = {
      applied: 'bg-green-100 text-green-800 border-green-200',
      viewed: 'bg-blue-100 text-blue-800 border-blue-200',
      rejected: 'bg-red-100 text-red-800 border-red-200',
      interview: 'bg-purple-100 text-purple-800 border-purple-200'
    };

    const lowerStatus = (status || 'applied').toLowerCase();
    
    for (const [key, value] of Object.entries(statusMap)) {
      if (lowerStatus.includes(key)) return value;
    }
    
    return 'bg-green-100 text-green-800 border-green-200'; // Default to applied
  };

  const handleExportCsv = () => {
    // Create CSV content
    const headers = ['Job Title', 'Company', 'Location', 'Platform', 'Date Applied', 'Status'];
    const rows = filteredJobs.map(job => [
      job.job_title || '',
      job.company_name || '',
      job.job_location || '',
      job.platform || '',
      job.date_applied ? formatDate(job.date_applied) : '',
      job.application_status || ''
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `applied_jobs_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-full">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex flex-wrap items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Applied Jobs</h1>
          <div className="flex items-center mt-2 sm:mt-0">
            <div className="bg-white rounded-md shadow-sm p-1 flex mr-2">
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded ${viewMode === 'table' ? 'bg-primary-50 text-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
                aria-label="Table view"
              >
                <FiList size={18} />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-primary-50 text-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
                aria-label="Grid view"
              >
                <FiGrid size={18} />
              </button>
            </div>
            <button 
              className="flex items-center px-3 py-1.5 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 text-sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <FiFilter className="mr-1.5" size={14} />
              <span>Filters</span>
              <FiChevronDown className={`ml-1 transform transition-transform ${showFilters ? 'rotate-180' : ''}`} size={14} />
            </button>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-4">
          <div className="p-4 border-b border-gray-200">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3">
              <div className="relative flex-1 w-full">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="text-gray-400" size={16} />
                </div>
                <input
                  type="text"
                  placeholder="Search jobs by title, company, or location..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 block w-full text-sm"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              
              <div className="flex w-full lg:w-auto">
                <button 
                  className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium w-full lg:w-auto justify-center"
                  onClick={handleExportCsv}
                >
                  <FiDownload className="mr-2 text-gray-500" size={14} />
                  <span>Export CSV</span>
                </button>
              </div>
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
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Platform</label>
                        <select
                          value={filter}
                          onChange={(e) => setFilter(e.target.value)}
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
                          className="block w-full text-sm appearance-none bg-white border border-gray-300 hover:border-gray-400 px-3 py-1.5 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                        >
                          <option value="all">All Statuses</option>
                          <option value="applied">Applied</option>
                          <option value="viewed">Viewed</option>
                          <option value="interview">Interview</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Sort By</label>
                        <select
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
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mb-3"></div>
              <p className="text-gray-500 font-medium">Loading job applications...</p>
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="p-8 text-center">
              <div className="mb-4 inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 text-gray-400">
                <FiInfo className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No job applications found</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                Start applying to jobs to see your applications here.
                You can use the automation features to apply to multiple jobs at once.
              </p>
              <button 
                onClick={() => navigate('/dashboard/automate')}
                className="mt-6 px-5 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
              >
                Start Applying
              </button>
            </div>
          ) : viewMode === 'table' ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Job Title</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
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
                        <div className="text-sm font-medium text-gray-900 truncate max-w-[180px]">{job.job_title || 'Untitled Job'}</div>
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap">
                        <div className="text-sm text-gray-700 truncate max-w-[120px]">{job.company_name || 'Unknown Company'}</div>
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap">
                        <div className="text-sm text-gray-500 truncate max-w-[120px]">{job.job_location || 'No location data'}</div>
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
                        <span className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStatusColor(job.application_status)}`}>
                          {job.application_status || 'Applied'}
                        </span>
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
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
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
                      <span className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStatusColor(job.application_status)}`}>
                        {job.application_status || 'Applied'}
                      </span>
                    </div>
                    
                    <h3 className="mt-2 text-base font-semibold text-gray-900 line-clamp-2">
                      {job.job_title || 'Untitled Job'}
                    </h3>
                    
                    <p className="mt-1 text-sm text-gray-700">
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
            <div className="px-4 py-3 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row items-center justify-between">
                <p className="text-xs text-gray-500 mb-2 sm:mb-0">
                  Showing <span className="font-medium">{filteredJobs.length}</span> of <span className="font-medium">{jobs.length}</span> applications
                </p>
                <div className="flex justify-end">
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
        
        {/* Job Application Stats - Condensed for better fit */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-base font-medium text-gray-900">Application Insights</h2>
            <p className="text-xs text-gray-500 mt-1">
              A summary of your job application activities
            </p>
          </div>
          
          <div className="p-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-3">
                <div className="text-blue-800 text-xs font-medium mb-1">Total Applications</div>
                <div className="text-xl font-bold text-blue-900">{jobs.length}</div>
                <div className="text-xs text-blue-700 mt-0.5">All time</div>
              </div>
              
              <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-lg p-3">
                <div className="text-green-800 text-xs font-medium mb-1">Recent Applications</div>
                <div className="text-xl font-bold text-green-900">
                  {jobs.filter(job => {
                    if (!job.date_applied) return false;
                    const date = new Date(job.date_applied);
                    const now = new Date();
                    const daysDiff = Math.round((now - date) / (1000 * 60 * 60 * 24));
                    return daysDiff <= 7;
                  }).length}
                </div>
                <div className="text-xs text-green-700 mt-0.5">Last 7 days</div>
              </div>
              
              <div className="bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-3">
                <div className="text-purple-800 text-xs font-medium mb-1">Most Active Platform</div>
                <div className="text-xl font-bold text-purple-900 capitalize">
                  {(() => {
                    const platforms = jobs.reduce((acc, job) => {
                      if (!job.platform) return acc;
                      acc[job.platform] = (acc[job.platform] || 0) + 1;
                      return acc;
                    }, {});
                    return Object.keys(platforms).sort((a, b) => platforms[b] - platforms[a])[0] || 'None';
                  })()}
                </div>
                <div className="text-xs text-purple-700 mt-0.5">By number of applications</div>
              </div>
              
              <div className="bg-gradient-to-r from-amber-50 to-amber-100 border border-amber-200 rounded-lg p-3">
                <div className="text-amber-800 text-xs font-medium mb-1">Response Rate</div>
                <div className="text-xl font-bold text-amber-900">
                  {(() => {
                    const responses = jobs.filter(job => 
                      job.application_status && 
                      job.application_status.toLowerCase() !== 'applied' &&
                      job.application_status.toLowerCase() !== 'pending'
                    ).length;
                    return jobs.length ? `${Math.round((responses / jobs.length) * 100)}%` : '0%';
                  })()}
                </div>
                <div className="text-xs text-amber-700 mt-0.5">Applications with responses</div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default JobDetailsPage;
