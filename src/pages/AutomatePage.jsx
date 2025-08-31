import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiLinkedin, FiBriefcase, FiAward, FiBookOpen, FiGlobe, FiZap, FiChevronRight, FiClock, FiCheck, FiArrowRight } from 'react-icons/fi';
import { motion } from 'framer-motion';
import SubscriptionStatus from '../components/SubscriptionStatus';
import { getPlatformColors } from './Dashboard'; // Import the utility function
import { useParams } from 'react-router-dom';

function AutomatePage() {
  const navigate = useNavigate();
  const [hoverIndex, setHoverIndex] = useState(null);
    const { platform } = useParams();

  useEffect(() => {
    const running = getRunningAutomation();
    if (
      running &&
      running.platform !== platform
    ) {
      // Optionally, set a flag in localStorage for a dashboard message
      localStorage.setItem('automationFormBlocked', 'true');
      navigate('/dashboard/automate');
    }
  }, [platform, navigate]);
  
    const [runningAutomation, setRunningAutomation] = useState(null);
  const getRunningAutomation = () => {
  try {
    const data = localStorage.getItem('runningAutomation');
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
};


  useEffect(() => {
    setRunningAutomation(getRunningAutomation());
    // Optionally, listen for changes (e.g., via storage event or polling)
  }, []);

  // Update platforms with the consistent professional color scheme
  const platforms = [
    {
      id: 'linkedin',
      name: 'LinkedIn',
      icon: FiLinkedin,
      color: 'bg-blue-600',
      gradientFrom: getPlatformColors('linkedin').gradient.from,
      gradientTo: getPlatformColors('linkedin').gradient.to,
      shadowColor: getPlatformColors('linkedin').shadow,
      description: 'Automate job applications on LinkedIn with smart matching technology',
      capabilities: [
        'Easy one-click applications',
        'Smart profile matching',
        'Automatic follow-ups'
      ]
    },
    {
      id: 'indeed',
      name: 'Indeed',
      icon: FiBriefcase,
      color: 'bg-emerald-600',
      gradientFrom: getPlatformColors('indeed').gradient.from,
      gradientTo: getPlatformColors('indeed').gradient.to,
      shadowColor: getPlatformColors('indeed').shadow,
      description: 'Streamline your Indeed job search with automated applications',
      capabilities: [
        'Auto-fill application forms',
        'Job recommendations',
        'Cover letter customization'
      ]
    },
    {
      id: 'unstop',
      name: 'Unstop',
      icon: FiAward,
      color: 'bg-amber-600',
      gradientFrom: getPlatformColors('unstop').gradient.from,
      gradientTo: getPlatformColors('unstop').gradient.to,
      shadowColor: getPlatformColors('unstop').shadow,
      description: 'Maximize your opportunities on Unstop with seamless automation',
      capabilities: [
        'Competition applications',
        'Profile optimization',
        'Instant notifications'
      ]
    },
    {
      id: 'internshala',
      name: 'Internshala',
      icon: FiBookOpen,
      color: 'bg-red-600',  // Changed from bg-indigo-600 to match the red color scheme
      gradientFrom: getPlatformColors('internshala').gradient.from,
      gradientTo: getPlatformColors('internshala').gradient.to,
      shadowColor: getPlatformColors('internshala').shadow,
      description: 'Find and apply to internships automatically on Internshala',
      capabilities: [
        'Targeted internship searches',
        'Application tracking',
        'Personalized messaging'
      ]
    },
    {
      id: 'naukri',
      name: 'Naukri',
      icon: FiGlobe,
      color: 'bg-purple-600',
      gradientFrom: getPlatformColors('naukri').gradient.from,
      gradientTo: getPlatformColors('naukri').gradient.to,
      shadowColor: getPlatformColors('naukri').shadow,
      description: 'Search and apply to jobs on Naukri.com with advanced automation',
      capabilities: [
        'Resume visibility boost',
        'Bulk applications',
        'Recruiter connections'
      ]
    }
  ];

  // Animation variants for staggered animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12
      }
    }
  };

  return (
    <div>

      {/* Platforms Section with subscription status on the right */}
      <motion.section 
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="mb-10"
      >
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-3">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            <FiBriefcase className="mr-2 text-primary-500" /> 
            Choose Platform to Automate
          </h2>
          <div className="mt-2 sm:mt-0 w-full sm:w-auto">
            <SubscriptionStatus compact={true} />
          </div>
        </div>
        
        <p className="text-gray-600 mb-6">
        </p>
              {runningAutomation && (
        <div className="mb-4 p-3 bg-yellow-100 border border-yellow-300 rounded text-yellow-800 flex items-center">
          {/* <FiAlertCircle className="mr-2" /> */}
          <span>
            Automation is running on <b>{runningAutomation.platform}</b>. Please finish or stop it before starting on another platform.
          </span>
        </div>
      )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {platforms.map((platform, index) => (
            <motion.div
              key={platform.id}
              variants={itemVariants}
              className="relative"
              onMouseEnter={() => setHoverIndex(index)}
              onMouseLeave={() => setHoverIndex(null)}
            >
              <div className={`bg-white rounded-xl overflow-hidden transition-all duration-300 ${hoverIndex === index ? 'shadow-xl transform -translate-y-1' : 'shadow-md'}`}> 
                <div className={`bg-gradient-to-r ${platform.gradientFrom} ${platform.gradientTo} p-5 sm:p-6 relative overflow-hidden`}>
                  <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <platform.icon className="text-white mb-2 sm:mb-0" size={32} />
                    <span className={`rounded-full px-3 py-1 text-xs text-white font-medium 
                      ${platform.id === 'linkedin' ? 'bg-blue-500/30' : 
                        platform.id === 'indeed' ? 'bg-emerald-500/30' : 
                        platform.id === 'unstop' ? 'bg-amber-500/30' : 
                        platform.id === 'internshala' ? 'bg-red-500/30' : 
                        platform.id === 'naukri' ? 'bg-purple-500/30' : 'bg-white/20'}`}>
                      {platform.id === 'unstop' || platform.id === 'internshala' ? 'Internships' : 'Jobs & Internships'}
                    </span>
                  </div>
                  <div className="absolute top-0 right-0 w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white/10 -mr-6 -mt-6 sm:-mr-8 sm:-mt-8"></div>
                  <div className="absolute bottom-0 left-0 w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-white/10 -ml-2 -mb-2 sm:-ml-4 sm:-mb-4"></div>
                </div>
                <div className="p-4 sm:p-6">
                  <h3 className="text-lg sm:text-xl font-bold mb-2 text-gray-800">{platform.name}</h3>
                  <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">{platform.description}</p>
                  <button
                    onClick={() => navigate(`/dashboard/automate/${platform.id}`)}
                    className={`w-full relative py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg overflow-hidden transition-all duration-300 
                      ${hoverIndex === index 
                        ? `bg-gradient-to-r ${platform.gradientFrom} ${platform.gradientTo} shadow-lg transform scale-[1.02]` 
                        : 'bg-white border border-gray-200'}
                      ${runningAutomation && runningAutomation.platform !== platform.id ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                    disabled={runningAutomation && runningAutomation.platform !== platform.id}
                  >
                    <span className={`relative flex items-center justify-center text-sm font-medium transition-colors duration-300
                      ${hoverIndex === index 
                        ? 'text-white' 
                        : platform.color.replace('bg-', 'text-')}`}>
                      {runningAutomation && runningAutomation.platform !== platform.id
                        ? 'Finish Current Automation'
                        : 'Start Automation'}
                      <FiArrowRight className={`ml-2 transition-transform duration-300 ${hoverIndex === index ? 'transform translate-x-1' : ''}`} />
                    </span>
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>
    </div>
  );
}

export default AutomatePage;