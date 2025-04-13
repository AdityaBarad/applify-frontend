import { useState, useEffect } from 'react';
import { FiBarChart2, FiPieChart, FiCalendar, FiLoader, FiTrendingUp } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

function ApplicationAnalytics() {
  const [stats, setStats] = useState(null);
  const [period, setPeriod] = useState('month');
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(null);
  const { user, getApplicationStats } = useAuth();
  
  useEffect(() => {
    if (!user) return;
    
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await getApplicationStats(period);
        setStats(data);
      } catch (error) {
        console.error('Error fetching application stats:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, [user, period, getApplicationStats]);
  
  const handlePeriodChange = (newPeriod) => {
    setPeriod(newPeriod);
  };

  const COLORS = ['#4f46e5', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
  
  // Prepare pie chart data
  const preparePieData = () => {
    if (!stats?.applicationsByPlatform) return [];
    
    return Object.entries(stats.applicationsByPlatform).map(([platform, count], index) => ({
      name: platform.charAt(0).toUpperCase() + platform.slice(1),
      value: count,
      color: COLORS[index % COLORS.length]
    }));
  };

  // Prepare bar chart data for days of the week
  const prepareWeekdayData = () => {
    if (!stats?.applicationsByDay) return [];
    
    const daysOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    
    return daysOrder.map(day => ({
      name: day.substring(0, 3),
      applications: stats.applicationsByDay[day.toLowerCase()] || 0
    }));
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
  
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-center justify-center h-64">
        <FiLoader className="animate-spin text-primary-600 mr-3" size={24} />
        <span className="text-gray-600 font-medium">Loading analytics data...</span>
      </div>
    );
  }
  
  // If no data or no applications
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
          <h3 className="text-lg font-medium text-gray-800 mb-2">No Application Data Yet</h3>
          <p className="text-gray-500 max-w-sm mx-auto mb-6">
            Start applying to jobs to see detailed analytics about your application activity.
          </p>
          
          <div className="inline-flex rounded-md shadow-sm" role="group">
            <button
              onClick={() => handlePeriodChange('day')}
              className={`px-4 py-2 text-sm font-medium rounded-l-lg ${period === 'day' ? 'bg-primary-600 text-white' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'}`}
            >
              Today
            </button>
            <button
              onClick={() => handlePeriodChange('week')}
              className={`px-4 py-2 text-sm font-medium ${period === 'week' ? 'bg-primary-600 text-white' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'}`}
            >
              This Week
            </button>
            <button
              onClick={() => handlePeriodChange('month')}
              className={`px-4 py-2 text-sm font-medium rounded-r-lg ${period === 'month' ? 'bg-primary-600 text-white' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'}`}
            >
              This Month
            </button>
          </div>
        </div>
      </div>
    );
  }

  const pieData = preparePieData();
  const weekdayData = prepareWeekdayData();
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
    >
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
            className={`px-3 py-1.5 text-xs font-medium rounded-r-md border ${
              period === 'month'
                ? 'bg-primary-50 text-primary-700 border-primary-300'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            This Month
          </button>
        </div>
      </div>
      
      <div className="p-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <motion.div 
            whileHover={{ y: -2, boxShadow: '0 8px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' }}
            className="p-4 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg text-white"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm opacity-90 font-medium mb-1">Total Applications</div>
                <div className="text-3xl font-bold">{stats.totalJobsApplied}</div>
                <div className="text-xs mt-1 opacity-80">All time</div>
              </div>
              <div className="bg-white/20 p-3 rounded-lg">
                <FiBarChart2 size={24} />
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            whileHover={{ y: -2, boxShadow: '0 8px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' }}
            className="p-4 bg-gradient-to-br from-secondary-500 to-secondary-700 rounded-lg text-white"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm opacity-90 font-medium mb-1">Automation Runs</div>
                <div className="text-3xl font-bold">{stats.totalSessions}</div>
                <div className="text-xs mt-1 opacity-80">Sessions started</div>
              </div>
              <div className="bg-white/20 p-3 rounded-lg">
                <FiTrendingUp size={24} />
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            whileHover={{ y: -2, boxShadow: '0 8px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' }}
            className="p-4 bg-gradient-to-br from-purple-500 to-purple-700 rounded-lg text-white"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm opacity-90 font-medium mb-1">Avg. Jobs per Run</div>
                <div className="text-3xl font-bold">
                  {stats.totalSessions > 0 ? (stats.totalJobsApplied / stats.totalSessions).toFixed(1) : 0}
                </div>
                <div className="text-xs mt-1 opacity-80">Jobs per session</div>
              </div>
              <div className="bg-white/20 p-3 rounded-lg">
                <FiPieChart size={24} />
              </div>
            </div>
          </motion.div>
        </div>
        
        {/* Charts section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Platform Distribution */}
          {stats.applicationsByPlatform && Object.keys(stats.applicationsByPlatform).length > 0 && (
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-800 mb-4 flex items-center">
                <FiPieChart className="mr-1.5 text-primary-600" /> Applications by Platform
              </h4>
              
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      activeIndex={activeIndex}
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={renderCustomizedLabel}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      onMouseEnter={handlePieEnter}
                      onMouseLeave={handlePieLeave}
                    >
                      {pieData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.color} 
                          stroke={activeIndex === index ? '#fff' : 'none'}
                          strokeWidth={activeIndex === index ? 2 : 0}
                        />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} applications`, 'Count']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-2">
                {pieData.map((entry, index) => (
                  <div key={index} className="flex items-center">
                    <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: entry.color }}></div>
                    <span className="text-xs text-gray-700">{entry.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Applications by Day of Week */}
          {stats.applicationsByDay && Object.keys(stats.applicationsByDay).length > 0 && (
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-800 mb-4 flex items-center">
                <FiCalendar className="mr-1.5 text-primary-600" /> Applications by Day of Week
              </h4>
              
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={weekdayData}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 0,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value} applications`, 'Count']} />
                    <Bar dataKey="applications" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
        
        {/* Recent Sessions */}
        {stats.recentSessions && stats.recentSessions.length > 0 && (
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <h4 className="text-sm font-semibold text-gray-800 p-4 border-b border-gray-200 flex items-center bg-gray-50">
              <FiCalendar className="mr-1.5 text-primary-600" /> Recent Automation Runs
            </h4>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Platform</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jobs</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {stats.recentSessions.slice(0, 5).map((session) => (
                    <tr key={session.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${session.platform === 'linkedin' ? 'bg-blue-100 text-blue-800' : 
                          session.platform === 'indeed' ? 'bg-purple-100 text-purple-800' : 
                          session.platform === 'internshala' ? 'bg-green-100 text-green-800' :
                          session.platform === 'unstop' ? 'bg-amber-100 text-amber-800' :
                          'bg-gray-100 text-gray-800'}`}
                        >
                          {session.platform.charAt(0).toUpperCase() + session.platform.slice(1)}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                        {new Date(session.session_start).toLocaleDateString('en-US', {
                          month: 'short', 
                          day: 'numeric',
                          hour: '2-digit', 
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        <div className="flex items-center">
                          <span className="font-medium text-gray-900">{session.jobs_applied}</span>
                          <span className="mx-1 text-gray-500">/</span>
                          <span className="text-gray-600">{session.jobs_requested}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-medium rounded-full 
                          ${session.status === 'completed' ? 'bg-green-100 text-green-800' : 
                          session.status === 'started' ? 'bg-blue-100 text-blue-800' : 
                          'bg-red-100 text-red-800'}`}>
                          {session.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
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
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default ApplicationAnalytics;
