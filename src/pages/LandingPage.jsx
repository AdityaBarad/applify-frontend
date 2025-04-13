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
  FiPlay
} from 'react-icons/fi';
import { useInView } from 'react-intersection-observer';

function LandingPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('monthly');
  const [activeQuestion, setActiveQuestion] = useState(null);
  
  // Animation hooks using react-intersection-observer
  const [heroRef, heroInView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [featuresRef, featuresInView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [statsRef, statsInView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [howItWorksRef, howItWorksInView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [testimonialsRef, testimonialsInView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [pricingRef, pricingInView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [faqRef, faqInView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [ctaRef, ctaInView] = useInView({ triggerOnce: true, threshold: 0.1 });

  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Platforms data
  const platforms = [
    {
      name: 'LinkedIn',
      icon: FiLinkedin,
      color: 'bg-blue-600',
      description: 'Apply to jobs on the world\'s largest professional network'
    },
    {
      name: 'Indeed',
      icon: FiBriefcase,
      color: 'bg-indigo-600',
      description: 'Streamline applications on one of the most popular job sites'
    },
    {
      name: 'Unstop',
      icon: FiAward,
      color: 'bg-violet-600',
      description: 'Access exclusive opportunities for fresh graduates'
    },
    {
      name: 'Internshala',
      icon: FiBookOpen,
      color: 'bg-green-600',
      description: 'Find the best internships and early career opportunities'
    },
    {
      name: 'Naukri',
      icon: FiGlobe,
      color: 'bg-purple-600',
      description: 'Connect with top employers in India and beyond'
    }
  ];

  // Testimonials data
  const testimonials = [
    {
      name: 'Sarah K.',
      position: 'UX Designer',
      company: 'hired at Google',
      image: 'https://randomuser.me/api/portraits/women/44.jpg',
      text: 'JobAutoPilot completely transformed my job search. I was able to apply to over 50 positions in one day, and within a week I had 5 interview requests. The time I saved was invaluable!'
    },
    {
      name: 'Raj M.',
      position: 'Software Engineer',
      company: 'hired at Microsoft',
      image: 'https://randomuser.me/api/portraits/men/32.jpg',
      text: 'As a developer, I appreciate efficient solutions. JobAutoPilot is exactly that for job hunting. I got my dream role at Microsoft after automating applications to over 100 positions.'
    },
    {
      name: 'Priya N.',
      position: 'Data Analyst',
      company: 'hired at Amazon',
      image: 'https://randomuser.me/api/portraits/women/68.jpg',
      text: 'The metrics and analytics JobAutoPilot provides helped me understand which applications were performing best. This insight was crucial in landing my role at Amazon.'
    },
    {
      name: 'James T.',
      position: 'Marketing Specialist',
      company: 'hired at Adobe',
      image: 'https://randomuser.me/api/portraits/men/62.jpg',
      text: 'I was skeptical at first, but JobAutoPilot exceeded my expectations. The personalized matching feature saved me from applying to jobs that werent a good fit.'
    }
  ];

  // FAQ data
  const faqs = [
    {
      question: 'How does JobAutoPilot work?',
      answer: 'JobAutoPilot connects to major job platforms through our browser extension. Once you set your preferences and keywords, our AI technology helps you find and apply to relevant positions automatically, saving you countless hours of manual work.'
    },
    {
      question: 'Is my data secure?',
      answer: 'Yes, we take data security very seriously. We use industry-standard encryption and security measures to protect your personal information. We never share your data with third parties without your explicit consent.'
    },
    {
      question: 'What platforms do you support?',
      answer: 'We currently support LinkedIn, Indeed, Unstop, Internshala, and Naukri. Were constantly working on adding more platforms based on user feedback and demand.'
    },
    {
      question: 'How many jobs can I apply to?',
      answer: 'The number of jobs you can apply to depends on your subscription plan. Our Basic plan allows for 50 applications per month, Standard for 200, and Premium for unlimited applications.'
    },
    {
      question: 'Can I cancel my subscription?',
      answer: 'Yes, you can cancel your subscription at any time. Youll continue to have access to your plan features until the end of your current billing period.'
    },
    {
      question: 'How do I get started?',
      answer: 'Getting started is easy! Just create an account, choose a subscription plan, install our browser extension, and begin setting up your preferences. Our onboarding process will guide you through each step.'
    }
  ];

  // Pricing plans data
  const pricingPlans = {
    monthly: [
      {
        name: 'Basic',
        price: '₹499',
        period: 'month',
        features: [
          'Apply to 50 jobs per month',
          'Access to all job platforms',
          'Email notifications',
          'Basic analytics',
          'Standard support'
        ],
        buttonText: 'Get Started',
        isPopular: false
      },
      {
        name: 'Standard',
        price: '₹999',
        period: 'month',
        features: [
          'Apply to 200 jobs per month',
          'All Basic features',
          'Advanced filtering options',
          'Priority support',
          'Resume optimization'
        ],
        buttonText: 'Get Started',
        isPopular: true
      },
      {
        name: 'Premium',
        price: '₹1,999',
        period: 'month',
        features: [
          'Unlimited job applications',
          'All Standard features',
          'AI-powered job matching',
          'Interview preparation tools',
          '24/7 priority support'
        ],
        buttonText: 'Get Started',
        isPopular: false
      }
    ],
    annual: [
      {
        name: 'Basic',
        price: '₹399',
        period: 'month',
        features: [
          'Apply to 50 jobs per month',
          'Access to all job platforms',
          'Email notifications',
          'Basic analytics',
          'Standard support'
        ],
        buttonText: 'Get Started',
        isPopular: false,
        savings: 'Save ₹1,200 yearly'
      },
      {
        name: 'Standard',
        price: '₹799',
        period: 'month',
        features: [
          'Apply to 200 jobs per month',
          'All Basic features',
          'Advanced filtering options',
          'Priority support',
          'Resume optimization'
        ],
        buttonText: 'Get Started',
        isPopular: true,
        savings: 'Save ₹2,400 yearly'
      },
      {
        name: 'Premium',
        price: '₹1,599',
        period: 'month',
        features: [
          'Unlimited job applications',
          'All Standard features',
          'AI-powered job matching',
          'Interview preparation tools',
          '24/7 priority support'
        ],
        buttonText: 'Get Started',
        isPopular: false,
        savings: 'Save ₹4,800 yearly'
      }
    ]
  };

  // Process steps data
  const processSteps = [
    {
      title: 'Sign Up & Install',
      description: 'Create an account and install our browser extension in just a few clicks.',
      icon: 'https://cdn-icons-png.flaticon.com/512/2580/2580805.png'
    },
    {
      title: 'Set Preferences',
      description: 'Customize your job search criteria, keywords, and application preferences.',
      icon: 'https://cdn-icons-png.flaticon.com/512/3580/3580378.png'
    },
    {
      title: 'Automate Applications',
      description: 'Let our AI find and apply to the most relevant positions for you.',
      icon: 'https://cdn-icons-png.flaticon.com/512/8764/8764188.png'
    },
    {
      title: 'Track Your Progress',
      description: 'Monitor your application status and analytics through our dashboard.',
      icon: 'https://cdn-icons-png.flaticon.com/512/6671/6671938.png'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-indigo-50 overflow-hidden">
      {/* Navigation */}
      <nav className="bg-white/90 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-3xl font-bold">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">JobAutoPilot</span>
              </h1>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-center space-x-8">
                <a href="#features" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Features</a>
                <a href="#how-it-works" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">How It Works</a>
                <a href="#pricing" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Pricing</a>
                <a href="#testimonials" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Testimonials</a>
                <a href="#faq" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">FAQ</a>
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
              <a 
                href="#faq" 
                className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md font-medium"
                onClick={() => setIsOpen(false)}
              >
                FAQ
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
        {/* Hero Section */}
        <section 
          className="relative pt-20 pb-32 overflow-hidden" 
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

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-24 relative z-10">
            <div className={`flex flex-col lg:flex-row items-center transition-all duration-1000 ${heroInView ? 'opacity-100' : 'opacity-0 -translate-y-6'}`}>
              {/* Hero Content */}
              <div className="w-full lg:w-1/2 text-center lg:text-left mb-12 lg:mb-0 lg:pr-10">
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-800 font-medium text-sm mb-6">
                  <span className="animate-pulse mr-2 h-2 w-2 rounded-full bg-blue-600"></span>
                  Launching Soon • Join the Waitlist
                </div>
                <h1 className="text-5xl sm:text-6xl font-extrabold mb-6 leading-tight">
                  Your Job Search on{' '}
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                    Autopilot
                  </span>
                </h1>
                <p className="text-xl text-gray-600 mb-8 leading-relaxed max-w-xl mx-auto lg:mx-0">
                  Automate your job applications across LinkedIn, Indeed, and more. Get hired faster while focusing on what matters most.
                </p>
                <div className="flex flex-col sm:flex-row justify-center lg:justify-start items-center space-y-4 sm:space-y-0 sm:space-x-4">
                  <Link 
                    to="/register" 
                    className="w-full sm:w-auto px-8 py-3 text-center bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                  >
                    Start for Free
                  </Link>
                  <a 
                    href="#how-it-works"
                    className="w-full sm:w-auto flex items-center justify-center px-8 py-3 text-gray-700 bg-white hover:bg-gray-50 font-medium rounded-lg border border-gray-200 shadow-sm hover:shadow transition-all duration-300"
                  >
                    <FiPlay className="mr-2 text-blue-600" />
                    See How It Works
                  </a>
                </div>
                <div className="mt-8 text-sm text-gray-500 flex flex-col sm:flex-row items-center justify-center lg:justify-start">
                  <div className="flex -space-x-2 mr-3 mb-2 sm:mb-0">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="w-8 h-8 rounded-full border-2 border-white overflow-hidden">
                        <img src={`https://randomuser.me/api/portraits/${i % 2 === 0 ? 'women' : 'men'}/${i * 10 + 10}.jpg`} alt="User" />
                      </div>
                    ))}
                  </div>
                  <div>
                    <span className="text-blue-600 font-medium">5,000+</span> job seekers joined this month
                  </div>
                </div>
              </div>

              {/* Hero Image */}
              <div className="w-full lg:w-1/2 relative">
                <div className="relative z-10 rounded-xl shadow-2xl overflow-hidden bg-white border border-gray-100">
                  <div className="h-6 bg-gray-100 flex items-center px-4 border-b">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 rounded-full bg-red-500"></div>
                      <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    </div>
                  </div>
                  <img 
                    src="https://res.cloudinary.com/practicaldev/image/fetch/s--LLJ6t-Kc--/c_imagga_scale,f_auto,fl_progressive,h_900,q_auto,w_1600/https://dev-to-uploads.s3.amazonaws.com/uploads/articles/7j8s2h4erdejm82dyyn7.png" 
                    alt="JobAutoPilot Dashboard" 
                    className="w-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-10 -right-10 z-0 w-64 h-64 rounded-full bg-indigo-100 filter blur-3xl opacity-60"></div>
                <div className="absolute -top-10 -left-10 z-0 w-64 h-64 rounded-full bg-blue-100 filter blur-3xl opacity-60"></div>
              </div>
            </div>
          </div>

          {/* Platform Logos */}
          <div className="bg-gray-50 border-t border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <div className="text-center mb-10">
                <h3 className="text-gray-500 font-medium text-sm uppercase tracking-wider mb-3">
                  Works with all major job platforms
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-8 justify-items-center">
                  {platforms.map((platform, index) => (
                    <div key={index} className="flex flex-col items-center">
                      <div className={`w-12 h-12 ${platform.color} text-white rounded-full flex items-center justify-center mb-3`}>
                        <platform.icon size={24} />
                      </div>
                      <span className="text-gray-700 font-medium">{platform.name}</span>
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
          className="py-24 bg-white relative overflow-hidden"
          ref={featuresRef}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className={`text-center max-w-3xl mx-auto mb-16 transition-all duration-1000 delay-300 ${featuresInView ? 'opacity-100' : 'opacity-0 translate-y-6'}`}>
              <h2 className="text-sm font-semibold text-blue-600 uppercase tracking-wide mb-2">Features</h2>
              <h3 className="text-4xl font-bold text-gray-900 mb-4">Everything You Need to Land Your Dream Job</h3>
              <p className="text-xl text-gray-500">
                Our comprehensive suite of tools helps you streamline your job search and maximize your chances of success.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
              <div className={`bg-gradient-to-br from-blue-50 to-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-500 group ${featuresInView ? 'opacity-100' : 'opacity-0 translate-y-10'}`} style={{ transitionDelay: '150ms' }}>
                <div className="bg-blue-100 group-hover:bg-blue-200 transition-colors duration-300 w-14 h-14 rounded-lg flex items-center justify-center mb-6">
                  <FiClock className="text-blue-600 text-2xl" />
                </div>
                <h3 className="text-xl font-bold mb-4 group-hover:text-blue-600 transition-colors duration-300">Time Saving Automation</h3>
                <p className="text-gray-600">
                  Our intelligent automation applies to jobs for you 24/7, saving you countless hours of repetitive work. Apply to hundreds of positions in the time it takes to apply to one manually.
                </p>
              </div>

              <div className={`bg-gradient-to-br from-indigo-50 to-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-500 group ${featuresInView ? 'opacity-100' : 'opacity-0 translate-y-10'}`} style={{ transitionDelay: '300ms' }}>
                <div className="bg-indigo-100 group-hover:bg-indigo-200 transition-colors duration-300 w-14 h-14 rounded-lg flex items-center justify-center mb-6">
                  <FiTarget className="text-indigo-600 text-2xl" />
                </div>
                <h3 className="text-xl font-bold mb-4 group-hover:text-indigo-600 transition-colors duration-300">Smart Job Matching</h3>
                <p className="text-gray-600">
                  Our AI algorithm analyzes job listings and your profile to match you with positions that align with your skills, experience, and preferences, ensuring better quality applications.
                </p>
              </div>

              <div className={`bg-gradient-to-br from-purple-50 to-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-500 group ${featuresInView ? 'opacity-100' : 'opacity-0 translate-y-10'}`} style={{ transitionDelay: '450ms' }}>
                <div className="bg-purple-100 group-hover:bg-purple-200 transition-colors duration-300 w-14 h-14 rounded-lg flex items-center justify-center mb-6">
                  <FiBarChart className="text-purple-600 text-2xl" />
                </div>
                <h3 className="text-xl font-bold mb-4 group-hover:text-purple-600 transition-colors duration-300">Comprehensive Analytics</h3>
                <p className="text-gray-600">
                  Track your application success rate, interview conversions, and other key metrics through our intuitive dashboard to continuously improve your job search strategy.
                </p>
              </div>
            </div>

            <div className="mt-20">
              <div className={`bg-gradient-to-r from-blue-50 to-indigo-50 rounded-3xl overflow-hidden shadow-xl transition-all duration-1000 ${featuresInView ? 'opacity-100' : 'opacity-0 scale-95'}`} style={{ transitionDelay: '600ms' }}>
                <div className="grid grid-cols-1 lg:grid-cols-2 items-center">
                  <div className="p-12 lg:pl-16">
                    <h3 className="text-3xl font-bold text-gray-900 mb-6">Cross-Platform Integration</h3>
                    <p className="text-gray-600 mb-8 text-lg">
                      JobAutoPilot seamlessly connects with all major job platforms, allowing you to manage your entire job search from a single dashboard.
                    </p>
                    <ul className="space-y-4 mb-8">
                      {platforms.map((platform, index) => (
                        <li key={index} className="flex items-start">
                          <div className={`flex-shrink-0 ${platform.color} rounded-full p-1 mt-1 mr-3`}>
                            <FiCheck className="text-white" />
                          </div>
                          <div>
                            <span className="font-medium text-gray-900">{platform.name}</span>
                            <p className="text-sm text-gray-500">{platform.description}</p>
                          </div>
                        </li>
                      ))}
                    </ul>
                    <Link to="/register" className="inline-flex items-center text-blue-600 font-medium hover:text-blue-700">
                      Get started with all platforms 
                      <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                      </svg>
                    </Link>
                  </div>
                  <div className="p-8 lg:p-0">
                    <img src="https://cdn.dribbble.com/users/1615584/screenshots/17536686/media/f7a0d4c0a7b43a4382d6ca23c754d59d.png" 
                         alt="Platform Integration" 
                         className="w-full h-auto rounded-lg shadow-lg" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section 
          className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600 text-white relative overflow-hidden"
          ref={statsRef}
        >
          {/* Background decoration */}
          <div className="absolute inset-0 overflow-hidden opacity-10">
            <svg className="absolute top-0 left-0 transform translate-x-[-10%] translate-y-[-10%]" width="800" height="800" fill="none" viewBox="0 0 800 800">
              <circle cx="400" cy="400" r="400" fill="white" />
            </svg>
            <svg className="absolute bottom-0 right-0 transform translate-x-[30%] translate-y-[20%]" width="800" height="800" fill="none" viewBox="0 0 800 800">
              <circle cx="400" cy="400" r="400" fill="white" />
            </svg>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className={`text-center max-w-3xl mx-auto mb-16 transition-all duration-1000 ${statsInView ? 'opacity-100' : 'opacity-0 translate-y-6'}`}>
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">Trusted by thousands of job seekers</h2>
              <p className="text-blue-100 text-lg">
                Join the community of successful job seekers who found their dream jobs faster with JobAutoPilot.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
              <div className={`transition-all duration-700 ${statsInView ? 'opacity-100' : 'opacity-0 translate-y-10'}`} style={{ transitionDelay: '150ms' }}>
                <div className="bg-white/10 rounded-lg p-8 backdrop-blur-md">
                  <div className="text-5xl font-bold mb-2">500+</div>
                  <div className="text-lg text-blue-100">Applications Automated Daily</div>
                </div>
              </div>
              <div className={`transition-all duration-700 ${statsInView ? 'opacity-100' : 'opacity-0 translate-y-10'}`} style={{ transitionDelay: '300ms' }}>
                <div className="bg-white/10 rounded-lg p-8 backdrop-blur-md">
                  <div className="text-5xl font-bold mb-2">85%<div className="text-lg text-blue-100">Time Saved Per Application</div>
                  </div>
                </div>
              </div>
              <div className={`transition-all duration-700 ${statsInView ? 'opacity-100' : 'opacity-0 translate-y-10'}`} style={{ transitionDelay: '450ms' }}>
                <div className="bg-white/10 rounded-lg p-8 backdrop-blur-md">
                  <div className="text-5xl font-bold mb-2">50k+</div>
                  <div className="text-lg text-blue-100">Happy Users</div>
                </div>
              </div>
              <div className={`transition-all duration-700 ${statsInView ? 'opacity-100' : 'opacity-0 translate-y-10'}`} style={{ transitionDelay: '600ms' }}>
                <div className="bg-white/10 rounded-lg p-8 backdrop-blur-md">
                  <div className="text-5xl font-bold mb-2">3x</div>
                  <div className="text-lg text-blue-100">More Interview Callbacks</div>
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
              <h3 className="text-4xl font-bold text-gray-900 mb-4">Simple Process, Powerful Results</h3>
              <p className="text-xl text-gray-500">
                Getting started with JobAutoPilot is easy. Follow these simple steps to transform your job search.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {processSteps.map((step, index) => (
                <div 
                  key={index} 
                  className={`relative transition-all duration-700 ${howItWorksInView ? 'opacity-100' : 'opacity-0 translate-y-10'}`} 
                  style={{ transitionDelay: `${index * 150}ms` }}
                >
                  {/* Step number */}
                  <div className="absolute -top-4 -left-4 w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg z-10">
                    {index + 1}
                  </div>
                  
                  {/* Step content */}
                  <div className="bg-white border border-gray-100 rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow h-full flex flex-col">
                    <div className="mb-6 w-16 h-16">
                      <img src={step.icon} alt={step.title} className="w-full h-full object-contain" />
                    </div>
                    <h4 className="text-xl font-bold mb-4 text-gray-900">{step.title}</h4>
                    <p className="text-gray-600 flex-grow">{step.description}</p>
                    
                    {/* Connector arrow for all but the last step */}
                    {index < processSteps.length - 1 && (
                      <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            <div className={`mt-16 text-center transition-all duration-1000 delay-700 ${howItWorksInView ? 'opacity-100' : 'opacity-0'}`}>
              <Link 
                to="/register" 
                className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                Get Started Today
              </Link>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section 
          id="testimonials" 
          className="py-24 bg-gray-50"
          ref={testimonialsRef}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className={`text-center max-w-3xl mx-auto mb-16 transition-all duration-1000 ${testimonialsInView ? 'opacity-100' : 'opacity-0 translate-y-6'}`}>
              <h2 className="text-sm font-semibold text-blue-600 uppercase tracking-wide mb-2">Success Stories</h2>
              <h3 className="text-4xl font-bold text-gray-900 mb-4">From Job Seekers Like You</h3>
              <p className="text-xl text-gray-500">
                Don't just take our word for it. Hear from our users who found their dream jobs using JobAutoPilot.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {testimonials.map((testimonial, index) => (
                <div 
                  key={index} 
                  className={`bg-white rounded-xl shadow-lg p-8 border border-gray-100 transition-all duration-700 ${testimonialsInView ? 'opacity-100' : 'opacity-0 translate-y-10'}`}
                  style={{ transitionDelay: `${index * 150}ms` }}
                >
                  <div className="flex items-center mb-6">
                    <div className="mr-4">
                      <img 
                        src={testimonial.image} 
                        alt={testimonial.name} 
                        className="w-16 h-16 rounded-full object-cover border-2 border-blue-100" 
                      />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-gray-900">{testimonial.name}</h4>
                      <p className="text-gray-600">{testimonial.position}, <span className="text-blue-600">{testimonial.company}</span></p>
                    </div>
                  </div>
                  <blockquote className="text-gray-700 italic mb-4">"{testimonial.text}"</blockquote>
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                        <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                      </svg>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className={`mt-16 text-center transition-all duration-1000 delay-700 ${testimonialsInView ? 'opacity-100' : 'opacity-0 translate-y-6'}`}>
              <a href="#" className="inline-flex items-center font-medium text-blue-600 hover:text-blue-800">
                Read more success stories
                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                </svg>
              </a>
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
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section 
          id="faq" 
          className="py-24 bg-gray-50"
          ref={faqRef}
        >
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className={`text-center mb-16 transition-all duration-1000 ${faqInView ? 'opacity-100' : 'opacity-0 translate-y-6'}`}>
              <h2 className="text-sm font-semibold text-blue-600 uppercase tracking-wide mb-2">FAQ</h2>
              <h3 className="text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h3>
              <p className="text-xl text-gray-500">
                Answers to the most common questions about JobAutoPilot.
              </p>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div 
                  key={index} 
                  className={`bg-white rounded-lg shadow border border-gray-100 overflow-hidden transition-all duration-700 ${faqInView ? 'opacity-100' : 'opacity-0 translate-y-10'}`}
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <button
                    className="flex justify-between items-center w-full px-6 py-5 text-left"
                    onClick={() => setActiveQuestion(activeQuestion === index ? null : index)}
                  >
                    <span className="text-lg font-medium text-gray-900">{faq.question}</span>
                    <FiChevronDown 
                      className={`text-gray-500 transition-transform duration-300 ${activeQuestion === index ? 'transform rotate-180' : ''}`} 
                    />
                  </button>
                  <div 
                    className={`px-6 overflow-hidden transition-all duration-300 ${activeQuestion === index ? 'max-h-60 pb-6' : 'max-h-0'}`}
                  >
                    <p className="text-gray-600">{faq.answer}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className={`mt-12 text-center transition-all duration-1000 delay-700 ${faqInView ? 'opacity-100' : 'opacity-0'}`}>
              <p className="text-gray-600">
                Still have questions? <a href="/contact" className="text-blue-600 hover:text-blue-800 font-medium">Contact our support team</a>
              </p>
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
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
                Ready to Transform Your Job Search?
              </h2>
              <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
                Join thousands of job seekers who have already found their dream jobs faster and easier with JobAutoPilot.
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
                  Request a Demo
                </Link>
              </div>
              <p className="text-blue-200 mt-6 text-sm">
                No credit card required for free trial • Cancel anytime
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
              <h2 className="text-2xl font-bold mb-6">JobAutoPilot</h2>
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
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Integrations</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Enterprise</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-6">Resources</h3>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Job Search Tips</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Success Stories</a></li>
                <li><a href="#faq" className="text-gray-400 hover:text-white transition-colors">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-6">Company</h3>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 mt-8 border-t border-gray-800 text-sm text-gray-400">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="mb-4 md:mb-0">
                <p>© 2024 JobAutoPilot. All rights reserved.</p>
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