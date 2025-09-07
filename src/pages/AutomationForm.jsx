import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiAlertCircle, FiSettings, FiSearch, FiMapPin, FiCalendar, FiClock, FiDollarSign, FiUser, FiMessageSquare, FiFilter, FiSave, FiTrash2, FiBookmark, FiDownload, FiAlignLeft } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext'; 
import { toast } from 'react-hot-toast';
import '../styles/Spinner.css';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
import { supabase } from '../lib/supabaseClient'; // Import Supabase client

// Helper functions for localStorage
const saveFormDataToLocalStorage = (platform, data) => {
  try {
    localStorage.setItem(`automation_${platform}_data`, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving form data to localStorage:', error);
  }
};

const loadFormDataFromLocalStorage = (platform) => {
  try {
    const savedData = localStorage.getItem(`automation_${platform}_data`);
    return savedData ? JSON.parse(savedData) : null;
  } catch (error) {
    console.error('Error loading form data from localStorage:', error);
    return null;
  }
};

const getPresets = (platform, userId) => {
  try {
    const presets = localStorage.getItem(`automation_${platform}_presets_${userId}`);
    return presets ? JSON.parse(presets) : [];
  } catch (error) {
    console.error('Error loading presets from localStorage:', error);
    return [];
  }
};

const savePreset = (platform, userId, name, data) => {
  try {
    const presets = getPresets(platform, userId);
    // Check if a preset with this name already exists
    const existingIndex = presets.findIndex(p => p.name === name);
    
    if (existingIndex >= 0) {
      // Update existing preset
      presets[existingIndex] = { name, data, updatedAt: new Date().toISOString() };
    } else {
      // Add new preset
      presets.push({ name, data, createdAt: new Date().toISOString() });
    }
    
    localStorage.setItem(`automation_${platform}_presets_${userId}`, JSON.stringify(presets));
    return true;
  } catch (error) {
    console.error('Error saving preset to localStorage:', error);
    return false;
  }
};

const deletePreset = (platform, userId, name) => {
  try {
    const presets = getPresets(platform, userId);
    const updatedPresets = presets.filter(p => p.name !== name);
    localStorage.setItem(`automation_${platform}_presets_${userId}`, JSON.stringify(updatedPresets));
    return true;
  } catch (error) {
    console.error('Error deleting preset from localStorage:', error);
    return false;
  }
};

const setAutomationProgress = (sessionId, totalApplied) => {
  localStorage.setItem('automationProgress', JSON.stringify({ sessionId, totalApplied }));
};
const getAutomationProgress = (sessionId) => {
  try {
    const data = localStorage.getItem('automationProgress');
    if (!data) return 0;
    const parsed = JSON.parse(data);
    return parsed.sessionId === sessionId ? parsed.totalApplied : 0;
  } catch {
    return 0;
  }
};
const clearAutomationProgress = () => {
  localStorage.removeItem('automationProgress');
};

const setRunningAutomation = (platform, sessionId) => {
  localStorage.setItem('runningAutomation', JSON.stringify({ platform, sessionId }));
};
const getRunningAutomation = () => {
  try {
    const data = localStorage.getItem('runningAutomation');
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
};
const clearRunningAutomation = () => {
  localStorage.removeItem('runningAutomation');
}

function AutomationForm() {
  const { user, checkJobApplicationLimit, startAutomationSession, completeAutomationSession, currentSession } = useAuth();
  const { platform } = useParams();
  const navigate = useNavigate();

  // New state to track current automation session ID
  const [currentSessionId, setCurrentSessionId] = useState(null);

  // Prevent access if another platform's automation is running
  useEffect(() => {
    try {
      const running = localStorage.getItem('runningAutomation');
      if (running) {
        const runningObj = JSON.parse(running);
        if (runningObj.platform && runningObj.platform !== platform) {
          // Optionally, set a flag for a dashboard message
          localStorage.setItem('automationFormBlocked', 'true');
          navigate('/dashboard/automate');
        }
      }
    } catch (err) {
      // Ignore errors
    }
  }, [platform, navigate]);
  

  // New state for presets management
  const [presets, setPresets] = useState([]);
  const [presetName, setPresetName] = useState('');
  const [showPresetModal, setShowPresetModal] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState(null);
  
  // Add validation state for required fields
  const [validationErrors, setValidationErrors] = useState({});

  // New state for extension installation status
  const [extensionInstalled, setExtensionInstalled] = useState(null); // null = checking, true = installed, false = not installed

  // New state to track if any automation is running (across all platforms)
  const [anyAutomationRunning, setAnyAutomationRunning] = useState(false);

  // Default form data
  const getDefaultFormData = () => ({
    platform: platform,
    Jobtitle: '',
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
    extraText: '', // New field for additional text inputs
    workFromHome: false,
    partTime: false,
    includeWorkFromHome: false,
    stipendFilter: 0, // Changed from 2000 to 0
    workModes: [],
    salaryRanges: [],
    workTypes: [],
    remoteWorkType: null, // Default is null, not 'All jobs'
    jobTypes: [],
    educationLevels: [],
    highestEducation: 'None',
    country: 'India',
    state: '',
    city: '',
    interviewAvailability: '',
    previousJobTitle: '',
    previousCompany: '',   // New field for previous company
    noticePeriod: '', // New field for notice period (in days)
    phoneNumber: '' // New field for phone number (for Indeed)
  });

  const [formData, setFormData] = useState(getDefaultFormData());

  // Fetch saved form data and presets when component mounts
  useEffect(() => {
  //     if (anyAutomationRunning && !progress.isRunning && !completionData.visible) {
  //   setProgress(prev => ({
  //     ...prev,
  //     isRunning: true
  //   }));
  // }

      try {
    window.postMessage({
      type: 'GET_AUTOMATION_STATUS'
    }, '*');
  } catch (error) {
    // Ignore errors
  }
    // Load previously saved form data for this platform
    const savedData = loadFormDataFromLocalStorage(platform);
    if (savedData) {
      // Make sure we maintain the current platform value
      setFormData(prev => ({ ...savedData, platform }));
    }
    
    // Load presets for this platform and user
    if (user?.id) {
      const userPresets = getPresets(platform, user.id);
      setPresets(userPresets);
    }

    // Function to check from localStorage (or chrome.storage if needed)
    // const checkAutomationRunning = () => {
    //   // Use localStorage for now (sync with extension in next step)
    //   const running = localStorage.getItem('isAutomationRunning');
    //   setAnyAutomationRunning(running === 'true');
    // };

    // checkAutomationRunning();

    // Listen for automation start/stop events from extension
    const handleAutomationEvent = (event) => {
      if (event.data?.type === 'AUTOMATION_STATUS_UPDATE') {
        setAnyAutomationRunning(event.data.running === true);
      }
      // Optionally, listen for completion/stopped events
      if (event.data?.type === 'AUTOMATION_STOPPED' || event.data?.type === 'AUTOMATION_COMPLETE') {
        setAnyAutomationRunning(false);
      }
    };

    window.addEventListener('message', handleAutomationEvent);

    // // Optionally poll every few seconds to keep in sync
    // const pollInterval = setInterval(checkAutomationRunning, 3000);

    return () => {
      window.removeEventListener('message', handleAutomationEvent);
    };
  }, [platform, user?.id]);

  // Save form data to localStorage whenever it changes
  useEffect(() => {
    if (Object.keys(formData).length > 0 && formData.platform) {
      saveFormDataToLocalStorage(platform, formData);
    }
  }, [formData, platform]);

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

  // Add state for detecting if tab was closed
  const [automationTabClosed, setAutomationTabClosed] = useState(false);

  useEffect(() => {
    const checkLimit = async () => {
      try {
        const result = await checkJobApplicationLimit(platform);
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
  }, [checkJobApplicationLimit, platform]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    // Special handling for remoteWorkType: if "All jobs" is selected, set to null
    if (name === 'remoteWorkType') {
      setFormData(prev => ({
        ...prev,
        remoteWorkType: (value === 'All jobs' || value === '' || value === null) ? null : value
      }));
    } else if (name === 'workModes' || name === 'salaryRanges' || name === 'workTypes' || 
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

    // Clear validation errors when user types in a field
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  // New functions for preset management
  const handleSavePreset = () => {
    if (!presetName.trim()) {
      toast.error('Please enter a preset name');
      return;
    }
    
    const success = savePreset(platform, user.id, presetName, formData);
    if (success) {
      toast.success(`Preset "${presetName}" saved successfully`);
      setPresets(getPresets(platform, user.id));
      setPresetName('');
      setShowPresetModal(false);
    } else {
      toast.error('Failed to save preset');
    }
  };

  const handleDeletePreset = (name) => {
    if (window.confirm(`Are you sure you want to delete the preset "${name}"?`)) {
      const success = deletePreset(platform, user.id, name);
      if (success) {
        toast.success(`Preset "${name}" deleted`);
        setPresets(getPresets(platform, user.id));
        if (selectedPreset === name) {
          setSelectedPreset(null);
        }
      } else {
        toast.error('Failed to delete preset');
      }
    }
  };

  const handleLoadPreset = (name) => {
    const preset = presets.find(p => p.name === name);
    if (preset) {
      setFormData({...preset.data, platform});
      setSelectedPreset(name);
      toast.success(`Loaded preset "${name}"`);
    }
  };

  // Add the missing isFormValid function
  const isFormValid = () => {
    if (platform === 'internshala') {
      return formData.Jobtitle && 
             formData.Jobtitle.trim() !== '' && 
             formData.coverLetter && 
             formData.coverLetter.trim() !== '' && 
             formData.extraText && 
             formData.extraText.trim() !== '';
    }
    else if (platform === 'linkedin') {
      return formData.Jobtitle && 
             formData.Jobtitle.trim() !== '' && 
             formData.experience && 
             formData.experience !== '';
    }
    else if (platform === 'indeed') {
  return formData.Jobtitle && 
     formData.Jobtitle.trim() !== '' && 
     formData.name &&
     formData.name.trim() !== '' &&
     formData.experience && 
     formData.experience !== '' &&
     formData.interviewAvailability &&
     formData.interviewAvailability.trim() !== '' &&
     formData.currentSalary &&
     formData.currentSalary.trim() !== '' &&
     formData.expectedSalary &&
     formData.expectedSalary.trim() !== '';
    }    else if (platform === 'unstop') {
      return formData.Jobtitle && 
             formData.Jobtitle.trim() !== '' && 
             formData.country && 
             formData.country.trim() !== '' &&
             formData.state && 
             formData.state.trim() !== '' &&
             formData.city && 
             formData.city.trim() !== '';
    } else if (platform === 'naukri') {
      return formData.Jobtitle && 
             formData.Jobtitle.trim() !== '' && 
             formData.location && 
             formData.location.trim() !== '';
    }
    return true; // For other platforms
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Prevent double submit
    if (isSubmitting || progress.isRunning) return;
    setIsSubmitting(true);

    // Strict: re-check the job application limit for this platform
    const limit = await checkJobApplicationLimit(platform);
    if (!limit.canApply) {
      toast.error(limit.message);
      setIsSubmitting(false);
      return;
    }

    // Sanitize and validate the requested jobs count
    let requestedJobs = parseInt(formData.totalJobsToApply) || 5;
    const remainingJobs = limit.limit - limit.used;
    // Force the requested jobs to be within the allowed range
    requestedJobs = Math.min(Math.max(1, requestedJobs), remainingJobs);
    // Update the form data with the sanitized value
    if (requestedJobs !== parseInt(formData.totalJobsToApply)) {
      toast(`Adjusted jobs to apply to ${requestedJobs} based on your available limit.`);
      setFormData(prev => ({
        ...prev,
        totalJobsToApply: requestedJobs.toString()
      }));
    }
    if (requestedJobs <= 0) {
      toast.error("You have no job applications remaining for today on this platform.");
      setIsSubmitting(false);
      return;
    }
    setProgress(prev => ({ ...prev, isRunning: true }));
    try {
      let transformedData = {
        ...formData,
        profile_id: user?.id,
        email: user?.email,
        totalJobsToApply: requestedJobs
      };
      // Ensure remoteWorkType is null if 'All jobs' or empty string
      if (typeof transformedData.remoteWorkType === 'string' && (transformedData.remoteWorkType === 'All jobs' || transformedData.remoteWorkType === '')) {
        transformedData.remoteWorkType = null;
      }
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
      } else if (platform === 'internshala') {
        if (formData.filtersText) {
          transformedData.filters = formData.filtersText.split(',').map(f => f.trim()).filter(Boolean);
        }
      }
      const session = await startAutomationSession({
        ...transformedData,
        platform,
        totalJobsToApply: requestedJobs
      });
      setCurrentSessionId(session.id);
      setRunningAutomation(platform, session.id);
      console.log('Created automation session:', session);
      const messageType = `${platform.toUpperCase()}_AUTOMATION_REQUEST`;
      window.postMessage({
        type: messageType,
        message: {
          action: 'startAutomation',
          data: {
            ...transformedData,
            totalJobsToApply: requestedJobs,
            sessionId: session.id,
            sessionData: session
          }
        }
      }, '*');
    } catch (error) {
      console.error('Automation error:', error);
      toast.error('Error: ' + error.message);
      setProgress(prev => ({ ...prev, isRunning: false }));
      setIsSubmitting(false);
    }
  };

  const handleStopAutomation = () => {
    if (!progress.isRunning) return;
    
    try {
      // First, update local UI state immediately for responsiveness
      setProgress(prev => ({
        ...prev,
        isRunning: false
      }));
      
      toast.success('Stopping automation...');
      
      // Set a fallback timer to show completion UI even if we don't get a response
      const fallbackTimer = setTimeout(() => {
        console.log('Stop fallback timer triggered - forcing UI update');
        
        // Show completion UI with stopped status
        setCompletionData({
          visible: true,
          jobsApplied: progress.totalApplied,
          platform,
          stopped: true
        });
        
        // Don't try to update session here, since it might fail
      }, 5000);
      
      // Send stop request to the extension
      const messageType = `${platform.toUpperCase()}_STOP_AUTOMATION_REQUEST`;
      
      window.postMessage({
        type: messageType,
        message: { 
          action: 'stopAutomation',
          platform: platform,
          force: true  // Add force flag to ensure it stops
        }
      }, '*');
      
      // Clean up fallback timer on component unmount
      return () => clearTimeout(fallbackTimer);
    } catch (error) {
      console.error('Error stopping automation:', error);
      toast.error('Failed to stop automation: ' + error.message);
      
      // Still show stopped state in case of error
      setProgress(prev => ({
        ...prev,
        isRunning: false
      }));
      clearRunningAutomation();
      clearAutomationProgress();
      
      // Show completion UI with stopped status even if error
      setCompletionData({
        visible: true,
        jobsApplied: progress.totalApplied,
        platform,
        stopped: true
      });
    }
  };

  // Prevent duplicate API calls for complete/stopped events
  const apiCalledRef = useRef({ complete: false, stopped: false });

  useEffect(() => {
    const handleMessage = async (event) => {
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
      const stoppedTypes = [
        'LINKEDIN_AUTOMATION_STOPPED',
        'INTERNSHALA_AUTOMATION_STOPPED',
        'INDEED_AUTOMATION_STOPPED',
        'UNSTOP_AUTOMATION_STOPPED',
        'NAUKRI_AUTOMATION_STOPPED'
      ];

      // If completion message is received, lock the UI in completion state
      if (completeTypes.includes(event.data.type) && event.data.data?.success) {
        setCompletionData({
          visible: true,
          jobsApplied: event.data.data.totalApplied,
          platform,
          auto: true
        });
        setProgress(prev => ({
          isRunning: false,
          totalApplied: event.data.data.totalApplied
        }));
        // Call backend complete API only once
        if (!apiCalledRef.current.complete) {
          apiCalledRef.current.complete = true;
          try {
            await fetch(`${API_BASE_URL}/automation-session/complete`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                sessionId: currentSessionId,
                jobsApplied: event.data.data.totalApplied
              })
            });
          } catch (err) {
            console.error('Failed to call complete API:', err);
          }
        }
        // Set a flag so stopped events are ignored after completion
        window.__automationCompleted = true;
        return;
      }

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
      // Only show stopped UI if completion hasn't already happened
      else if (stoppedTypes.includes(event.data.type) && !window.__automationCompleted) {
        // Only call backend stopped API if jobsApplied > 0
        if (progress.totalApplied > 0 && !apiCalledRef.current.stopped) {
          apiCalledRef.current.stopped = true;
          try {
            await fetch(`${API_BASE_URL}/automation-session/stopped`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                sessionId: currentSessionId,
                jobsApplied: progress.totalApplied
              })
            });
          } catch (err) {
            console.error('Failed to call stopped API:', err);
          }
        }
        setProgress(prev => ({
          ...prev,
          isRunning: false
        }));
        setCompletionData({
          visible: true,
          jobsApplied: progress.totalApplied,
          platform,
          stopped: true
        });
        completionShownRef.current = true;
        toast.info('Automation stopped.');
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [formData.totalJobsToApply, completeAutomationSession, progress.totalApplied, platform, currentSessionId]);

  const [completionData, setCompletionData] = useState({
    visible: false,
    jobsApplied: 0,
    platform: ''
  });
  
  useEffect(() => {
  if (completionData.visible) {
    clearRunningAutomation();
    clearAutomationProgress();
  }
}, [completionData.visible]);

  // Get icon based on field type
  const getFieldIcon = (fieldType) => {
    const icons = {
      Jobtitle: <FiSearch className="text-gray-400" />,
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
          {/* Jobtitle and Location in the same row */}
          <div className="md:col-span-1">
            <label className="form-label flex items-center mb-2">
              <FiSearch className="text-primary-500 mr-2" />
              <span className="text-gray-800 font-medium">Jobtitle</span>
              <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                name="Jobtitle"
                value={formData.Jobtitle}
                onChange={handleChange}
                className="form-input w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-200 transition-all"
                placeholder="e.g., Web Development, Data Science"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1.5">
              Enter Jobtitle relevant to the internships you're looking for
            </p>
          </div>

          <div className="md:col-span-1">
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
              <span className="text-red-500 ml-1">*</span>

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

          {/* Add new Extra Text field */}
          <div className="md:col-span-2">
            <label className="form-label flex items-center mb-2">
              <FiAlignLeft className="text-primary-500 mr-2" />
              <span className="text-gray-800 font-medium">Additional Text</span>
              <span className="text-red-500 ml-1">*</span>

            </label>
            <textarea
              name="extraText"
              value={formData.extraText}
              onChange={handleChange}
              className="form-input min-h-[100px] w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-200 transition-all"
              placeholder="Enter additional text to fill any extra questions or fields in application forms."

            ></textarea>



            <p className="text-xs text-gray-500 mt-1.5">
              This text will be used to fill additional text fields in application forms if needed
            </p>
          </div>

        </div>
      );
    } else if (platform === 'indeed') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Full Name for electronic signature */}
          <div className="md:col-span-2">
            <label className="form-label flex items-center mb-2">
              <FiUser className="text-primary-500 mr-2" />
              <span className="text-gray-800 font-medium">Full Name</span>
              <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name || ''}
              onChange={handleChange}
              className="form-input w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-200 transition-all"
              placeholder="Enter your full name (for electronic signature)"
              required
            />
            <p className="text-xs text-gray-500 mt-1.5">
              This will be used to electronically sign your application on Indeed.
            </p>
          </div>

          {/* Phone Number field for Indeed */}
          <div className="md:col-span-2">
            <label className="form-label flex items-center mb-2">
              <FiUser className="text-primary-500 mr-2" />
              <span className="text-gray-800 font-medium">Phone Number</span>
              <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber || ''}
              onChange={handleChange}
              className="form-input w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-200 transition-all"
              placeholder="Enter your phone number"
              required
              pattern="[0-9]{10,15}"
              maxLength={15}
            />
            <p className="text-xs text-gray-500 mt-1.5">
              This will be used to fill contact number fields in Indeed applications.
            </p>
          </div>
          <div className="md:col-span-2">
            <label className="form-label flex items-center mb-2">
              <FiSearch className="text-primary-500 mr-2" />
              <span className="text-gray-800 font-medium">Jobtitle</span>
              <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                name="Jobtitle"
                value={formData.Jobtitle}
                onChange={handleChange}
                className="form-input w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-200 transition-all"
                placeholder="e.g., Software Engineer, React Developer"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1.5">
              Jobtitle, skills, or company name
            </p>
          </div>

          {/* Add the new highest education level dropdown field */}
          <div className="md:col-span-2">
            <label className="form-label flex items-center mb-2">
              <FiUser className="text-primary-500 mr-2" />
              <span className="text-gray-800 font-medium">Highest Level of Education</span>
            </label>
            <select
              name="highestEducation"
              value={formData.highestEducation}
              onChange={handleChange}
              className="form-input w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-200 transition-all"
              aria-required="true"
            >
              <option value="None">None</option>
              <option value="Secondary(10th Pass)">Secondary(10th Pass)</option>
              <option value="Higher Secondary(12th Pass)">Higher Secondary(12th Pass)</option>
              <option value="Diploma">Diploma</option>
              <option value="Bachelor's">Bachelor's</option>
              <option value="Master's">Master's</option>
              <option value="Doctorate">Doctorate</option>
            </select>
            <p className="text-xs text-gray-500 mt-1.5">
              Used to automatically fill education questions in applications
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

          {/* New field: Previous Job Title */}
          <div className="md:col-span-2">
            <label className="form-label flex items-center mb-2">
              <FiUser className="text-primary-500 mr-2" />
              <span className="text-gray-800 font-medium">Previous Job Title</span>
            </label>
            <div className="relative">
              <input
                type="text"
                name="previousJobTitle"
                value={formData.previousJobTitle}
                onChange={handleChange}
                className="form-input w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-200 transition-all"
                placeholder="e.g., Frontend Developer"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1.5">
              Used to fill previous employment information in applications
            </p>
          </div>

          {/* New field: Previous Company */}
          <div className="md:col-span-2">
            <label className="form-label flex items-center mb-2">
              <FiUser className="text-primary-500 mr-2" />
              <span className="text-gray-800 font-medium">Previous Company</span>
            </label>
            <div className="relative">
              <input
                type="text"
                name="previousCompany"
                value={formData.previousCompany}
                onChange={handleChange}
                className="form-input w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-200 transition-all"
                placeholder="e.g., Acme Corporation"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1.5">
              Used to fill previous employment information in applications
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
              <span className="text-red-500 ml-1">*</span>
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
  <label className="form-label flex items-center mb-2">
    <FiDollarSign className="text-primary-500 mr-2" />
    <span className="text-gray-800 font-medium">Pay Filter</span>
  </label>
  <select
    name="payFilter"
    id="payFilter"
    value={formData.payFilter || ''}
    onChange={handleChange}
    className="form-input w-full py-1.5 text-sm rounded border-gray-300"
  >
    <option value="">All Salaries</option>
    <option value="₹ 25,833.33+/month">₹ 25,833.33+/month</option>
    <option value="₹ 32,500.00+/month">₹ 32,500.00+/month</option>
    <option value="₹ 37,500.00+/month">₹ 37,500.00+/month</option>
    <option value="₹ 66,666.66+/month">₹ 66,666.66+/month</option>
    <option value="₹ 1,07,500.00+/month">₹ 1,07,500.00+/month</option>
  </select>
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
              <span className="text-red-500 ml-1">*</span>
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
              <span className="text-red-500 ml-1">*</span>
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
              <span className="text-red-500 ml-1">*</span>
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
        </div>
      );
    } else if (platform === 'naukri') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">


          {/* Jobtitle and Location in the same row */}
          <div className="md:col-span-1">
            <label className="form-label flex items-center mb-2">
              {getFieldIcon('Jobtitle')}
              <span className="text-gray-800 font-medium ml-2">Jobtitle</span>
              <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                name="Jobtitle"
                value={formData.Jobtitle}
                onChange={handleChange}
                className="form-input w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-200 transition-all"
                placeholder="e.g., Software Engineer, React Developer"
              />
            </div>
          </div>
          <div className="md:col-span-1">
            <label className="form-label flex items-center mb-2">
              {getFieldIcon('location')}
              <span className="text-gray-800 font-medium ml-2">Location</span>
              <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="form-input w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-200 transition-all"
                placeholder="e.g., Bangalore, Delhi, Remote"
              />
            </div>
          </div>

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

        </div>
      );
    } else if (platform === 'unstop') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Jobtitle and Location in the same row */}
          <div className="md:col-span-1">
            <label className="form-label flex items-center mb-2">
              {getFieldIcon('Jobtitle')}
              <span className="text-gray-800 font-medium ml-2">Jobtitle</span>
              <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                name="Jobtitle"
                value={formData.Jobtitle}
                onChange={handleChange}
                className="form-input w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-200 transition-all"
                placeholder="e.g., Software Engineer, React Developer"
              />
            </div>
          </div>
          <div className="md:col-span-1">
            <label className="form-label flex items-center mb-2">
              {getFieldIcon('location')}
              <span className="text-gray-800 font-medium ml-2">Location</span>
            </label>
            <div className="relative">
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="form-input w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-200 transition-all"
                placeholder="e.g., Delhi, Bangalore, Mumbai"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1.5">
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
                  Country<span className="text-red-500 ml-1">*</span>
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
                  State <span className="text-red-500 ml-1">*</span>
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
                  City <span className="text-red-500 ml-1">*</span>
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

        </div>
      );
    }  else if (platform === 'linkedin') {
      // --- MODIFIED LINKEDIN FORM FIELDS ---
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Jobtitle and Location in the same row */}
          <div className="md:col-span-1">
            <label className="form-label flex items-center mb-2">
              <FiSearch className="text-primary-500 mr-2" />
              <span className="text-gray-800 font-medium">Jobtitle</span>
              <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                name="Jobtitle"
                value={formData.Jobtitle}
                onChange={handleChange}
                className="form-input w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-200 transition-all"
                placeholder="e.g., Software Engineer, React Developer"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1.5">
              Jobtitle, key skills, or company name
            </p>
          </div>
          <div className="md:col-span-1">
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
          {/* Notice Period Field */}
          <div className="md:col-span-1">
            <label className="form-label flex items-center mb-2">
              <FiClock className="text-primary-500 mr-2" />
              <span className="text-gray-800 font-medium">Notice Period (in days)</span>
            </label>
            <input
              type="number"
              name="noticePeriod"
              min="0"
              placeholder="e.g. 30"
              value={formData.noticePeriod}
              onChange={handleChange}
              className="form-input w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-200 transition-all"
            />
            <p className="text-xs text-gray-500 mt-1.5">
              Enter your notice period in days (if applicable)
            </p>
          </div>
          {/* ...rest of the LinkedIn fields... */}
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
                 <span className="text-red-500 ml-1">*</span>
              </label>
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
        </div>
      );
  }  else if (platform === 'linkedin') {
    // --- MODIFIED LINKEDIN FORM FIELDS ---
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Jobtitle and Location in the same row */}
        <div className="md:col-span-1">
          <label className="form-label flex items-center mb-2">
            <FiSearch className="text-primary-500 mr-2" />
            <span className="text-gray-800 font-medium">Jobtitle</span>
            <span className="text-red-500 ml-1">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              name="Jobtitle"
              value={formData.Jobtitle}
              onChange={handleChange}
              className="form-input w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-200 transition-all"
              placeholder="e.g., Software Engineer, React Developer"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1.5">
            Jobtitle, key skills, or company name
          </p>
        </div>
        <div className="md:col-span-1">
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
        {/* ...rest of the LinkedIn fields... */}
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
               <span className="text-red-500 ml-1">*</span>
            </label>
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
      </div>
    );
  }  else if (platform === 'linkedin') {
    // --- MODIFIED LINKEDIN FORM FIELDS ---
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Jobtitle and Location in the same row */}
        <div className="md:col-span-1">
          <label className="form-label flex items-center mb-2">
            <FiSearch className="text-primary-500 mr-2" />
            <span className="text-gray-800 font-medium">Jobtitle</span>
            <span className="text-red-500 ml-1">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              name="Jobtitle"
              value={formData.Jobtitle}
              onChange={handleChange}
              className="form-input w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-200 transition-all"
              placeholder="e.g., Software Engineer, React Developer"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1.5">
            Jobtitle, key skills, or company name
          </p>
        </div>
        <div className="md:col-span-1">
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
        {/* ...rest of the LinkedIn fields... */}
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
               <span className="text-red-500 ml-1">*</span>
            </label>
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
      </div>
    );
  }  else if (platform === 'linkedin') {
    // --- MODIFIED LINKEDIN FORM FIELDS ---
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Jobtitle and Location in the same row */}
        <div className="md:col-span-1">
          <label className="form-label flex items-center mb-2">
            <FiSearch className="text-primary-500 mr-2" />
            <span className="text-gray-800 font-medium">Jobtitle</span>
            <span className="text-red-500 ml-1">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              name="Jobtitle"
              value={formData.Jobtitle}
              onChange={handleChange}
              className="form-input w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-200 transition-all"
              placeholder="e.g., Software Engineer, React Developer"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1.5">
            Jobtitle, key skills, or company name
          </p>
        </div>
        <div className="md:col-span-1">
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
        {/* ...rest of the LinkedIn fields... */}
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
               <span className="text-red-500 ml-1">*</span>
            </label>
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
      </div>
    );
  }
};

  // Enhanced Progress UI with animations and stop button
  const renderProgressUI = () => {
    // Hide progress UI if automation is complete
    if (!progress.isRunning || completionData.visible) return null;
    
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
          
          <div className="mt-6 flex flex-col gap-4">
            <button
              onClick={handleStopAutomation}
              className="w-full py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
              </svg>
              Stop Automation
            </button>
            
            <div className="p-4 bg-blue-50 rounded-lg text-sm text-blue-700 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
              The automation is working in the background. You can minimize this window, but please don't close it.
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Enhanced Completion UI with stopped status
  const renderCompletionUI = () => {
    if (!completionData.visible) return null;

    // Back button handler
    const handleBack = () => {
      navigate('/dashboard/automate');
    };
    // Reload button handler
    const handleReload = () => {
      window.location.reload();
    };

    return (
      <div className="mb-8 overflow-hidden">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className={`bg-gradient-to-r ${completionData.stopped ? 'from-yellow-500 to-amber-600' : 'from-green-500 to-emerald-600'} text-white px-6 py-5`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="bg-white/20 p-3 rounded-full mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
                    {completionData.stopped ? (
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm8-8a8 8 0 11-16 0 8 8 0 0116 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z" clipRule="evenodd" />
                    ) : (
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    )}
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-semibold">
                    {completionData.stopped ? 'Automation Stopped' : 'Automation Completed Successfully!'}
                  </h3>
                  <p className="text-green-100 mt-1">
                    {completionData.stopped 
                      ? 'Automation was stopped before completion' 
                      : `All ${completionData.jobsApplied} job applications processed!`}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleBack}
                  className="flex items-center px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                  title="Back to Automate"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                  </svg>
                  Back
                </button>
                <button
                  onClick={handleReload}
                  className="flex items-center px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors"
                  title="Reload Page"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v6h6M20 20v-6h-6" />
                  </svg>
                  Reload
                </button>
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
              {completionData.auto && (
                <div className="mt-2 inline-block bg-green-50 text-green-700 text-sm px-3 py-1 rounded-full border border-green-200">
                  <span className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Target applications reached
                  </span>
                </div>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button 
                onClick={() => navigate('/dashboard/manage')}
                className="flex items-center justify-center px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2H9a2 2 0 00-2 2v10a2 2 0 002 2h6" />
                </svg>
                View Application History
              </button>
              <button 
                onClick={() => navigate('/dashboard/automate')}
                className="flex items-center justify-center px-4 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
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
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
                <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
              </svg>
              Application Usage: {limitStatus.used} of {limitStatus.limit} used this month
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2 mb-2">
              <div 
                className={`h-2 rounded-full ${statusColor} transition-all duration-500`} 
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
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="currentColor">
              <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
              <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
            </svg>
            View Plans
          </button>
        </div>
      </div>
    );
  };

  // Add the missing renderPresetsUI function
  const renderPresetsUI = () => {
    if (!user?.id) return null;
    
    return (
      <div className="mb-6 bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
        <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-5 py-3 border-b border-gray-200">
          <h3 className="font-medium text-gray-800 flex items-center">
            <FiBookmark className="mr-2 text-primary-500" size={16} />
            Saved Presets
          </h3>
        </div>
        
        <div className="p-3">
          {presets.length === 0 ? (
            <div className="text-center py-3 text-gray-500 text-sm">
              <p>No saved presets yet</p>
            </div>
          ) : (
            <div className="max-h-[calc(100vh-300px)] overflow-y-auto">
              {presets.map(preset => (
                <div 
                  key={preset.name}
                  className={`flex justify-between items-center p-2 mb-1.5 rounded border cursor-pointer transition-colors ${
                    selectedPreset === preset.name ? 'bg-indigo-50 border-indigo-200' : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex-1 overflow-hidden" onClick={() => handleLoadPreset(preset.name)}>
                    <div className="font-medium text-gray-800 text-sm truncate">{preset.name}</div>
                    <div className="text-xs text-gray-500">
                      {preset.updatedAt 
                        ? `Updated: ${new Date(preset.updatedAt).toLocaleDateString()}`
                        : `Created: ${new Date(preset.createdAt).toLocaleDateString()}`
                      }
                    </div>
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeletePreset(preset.name);
                    }}
                    className="ml-2 p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                    title="Delete preset"
                  >
                    <FiTrash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
          
          <div className="flex flex-col gap-2 mt-3">
            <button
              type="button"
              onClick={() => setShowPresetModal(true)}
              className="flex items-center justify-center text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-3 py-2 rounded border border-indigo-200 transition-colors w-full"
            >
              <FiSave size={14} className="mr-1.5" />
              Save Current Settings
            </button>
            
            {presets.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setFormData(getDefaultFormData());
                  setSelectedPreset(null);
                  toast.success('Settings reset to default');
                }}
                className="text-xs text-gray-600 hover:text-gray-800 hover:underline"
              >
                Reset to default
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Modal for saving presets
  const renderPresetModal = () => {
    return (
      <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${showPresetModal ? '' : 'hidden'}`}>
        <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
          <h3 className="text-lg font-semibold mb-4">
            <FiSave className="inline-block mr-2" />
            Save Preset
          </h3>
          
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Preset Name
          </label>
          <input
            type="text"
            value={presetName}
            onChange={(e) => setPresetName(e.target.value)}
            className="form-input mb-4"
            placeholder="Enter a name for your preset"
          />
          
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setShowPresetModal(false)}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSavePreset}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Save Preset
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Check if extension is installed when component mounts
  useEffect(() => {
    const checkExtensionInstalled = () => {
      // Create a timeout to handle case when extension doesn't respond
      const timeoutId = setTimeout(() => {
        setExtensionInstalled(false);
      }, 1000);

      // Try to communicate with the extension
      try {
        window.postMessage({
          type: 'CHECK_EXTENSION_INSTALLED',
          message: { action: 'ping' }
        }, '*');

        // Listen for response from extension
        const messageListener = (event) => {
          if (event.data.type === 'EXTENSION_INSTALLED_RESPONSE') {
            clearTimeout(timeoutId);
            setExtensionInstalled(true);
            window.removeEventListener('message', messageListener);
          }
        };

        window.addEventListener('message', messageListener);

        // Cleanup listener if component unmounts
        return () => {
          clearTimeout(timeoutId);
          window.removeEventListener('message', messageListener);
        };
      } catch (error) {
        clearTimeout(timeoutId);
        setExtensionInstalled(false);
      }
    };

    checkExtensionInstalled();
  }, []);

  useEffect(() => {
  if (progress.isRunning && currentSessionId != null) {
    setAutomationProgress(currentSessionId, progress.totalApplied);
  }
}, [progress.totalApplied, progress.isRunning, currentSessionId]);

useEffect(() => {
  const running = getRunningAutomation();
  if (
    running &&
    running.platform === platform &&
    !completionData.visible
  ) {
    const restoredApplied = getAutomationProgress(running.sessionId);
    setProgress(prev => ({
      ...prev,
      isRunning: true,
      totalApplied: restoredApplied
    }));
    setCurrentSessionId(running.sessionId);
  }
}, [platform, completionData.visible]);
  // Handle browser back button and tab close when automation is running
  useEffect(() => {
    if (progress.isRunning) {
      // Push a custom state so popstate fires on back
      window.history.pushState({ automation: true }, '');

      const sendStopAutomationMessage = () => {
        const messageType = `${platform.toUpperCase()}_STOP_AUTOMATION_REQUEST`;
        window.postMessage({
          type: messageType,
          message: {
            action: 'stopAutomation',
            platform: platform,
            force: true
          }
        }, '*');
      };

      const handleBeforeUnload = (e) => {
        sendStopAutomationMessage();
        setProgress(prev => ({ ...prev, isRunning: false }));
        clearRunningAutomation();
        clearAutomationProgress();
        setCompletionData({
          visible: true,
          jobsApplied: progress.totalApplied,
          platform,
          stopped: true
        });
        e.preventDefault();
        e.returnValue = '';
      };

      const handlePopState = (e) => {
        if (progress.isRunning) {
          if (window.confirm('Automation is currently running. If you go back, your automation will be stopped. Do you want to proceed?')) {
            sendStopAutomationMessage();
            setProgress(prev => ({ ...prev, isRunning: false }));
            clearRunningAutomation();
            clearAutomationProgress();
            setCompletionData({
              visible: true,
              jobsApplied: progress.totalApplied,
              platform,
              stopped: true
            });
          } else {
            window.history.pushState({ automation: true }, '');
          }
        }
      };

      window.addEventListener('beforeunload', handleBeforeUnload);
      window.addEventListener('popstate', handlePopState);
      return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
        window.removeEventListener('popstate', handlePopState);
      };
    }
  }, [progress.isRunning, progress.totalApplied, platform]);


  // New component to render extension status
  const renderExtensionStatus = () => {
    if (extensionInstalled === null) {
      return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-4 animate-pulse">
          <div className="flex items-center">
            <div className="bg-gray-200 h-5 w-5 rounded-full mr-2"></div>
            <div className="bg-gray-200 h-4 w-36 rounded"></div>
          </div>
        </div>
      );
    } else if (extensionInstalled) {
      return (
        <div className="bg-green-50 rounded-lg shadow-sm border border-green-200 p-3 mb-4">
          <div className="flex items-center">
            <div className="bg-green-100 p-1 rounded-full mr-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="text-sm text-green-700 font-medium">Extension installed</span>
          </div>
        </div>
      );
    } else {
      return (
        <div className="bg-amber-50 rounded-lg shadow-sm border border-amber-200 p-3 mb-4">
          <div className="flex flex-col">
            <div className="flex items-center mb-2">
              <div className="bg-amber-100 p-1 rounded-full mr-2">
                <FiDownload className="h-4 w-4 text-amber-600" />
              </div>
              <span className="text-sm text-amber-700 font-medium">Extension not detected</span>
            </div>
            <p className="text-xs text-amber-600 mb-2">
              The Applify extension is required for the automation to work.
            </p>
            <button
              onClick={() => navigate('/')}
              className="text-xs bg-amber-100 hover:bg-amber-200 text-amber-800 py-1.5 px-3 rounded border border-amber-200 transition-colors flex items-center justify-center w-full sm:w-auto"
            >
              <FiDownload className="mr-1.5" size={12} />
              Download Extension
            </button>
          </div>
        </div>
      );
    }
  };

  // Helper to prettify field labels
  const prettyFieldName = (key) => {
    const map = {
      Jobtitle: 'Job Title',
      location: 'Location',
      datePosted: 'Date Posted',
      workplaceType: 'Workplace Type',
      experienceLevel: 'Experience Level',
      totalJobsToApply: 'Jobs to Apply',
      email: 'Email',
      filtersText: 'Filters',
      coverLetter: 'Cover Letter',
      extraText: 'Additional Text',
      workFromHome: 'Work From Home',
      partTime: 'Part Time',
      includeWorkFromHome: 'Include WFH',
      stipendFilter: 'Min Stipend',
      workModes: 'Work Modes',
      salaryRanges: 'Salary Ranges',
      workTypes: 'Work Types',
      remoteWorkType: 'Remote Work Type',
      jobTypes: 'Job Types',
      educationLevels: 'Education Levels',
      highestEducation: 'Highest Education',
      country: 'Country',
      state: 'State',
      city: 'City',
      interviewAvailability: 'Interview Availability',
      previousJobTitle: 'Previous Job Title',
      previousCompany: 'Previous Company',
      experience: 'Experience (years)',
      currentSalary: 'Current Salary',
      expectedSalary: 'Expected Salary',
      jobType: 'Job Type'
    };
    return map[key] || key;
  };

  // Show a summary of user preferences during automation
  function renderPreferencesSummary() {
    // Only show relevant fields
    const summaryFields = [
      'Jobtitle', 'location', 'datePosted', 'workplaceType', 'experienceLevel', 'experience', 'jobType',
      'workFromHome', 'partTime', 'includeWorkFromHome', 'stipendFilter', 'workModes', 'salaryRanges', 'workTypes',
      'remoteWorkType', 'jobTypes', 'educationLevels', 'highestEducation', 'country', 'state', 'city',
      'interviewAvailability', 'previousJobTitle', 'previousCompany', 'coverLetter', 'extraText', 'currentSalary', 'expectedSalary', 'totalJobsToApply'
    ];
    return (
      <div className="mb-8 bg-white rounded-xl shadow-lg border border-indigo-100 overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-500 to-blue-600 px-6 py-4">
          <h3 className="text-lg font-semibold text-white flex items-center">
            <FiSettings className="mr-2" /> Your Automation Preferences
          </h3>
          <p className="text-indigo-100 text-sm">Review your selected settings below</p>
        </div>
        <div className="p-6">
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            {summaryFields.map((key) => {
              let value = formData[key];
              if (
                value === undefined ||
                value === '' ||
                (Array.isArray(value) && value.length === 0) ||
                (typeof value === 'boolean' && value === false)
              ) return null;
              if (typeof value === 'boolean') value = value ? 'Yes' : 'No';
              if (Array.isArray(value)) value = value.join(', ');
              if (key === 'stipendFilter') value = `₹${value}/month`;
              if (key === 'coverLetter' || key === 'extraText' || key === 'interviewAvailability') {
                return (
                  <div key={key} className="md:col-span-2">
                    <dt className="font-medium text-gray-700">{prettyFieldName(key)}</dt>
                    <dd className="text-gray-600 whitespace-pre-line bg-gray-50 rounded p-2 mt-1 text-sm">{value}</dd>
                  </div>
                );
              }
              return (
                <div key={key}>
                  <dt className="font-medium text-gray-700">{prettyFieldName(key)}</dt>
                  <dd className="text-gray-600 text-sm">{value}</dd>
                </div>
              );
            })}
          </dl>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-4">
      {/* Progress and Completion Components - Only show when active */}
      {progress.isRunning && (
        <>
          {renderProgressUI()}
          {renderPreferencesSummary()}
        </>
      )}
      {completionData.visible && (
        <>
          {renderCompletionUI()}
          {renderUsageStatusUI()}
          {renderPreferencesSummary()}
        </>
      )}

      {/* Main two-column layout */}
      {!progress.isRunning && !completionData.visible && (
        // Show loading spinner if usage is not loaded yet
        limitStatus.loading ? (
          <div className="flex justify-center items-center min-h-[300px]">
            <div className="spinner-container" style={{width: "60px", height: "60px"}}>
              <div className="spinner"></div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Left sidebar with presets and usage status */}
            <div className="lg:w-1/4">
              {/* Header with back button */}
              <div className="flex items-center mb-4">
                <button
                  onClick={() => navigate('/dashboard/automate')}
                  className="mr-3 p-2 hover:bg-gray-100 rounded-full transition-colors flex items-center justify-center"
                  aria-label="Go back"
                >
                  <FiArrowLeft size={18} className="text-gray-700" />
                </button>
                <h2 className="text-xl font-bold text-gray-800 capitalize">
                  {platform} <span className="font-normal text-gray-600">setup</span>
                </h2>
              </div>
              {/* Subscription Status Panel */}
              {!limitStatus.loading && (
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-3 mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Application Usage</span>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      {limitStatus.used}/{limitStatus.limit}
                    </span>
                  </div>
                  
                  <div className="w-full bg-gray-100 rounded-full h-2 mb-2">
                    <div 
                      className="h-2 rounded-full bg-gradient-to-r from-primary-500 to-indigo-600 transition-all duration-500"
                      style={{width: `${(limitStatus.used / limitStatus.limit) * 100}%`}}
                    ></div>
                  </div>
                  
                  {limitStatus.canApply ? (
                    <p className="text-xs text-gray-500">
                      {limitStatus.limit - limitStatus.used} applications remaining
                    </p>
                  ) : (
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-red-600 font-medium">{limitStatus.message}</p>
                      <button
                        onClick={() => navigate('/pricing')}
                        className="text-xs bg-red-50 hover:bg-red-100 text-red-600 px-2 py-1 rounded border border-red-200"
                      >
                        Upgrade
                      </button>
                    </div>
                  )}
                </div>
              )}
              {/* Presets Panel */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-4">
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-3 border-b border-gray-200">
                  <h3 className="font-medium text-gray-800 flex items-center">
                    <FiBookmark className="mr-2 text-primary-500" size={16} />
                    Saved Presets
                  </h3>
                </div>
                
                <div className="p-3">
                  {presets.length === 0 ? (
                    <div className="text-center py-3 text-gray-500 text-sm">
                      <p>No saved presets yet</p>
                    </div>
                  ) : (
                    <div className="max-h-[calc(100vh-300px)] overflow-y-auto">
                      {presets.map(preset => (
                        <div 
                          key={preset.name}
                          className={`flex justify-between items-center p-2 mb-1.5 rounded border cursor-pointer transition-colors ${
                            selectedPreset === preset.name ? 'bg-indigo-50 border-indigo-200' : 'border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex-1 overflow-hidden" onClick={() => handleLoadPreset(preset.name)}>
                            <div className="font-medium text-gray-800 text-sm truncate">{preset.name}</div>
                            <div className="text-xs text-gray-500">
                              {preset.updatedAt 
                                ? `Updated: ${new Date(preset.updatedAt).toLocaleDateString()}`
                                : `Created: ${new Date(preset.createdAt).toLocaleDateString()}`
                              }
                            </div>
                          </div>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeletePreset(preset.name);
                            }}
                            className="ml-2 p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                            title="Delete preset"
                          >
                            <FiTrash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div className="flex flex-col gap-2 mt-3">
                    <button
                      type="button"
                      onClick={() => setShowPresetModal(true)}
                      className="flex items-center justify-center text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-3 py-2 rounded border border-indigo-200 transition-colors w-full"
                    >
                      <FiSave size={14} className="mr-1.5" />
                      Save Current Settings
                    </button>
                    
                    {presets.length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setFormData(getDefaultFormData());
                          setSelectedPreset(null);
                          toast.success('Settings reset to default');
                        }}
                        className="text-xs text-gray-600 hover:text-gray-800 hover:underline"
                      >
                        Reset to default
                      </button>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Extension Status Panel - New component */}
              {renderExtensionStatus()}
            </div>
            {/* Right side - Main form area */}
            <div className="lg:w-3/4">
              <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                    <FiSettings className="text-primary-500 mr-2" size={18} />
                    <span className="capitalize">{platform}</span> Automation Settings
                  </h3>
                  <p className="text-sm text-gray-600">
                    Configure how the automation will search and apply for jobs
                  </p>
                </div>
                
                <div className="p-4">
                  {/* Compact form layout with reduced spacing */}
                  <div className="mb-6">
                    {renderFormFields()}
                  </div>

                  {/* Sticky Submit Button at the bottom */}
                  <div className="sticky bottom-0 left-0 right-0 pt-3 pb-1 border-t border-gray-200 bg-white">
                    <div className="flex items-center justify-between">
                      <div className="w-1/3">
                        <label className="form-label mb-1 text-sm font-medium text-gray-700">
                          <FiFilter size={14} className="inline mr-1" />
                          Jobs to Apply
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                                               name="totalJobsToApply"
                            value={formData.totalJobsToApply}
                            onChange={handleChange}
                            className="form-input w-full py-1.5 text-sm rounded border-gray-300"
                            min="1"
                            max={limitStatus.limit - limitStatus.used > 0 ? limitStatus.limit - limitStatus.used : 1}
                          />
                          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            <span className="text-xs text-gray-500">jobs</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="w-2/3 pl-4">
                        <button 
                          type="submit" 
                          className={`w-full py-2.5 px-4 ${
                            (!isFormValid() || progress.isRunning || !limitStatus.canApply || isSubmitting)
                              ? 'bg-gray-400 cursor-not-allowed'
                              : 'bg-gradient-to-r from-primary-600 to-indigo-600 hover:shadow hover:from-primary-700 hover:to-indigo-700'
                                                      } text-white rounded-lg shadow-sm transition-all flex items-center justify-center font-medium`}
                            disabled={!isFormValid() || progress.isRunning || !limitStatus.canApply || isSubmitting}
                        >
                          {progress.isRunning ? (
                            <>
                              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Automation Running...
                            </>
                          ) : isSubmitting ? (
                            <>
                              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Starting...
                            </>
                          ) : !isFormValid() ? (
                            <>
                              <FiAlertCircle className="mr-2" size={18} />
                              Fill Required Fields
                            </>
                          ) : (
                            <>
                              <FiSettings className="mr-2" size={18} />
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
            {/* Modal for saving presets */}
            {renderPresetModal()}
          </div>
        )
      )}
    </div>
  );
}

export default AutomationForm;