import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FiClock, 
  FiTarget, 
  FiTrendingUp, 
  FiCheck, 
  FiUser, 
  FiBarChart, 
  FiLinkedin, 
  FiBriefcase, 
  FiAward, 
  FiBookOpen, 
  FiGlobe,
  FiMenu,
  FiX,
  FiMail,
  FiMapPin,
  FiPhone,
  FiGithub,
  FiTwitter,
  FiInstagram,
  FiChevronDown,
  FiPlay,
  FiMousePointer,
  FiLock,
  FiSettings,
  FiLayers,
  FiCode,
  FiShield,
  FiPieChart
} from 'react-icons/fi';
import { useInView } from 'react-intersection-observer';
import logo from '../assets/logo-blue.png'; // Use blue logo for hero section
import appScreenshot from '../assets/app-screenshot.png';
// import appScreenshot from '../assets/app-screenshot.png'; // Add app screenshot image

function LandingPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('monthly');
  
  // Animation hooks using react-intersection-observer
  const [heroRef, heroInView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [featuresRef, featuresInView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [statsRef, statsInView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [howItWorksRef, howItWorksInView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [testimonialsRef, testimonialsInView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [pricingRef, pricingInView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [ctaRef, ctaInView] = useInView({ triggerOnce: true, threshold: 0.1 });

  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Updated platforms data
  const platforms = [
    {
      name: 'LinkedIn',
      icon: FiLinkedin,
      color: 'bg-blue-600',
      description: 'Automate applications across the world\'s largest professional network'
    },
    {
      name: 'Internshala',
      icon: FiBookOpen,
      color: 'bg-green-600',
      description: 'Find and apply to the best internships and early career opportunities'
    },
    {
      name: 'Indeed',
      icon: FiBriefcase,
      color: 'bg-indigo-600',
      description: 'Streamline applications on one of the most popular job sites'
    },
    {
      name: 'Naukri',
      icon: FiGlobe,
      color: 'bg-purple-600',
      description: 'Connect with top employers in India and beyond'
    },
    {
      name: 'Unstop',
      icon: FiAward,
      color: 'bg-violet-600',
      description: 'Access exclusive opportunities for fresh graduates'
    }
  ];

  // Updated pricing plans data to match PricingPage
  const pricingPlans = {
    monthly: [
      {
        name: 'Basic',
        price: '₹499',
        period: 'month',
        features: [
          'Apply to up to 50 jobs per month',
          'Access to all job platforms',
          'Email notifications',
          'Basic analytics',
          'Standard support'
        ],
        buttonText: 'Get Started',
        isPopular: false,
        description: 'Essential features to get started'
      },
      {
        name: 'Standard',
        price: '₹999',
        period: 'month',
        features: [
          'Apply to up to 200 jobs per month',
          'Access to all job platforms',
          'Email notifications',
          'Priority support',
          'Advanced filtering options'
        ],
        buttonText: 'Get Started',
        isPopular: true,
        description: 'Perfect for active job seekers'
      },
      {
        name: 'Premium',
        price: '₹1,999',
        period: 'month',
        features: [
          'Unlimited job applications',
          'Access to all job platforms',
          'Email notifications',
          'Priority support',
          'Advanced filtering options'
        ],
        buttonText: 'Get Started',
        isPopular: false,
        description: 'For professionals seeking the best opportunities'
      }
    ],
    annual: [
      {
        name: 'Basic',
        price: '₹399',
        period: 'month',
        features: [
          'Apply to up to 50 jobs per month',
          'Access to all job platforms',
          'Email notifications',
          'Basic analytics',
          'Standard support'
        ],
        buttonText: 'Get Started',
        isPopular: false,
        savings: 'Save ₹1,200 yearly',
        description: 'Essential features to get started'
      },
      {
        name: 'Standard',
        price: '₹799',
        period: 'month',
        features: [
          'Apply to up to 200 jobs per month',
          'Access to all job platforms',
          'Email notifications',
          'Priority support',
          'Advanced filtering options'
        ],
        buttonText: 'Get Started',
        isPopular: true,
        savings: 'Save ₹2,400 yearly',
        description: 'Perfect for active job seekers'
      },
      {
        name: 'Premium',
        price: '₹1,599',
        period: 'month',
        features: [
          'Unlimited job applications',
          'Access to all job platforms',
          'Email notifications',
          'Priority support',
          'Advanced filtering options'
        ],
        buttonText: 'Get Started',
        isPopular: false,
        savings: 'Save ₹4,800 yearly',
        description: 'For professionals seeking the best opportunities'
      }
    ]
  };

  // Updated process steps data
  const processSteps = [
    {
      title: 'Install the Applify extension',
      description: 'Add our browser extension with a single click for seamless automation.',
      icon: FiCode
    },
    {
      title: 'Sign up and set preferences',
      description: 'Create an account and customize your job search criteria in minutes.',
      icon: FiUser
    },
    {
      title: 'Fill your details once',
      description: 'Enter your profile information once, and well handle the rest.',
      icon: FiSettings
    },
    {
      title: 'Click "Automate"',
      description: 'Let Applify find and apply to relevant jobs with one click.',
      icon: FiMousePointer
    },
    {
      title: 'Track and manage applications',
      description: 'Monitor your progress and success through our intuitive dashboard.',
      icon: FiBarChart
    }
  ];

  // Key features data
  const keyFeatures = [
    {
      title: '1-Click Job Automation',
      description: 'Apply to hundreds of jobs instantly with a single click.',
      icon: FiMousePointer,
      color: 'bg-blue-100 text-blue-600'
    },
    {
      title: 'Smart Extension',
      description: 'Works seamlessly with your browser and Applify Web dashboard.',
      icon: FiCode,
      color: 'bg-indigo-100 text-indigo-600'
    },
    {
      title: 'Personalized Job Matching',
      description: 'Apply to perfectly matched to your profile and skills.',
      icon: FiTarget,
      color: 'bg-purple-100 text-purple-600'
    },
    {
      title: 'Application Tracker',
      description: 'Track all applied jobs in one unified dashboard for easy management.',
      icon: FiPieChart,
      color: 'bg-green-100 text-green-600'
    },
    {
      title: 'Privacy First',
      description: 'No data saved on our servers. All automation runs on your device.',
      icon: FiShield,
      color: 'bg-red-100 text-red-600'
    },
    {
      title: 'Detailed Analytics',
      description: 'Understand whats working and improve your job search strategy.',
      icon: FiBarChart,
      color: 'bg-amber-100 text-amber-600'
    }
  ];

  // Why choose us data
  const whyChooseUs = [
    'Apply smarter and faster',
    'Personalized job search',
    'Private and secure',
    'Boost selection chances'
  ];

  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-indigo-50 overflow-hidden">
      {/* Navigation */}
      <nav className="bg-white/90 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex-shrink-0 flex items-center">
              <img src={logo} alt="Applify Logo" className="h-12 w-auto" />
              <span className="ml-3 font-bold text-3xl text-gray-900">Applify</span>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-center space-x-8">
                <a href="#features" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Features</a>
                <a href="#how-it-works" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">How It Works</a>
                <a href="#platforms" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Supported Platforms</a>
                <a href="#pricing" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Pricing</a>
                {/* <a href="#testimonials" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Testimonials</a> */}
              </div>
            </div>
            
            <div className="hidden md:block">
              <div className="flex items-center space-x-4">
                <Link to="/login" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md font-medium transition-colors">
                  Log In
                </Link>
                <Link to="/register" className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-2.5 rounded-md font-medium shadow-md hover:shadow-lg transition-all duration-300 hover:opacity-90">
                  Get Started
                </Link>
              </div>
            </div>
            
            {/* Mobile menu button */}
            <div className="md:hidden">
              <button 
                onClick={() => setIsOpen(!isOpen)} 
                className="p-2 rounded-md text-gray-600 hover:text-blue-600 focus:outline-none"
              >
                {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile menu */}
        {isOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 py-2 px-4">
            <div className="flex flex-col space-y-3 pb-3">
              <a 
                href="#features" 
                className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md font-medium"
                onClick={() => setIsOpen(false)}
              >
                Features
              </a>
              <a 
                href="#how-it-works" 
                className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md font-medium"
                onClick={() => setIsOpen(false)}
              >
                How It Works
              </a>
              <a 
                href="#pricing" 
                className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md font-medium"
                onClick={() => setIsOpen(false)}
              >
                Pricing
              </a>
              <a 
                href="#testimonials" 
                className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md font-medium"
                onClick={() => setIsOpen(false)}
              >
                Testimonials
              </a>
              <div className="border-t border-gray-100 pt-3 flex flex-col space-y-3">
                <Link 
                  to="/login" 
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  Log In
                </Link>
                <Link 
                  to="/register" 
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-3 py-2 rounded-md font-medium text-center"
                  onClick={() => setIsOpen(false)}
                >
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      <main>
        {/* Combined Hero Section with Extension Download */}
        <section 
          className="relative pt-10 overflow-hidden" 
          ref={heroRef}
        >
          <div className="absolute inset-0 z-0">
            <svg className="absolute left-0 transform -translate-y-1/4" width="800" height="800" fill="none" viewBox="0 0 800 800">
              <circle cx="400" cy="400" r="400" fill="url(#paint0_radial)" fillOpacity="0.1" />
              <defs>
                <radialGradient id="paint0_radial" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(400 400) rotate(90) scale(400)">
                  <stop stopColor="#3B82F6" />
                  <stop offset="1" stopColor="#3B82F6" stopOpacity="0" />
                </radialGradient>
              </defs>
            </svg>
            <svg className="absolute right-0 top-1/3 transform translate-x-1/4" width="800" height="800" fill="none" viewBox="0 0 800 800">
              <circle cx="400" cy="400" r="400" fill="url(#paint1_radial)" fillOpacity="0.08" />
              <defs>
                <radialGradient id="paint1_radial" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(400 400) rotate(90) scale(400)">
                  <stop stopColor="#818CF8" />
                  <stop offset="1" stopColor="#818CF8" stopOpacity="0" />
                </radialGradient>
              </defs>
            </svg>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 relative z-10">
            <div className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center transition-all duration-1000 ${heroInView ? 'opacity-100' : 'opacity-0 -translate-y-6'}`}>
              {/* Hero Content - Left Column */}
              <div className="text-center lg:text-left">
                <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
                  Applify <span className="text-blue-600">Autopilot</span>
                </h1>
                <p className="max-w-xl mt-5 mx-auto lg:mx-0 text-xl text-gray-600">
                  Apply to hundreds of jobs with a single click. Applify automates your job hunt across LinkedIn, Internshala, and more.
                </p>

                <div className="mt-8 space-y-4">
                  <h3 className="text-xl font-bold text-gray-800">Get started in two simple steps:</h3>
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold mr-3">
                      1
                    </div>
                    <div className="text-left">
                      <p className="font-medium">Install our Chrome extension</p>
                      <p className="text-gray-600 text-sm">Required for automating your job applications</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold mr-3">
                      2
                    </div>
                    <div className="text-left">
                      <p className="font-medium">Create your Applify account</p>
                      <p className="text-gray-600 text-sm">To track and manage your applications</p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <a 
                    href="#" 
                    className="inline-flex items-center justify-center px-6 py-3 rounded-lg text-base font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download Chrome Extension
                  </a>
                  <Link 
                    to="/register" 
                    className="inline-flex items-center justify-center px-6 py-3 rounded-lg text-base font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 shadow-sm hover:shadow transition-all duration-300"
                  >
                    Create Account
                  </Link>
                </div>
                <p className="mt-4 text-sm text-gray-500">
                  Works with Chrome, Edge, and other Chromium-based browsers
                </p>
              </div>

              {/* Extension & Dashboard Preview - Right Column */}
              <div className="relative flex flex-col gap-8">
                {/* Extension Image */}
                <div className="bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-100">
                  <div className="h-10 bg-gray-100 flex items-center px-4 border-b">
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    </div>
                    <div className="mx-auto bg-white/70 rounded-md px-3 py-1 text-xs text-gray-500">
                      chrome://extensions/
                    </div>
                  </div>
                  <div className="p-5 bg-white">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <img src={logo} alt="Applify Logo" className="h-10 w-auto mr-3" />
                        <div>
                          <h4 className="font-bold text-gray-900">Applify Extension</h4>
                          <p className="text-xs text-gray-400">v1.0.0</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <a 
                          href="#"
                          className="inline-flex items-center justify-center px-3 py-1.5 rounded text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                        >
                          Add to Chrome
                        </a>
                        <span className="mt-1 text-[10px] text-gray-400">10,000+ users • ★★★★★ (4.8)</span>
                      </div>
                    </div>
                    {/* <img 
                      src="https://www.webextensions.org/images/chrome-extensions-setup.png" 
                      alt="Chrome Extension" 
                      className="w-full h-auto rounded-md shadow-sm mb-4"
                    /> */}
                    {/* <div className="p-3 bg-green-50 border border-green-100 rounded-md flex items-center mb-3">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 mr-3">
                        <FiCheck size={18} />
                      </div>
                      <p className="text-green-800 text-sm">
                        Applify extension installed successfully!
                      </p>
                    </div> */}
                    {/* <div className="text-center">
                      <a 
                        href="#"
                        className="inline-flex items-center justify-center px-5 py-2 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                      >
                        Add to Chrome
                      </a>
                      <p className="mt-2 text-xs text-gray-500">10,000+ users • ★★★★★ (4.8)</p>
                    </div> */}
                  </div>
                </div>
                {/* Dashboard Image */}
                <div className="bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col items-center p-2">
                  <img src={appScreenshot} alt="App Screenshot" />
                  {/* <div className="mt-3 text-center">
                    <span className="text-gray-700 font-medium">Dashboard</span>
                  </div> */}
                </div>
                {/* Remove or comment out the decorative blur elements */}
                {/* <div className="absolute -bottom-10 -right-10 z-0 w-64 h-64 rounded-full bg-indigo-100 filter blur-3xl opacity-60"></div>
                <div className="absolute -top-10 -left-10 z-0 w-64 h-64 rounded-full bg-blue-100 filter blur-3xl opacity-60"></div> */}
              </div>
            </div>
            
            <div className="mt-16 text-center">
              <h3 className="font-medium text-xl text-gray-900 mb-6">How Applify powers your job search</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg p-5 shadow-md">
                  <div className="w-12 h-12 bg-blue-100 rounded-full text-blue-600 flex items-center justify-center mx-auto mb-4">
                    <FiMousePointer size={20} />
                  </div>
                  <h4 className="font-medium mb-2">One-Click Apply</h4>
                  <p className="text-gray-600 text-sm">Apply to hundreds of jobs with our Chrome extension</p>
                </div>
                <div className="bg-white rounded-lg p-5 shadow-md">
                  <div className="w-12 h-12 bg-purple-100 rounded-full text-purple-600 flex items-center justify-center mx-auto mb-4">
                    <FiTarget size={20} />
                  </div>
                  <h4 className="font-medium mb-2">Personalized  job Matching </h4>
                  <p className="text-gray-600 text-sm">Apply to jobs perfectly matched to your profile</p>
                </div>
                <div className="bg-white rounded-lg p-5 shadow-md">
                  <div className="w-12 h-12 bg-green-100 rounded-full text-green-600 flex items-center justify-center mx-auto mb-4">
                    <FiBarChart size={20} />
                  </div>
                  <h4 className="font-medium mb-2">Track Everything</h4>
                  <p className="text-gray-600 text-sm">Monitor applications and progress in one dashboard</p>
                </div>
              </div>
            </div>
          </div>

          {/* Platform Logos */}
          <div className="bg-white shadow-sm border-t border-gray-100 mt-8" id="platforms">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <div className="text-center mb-8">
                <h3 className="text-gray-900 font-medium text-xl mb-12">
                  Platforms Supported
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-8 justify-items-center">
                  {platforms.map((platform, index) => (
                    <div key={index} className="flex flex-col items-center">
                      <div className={`w-14 h-14 ${platform.color} text-white rounded-full flex items-center justify-center mb-3 shadow-lg`}>
                        <platform.icon size={28} />
                      </div>
                      <span className="text-gray-800 font-medium text-lg">{platform.name}</span>
                      {/* <p className="text-gray-500 text-sm mt-1 max-w-xs text-center">{platform.description}</p> */}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section 
          id="features" 
          className="py-5 bg-white relative overflow-hidden"
          ref={featuresRef}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className={`text-center max-w-3xl mx-auto mb-16 transition-all duration-1000 delay-300 ${featuresInView ? 'opacity-100' : 'opacity-0 translate-y-6'}`}>
              <h2 className="text-sm font-semibold text-blue-600 uppercase tracking-wide mb-2">Features</h2>
              <h3 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
                Everything you need to supercharge your job search
              </h3>
              <p className="text-xl text-gray-500 mt-4">
                Applify combines automation with intelligent job matching to make your job hunt effortless and effective.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
              {keyFeatures.map((feature, index) => (
                <div 
                  key={index}
                  className={`bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-500 border border-gray-100 group ${featuresInView ? 'opacity-100' : 'opacity-0 translate-y-10'}`} 
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <div className={`${feature.color} w-14 h-14 rounded-lg flex items-center justify-center mb-6`}>
                    <feature.icon className="text-2xl" />
                  </div>
                  <h3 className="text-xl font-bold mb-4 group-hover:text-blue-600 transition-colors duration-300">{feature.title}</h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-20">
              <div className={`bg-gradient-to-r from-blue-50 to-indigo-50 rounded-3xl overflow-hidden shadow-xl transition-all duration-1000 ${featuresInView ? 'opacity-100' : 'opacity-0 scale-95'}`} style={{ transitionDelay: '600ms' }}>
                <div className="grid grid-cols-1 lg:grid-cols-2 items-center">
                  <div className="p-12 lg:pl-16">
                    <h3 className="text-3xl font-bold text-gray-900 mb-6">Why Choose Applify?</h3>
                    <p className="text-gray-600 mb-8 text-lg">
                      Applify is built with one goal in mind: to make your job search faster, smarter, and more effective.
                    </p>
                    <ul className="space-y-4 mb-8">
                      {whyChooseUs.map((point, index) => (
                        <li key={index} className="flex items-start">
                          <div className="flex-shrink-0 bg-blue-600 rounded-full p-1 mt-1 mr-3">
                            <FiCheck className="text-white" />
                          </div>
                          <div>
                            <span className="font-medium text-gray-900">{point}</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                    <Link to="/register" className="inline-flex items-center text-blue-600 font-medium hover:text-blue-700">
                      Experience the Applify difference 
                      <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                      </svg>
                    </Link>
                  </div>
                  <div className="p-8 lg:p-0">
                      <img src={appScreenshot} alt="App Screenshot" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section 
          id="how-it-works" 
          className="py-24 bg-white"
          ref={howItWorksRef}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className={`text-center max-w-3xl mx-auto mb-20 transition-all duration-1000 ${howItWorksInView ? 'opacity-100' : 'opacity-0 translate-y-6'}`}>
              <h2 className="text-sm font-semibold text-blue-600 uppercase tracking-wide mb-2">How It Works</h2>
              <h3 className="text-4xl font-bold text-gray-900 mb-4">Get Started in Minutes</h3>
              <p className="text-xl text-gray-500">
                Applify streamlines your job search with a simple 5-step process that saves you hours of manual work.
              </p>
            </div>

            <div className="relative">
              {/* Process steps vertical line */}
              <div className="absolute left-[2.25rem] lg:left-1/2 top-0 bottom-0 w-0.5 bg-blue-100 transform lg:-translate-x-1/2"></div>
              
              <div className="space-y-12">
                {processSteps.map((step, index) => (
                  <div 
                    key={index} 
                    className={`relative transition-all duration-700 ${howItWorksInView ? 'opacity-100' : 'opacity-0 translate-y-10'}`} 
                    style={{ transitionDelay: `${index * 150}ms` }}
                  >
                    <div className="flex items-center">
                      {/* Step number */}
                      <div className="absolute left-0 lg:left-1/2 -translate-x-1/2 flex items-center justify-center w-12 h-12 rounded-full bg-blue-600 text-white font-bold z-10 border-4 border-white shadow-xl">
                        {index + 1}
                      </div>
                      
                      {/* Step content box - alternating left/right on large screens */}
                      <div className={`ml-16 lg:ml-0 lg:w-5/12 ${index % 2 === 0 ? 'lg:mr-auto' : 'lg:ml-auto'} bg-white border border-gray-100 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all`}>
                        <div className="flex items-center mb-4">
                          <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-4 flex-shrink-0">
                            <step.icon size={20} />
                          </div>
                          <h4 className="text-xl font-bold text-gray-900">{step.title}</h4>
                        </div>
                        <p className="text-gray-600 ml-14">{step.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className={`mt-20 text-center transition-all duration-1000 delay-700 ${howItWorksInView ? 'opacity-100' : 'opacity-0'}`}>
              <Link 
                to="/register" 
                className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                Start Automating Today
              </Link>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section 
          id="pricing" 
          className="py-24 bg-white"
          ref={pricingRef}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className={`text-center max-w-3xl mx-auto mb-16 transition-all duration-1000 ${pricingInView ? 'opacity-100' : 'opacity-0 translate-y-6'}`}>
              <h2 className="text-sm font-semibold text-blue-600 uppercase tracking-wide mb-2">Pricing</h2>
              <h3 className="text-4xl font-bold text-gray-900 mb-4">Choose the Perfect Plan</h3>
              <p className="text-xl text-gray-500">
                We offer flexible pricing options to fit your needs and budget. No hidden fees or long-term commitments.
              </p>
              
              {/* Billing toggle */}
              <div className="flex items-center justify-center mt-8">
                <span className={`text-sm ${activeTab === 'monthly' ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>Monthly</span>
                <button 
                  className="relative mx-4 w-14 h-8 rounded-full bg-blue-100 flex items-center transition-colors focus:outline-none"
                  onClick={() => setActiveTab(activeTab === 'monthly' ? 'annual' : 'monthly')}
                >
                  <span className={`absolute left-1 top-1 w-6 h-6 rounded-full bg-blue-600 transition-all duration-300 transform ${activeTab === 'annual' ? 'translate-x-6' : ''}`}></span>
                </button>
                <span className={`text-sm ${activeTab === 'annual' ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>Annual <span className="text-green-500 font-medium">(Save 20%)</span></span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {pricingPlans[activeTab].map((plan, index) => (
                <div 
                  key={index} 
                  className={`bg-white rounded-2xl overflow-hidden border ${plan.isPopular ? 'border-blue-600' : 'border-gray-200'} transition-all duration-700 transform ${pricingInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'} ${plan.isPopular ? 'md:-translate-y-4 shadow-xl' : 'shadow-lg'}`}
                  style={{ transitionDelay: `${index * 150}ms` }}
                >
                  {plan.isPopular && (
                    <div className="bg-blue-600 text-white text-sm font-medium py-2 text-center">
                      MOST POPULAR
                    </div>
                  )}
                  
                  <div className="p-8">
                    <h4 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h4>
                    <p className="text-gray-600 mb-6">{plan.name === 'Basic' ? 'Essential features to get started' : plan.name === 'Standard' ? 'Perfect for active job seekers' : 'For professionals seeking the best opportunities'}</p>
                    
                    <div className="mb-6">
                      <span className="text-5xl font-bold text-gray-900">{plan.price}</span>
                      <span className="text-gray-600">/{plan.period}</span>
                      {plan.savings && (
                        <div className="mt-2 inline-block bg-green-100 text-green-800 text-sm font-medium px-2 py-1 rounded">
                          {plan.savings}
                        </div>
                      )}
                    </div>
                    
                    <ul className="space-y-4 mb-8">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start">
                          <FiCheck className="text-green-500 mt-1 mr-3 flex-shrink-0" />
                          <span className="text-gray-600">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <Link 
                      to="/register" 
                      className={`block w-full py-3 px-4 rounded-lg text-center font-medium ${plan.isPopular ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-800'} transition-colors duration-300`}
                    >
                      {plan.buttonText}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
            
            <div className={`mt-12 p-8 bg-gray-50 rounded-xl border border-gray-200 shadow-sm transition-all duration-1000 delay-500 ${pricingInView ? 'opacity-100' : 'opacity-0'}`}>
              <div className="flex flex-col md:flex-row items-center justify-between">
                <div className="mb-6 md:mb-0 md:mr-8">
                  <h4 className="text-xl font-bold text-gray-900 mb-2">Enterprise Solutions</h4>
                  <p className="text-gray-600">
                    Custom solutions for career centers, recruiting firms, and enterprises. Get volume discounts and dedicated support.
                  </p>
                </div>
                <Link 
                  to="/contact" 
                  className="px-6 py-3 bg-white border border-gray-300 hover:border-gray-400 rounded-lg text-gray-700 font-medium transition-colors duration-300 shadow-sm"
                >
                  Contact Sales
                </Link>
              </div >
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section 
          className="py-20 bg-gradient-to-r from-blue-600 to-indigo-700 relative overflow-hidden"
          ref={ctaRef}
        >
          <div className="absolute inset-0 overflow-hidden opacity-10">
            <svg className="absolute top-0 right-0 transform rotate-180" width="500" height="500" viewBox="0 0 500 500" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="250" cy="250" r="250" fill="white" />
            </svg>
            <svg className="absolute bottom-0 left-0" width="400" height="400" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="200" cy="200" r="200" fill="white" />
            </svg>
          </div>

          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className={`text-center transition-all duration-1000 ${ctaInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                <span className="block">Ready to automate your job search?</span>
                <span className="block">Start with Applify today.</span>
              </h2>
              <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
                Join thousands of job seekers who are saving time and getting more interviews with Applify.
              </p>
              <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6">
                <Link 
                  to="/register" 
                  className="w-full sm:w-auto bg-white text-blue-600 hover:bg-blue-50 px-8 py-3 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Get Started Free
                </Link>
                <Link 
                  to="/demo" 
                  className="w-full sm:w-auto bg-transparent text-white border border-white hover:bg-white/10 px-8 py-3 rounded-lg font-medium transition-colors duration-300"
                >
                  See How It Works
                </Link>
              </div>
              <p className="text-blue-200 mt-6 text-sm">
                No credit card required • Install in seconds • Start applying today
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
            <div className="lg:col-span-2">
              <div className="flex items-center mb-6">
                <img src={logo} alt="Applify Logo" className="h-10 w-auto bg-white rounded-md p-1" />
                <h2 className="text-2xl font-bold ml-3 text-white">Applify</h2>
              </div>
              <p className="text-gray-400 mb-6 pr-8">
                Automate your job search and focus on what matters most. Our platform helps you apply to jobs across multiple platforms with a single click.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <FiTwitter size={20} />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <FiGithub size={20} />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <FiLinkedin size={20} />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <FiInstagram size={20} />
                </a>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-6">Product</h3>
              <ul className="space-y-3">
                <li><a href="#features" className="text-gray-400 hover:text-white transition-colors">Features</a></li>
                <li><a href="#pricing" className="text-gray-400 hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#platforms" className="text-gray-400 hover:text-white transition-colors">Supported Platforms</a></li>
                {/* Removed How It Works */}
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-6">Resources</h3>
              <ul className="space-y-3">
                <li><a href="#how-it-works" className="text-gray-400 hover:text-white transition-colors">How It Works</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">How to Use</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-6">Company</h3>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">About Us</a></li>
                {/* Removed Careers */}
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 mt-8 border-t border-gray-800 text-sm text-gray-400">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="mb-4 md:mb-0 flex items-center">
                <img src={logo} alt="Applify Logo" className="h-6 w-auto mr-2 bg-white rounded p-0.5" />
                <p>© 2024 Applify. All rights reserved.</p>
              </div>
              <div className="flex items-center space-x-6">
                <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                <a href="#" className="hover:text-white transition-colors">Cookie Policy</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;