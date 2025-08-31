import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiPackage, FiCalendar, FiClock, FiAlertCircle, FiLoader, FiChevronUp } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import { subscriptionService } from '../lib/supabaseClient';
import { motion } from 'framer-motion';

function SubscriptionStatus({ compact = false }) {
  const { user, subscription, subscriptionLoading } = useAuth();
  const [usageData, setUsageData] = useState({ used: 0, limit: 30 });
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(!compact);

  useEffect(() => {
    if (!user) return;

    const fetchUsageData = async () => {
      try {
        const data = await subscriptionService.hasReachedLimit(user.id);
        setUsageData({
          used: data.used,
          limit: data.limit
        });
      } catch (error) {
        console.error('Error fetching usage data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsageData();
  }, [user, subscription]);

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Calculate usage percentage
  const usagePercentage = Math.min(100, (usageData.used / usageData.limit) * 100);
  
  // Determine if user is close to or at limit
  const isNearLimit = usagePercentage >= 80;
  const isAtLimit = usagePercentage >= 100;

  const remainingApplications = usageData.limit - usageData.used;

  if (subscriptionLoading || loading) {
    return compact ? (
      <div className="flex items-center gap-2">
        <FiLoader className="animate-spin text-primary-600" size={16} />
        <span className="text-sm text-gray-600">Loading...</span>
      </div>
    ) : (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-center justify-center h-32">
        <FiLoader className="animate-spin text-primary-600 mr-3" size={22} />
        <span className="text-gray-600 font-medium">Loading subscription data...</span>
      </div>
    );
  }

  if (compact) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center gap-3 text-sm"
      >
        <div className="bg-primary-50 px-2.5 py-1 rounded-lg text-primary-700 font-medium flex items-center">
          <span>{subscription ? subscription.subscription_plans.name : 'Basic'}</span>
        </div>
        <div className="text-gray-600 flex items-center">
          <span className="font-medium">{usageData.used}/{usageData.limit}</span>
          <span className="ml-1">applications</span>
        </div>
        <Link 
          to="/pricing" 
          className="text-primary-600 hover:text-primary-700 font-medium"
        >
          Upgrade
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
    >
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center cursor-pointer"
           onClick={() => setExpanded(!expanded)}>
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <FiPackage className="mr-2 text-primary-600" />
          Subscription Status
        </h3>
        <FiChevronUp className={`text-gray-500 transition-transform ${expanded ? '' : 'transform rotate-180'}`} />
      </div>
      
      {expanded && (
        <div className="px-6 py-5">
          <div className="flex flex-col sm:flex-row justify-between mb-5">
            <div>
              <h4 className="font-semibold text-xl text-gray-800 flex items-center">
                <span className="bg-gradient-to-r from-primary-600 to-secondary-500 bg-clip-text text-transparent">
                  {subscription ? subscription.subscription_plans.name : 'Basic'}
                </span>
                {subscription && (
                  <span className="ml-2 px-2 py-0.5 bg-primary-100 text-primary-700 text-xs rounded-full uppercase font-bold">
                    Active
                  </span>
                )}
              </h4>
              <p className="text-sm text-gray-600 mt-1">
                {subscription ? subscription.subscription_plans.description : 'Apply to up to 30 jobs per month'}
              </p>
            </div>
            
            {subscription && subscription.end_date && (
              <div className="mt-3 sm:mt-0 flex items-center px-4 py-2 bg-gray-50 rounded-lg text-sm text-gray-600 border border-gray-200">
                <FiCalendar className="mr-2 text-gray-500" />
                <div>
                  <span className="font-medium text-gray-700">Expires:</span> {formatDate(subscription.end_date)}
                </div>
              </div>
            )}
          </div>
          
          <div className="mt-6">
            <div className="flex justify-between items-center mb-2">
              <div className="text-sm font-medium text-gray-800 flex items-center">
                <FiClock className="mr-2 text-gray-500" size={16} /> 
                <span>Monthly Usage: <span className="font-semibold text-primary-700">{usageData.used}/{usageData.limit}</span> applications</span>
              </div>
              <div className="text-sm font-medium text-gray-700">
                {Math.round(usagePercentage)}%
              </div>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${usagePercentage}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className={`h-2.5 rounded-full ${
                  isAtLimit ? 'bg-red-500' : isNearLimit ? 'bg-amber-500' : 'bg-green-500'
                }`}
              ></motion.div>
            </div>
            
            <p className="mt-2 text-sm text-gray-500">
              {remainingApplications > 0 ? 
                `You have ${remainingApplications} applications remaining this month.` : 
                'You have used all your applications for this month.'}
            </p>
          </div>
          
          {/* Warning message if near/at limit */}
          {isNearLimit && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.3 }}
              className={`mt-4 p-3.5 rounded-lg ${isAtLimit ? 'bg-red-50 text-red-800' : 'bg-amber-50 text-amber-800'} flex items-start`}
            >
              <FiAlertCircle className="mt-0.5 mr-2 flex-shrink-0" />
              <div>
                {isAtLimit ? (
                  <p className="font-medium">You've reached your monthly application limit. Upgrade your plan to apply to more jobs.</p>
                ) : (
                  <p className="font-medium">You're approaching your monthly application limit. Consider upgrading your plan soon.</p>
                )}
              </div>
            </motion.div>
          )}
          
          <div className="mt-6">
            <Link 
              to="/pricing" 
              className="block w-full text-center bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white py-2.5 px-4 rounded-lg font-medium transition-all shadow hover:shadow-md"
            >
              {subscription ? 'Manage Subscription' : 'Upgrade Plan'}
            </Link>
          </div>
        </div>
      )}
    </motion.div>
  );
}

export default SubscriptionStatus;
