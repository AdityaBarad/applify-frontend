import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiAlertCircle, FiSettings, FiSearch, FiMapPin, FiCalendar, FiClock, FiDollarSign, FiUser, FiMessageSquare, FiFilter } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext'; 
import { toast } from 'react-hot-toast';
import '../styles/Spinner.css';

function AutomationForm() {
  const { user, checkJobApplicationLimit, startAutomationSession, completeAutomationSession, currentSession } = useAuth();
  const { platform } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    platform: platform,
    keywords: '',
    location: '',
    datePosted: '',
    workplaceType: '',
    experienceLevel: '',
    totalJobsToApply: '5',
    email: '',
    password: '',
    filters: [],
    filtersText: '',
    coverLetter: '',
    workFromHome: false,
    partTime: false,
    includeWorkFromHome: false,
    stipendFilter: 2000,
    workModes: [],
    salaryRanges: [],
    workTypes: [],
    remoteWorkType: 'All jobs',
    jobTypes: [],
    educationLevels: [],
    country: 'India',
    state: '',
    city: '',
    interviewAvailability: ''
  });

  const [progress, setProgress] = useState({
    isRunning: false,
    totalApplied: 0
  });
  
  const [limitStatus, setLimitStatus] = useState({
    loading: true,
    canApply: true,
    message: '',
    limit: 0,
    used: 0
  });

  useEffect(() => {
    const checkLimit = async () => {
      try {
        const result = await checkJobApplicationLimit();
        setLimitStatus({
          loading: false,
          canApply: result.canApply,
          message: result.message,
          limit: result.limit,
          used: result.used
        });
      } catch (error) {
        console.error('Error checking application limit:', error);
        setLimitStatus({
          loading: false,
          canApply: false,
          message: 'Error checking your subscription limits',
          limit: 0,
          used: 0
        });
      }
    };
    
    checkLimit();
  }, [checkJobApplicationLimit]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === 'workModes' || name === 'salaryRanges' || name === 'workTypes' || 
        name === 'jobTypes' || name === 'educationLevels') {
      setFormData((prev) => ({
        ...prev,
        [name]: checked
          ? [...prev[name], value]
          : prev[name].filter((item) => item !== value),
      }));
    } else if (name === 'location' && value.trim() !== '') {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : type === 'range' ? parseInt(value) : value,
        workFromHome: false
      }));
    } 
    else if (name === 'workFromHome' && checked) {
      setFormData(prev => ({
        ...prev,
        [name]: checked,
        location: '',
        includeWorkFromHome: false
      }));
    }
    else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : type === 'range' ? parseInt(value) : value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const limit = await checkJobApplicationLimit();
    
    if (!limit.canApply) {
      toast.error(limit.message);
      return;
    }
    
    const requestedJobs = parseInt(formData.totalJobsToApply) || 5;
    const remainingJobs = limit.limit - limit.used;
    
    if (requestedJobs > remainingJobs) {
      if (window.confirm(`You only have ${remainingJobs} applications left in your current plan. Would you like to adjust and continue?`)) {
        setFormData(prev => ({
          ...prev,
          totalJobsToApply: remainingJobs.toString()
        }));
        // Wait for state update before continuing
        await new Promise(resolve => setTimeout(resolve, 0));
      } else {
        return;
      }
    }
    
    setProgress(prev => ({ ...prev, isRunning: true }));

    try {
      let transformedData = {
        ...formData,
        profile_id: user?.id,
        totalJobsToApply: parseInt(formData.totalJobsToApply) || 5
      };
      
      if (platform === 'linkedin') {
        transformedData = {
          ...transformedData,
          datePosted: {
            '24h': 'r86400',
            'week': 'r604800',
            'month': 'r2592000'
          }[formData.datePosted] || formData.datePosted,
          workplaceType: {
            'onsite': '1',
            'hybrid': '3',
            'remote': '2'
          }[formData.workplaceType] || formData.workplaceType,
          experienceLevel: {
            'internship': '1',
            'entry': '2',
            'associate': '3',
            'mid-senior': '4',
            'director': '5',
            'executive': '6'
          }[formData.experienceLevel] || formData.experienceLevel
        };
      }
      else if (platform === 'internshala') {
        if (formData.filtersText) {
          transformedData.filters = formData.filtersText.split(',').map(f => f.trim()).filter(Boolean);
        }
      }
      
      const session = await startAutomationSession({
        ...transformedData,
        platform
      });

      console.log('Created automation session:', session);

      const messageType = `${platform.toUpperCase()}_AUTOMATION_REQUEST`;
      
      window.postMessage({
        type: messageType,
        message: {
          action: 'startAutomation',
          data: {
            ...transformedData,
            sessionId: session.id,
            sessionData: session
          }
        }
      }, '*');
    } catch (error) {
      console.error('Automation error:', error);
      toast.error('Error: ' + error.message);
      setProgress(prev => ({ ...prev, isRunning: false }));
    }
  };

  useEffect(() => {
    const handleMessage = (event) => {
      console.log("Received message:", event.data);
      
      const responseTypes = [
        'LINKEDIN_AUTOMATION_RESPONSE',
        'INTERNSHALA_AUTOMATION_RESPONSE',
        'INDEED_AUTOMATION_RESPONSE',
        'UNSTOP_AUTOMATION_RESPONSE',
        'NAUKRI_AUTOMATION_RESPONSE'
      ];
      
      const progressTypes = [
        'LINKEDIN_AUTOMATION_PROGRESS',
        'INTERNSHALA_AUTOMATION_PROGRESS',
        'INDEED_AUTOMATION_PROGRESS',
        'UNSTOP_AUTOMATION_PROGRESS',
        'NAUKRI_AUTOMATION_PROGRESS'
      ];
      
      const completeTypes = [
        'LINKEDIN_AUTOMATION_COMPLETE',
        'INTERNSHALA_AUTOMATION_COMPLETE',
        'INDEED_AUTOMATION_COMPLETE',
        'UNSTOP_AUTOMATION_COMPLETE',
        'NAUKRI_AUTOMATION_COMPLETE'
      ];
      
      if (responseTypes.includes(event.data.type)) {
        if (event.data.error) {
          console.error("Automation error:", event.data.error);
          toast.error('Error: ' + event.data.error);
          setProgress(prev => ({ ...prev, isRunning: false }));
        } else if (event.data.response?.success) {
          console.log("Automation started successfully");
          setProgress(prev => ({ ...prev, isRunning: true }));
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      } 
      else if (progressTypes.includes(event.data.type)) {
        console.log("Progress update:", event.data);
        const applied = event.data.data?.total || 0;
        const total = event.data.data?.totalJobsToApply || parseInt(formData.totalJobsToApply);
        
        setProgress(prev => ({
          isRunning: true,
          totalApplied: applied
        }));
        
        if (window.scrollY > 100) {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }
      else if (completeTypes.includes(event.data.type)) {
        console.log("Automation complete:", event.data);
        const jobsApplied = event.data.data?.totalApplied || progress.totalApplied;
        
        setProgress(prev => ({
          isRunning: false,
          totalApplied: jobsApplied
        }));
        
        completeAutomationSession(jobsApplied)
          .then((updatedSession) => {
            console.log("Session updated successfully:", updatedSession);
            
            toast.success(
              <div className="flex flex-col">
                <span className="font-bold text-lg">Automation Complete!</span>
                <span>Successfully applied to {jobsApplied} jobs!</span>
              </div>,
              { duration: 5000 }
            );
            
            setCompletionData({
              visible: true,
              jobsApplied,
              platform
            });
          })
          .catch(err => {
            console.error("Error updating automation session:", err);
            toast.error("Failed to update session data.");
          });
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [formData.totalJobsToApply, completeAutomationSession, progress.totalApplied, platform]);

  const [completionData, setCompletionData] = useState({
    visible: false,
    jobsApplied: 0,
    platform: ''
  });

  // Get icon based on field type
  const getFieldIcon = (fieldType) => {
    const icons = {
      keywords: <FiSearch className="text-gray-400" />,
      location: <FiMapPin className="text-gray-400" />,
      datePosted: <FiCalendar className="text-gray-400" />,
      workplaceType: <FiSettings className="text-gray-400" />,
      salary: <FiDollarSign className="text-gray-400" />,
      experience: <FiUser className="text-gray-400" />,
      coverLetter: <FiMessageSquare className="text-gray-400" />,
      filter: <FiFilter className="text-gray-400" />,
      workTime: <FiClock className="text-gray-400" />
    };
    return icons[fieldType] || null;
  };

  const renderFormFields = () => {
    if (platform === 'internshala') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="form-label flex items-center mb-2">
              <FiSearch className="text-primary-500 mr-2" />
              <span className="text-gray-800 font-medium">Keywords</span>
            </label>
            <div className="relative">
              <input
                type="text"
                name="keywords"
                value={formData.keywords}
                onChange={handleChange}
                className="form-input w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-200 transition-all"
                placeholder="e.g., Web Development, Data Science"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1.5">
              Enter keywords relevant to the internships you're looking for
            </p>
          </div>

          <div className="md:col-span-2">
            <label className="form-label flex items-center mb-2">
              <FiMapPin className="text-primary-500 mr-2" />
              <span className="text-gray-800 font-medium">Location</span>
            </label>
            <div className="relative">
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="form-input w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-200 transition-all"
                placeholder="e.g., Delhi, Mumbai, Bangalore"
                disabled={formData.workFromHome}
              />
            </div>
            {formData.workFromHome && (
              <p className="text-xs text-amber-600 mt-1.5 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                Location is disabled when "Work from home" is selected
              </p>
            )}
            
            {formData.location && !formData.workFromHome && (
              <div className="mt-2.5 flex items-center">
                <input
                  type="checkbox"
                  id="includeWorkFromHome"
                  name="includeWorkFromHome"
                  checked={formData.includeWorkFromHome}
                  onChange={handleChange}
                  className="h-4 w-4 text-primary-600 rounded focus:ring-primary-500 border-gray-300"
                />
                <label htmlFor="includeWorkFromHome" className="ml-2 text-sm text-gray-700">
                  Include work from home opportunities as well
                </label>
              </div>
            )}
          </div>

          <div className="md:col-span-2">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
              <label className="flex items-center mb-3 text-gray-800 font-medium">
                <FiClock className="text-primary-500 mr-2" />
                <span>Internship Options</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-white p-3 rounded-md border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="workFromHome"
                      name="workFromHome"
                      checked={formData.workFromHome}
                      onChange={handleChange}
                      className="h-4 w-4 text-primary-600 rounded focus:ring-primary-500 border-gray-300"
                    />
                    <label htmlFor="workFromHome" className="ml-2 text-sm text-gray-800 font-medium flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                      Work from home
                    </label>
                    {formData.location && !formData.workFromHome && (
                      <span className="ml-1.5 text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-md">
                        Will clear location
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1.5 ml-6">Apply to remote internships from anywhere</p>
                </div>
                
                <div className="bg-white p-3 rounded-md border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="partTime"
                      name="partTime"
                      checked={formData.partTime}
                      onChange={handleChange}
                      className="h-4 w-4 text-primary-600 rounded focus:ring-primary-500 border-gray-300"
                    />
                    <label htmlFor="partTime" className="ml-2 text-sm text-gray-800 font-medium flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Part-time
                    </label>
                  </div>
                  <p className="text-xs text-gray-500 mt-1.5 ml-6">Work for a few hours per day</p>
                </div>
              </div>
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="form-label flex items-center mb-2">
              <FiDollarSign className="text-primary-500 mr-2" />
              <span className="text-gray-800 font-medium">Minimum Stipend</span>
            </label>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex justify-between items-center mb-1 text-sm">
                <span className="font-medium text-primary-700">₹{formData.stipendFilter.toLocaleString()}/month</span>
                <span className="text-xs text-gray-500">Drag to set minimum</span>
              </div>
              <input
                type="range"
                name="stipendFilter"
                min="0"
                max="12100"
                step="100"
                value={formData.stipendFilter}
                onChange={handleChange}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
                style={{
                  background: `linear-gradient(to right, #4f46e5 0%, #4f46e5 ${(formData.stipendFilter/12100)*100}%, #e5e7eb ${(formData.stipendFilter/12100)*100}%, #e5e7eb 100%)`
                }}
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1 px-1">
                <span>₹0</span>
                <span>₹4,000</span>
                <span>₹8,000</span>
                <span>₹12,000+</span>
              </div>
            </div>
          </div>
          
          <div className="md:col-span-2">
            <label className="form-label flex items-center mb-2">
              <FiMessageSquare className="text-primary-500 mr-2" />
              <span className="text-gray-800 font-medium">Cover Letter</span>
            </label>
            <textarea
              name="coverLetter"
              value={formData.coverLetter}
              onChange={handleChange}
              className="form-input min-h-[150px] w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-200 transition-all"
              placeholder="Write a compelling cover letter explaining why you're a great fit for the internship. This will be used for all your applications."
            ></textarea>
            <p className="text-xs text-gray-500 mt-1.5">
              A personalized cover letter significantly increases your chances of being selected
            </p>
          </div>
          
          <div className="md:col-span-2 p-4 bg-blue-50 rounded-lg mb-2 border-l-4 border-blue-500">
            <div className="flex items-start">
              <div className="text-blue-500 mr-3 mt-0.5">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="16" x2="12" y2="12"></line>
                  <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-blue-700">Important Note</p>
                <p className="text-sm text-blue-700 mt-1">
                  You must be logged in to Internshala in your browser before starting the automation.
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    } else if (platform === 'indeed') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="form-label flex items-center mb-2">
              <FiSearch className="text-primary-500 mr-2" />
              <span className="text-gray-800 font-medium">Keywords</span>
            </label>
            <div className="relative">
              <input
                type="text"
                name="keywords"
                value={formData.keywords}
                onChange={handleChange}
                className="form-input w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-200 transition-all"
                placeholder="e.g., Software Engineer, React Developer"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1.5">
              Job title, skills, or company name
            </p>
          </div>

          <div className="md:col-span-2">
            <label className="form-label flex items-center mb-2">
              <FiMapPin className="text-primary-500 mr-2" />
              <span className="text-gray-800 font-medium">Location</span>
            </label>
            <div className="relative">
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="form-input w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-200 transition-all"
                placeholder="e.g., New York, Remote"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1.5">
              City, state, zip code, or "remote"
            </p>
          </div>
          
          <div>
            <label className="form-label flex items-center mb-2">
              <FiSettings className="text-primary-500 mr-2" />
              <span className="text-gray-800 font-medium">Remote Work Type</span>
            </label>
            <select
              name="remoteWorkType"
              value={formData.remoteWorkType}
              onChange={handleChange}
              className="form-input w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-200 transition-all"
            >
              <option value="All jobs">All jobs</option>
              <option value="Remote">Remote</option>
              <option value="Hybrid work">Hybrid work</option>
            </select>
          </div>

          <div>
            <label className="form-label flex items-center mb-2">
              <FiUser className="text-primary-500 mr-2" />
              <span className="text-gray-800 font-medium">Experience (years)</span>
            </label>
            <div className="relative">
              <input
                type="number"
                name="experience"
                value={formData.experience}
                onChange={handleChange}
                className="form-input w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-200 transition-all"
                placeholder="e.g., 2"
                min="0"
                max="20"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1.5">
              Used to fill experience-related questions in applications
            </p>
          </div>

          <div className="md:col-span-2">
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-5 border border-indigo-100">
              <label className="flex items-center mb-3 text-gray-800 font-medium">
                <FiFilter className="text-primary-500 mr-2" />
                <span>Job Type</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  {id: 'jobType-fulltime', value: 'Full-time', icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'},
                  {id: 'jobType-parttime', value: 'Part-time', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'},
                  {id: 'jobType-permanent', value: 'Permanent', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z'},
                  {id: 'jobType-temporary', value: 'Temporary', icon: 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'},
                  {id: 'jobType-internship', value: 'Internship', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253'},
                  {id: 'jobType-freelance', value: 'Freelance', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z'}
                ].map(jobType => (
                  <div key={jobType.id} className="bg-white p-3 rounded-md border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id={jobType.id}
                        name="jobTypes"
                        value={jobType.value}
                        checked={formData.jobTypes.includes(jobType.value)}
                        onChange={handleChange}
                        className="h-4 w-4 text-primary-600 rounded focus:ring-primary-500 border-gray-300"
                      />
                      <label htmlFor={jobType.id} className="ml-2 text-sm text-gray-800 font-medium flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={jobType.icon} />
                        </svg>
                        {jobType.value}
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="md:col-span-2">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-5 border border-blue-100">
              <label className="flex items-center mb-3 text-gray-800 font-medium">
                <FiFilter className="text-primary-500 mr-2" />
                <span>Education Level</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  {id: 'education-bachelors', value: "Bachelor's degree", icon: 'M12 14l9-5-9-5-9 5 9 5z M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z'},
                  {id: 'education-masters', value: "Master's degree", icon: 'M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.248 0l-9-13.5a.75.75 0 011.04-1.08l8.58 8.293 8.458-8.293a.75.75 0 01.96 0h.002z'},
                  {id: 'education-diploma', value: "Diploma", icon: 'M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z'},
                  {id: 'education-doctoral', value: "Doctoral degree", icon: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'}
                ].map(education => (
                  <div key={education.id} className="bg-white p-3 rounded-md border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id={education.id}
                        name="educationLevels"
                        value={education.value}
                        checked={formData.educationLevels.includes(education.value)}
                        onChange={handleChange}
                        className="h-4 w-4 text-primary-600 rounded focus:ring-primary-500 border-gray-300"
                      />
                      <label htmlFor={education.id} className="ml-2 text-sm text-gray-800 font-medium flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={education.icon} />
                        </svg>
                        {education.value}
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="form-label flex items-center mb-2">
              <FiCalendar className="text-primary-500 mr-2" />
              <span className="text-gray-800 font-medium">Interview Availability</span>
            </label>
            <textarea
              name="interviewAvailability"
              value={formData.interviewAvailability || ''}
              onChange={handleChange}
              className="form-input min-h-[100px] w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-200 transition-all"
              placeholder="Please list 2-3 dates and time ranges when you're available for interviews (e.g., June 20, 10am-2pm)"
            />
            <p className="text-xs text-gray-500 mt-1.5">
              Used to automatically fill interview scheduling questions in applications
            </p>
          </div>

          <div>
            <label className="form-label flex items-center mb-2">
              <FiDollarSign className="text-primary-500 mr-2" />
              <span className="text-gray-800 font-medium">Current Salary</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500">$</span>
              </div>
              <input
                type="text"
                name="currentSalary"
                value={formData.currentSalary}
                onChange={handleChange}
                className="form-input pl-8 w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-200 transition-all"
                placeholder="e.g., 75000"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1.5">
              For salary-related application questions
            </p>
          </div>
          
          <div>
            <label className="form-label flex items-center mb-2">
              <FiDollarSign className="text-primary-500 mr-2" />
              <span className="text-gray-800 font-medium">Expected Salary</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500">$</span>
              </div>
              <input
                type="text"
                name="expectedSalary"
                value={formData.expectedSalary}
                onChange={handleChange}
                className="form-input pl-8 w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-200 transition-all"
                placeholder="e.g., 90000"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1.5">
              Your desired compensation
            </p>
          </div>

          <div className="md:col-span-2 p-5 bg-blue-50 rounded-lg border-l-4 border-blue-500">
            <div className="flex items-start">
              <div className="text-blue-500 mr-3 mt-0.5">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="16" x2="12" y2="12"></line>
                  <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-blue-700">Demo Mode</p>
                <p className="text-sm text-blue-700 mt-1">
                  This is a demonstration of basic Indeed navigation. No actual applications will be submitted.
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    } else if (platform === 'naukri') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="form-label">
              Job Type
            </label>
            <select
              name="jobType"
              value={formData.jobType || 'ajob'}
              onChange={handleChange}
              className="form-input"
            >
              <option value="ajob">Job</option>
              <option value="ainternship">Internship</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="form-label">
              Keywords
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                {getFieldIcon('keywords')}
              </div>
              <input
                type="text"
                name="keywords"
                value={formData.keywords}
                onChange={handleChange}
                className="form-input pl-10"
                placeholder="e.g., Software Engineer, React Developer"
              />
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="form-label">
              Location
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                {getFieldIcon('location')}
              </div>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="form-input pl-10"
                placeholder="e.g., Bangalore, Delhi, Remote"
              />
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="form-label flex items-center mb-2">
              {getFieldIcon('workplaceType')}
              <span className="ml-2">Work Mode</span>
            </label>
            <div className="grid grid-cols-2 gap-3 bg-gray-50 p-4 rounded-md">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="workFromOffice"
                  name="workModes"
                  value="Work from office"
                  checked={formData.workModes.includes('Work from office')}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="workFromOffice" className="ml-2 text-sm text-gray-700">
                  Work from office
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="remote"
                  name="workModes"
                  value="Remote"
                  checked={formData.workModes.includes('Remote')}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="remote" className="ml-2 text-sm text-gray-700">
                  Remote
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="hybrid"
                  name="workModes"
                  value="Hybrid"
                  checked={formData.workModes.includes('Hybrid')}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="hybrid" className="ml-2 text-sm text-gray-700">
                  Hybrid
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="tempWfh"
                  name="workModes"
                  value="Temp. WFH due to covid"
                  checked={formData.workModes.includes('Temp. WFH due to covid')}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="tempWfh" className="ml-2 text-sm text-gray-700">
                  Temp. WFH due to covid
                </label>
              </div>
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="form-label flex items-center mb-2">
              {getFieldIcon('salary')}
              <span className="ml-2">Salary Range</span>
            </label>
            <div className="grid grid-cols-2 gap-3 bg-gray-50 p-4 rounded-md">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="salary-0-3"
                  name="salaryRanges"
                  value="0-3 Lakhs"
                  checked={formData.salaryRanges.includes('0-3 Lakhs')}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="salary-0-3" className="ml-2 text-sm text-gray-700">
                  0-3 Lakhs
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="salary-3-6"
                  name="salaryRanges"
                  value="3-6 Lakhs"
                  checked={formData.salaryRanges.includes('3-6 Lakhs')}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="salary-3-6" className="ml-2 text-sm text-gray-700">
                  3-6 Lakhs
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="salary-6-10"
                  name="salaryRanges"
                  value="6-10 Lakhs"
                  checked={formData.salaryRanges.includes('6-10 Lakhs')}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="salary-6-10" className="ml-2 text-sm text-gray-700">
                  6-10 Lakhs
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="salary-10-15"
                  name="salaryRanges"
                  value="10-15 Lakhs"
                  checked={formData.salaryRanges.includes('10-15 Lakhs')}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="salary-10-15" className="ml-2 text-sm text-gray-700">
                  10-15 Lakhs
                </label>
              </div>
            </div>
          </div>

          <div className="md:col-span-2 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center">
              <div className="text-blue-500 mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="16" x2="12" y2="12"></line>
                  <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
              </div>
              <p className="text-sm text-blue-700">
                This is a demonstration of basic Naukri navigation. No actual applications will be submitted.
              </p>
            </div>
          </div>
        </div>
      );
    } else if (platform === 'unstop') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="form-label">
              Keywords
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                {getFieldIcon('keywords')}
              </div>
              <input
                type="text"
                name="keywords"
                value={formData.keywords}
                onChange={handleChange}
                className="form-input pl-10"
                placeholder="e.g., Software Engineer, Marketing Intern"
              />
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="form-label">
              Location
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                {getFieldIcon('location')}
              </div>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="form-input pl-10"
                placeholder="e.g., Delhi, Bangalore, Mumbai"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Enter a city name for location-based filtering
            </p>
          </div>
          
          <div className="md:col-span-2 p-4 bg-blue-50 rounded-lg border border-blue-100">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
              {getFieldIcon('location')}
              <span className="ml-2">Your Location Information</span>
            </h3>
            <p className="text-xs text-gray-600 mb-3">
              This information will be used to fill location fields in job applications.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Country
                </label>
                <input
                  type="text"
                  name="country"
                  value={formData.country || 'India'}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="e.g., India"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  State
                </label>
                <input
                  type="text"
                  name="state"
                  value={formData.state || ''}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="e.g., Delhi"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city || ''}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="e.g., New Delhi"
                />
              </div>
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="form-label flex items-center mb-2">
              {getFieldIcon('workplaceType')}
              <span className="ml-2">Work Type</span>
            </label>
            <div className="grid grid-cols-2 gap-3 bg-gray-50 p-4 rounded-md">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="workType-inOffice"
                  name="workTypes"
                  value="In Office"
                  checked={formData.workTypes.includes('In Office')}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="workType-inOffice" className="ml-2 text-sm text-gray-700">
                  In Office
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="workType-remote"
                  name="workTypes"
                  value="Remote"
                  checked={formData.workTypes.includes('Remote')}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="workType-remote" className="ml-2 text-sm text-gray-700">
                  Remote
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="workType-fieldWork"
                  name="workTypes"
                  value="Field Work"
                  checked={formData.workTypes.includes('Field Work')}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="workType-fieldWork" className="ml-2 text-sm text-gray-700">
                  Field Work
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="workType-hybrid"
                  name="workTypes"
                  value="Hybrid"
                  checked={formData.workTypes.includes('Hybrid')}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="workType-hybrid" className="ml-2 text-sm text-gray-700">
                  Hybrid
                </label>
              </div>
            </div>
          </div>

          <div>
            <label className="form-label">
              Experience (years)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                {getFieldIcon('experience')}
              </div>
              <input
                type="number"
                name="experience"
                value={formData.experience}
                onChange={handleChange}
                className="form-input pl-10"
                placeholder="e.g., 1"
              />
            </div>
          </div>

          <div className="md:col-span-2 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center">
              <div className="text-blue-500 mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="16" x2="12" y2="12"></line>
                  <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
              </div>
              <p className="text-sm text-blue-700">
                This is a demonstration of basic Unstop navigation. No actual applications will be submitted.
              </p>
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="form-label flex items-center mb-2">
              <FiSearch className="text-primary-500 mr-2" />
              <span className="text-gray-800 font-medium">Keywords</span>
            </label>
            <div className="relative">
              <input
                type="text"
                name="keywords"
                value={formData.keywords}
                onChange={handleChange}
                className="form-input w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-200 transition-all"
                placeholder="e.g., Software Engineer, React Developer"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1.5">
              Job title, key skills, or company name
            </p>
          </div>

          <div className="md:col-span-2">
            <label className="form-label flex items-center mb-2">
              <FiMapPin className="text-primary-500 mr-2" />
              <span className="text-gray-800 font-medium">Location</span>
            </label>
            <div className="relative">
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="form-input w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-200 transition-all"
                placeholder="e.g., New York, Remote"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1.5">
              City, state, or "remote"
            </p>
          </div>

          <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="form-label flex items-center mb-2">
                <FiCalendar className="text-primary-500 mr-2" />
                <span className="text-gray-800 font-medium">Date Posted</span>
              </label>
              <select
                name="datePosted"
                value={formData.datePosted}
                onChange={handleChange}
                className="form-input w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-200 transition-all"
              >
                <option value="">Select date range</option>
                <option value="24h">Past 24 hours</option>
                <option value="week">Past week</option>
                <option value="month">Past month</option>
              </select>
            </div>

            <div>
              <label className="form-label flex items-center mb-2">
                <FiSettings className="text-primary-500 mr-2" />
                <span className="text-gray-800 font-medium">Workplace Type</span>
              </label>
              <select
                name="workplaceType"
                value={formData.workplaceType}
                onChange={handleChange}
                className="form-input w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-200 transition-all"
              >
                <option value="">Select workplace type</option>
                <option value="onsite">On-site</option>
                <option value="hybrid">Hybrid</option>
                <option value="remote">Remote</option>
              </select>
            </div>
          </div>
          
          <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="form-label flex items-center mb-2">
                <FiUser className="text-primary-500 mr-2" />
                <span className="text-gray-800 font-medium">Experience Level</span>
              </label>
              <select
                name="experienceLevel"
                value={formData.experienceLevel}
                onChange={handleChange}
                className="form-input w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-200 transition-all"
              >
                <option value="">Select experience level</option>
                <option value="internship">Internship</option>
                <option value="entry">Entry level</option>
                <option value="associate">Associate</option>
                <option value="mid-senior">Mid-Senior level</option>
                <option value="director">Director</option>
                <option value="executive">Executive</option>
              </select>
            </div>

            <div>
              <label className="form-label flex items-center mb-2">
                <FiUser className="text-primary-500 mr-2" />
                <span className="text-gray-800 font-medium">Experience (years)</span>
              </label>
              <input
                type="number"
                name="experience"
                value={formData.experience}
                onChange={handleChange}
                className="form-input w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-200 transition-all"
                placeholder="e.g., 2"
                min="0"
              />
            </div>
          </div>
          
          <div>
            <label className="form-label flex items-center mb-2">
              <FiDollarSign className="text-primary-500 mr-2" />
              <span className="text-gray-800 font-medium">Current Salary</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500">$</span>
              </div>
              <input
                type="text"
                name="currentSalary"
                value={formData.currentSalary}
                onChange={handleChange}
                className="form-input pl-8 w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-200 transition-all"
                placeholder="e.g., 75000"
              />
            </div>
          </div>
          
          <div>
            <label className="form-label flex items-center mb-2">
              <FiDollarSign className="text-primary-500 mr-2" />
              <span className="text-gray-800 font-medium">Expected Salary</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500">$</span>
              </div>
              <input
                type="text"
                name="expectedSalary"
                value={formData.expectedSalary}
                onChange={handleChange}
                className="form-input pl-8 w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-200 transition-all"
                placeholder="e.g., 90000"
              />
            </div>
          </div>
        </div>
      );
    }
  };

  // Enhanced Progress UI with animations
  const renderProgressUI = () => {
    if (!progress.isRunning) return null;
    
    const progressPercentage = (progress.totalApplied / parseInt(formData.totalJobsToApply)) * 100;
    
    return (
      <div className="mb-8 bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-4">
          <h3 className="text-xl font-semibold">Automation in Progress</h3>
          <p className="text-blue-100 mt-1">Please keep this window open while the automation runs</p>
        </div>
        
        <div className="p-6">
          <div className="flex items-center justify-center mb-6">
            <div className="spinner-container" style={{width: "60px", height: "60px"}}>
              <div className="spinner"></div>
            </div>
          </div>
          
          <div className="text-center mb-6">
            <p className="text-gray-600 mb-1">Applying to jobs on {platform.charAt(0).toUpperCase() + platform.slice(1)}</p>
            <div className="text-2xl font-bold text-gray-800">
              {progress.totalApplied} <span className="text-gray-500">/ {formData.totalJobsToApply}</span>
            </div>
          </div>
          
          <div className="relative h-4 bg-gray-100 rounded-full overflow-hidden mb-2">
            <div 
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-500 ease-out"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          
          <div className="flex justify-between text-xs text-gray-500">
            <div>Started</div>
            <div>{Math.round(progressPercentage)}% Complete</div>
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 rounded-lg text-sm text-blue-700 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            The automation is working in the background. You can minimize this window, but please don't close it.
          </div>
        </div>
      </div>
    );
  };

  // Enhanced Completion UI
  const renderCompletionUI = () => {
    if (!completionData.visible) return null;
    
    return (
      <div className="mb-8 overflow-hidden">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-5">
            <div className="flex items-center">
              <div className="bg-white/20 p-3 rounded-full mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold">Automation Completed Successfully!</h3>
                <p className="text-green-100 mt-1">Your job applications have been processed</p>
              </div>
            </div>
          </div>
          
          <div className="p-6 text-center">
            <div className="mb-6">
              <div className="text-3xl font-bold text-gray-800">
                {completionData.jobsApplied} <span className="text-lg text-gray-500">applications submitted</span>
              </div>
              <p className="text-gray-600 mt-2">
                on {completionData.platform.charAt(0).toUpperCase() + completionData.platform.slice(1)}
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button 
                onClick={() => navigate('/dashboard/manage')}
                className="flex items-center justify-center px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                View Application History
              </button>
              <button 
                onClick={() => navigate('/dashboard/automate')}
                className="flex items-center justify-center px-4 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Start New Automation
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Enhanced Subscription Limit UI
  const renderSubscriptionLimitUI = () => {
    if (limitStatus.loading) return null;
    if (limitStatus.canApply) return null;
    
    return (
      <div className="mb-8 rounded-xl overflow-hidden shadow-lg border border-red-200 bg-white">
        <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-4">
          <div className="flex items-center">
            <div className="bg-white/20 p-2 rounded-full mr-3">
              <FiAlertCircle className="text-white" size={24} />
            </div>
            <h3 className="text-xl font-semibold text-white">Subscription Limit Reached</h3>
          </div>
        </div>
        
        <div className="px-6 py-5">
          <p className="text-red-700 mb-4 font-medium">{limitStatus.message}</p>
          <p className="text-gray-600 mb-5">
            Upgrade your plan to continue applying to more jobs and increase your chances of landing your dream role.
          </p>
          
          <button
            onClick={() => navigate('/pricing')}
            className="w-full sm:w-auto flex items-center justify-center px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-sm font-medium"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
            </svg>
            Upgrade Plan
          </button>
        </div>
      </div>
    );
  };

  // Enhanced Usage Status UI
  const renderUsageStatusUI = () => {
    if (limitStatus.loading || !limitStatus.canApply) return null;
    
    const usagePercentage = (limitStatus.used / limitStatus.limit) * 100;
    let statusColor = 'bg-green-500';
    
    if (usagePercentage > 80) {
      statusColor = 'bg-amber-500';
    } else if (usagePercentage > 95) {
      statusColor = 'bg-red-500';
    }
    
    return (
      <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="text-sm font-medium text-blue-800 mb-1 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
                <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
              </svg>
              Application Usage: {limitStatus.used} of {limitStatus.limit} used this month
            </div>
            <div className="w-full bg-blue-100 rounded-full h-2.5 mb-1">
              <div 
                className={`h-2.5 rounded-full ${statusColor} transition-all duration-500`} 
                style={{width: `${usagePercentage}%`}}
              ></div>
            </div>
            <div className="text-xs text-blue-700">
              You have {limitStatus.limit - limitStatus.used} applications remaining in your current plan
            </div>
          </div>
          <button
            onClick={() => navigate('/pricing')}
            className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md font-medium transition-colors flex-shrink-0 flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
              <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
            </svg>
            View Plans
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Progress Component */}
      {renderProgressUI()}
      
      {/* Completion Component */}
      {renderCompletionUI()}
      
      {/* Subscription Limit Warning */}
      {renderSubscriptionLimitUI()}
      
      {/* Usage Status Component */}
      {renderUsageStatusUI()}

      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate('/dashboard/automate')}
          className="mr-4 p-2 hover:bg-gray-100 rounded-full transition-colors flex items-center justify-center"
          aria-label="Go back"
        >
          <FiArrowLeft size={20} className="text-gray-700" />
        </button>
        <h2 className="text-2xl font-bold text-gray-800 flex items-center">
          <span className="mr-2">Configure</span>
          <span className="text-gradient bg-gradient-to-r from-primary-600 to-indigo-600 bg-clip-text text-transparent capitalize">
            {platform}
          </span>
          <span className="ml-2">Automation</span>
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
        <div className="p-6 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
            </svg>
            Search Parameters
          </h3>
          <p className="text-sm text-gray-600">Configure how the automation will search for jobs</p>
        </div>
        
        <div className="p-6">
          {renderFormFields()}

          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="w-full sm:w-1/3">
                <label className="form-label flex items-center mb-2">
                  <FiSettings className="text-primary-500 mr-2" />
                  <span className="text-gray-800 font-medium">Total Jobs to Apply</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    name="totalJobsToApply"
                    value={formData.totalJobsToApply}
                    onChange={handleChange}
                    className="form-input w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-200 transition-all"
                    min="1"
                    max={limitStatus.limit - limitStatus.used > 0 ? limitStatus.limit - limitStatus.used : 1}
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span className="text-sm text-gray-500">jobs</span>
                  </div>
                </div>
                {limitStatus.canApply && (
                  <p className="text-xs text-gray-500 mt-1.5">
                    You can apply to up to {limitStatus.limit - limitStatus.used} more jobs this month.
                  </p>
                )}
              </div>
              
              <div className="w-full sm:w-2/3">
                <button 
                  type="submit" 
                  className="w-full h-full py-3.5 px-6 bg-gradient-to-r from-primary-600 to-indigo-600 text-white rounded-xl shadow-md hover:shadow-lg hover:from-primary-700 hover:to-indigo-700 transition-all flex items-center justify-center text-base font-medium" 
                  disabled={progress.isRunning || !limitStatus.canApply}
                >
                  {progress.isRunning ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Automation Running...
                    </>
                  ) : (
                    <>
                      <FiSettings className="mr-2" size={20} />
                      Start Automation
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

export default AutomationForm;