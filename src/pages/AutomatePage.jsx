import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiLinkedin, FiBriefcase, FiAward, FiBookOpen, FiGlobe, FiZap, FiChevronRight, FiClock, FiCheck, FiArrowRight } from 'react-icons/fi';
import { motion } from 'framer-motion';
import SubscriptionStatus from '../components/SubscriptionStatus';

function AutomatePage() {
  const navigate = useNavigate();
  const [hoverIndex, setHoverIndex] = useState(null);

  const platforms = [
    {
      id: 'linkedin',
      name: 'LinkedIn',
      icon: FiLinkedin,
      color: 'bg-blue-500',
      gradientFrom: 'from-blue-500',
      gradientTo: 'to-blue-600',
      shadowColor: 'shadow-blue-300/30',
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
      color: 'bg-indigo-500',
      gradientFrom: 'from-indigo-500',
      gradientTo: 'to-indigo-600',
      shadowColor: 'shadow-indigo-300/30',
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
      color: 'bg-blue-600',
      gradientFrom: 'from-blue-600',
      gradientTo: 'to-indigo-700',
      shadowColor: 'shadow-blue-400/30',
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
      color: 'bg-green-500',
      gradientFrom: 'from-green-500',
      gradientTo: 'to-green-600',
      shadowColor: 'shadow-green-300/30',
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
      color: 'bg-purple-500',
      gradientFrom: 'from-purple-500',
      gradientTo: 'to-purple-600',
      shadowColor: 'shadow-purple-300/30',
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

  const stepsData = [
    {
      icon: <FiClock className="h-6 w-6" />,
      title: "Save Time",
      description: "Automate repetitive tasks and apply to multiple jobs in minutes instead of hours"
    },
    {
      icon: <FiZap className="h-6 w-6" />,
      title: "Increase Reach",
      description: "Apply to more relevant positions across multiple platforms simultaneously"
    },
    {
      icon: <FiCheck className="h-6 w-6" />,
      title: "Improve Success Rate",
      description: "Our AI-powered system targets positions that match your skills and experience"
    }
  ];

  return (
    <div>
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-12 text-center"
      >
        <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-primary-600 to-indigo-600 bg-clip-text text-transparent">
          Automate Your Job Search
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Apply to multiple jobs with a single click across various platforms and save hours of your valuable time
        </p>
      </motion.div>

      <div className="mb-8">
        <SubscriptionStatus />
      </div>

      {/* How It Works Section */}
      <motion.section 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="mb-12 p-6 bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl shadow-sm border border-gray-100"
      >
        <h2 className="text-2xl font-bold mb-6 flex items-center">
          <FiZap className="mr-2 text-primary-500" />
          <span>How It Works</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stepsData.map((step, index) => (
            <div key={index} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="h-12 w-12 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center mb-4">
                {step.icon}
              </div>
              <h3 className="font-semibold text-lg mb-2 text-gray-800">{step.title}</h3>
              <p className="text-gray-600">{step.description}</p>
            </div>
          ))}
        </div>
      </motion.section>

      {/* Platforms Section */}
      <motion.section 
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <h2 className="text-2xl font-bold mb-3 text-gray-800 flex items-center">
          <FiBriefcase className="mr-2 text-primary-500" /> 
          Choose Platform to Automate
        </h2>
        <p className="text-gray-600 mb-8">
          Select the platform where you want to streamline your job applications
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {platforms.map((platform, index) => (
            <motion.div
              key={platform.id}
              variants={itemVariants}
              className="relative"
              onMouseEnter={() => setHoverIndex(index)}
              onMouseLeave={() => setHoverIndex(null)}
            >
              <div className={`bg-white rounded-xl overflow-hidden transition-all duration-300 ${hoverIndex === index ? 'shadow-xl transform -translate-y-1' : 'shadow-md'}`}>
                <div className={`bg-gradient-to-r ${platform.gradientFrom} ${platform.gradientTo} p-6 relative overflow-hidden`}>
                  <div className="relative z-10 flex justify-between items-center">
                    <platform.icon className="text-white" size={36} />
                    <span className="bg-white/20 rounded-full px-3 py-1 text-xs text-white font-medium">
                      Automated
                    </span>
                  </div>
                  <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-white/10 -mr-8 -mt-8"></div>
                  <div className="absolute bottom-0 left-0 w-16 h-16 rounded-full bg-white/10 -ml-4 -mb-4"></div>
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2 text-gray-800">{platform.name}</h3>
                  <p className="text-gray-600 mb-4">{platform.description}</p>
                  
                  <ul className="mb-6 space-y-2">
                    {platform.capabilities.map((capability, idx) => (
                      <li key={idx} className="flex items-start">
                        <span className={`w-5 h-5 rounded-full ${platform.color} text-white flex-shrink-0 flex items-center justify-center mt-0.5 mr-2`}>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </span>
                        <span className="text-sm text-gray-600">{capability}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <button
                    onClick={() => navigate(`/dashboard/automate/${platform.id}`)}
                    className={`w-full relative py-3 px-4 overflow-hidden rounded-lg group bg-white ${hoverIndex === index ? `border-2 border-${platform.color}` : 'border border-gray-200'}`}
                  >
                    <span className={`absolute top-0 left-0 w-0 h-full transition-all duration-500 ease-out ${platform.gradientFrom} ${platform.gradientTo} group-hover:w-full -z-1`}></span>
                    <span className="relative flex items-center justify-center text-sm font-medium transition-colors duration-200 ease-in group-hover:text-white">
                      Start Automation
                      <FiArrowRight className="ml-2" />
                    </span>
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Tips & Best Practices Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="mt-12 p-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl"
      >
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Tips for Success</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start">
            <div className="bg-indigo-100 p-2 rounded-lg mr-3 flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
                <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold mb-1">Update Your Resume</h3>
              <p className="text-sm text-gray-600">Ensure your resume is updated with relevant skills and experience before starting automation</p>
            </div>
          </div>
          <div className="flex items-start">
            <div className="bg-purple-100 p-2 rounded-lg mr-3 flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold mb-1">Customize Cover Letter</h3>
              <p className="text-sm text-gray-600">Add a personalized cover letter template to make your applications stand out</p>
            </div>
          </div>
          <div className="flex items-start">
            <div className="bg-blue-100 p-2 rounded-lg mr-3 flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold mb-1">Be Selective</h3>
              <p className="text-sm text-gray-600">Target positions that match your skills rather than applying to everything</p>
            </div>
          </div>
          <div className="flex items-start">
            <div className="bg-green-100 p-2 rounded-lg mr-3 flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold mb-1">Track Applications</h3>
              <p className="text-sm text-gray-600">Monitor your applications in the "Applied Jobs" section after automation</p>
            </div>
          </div>
        </div>
      </motion.section>
    </div>
  );
}

export default AutomatePage;