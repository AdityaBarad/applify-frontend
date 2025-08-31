import React, { useState, useEffect } from 'react';
import './JobDatingPage.css';
import { FaHeart, FaTimes, FaInfoCircle, FaBriefcase, FaMapMarkerAlt, FaGlobe, FaClock, FaMoneyBillWave } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion'; // We'll need to add this dependency

// Enhanced job data with more details
const demoJobs = [
  {
    id: 1,
    title: 'Frontend Developer',
    company: 'TechNova',
    location: 'Remote',
    salary: '$80K - $120K',
    workType: 'Full-time',
    postedDate: '3 days ago',
    description: 'Join our innovative team to craft beautiful and responsive user interfaces using React and Tailwind CSS. You\'ll be responsible for transforming design concepts into functional components while ensuring optimal performance across devices.',
    requirements: ['3+ years React experience', 'Tailwind CSS proficiency', 'Strong JavaScript fundamentals', 'Experience with responsive design'],
    benefits: ['Flexible remote work', 'Healthcare benefits', 'Unlimited PTO', 'Professional development budget'],
    logo: '/src/assets/logo-blue.png',
    companyColor: '#3b82f6',
  },
  {
    id: 2,
    title: 'Backend Engineer',
    company: 'DataWiz',
    location: 'Bangalore',
    salary: '$70K - $110K',
    workType: 'Full-time',
    postedDate: '1 day ago',
    description: 'Build scalable and robust API services using Node.js and Express. You\'ll be designing database schemas, optimizing queries, and implementing security best practices while working alongside a talented engineering team.',
    requirements: ['Node.js and Express expertise', 'MongoDB or PostgreSQL experience', 'API design knowledge', 'Understanding of security practices'],
    benefits: ['Hybrid work model', '5-day work week', 'Health insurance', 'Annual retreat'],
    logo: '/src/assets/logo-white.png',
    companyColor: '#10b981',
  },
  {
    id: 3,
    title: 'Product Designer',
    company: 'Designly',
    location: 'Delhi',
    salary: '$60K - $90K',
    workType: 'Contract',
    postedDate: '1 week ago',
    description: 'Create exceptional user experiences from concept to implementation. You\'ll work closely with product managers and engineers to define user flows, create wireframes, and design beautiful interfaces that solve real user problems.',
    requirements: ['UI/UX design portfolio', 'Figma proficiency', 'User research experience', 'Design system knowledge'],
    benefits: ['Creative environment', 'Latest design tools provided', 'Flexible hours', 'Portfolio development'],
    logo: '/src/assets/logo.png',
    companyColor: '#f43f5e',
  },
  {
    id: 4,
    title: 'DevOps Engineer',
    company: 'CloudSphere',
    location: 'Remote',
    salary: '$90K - $130K',
    workType: 'Full-time',
    postedDate: '2 days ago',
    description: 'Lead our infrastructure automation efforts using Kubernetes, Docker, and CI/CD pipelines. You\'ll be responsible for maintaining high availability systems, implementing security protocols, and optimizing cloud resources.',
    requirements: ['Kubernetes expertise', 'AWS/GCP experience', 'CI/CD pipeline knowledge', 'Infrastructure as Code'],
    benefits: ['100% remote work', 'Competitive salary', 'Learning stipend', 'Latest hardware'],
    logo: '/src/assets/logo.png',
    companyColor: '#8b5cf6',
  },
];

const JobDatingPage = () => {
  const [jobs, setJobs] = useState(demoJobs);
  const [swiped, setSwiped] = useState([]);
  const [showInfo, setShowInfo] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showDetails, setShowDetails] = useState(false);
  const [direction, setDirection] = useState(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') {
        handleSwipe('left');
      } else if (e.key === 'ArrowRight') {
        handleSwipe('right');
      } else if (e.key === 'i') {
        setShowDetails(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [jobs]);

  const handleSwipe = (direction) => {
    if (jobs.length === 0) return;
    
    setDirection(direction);
    
    setTimeout(() => {
      const [current, ...rest] = jobs;
      setJobs(rest);
      setSwiped([...swiped, { ...current, direction }]);
      setShowDetails(false);
      setDirection(null);
      
      // TODO: Send to backend if direction === 'right'
      if (direction === 'right') {
        // In a real app, we would send the application to backend
        console.log(`Applied to: ${jobs[0].title} at ${jobs[0].company}`);
      }
    }, 300);
  };

  const currentJob = jobs.length > 0 ? jobs[0] : null;

  const cardVariants = {
    initial: { scale: 1 },
    swipeRight: { x: 1000, rotate: 20, transition: { duration: 0.3 } },
    swipeLeft: { x: -1000, rotate: -20, transition: { duration: 0.3 } },
  };

  return (
    <div className="job-dating-container">
      <AnimatePresence>
        {showInfo && (
          <motion.div 
            className="job-dating-beta-info"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="beta-badge">BETA</div>
            <h2>🚀 Job Dating</h2>
            <p>
              Swipe right to apply, left to skip! We&apos;re reimagining job search as a fun, interactive experience.
              <br />
              <span className="keyboard-tip">Pro tip: Use ← → arrow keys to swipe, press "i" to view details</span>
            </p>
            <button onClick={() => setShowInfo(false)} className="pulse-button">Got it!</button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="job-dating-cards">
        {jobs.length > 0 ? (
          <AnimatePresence>
            <motion.div 
              className={`job-card ${showDetails ? 'expanded' : ''}`}
              key={currentJob.id}
              variants={cardVariants}
              initial="initial"
              animate={direction ? `swipe${direction.charAt(0).toUpperCase() + direction.slice(1)}` : 'initial'}
              style={{
                borderTop: `4px solid ${currentJob.companyColor}`,
              }}
            >
              <div className="card-header">
                <div className="logo-container" style={{ backgroundColor: `${currentJob.companyColor}20` }}>
                  <img src={currentJob.logo} alt={`${currentJob.company} logo`} className="job-logo" />
                </div>
                <div className="card-title-container">
                  <h3>{currentJob.title}</h3>
                  <h4>{currentJob.company}</h4>
                </div>
              </div>

              <div className="job-meta">
                <div className="meta-item">
                  <FaMapMarkerAlt className="meta-icon" />
                  <span>{currentJob.location}</span>
                </div>
                <div className="meta-item">
                  <FaBriefcase className="meta-icon" />
                  <span>{currentJob.workType}</span>
                </div>
                <div className="meta-item">
                  <FaClock className="meta-icon" />
                  <span>{currentJob.postedDate}</span>
                </div>
                <div className="meta-item">
                  <FaMoneyBillWave className="meta-icon" />
                  <span>{currentJob.salary}</span>
                </div>
              </div>

              <AnimatePresence>
                {!showDetails ? (
                  <motion.div 
                    className="job-desc"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <p>{currentJob.description}</p>
                    <button 
                      className="view-details-btn"
                      onClick={() => setShowDetails(true)}
                    >
                      <FaInfoCircle /> View Details
                    </button>
                  </motion.div>
                ) : (
                  <motion.div 
                    className="job-details"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <div className="details-section">
                      <h5>Description</h5>
                      <p>{currentJob.description}</p>
                    </div>
                    
                    <div className="details-section">
                      <h5>Requirements</h5>
                      <ul className="job-list">
                        {currentJob.requirements.map((req, index) => (
                          <li key={index}>{req}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="details-section">
                      <h5>Benefits</h5>
                      <ul className="job-list benefits-list">
                        {currentJob.benefits.map((benefit, index) => (
                          <li key={index}>{benefit}</li>
                        ))}
                      </ul>
                    </div>

                    <button 
                      className="close-details-btn"
                      onClick={() => setShowDetails(false)}
                    >
                      Show Less
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="swipe-actions">
                <motion.button 
                  className="swipe-left" 
                  onClick={() => handleSwipe('left')}
                  whileHover={{ scale: 1.1, rotate: -10 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <FaTimes size={28} />
                </motion.button>
                <motion.button 
                  className="swipe-right" 
                  onClick={() => handleSwipe('right')}
                  whileHover={{ scale: 1.1, rotate: 10 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <FaHeart size={28} />
                </motion.button>
              </div>
            </motion.div>
          </AnimatePresence>
        ) : (
          <motion.div 
            className="no-more-jobs"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="no-jobs-illustration">
              <span className="emoji">🏁</span>
            </div>
            <h3>You&apos;ve seen all jobs!</h3>
            <p>We&apos;re finding more matches for you.</p>
            <button 
              onClick={() => setJobs(demoJobs)} 
              className="reset-jobs-btn"
            >
              Start Over
            </button>
          </motion.div>
        )}
      </div>

      {swiped.length > 0 && (
        <div className="job-dating-stats">
          <div className="stat-item">
            <span>{swiped.filter(job => job.direction === 'right').length}</span> applied
          </div>
          <div className="stat-item">
            <span>{swiped.filter(job => job.direction === 'left').length}</span> skipped
          </div>
        </div>
      )}

      <div className="job-dating-footer">
        <p>
          <span className="pulse-dot"></span> 
          Beta feature • Your feedback shapes the future 🚀
        </p>
      </div>
    </div>
  );
};

export default JobDatingPage;
