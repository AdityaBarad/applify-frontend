
import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { FiUser, FiEdit2, FiSave, FiPlus, FiTrash2, FiLoader, FiUploadCloud, FiFile, FiBriefcase, FiAward, FiStar, FiGlobe, FiDollarSign, FiMapPin, FiClock, FiLock } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { parseResume } from '../utils/resumeParser';

function ResumePage() {
  const { user, getUserProfile, updateUserProfile, subscription, subscriptionLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [parseLoading, setParseLoading] = useState(false);
  const fileInputRef = useRef(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [activeSection, setActiveSection] = useState('basic');
  const [formChanged, setFormChanged] = useState(false);
  const [profile, setProfile] = useState({
    fullName: '',
    phone: '',
    location: '',
    professionalSummary: '',
    resumeUrl: '',
    skills: [],
    languages: [],
    education: [],
    workExperience: [],
    socialLinks: {
      linkedin: '',
      github: '',
      portfolio: ''
    },
    jobPreferences: {
      remoteWork: false,
      relocation: false,
      expectedSalary: '',
      noticePeriod: '',
      preferredIndustries: []
    }
  });

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      try {
        setLoading(true);
        const profileData = await getUserProfile();
        if (profileData) {
          setProfile(prev => ({
            ...prev,
            ...profileData,
            socialLinks: profileData.socialLinks || prev.socialLinks,
            jobPreferences: profileData.jobPreferences || prev.jobPreferences,
            workExperience: profileData.workExperience || [],
            education: profileData.education || [],
            skills: profileData.skills || [],
            languages: profileData.languages || []
          }));
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast.error('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user, getUserProfile]);
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      // Handle nested properties (e.g., socialLinks.github)
      const [parent, child] = name.split('.');
      setProfile(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      // Handle top-level properties
      setProfile(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
    
    setFormChanged(true);
  };
  
  const handleAddSkill = () => {
    if (!newSkill.trim()) return;
    
    setProfile(prev => ({
      ...prev,
      skills: [...prev.skills, newSkill.trim()]
    }));
    setNewSkill('');
    setFormChanged(true);
  };
  
  const handleRemoveSkill = (index) => {
    setProfile(prev => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index)
    }));
    setFormChanged(true);
  };
  
  const handleAddLanguage = () => {
    if (!newLanguage.language.trim()) return;
    
    setProfile(prev => ({
      ...prev,
      languages: [...prev.languages, newLanguage]
    }));
    setNewLanguage({ language: '', proficiency: 'Beginner' });
    setFormChanged(true);
  };
  
  const handleRemoveLanguage = (index) => {
    setProfile(prev => ({
      ...prev,
      languages: prev.languages.filter((_, i) => i !== index)
    }));
    setFormChanged(true);
  };
  
  const handleAddEducation = () => {
    if (!newEducation.institution.trim() || !newEducation.degree.trim()) return;
    
    setProfile(prev => ({
      ...prev,
      education: [...prev.education, newEducation]
    }));
    setNewEducation({
      institution: '',
      degree: '',
      fieldOfStudy: '',
      startDate: '',
      endDate: '',
      currentlyStudying: false,
      description: ''
    });
    setFormChanged(true);
  };
  
  const handleRemoveEducation = (index) => {
    setProfile(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index)
    }));
    setFormChanged(true);
  };
  
  const handleAddExperience = () => {
    if (!newExperience.company.trim() || !newExperience.position.trim()) return;
    
    setProfile(prev => ({
      ...prev,
      workExperience: [...prev.workExperience, newExperience]
    }));
    setNewExperience({
      company: '',
      position: '',
      location: '',
      startDate: '',
      endDate: '',
      currentlyWorking: false,
      description: ''
    });
    setFormChanged(true);
  };
  
  const handleRemoveExperience = (index) => {
    setProfile(prev => ({
      ...prev,
      workExperience: prev.workExperience.filter((_, i) => i !== index)
    }));
    setFormChanged(true);
  };
  
  const handleAddIndustry = () => {
    if (!newIndustry.trim()) return;
    
    setProfile(prev => ({
      ...prev,
      jobPreferences: {
        ...prev.jobPreferences,
        preferredIndustries: [...(prev.jobPreferences.preferredIndustries || []), newIndustry.trim()]
      }
    }));
    setNewIndustry('');
    setFormChanged(true);
  };
  
  const handleRemoveIndustry = (index) => {
    setProfile(prev => ({
      ...prev,
      jobPreferences: {
        ...prev.jobPreferences,
        preferredIndustries: prev.jobPreferences.preferredIndustries.filter((_, i) => i !== index)
      }
    }));
    setFormChanged(true);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      await updateUserProfile(profile);
      toast.success('Profile updated successfully');
      setFormChanged(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile: ' + (error.message || 'Unknown error'));
    } finally {
      setSaving(false);
    }
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload a PDF or Word document');
      return;
    }

    setUploadedFile(file);
    setParseLoading(true);
    
    try {
      const parsedData = await parseResume(file);
      
      if (parsedData) {
        // Update profile with parsed data
        setProfile(prev => ({
          ...prev,
          ...parsedData,
          // Merge arrays rather than replacing them
          skills: [...new Set([...(prev.skills || []), ...(parsedData.skills || [])])],
          languages: [...(prev.languages || []), ...(parsedData.languages || [])],
          education: [...(prev.education || []), ...(parsedData.education || [])],
          workExperience: [...(prev.workExperience || []), ...(parsedData.workExperience || [])],
          // Preserve existing socialLinks and add new ones
          socialLinks: {
            ...(prev.socialLinks || {}),
            ...(parsedData.socialLinks || {})
          },
          // Preserve existing jobPreferences and add new ones
          jobPreferences: {
            ...(prev.jobPreferences || {}),
            ...(parsedData.jobPreferences || {}),
            // Merge preferred industries
            preferredIndustries: [
              ...new Set([
                ...(prev.jobPreferences?.preferredIndustries || []), 
                ...(parsedData.jobPreferences?.preferredIndustries || [])
              ])
            ]
          }
        }));
        
        toast.success('Resume parsed successfully!');
      } else {
        toast.error('Could not extract information from the resume');
      }
    } catch (error) {
      console.error('Error parsing resume:', error);
      toast.error('Error parsing resume: ' + error.message);
    } finally {
      setParseLoading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  // Navigation items for the sidebar
  const navigationItems = [
    { id: 'basic', label: 'Basic Information', icon: <FiUser /> },
    { id: 'experience', label: 'Work Experience', icon: <FiBriefcase /> },
    { id: 'education', label: 'Education', icon: <FiAward /> },
    { id: 'skills', label: 'Skills & Languages', icon: <FiStar /> },
    { id: 'links', label: 'Social & Portfolio', icon: <FiGlobe /> },
    { id: 'preferences', label: 'Job Preferences', icon: <FiDollarSign /> },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-4 border-t-primary-500 border-gray-200 rounded-full animate-spin"></div>
          <p className="text-lg font-medium text-gray-700">Loading your profile...</p>
        </div>
      </div>
    );
  }
  
  // Restrict access to Elite plan only
  if (subscriptionLoading || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="spinner-container inline-block mx-auto" style={{width: "40px", height: "40px"}}>
            <div className="spinner"></div>
          </div>
          <p className="text-gray-600 font-medium mt-3">Loading...</p>
        </div>
      </div>
    );
  }

  const isElite = subscription && subscription.subscription_plans && subscription.subscription_plans.name === 'Elite';
  if (!isElite) {
    return (
      <div className="max-w-xl mx-auto mt-20 bg-white rounded-xl shadow-lg p-8 text-center border border-gray-200">
        <h2 className="text-2xl font-bold mb-4 text-gray-900">Elite Plan Required</h2>
        <p className="text-gray-600 mb-6">The Resume Builder is available exclusively for Elite plan members. Upgrade to Elite to unlock this feature and build a professional resume with advanced tools.</p>
        <a href="/pricing" className="inline-block bg-primary-600 hover:bg-primary-700 text-white font-semibold px-6 py-3 rounded-lg transition">Upgrade to Elite</a>
      </div>
    );
  }
            

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <FiUser className="mr-3 text-primary-600" />
            Your Professional Profile
          </h1>
          <p className="text-gray-600 mt-2">
            Complete your profile to improve your job application success rate
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <button
            type="submit"
            form="profile-form"
            disabled={saving || !formChanged}
            className={`inline-flex items-center justify-center px-6 py-3 rounded-lg shadow-sm text-base font-medium text-white transition-all ${
              !formChanged ? 'bg-gray-400 cursor-not-allowed' : saving ? 'bg-indigo-600 opacity-75 cursor-wait' : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
            }`}
          >
            {saving ? (
              <>
                <FiLoader className="animate-spin -ml-1 mr-2 h-5 w-5" /> 
                Saving Changes...
              </>
            ) : (
              <>
                <FiSave className="-ml-1 mr-2 h-5 w-5" /> 
                Save Profile
              </>
            )}
          </button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 sticky top-24">
            {/* Resume Upload Card */}
            <div className="p-5 bg-gradient-to-r from-primary-50 to-indigo-50 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                <FiFile className="mr-2 text-primary-600" />
                Resume Parser
              </h3>
              
              <div
                className={`border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer transition-all ${
                  uploadedFile ? 'border-primary-400 bg-primary-50' : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
                }`}
                onClick={triggerFileInput}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleResumeUpload}
                  className="hidden"
                  accept=".pdf,.doc,.docx"
                />
                
                {parseLoading ? (
                  <div className="py-4">
                    <div className="w-10 h-10 mx-auto mb-2 border-4 border-t-primary-500 border-primary-200 rounded-full animate-spin"></div>
                    <p className="text-sm text-primary-700 text-center">Parsing resume...</p>
                  </div>
                ) : uploadedFile ? (
                  <div className="text-center">
                    <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mx-auto mb-2">
                      <FiFile className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-medium text-gray-900">{uploadedFile.name}</p>
                    <p className="text-xs text-gray-500 mt-1">Click to replace</p>
                  </div>
                ) : (
                  <>
                    <FiUploadCloud className="w-8 h-8 text-primary-500 mb-2" />
                    <p className="text-sm font-medium text-gray-700">Upload your resume</p>
                    <p className="text-xs text-gray-500 mt-1">PDF or Word document</p>
                  </>
                )}
              </div>
              
              <p className="text-xs text-gray-600 mt-3">
                Upload your resume to automatically fill your profile information
              </p>
            </div>
            
            {/* Navigation */}
            <nav>
              <ul className="py-2">
                {navigationItems.map(item => (
                  <li key={item.id}>
                    <button
                      onClick={() => setActiveSection(item.id)}
                      className={`w-full flex items-center px-5 py-3 text-sm font-medium transition-colors ${
                        activeSection === item.id
                          ? 'text-primary-700 bg-primary-50 border-l-4 border-primary-600'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <span className={`mr-3 ${activeSection === item.id ? 'text-primary-600' : 'text-gray-500'}`}>
                        {item.icon}
                      </span>
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
            
            <div className="p-5 border-t border-gray-200">
              <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-600" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-amber-800">
                      A complete profile significantly increases your chances of landing interviews.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Form Content */}
        <div className="lg:col-span-3">
          <form id="profile-form" onSubmit={handleSubmit}>
            <AnimatePresence mode="wait">
              {activeSection === 'basic' && (
                <motion.div
                  key="basic"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200"
                >
                  <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-800">Basic Information</h2>
                    <p className="text-sm text-gray-600">Tell us about yourself</p>
                  </div>
                  
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Full Name
                        </label>
                        <input
                          type="text"
                          name="fullName"
                          value={profile.fullName}
                          onChange={handleChange}
                          className="form-input block w-full rounded-lg border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-shadow"
                          placeholder="John Doe"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Phone Number
                        </label>
                        <input
                          type="text"
                          name="phone"
                          value={profile.phone}
                          onChange={handleChange}
                          className="form-input block w-full rounded-lg border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-shadow"
                          placeholder="+1 (555) 123-4567"
                        />
                      </div>
                    </div>
                    
                    <div className="mt-6">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Location
                      </label>
                      <div className="flex items-center">
                        <div className="relative flex-grow">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FiMapPin className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            type="text"
                            name="location"
                            value={profile.location}
                            onChange={handleChange}
                            className="form-input block w-full pl-10 rounded-lg border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-shadow"
                            placeholder="City, State/Province, Country"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-6">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Professional Summary
                      </label>
                      <textarea
                        name="professionalSummary"
                        value={profile.professionalSummary}
                        onChange={handleChange}
                        rows="4"
                        className="form-input block w-full rounded-lg border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-shadow"
                        placeholder="A brief description of your professional background, skills, and career goals"
                      ></textarea>
                      <p className="mt-1 text-sm text-gray-500">
                        This summary will be used in your applications to introduce yourself to employers.
                      </p>
                    </div>
                    
                    <div className="mt-6">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Resume URL
                      </label>
                      <div className="mt-1 flex rounded-md shadow-sm">
                        <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                          URL
                        </span>
                        <input
                          type="text"
                          name="resumeUrl"
                          value={profile.resumeUrl}
                          onChange={handleChange}
                          className="flex-1 min-w-0 block w-full rounded-none rounded-r-md border-gray-300 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                          placeholder="https://example.com/my-resume.pdf"
                        />
                      </div>
                      <p className="mt-1 text-sm text-gray-500">
                        Link to your resume (PDF, Google Docs, etc.)
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeSection === 'experience' && (
                <motion.div
                  key="experience"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200"
                >
                  {/* Experience section content */}
                  <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-800">Work Experience</h2>
                    <p className="text-sm text-gray-600">Add your work history to showcase your professional experience</p>
                  </div>
                  
                  <div className="p-6">
                    {/* List of existing experiences */}
                    {profile.workExperience && profile.workExperience.length > 0 ? (
                      <div className="mb-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-3">Your Experience</h3>
                        <div className="space-y-5">
                          {profile.workExperience.map((exp, index) => (
                            <motion.div 
                              key={index}
                              initial={{ opacity: 0, y: 10 }} 
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.2 }}
                              className="relative p-5 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow transition-shadow"
                            >
                              <button
                                type="button"
                                onClick={() => handleRemoveExperience(index)}
                                className="absolute top-4 right-4 p-1 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                                aria-label="Remove experience"
                              >
                                <FiTrash2 className="h-5 w-5" />
                              </button>
                              
                              {/* Experience item content */}
                              <div className="flex items-center mb-2">
                                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                                  <FiBriefcase className="h-5 w-5 text-primary-600" />
                                </div>
                                <div>
                                  <h4 className="text-lg font-semibold text-gray-900">{exp.position}</h4>
                                  <p className="text-gray-700">{exp.company}</p>
                                </div>
                              </div>
                              
                              <div className="mt-3 flex flex-wrap items-center text-sm text-gray-600 gap-x-4 gap-y-1">
                                {/* Location and date info */}
                                {exp.location && (
                                  <div className="flex items-center">
                                    <FiMapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                                    <span>{exp.location}</span>
                                  </div>
                                )}
                                <div className="flex items-center">
                                  <FiClock className="h-4 w-4 mr-1 flex-shrink-0" />
                                  <span>{exp.startDate} - {exp.currentlyWorking ? 'Present' : exp.endDate}</span>
                                </div>
                              </div>
                              
                              {exp.description && (
                                <div className="mt-3 text-gray-700">
                                  <p className="whitespace-pre-line">{exp.description}</p>
                                </div>
                              )}
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gray-50 rounded-lg p-5 text-center mb-6 border border-gray-200">
                        <FiBriefcase className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                        <h3 className="text-gray-500 font-medium">No work experience added yet</h3>
                        <p className="text-gray-400 text-sm mt-1">Add your professional experience below</p>
                      </div>
                    )}
                    
                    {/* Add new experience form */}
                    <div className="mt-8">
                      <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                          <FiPlus className="mr-2 h-5 w-5 text-primary-500" />
                          Add New Experience
                        </h3>
                        
                        {/* New experience form fields */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          {/* Company field */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Company*
                            </label>
                            <input
                              type="text"
                              value={newExperience.company}
                              onChange={(e) => setNewExperience({...newExperience, company: e.target.value})}
                              className="form-input block w-full rounded-lg border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-shadow"
                              placeholder="Company name"
                            />
                          </div>
                          
                          {/* Other fields like position, location, dates, etc. */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Position*
                            </label>
                            <input
                              type="text"
                              value={newExperience.position}
                              onChange={(e) => setNewExperience({...newExperience, position: e.target.value})}
                              className="form-input block w-full rounded-lg border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-shadow"
                              placeholder="Job title"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Location
                            </label>
                            <input
                              type="text"
                              value={newExperience.location}
                              onChange={(e) => setNewExperience({...newExperience, location: e.target.value})}
                              className="form-input block w-full rounded-lg border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-shadow"
                              placeholder="City, Country"
                            />
                          </div>
                          
                          <div className="flex items-center mt-6">
                            <input
                              type="checkbox"
                              id="currentlyWorking"
                              checked={newExperience.currentlyWorking}
                              onChange={(e) => setNewExperience({...newExperience, currentlyWorking: e.target.checked})}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor="currentlyWorking" className="ml-2 block text-sm text-gray-700">
                              I currently work here
                            </label>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Start Date
                            </label>
                            <input
                              type="month"
                              value={newExperience.startDate}
                              onChange={(e) => setNewExperience({...newExperience, startDate: e.target.value})}
                              className="form-input block w-full rounded-lg border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-shadow"
                            />
                          </div>
                          
                          {!newExperience.currentlyWorking && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                End Date
                              </label>
                              <input
                                type="month"
                                value={newExperience.endDate}
                                onChange={(e) => setNewExperience({...newExperience, endDate: e.target.value})}
                                className="form-input block w-full rounded-lg border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-shadow"
                              />
                            </div>
                          )}
                        </div>
                        
                        <div className="mt-5">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                          </label>
                          <textarea
                            value={newExperience.description}
                            onChange={(e) => setNewExperience({...newExperience, description: e.target.value})}
                            rows="3"
                            className="form-input block w-full rounded-lg border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-shadow"
                            placeholder="Describe your responsibilities and achievements"
                          ></textarea>
                        </div>
                        
                        <div className="mt-5 text-right">
                          <button
                            type="button"
                            onClick={handleAddExperience}
                            disabled={!newExperience.company.trim() || !newExperience.position.trim()}
                            className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                              !newExperience.company.trim() || !newExperience.position.trim()
                                ? 'bg-gray-300 cursor-not-allowed'
                                : 'bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500'
                            }`}
                          >
                            <FiPlus className="-ml-1 mr-2 h-4 w-4" />
                            Add Experience
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Similarly structured sections for Education, Skills, Links, and Preferences */}
              {/* All with similar pattern of displaying existing items and add new item forms */}
              {activeSection === 'education' && (
                <motion.div
                  key="education"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200"
                >
                  <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-800">Education</h2>
                    <p className="text-sm text-gray-600">Add your educational background</p>
                  </div>
                  
                  <div className="p-6">
                    {profile.education && profile.education.length > 0 ? (
                      <div className="mb-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-3">Your Education</h3>
                        <div className="space-y-5">
                          {profile.education.map((edu, index) => (
                            <motion.div 
                              key={index}
                              initial={{ opacity: 0, y: 10 }} 
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.2 }}
                              className="relative p-5 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow transition-shadow"
                            >
                              <button
                                type="button"
                                onClick={() => handleRemoveEducation(index)}
                                className="absolute top-4 right-4 p-1 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                                aria-label="Remove education"
                              >
                                <FiTrash2 className="h-5 w-5" />
                              </button>
                              
                              <div className="flex items-center mb-2">
                                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                                  <FiAward className="h-5 w-5 text-primary-600" />
                                </div>
                                <div>
                                  <h4 className="text-lg font-semibold text-gray-900">{edu.degree}{edu.fieldOfStudy && `, ${edu.fieldOfStudy}`}</h4>
                                  <p className="text-gray-700">{edu.institution}</p>
                                </div>
                              </div>
                              
                              <div className="mt-3 flex flex-wrap items-center text-sm text-gray-600 gap-x-4 gap-y-1">
                                <div className="flex items-center">
                                  <FiClock className="h-4 w-4 mr-1 flex-shrink-0" />
                                  <span>{edu.startDate} - {edu.currentlyStudying ? 'Present' : edu.endDate}</span>
                                </div>
                              </div>
                              
                              {edu.description && (
                                <div className="mt-3 text-gray-700">
                                  <p className="whitespace-pre-line">{edu.description}</p>
                                </div>
                              )}
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gray-50 rounded-lg p-5 text-center mb-6 border border-gray-200">
                        <FiAward className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                        <h3 className="text-gray-500 font-medium">No education added yet</h3>
                        <p className="text-gray-400 text-sm mt-1">Add your educational background below</p>
                      </div>
                    )}
                    
                    <div className="mt-8">
                      <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                          <FiPlus className="mr-2 h-5 w-5 text-primary-500" />
                          Add New Education
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Institution*
                            </label>
                            <input
                              type="text"
                              value={newEducation.institution}
                              onChange={(e) => setNewEducation({...newEducation, institution: e.target.value})}
                              className="form-input block w-full rounded-lg border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-shadow"
                              placeholder="University or school name"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Degree*
                            </label>
                            <input
                              type="text"
                              value={newEducation.degree}
                              onChange={(e) => setNewEducation({...newEducation, degree: e.target.value})}
                              className="form-input block w-full rounded-lg border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-shadow"
                              placeholder="e.g., Bachelor of Science"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Field of Study
                            </label>
                            <input
                              type="text"
                              value={newEducation.fieldOfStudy}
                              onChange={(e) => setNewEducation({...newEducation, fieldOfStudy: e.target.value})}
                              className="form-input block w-full rounded-lg border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-shadow"
                              placeholder="e.g., Computer Science"
                            />
                          </div>
                          
                          <div className="flex items-center mt-6">
                            <input
                              type="checkbox"
                              id="currentlyStudying"
                              checked={newEducation.currentlyStudying}
                              onChange={(e) => setNewEducation({...newEducation, currentlyStudying: e.target.checked})}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor="currentlyStudying" className="ml-2 block text-sm text-gray-700">
                              I am currently studying here
                            </label>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Start Date
                            </label>
                            <input
                              type="month"
                              value={newEducation.startDate}
                              onChange={(e) => setNewEducation({...newEducation, startDate: e.target.value})}
                              className="form-input block w-full rounded-lg border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-shadow"
                            />
                          </div>
                          
                          {!newEducation.currentlyStudying && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                End Date
                              </label>
                              <input
                                type="month"
                                value={newEducation.endDate}
                                onChange={(e) => setNewEducation({...newEducation, endDate: e.target.value})}
                                className="form-input block w-full rounded-lg border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-shadow"
                              />
                            </div>
                          )}
                        </div>
                        
                        <div className="mt-5">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                          </label>
                          <textarea
                            value={newEducation.description}
                            onChange={(e) => setNewEducation({...newEducation, description: e.target.value})}
                            rows="3"
                            className="form-input block w-full rounded-lg border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-shadow"
                            placeholder="Additional information about your education"
                          ></textarea>
                        </div>
                        
                        <div className="mt-5 text-right">
                          <button
                            type="button"
                            onClick={handleAddEducation}
                            disabled={!newEducation.institution.trim() || !newEducation.degree.trim()}
                            className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                              !newEducation.institution.trim() || !newEducation.degree.trim()
                                ? 'bg-gray-300 cursor-not-allowed'
                                : 'bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500'
                            }`}
                          >
                            <FiPlus className="-ml-1 mr-2 h-4 w-4" />
                            Add Education
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeSection === 'skills' && (
                <motion.div
                  key="skills"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200"
                >
                  <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-800">Skills & Languages</h2>
                    <p className="text-sm text-gray-600">Showcase your skills and language proficiencies</p>
                  </div>
                  
                  <div className="p-6">
                    <div className="mb-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-3">Skills</h3>
                      
                      <div className="flex flex-wrap gap-2 mb-3">
                        {profile.skills && profile.skills.length > 0 ? (
                          profile.skills.map((skill, index) => (
                            <div key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full flex items-center">
                              {skill}
                              <button
                                type="button"
                                onClick={() => handleRemoveSkill(index)}
                                className="ml-2 text-blue-600 hover:text-blue-800"
                              >
                                <FiTrash2 size={14} />
                              </button>
                            </div>
                          ))
                        ) : (
                          <p className="text-gray-500 italic">No skills added yet.</p>
                        )}
                      </div>
                      
                      <div className="flex">
                        <input
                          type="text"
                          value={newSkill}
                          onChange={(e) => setNewSkill(e.target.value)}
                          className="form-input flex-1 rounded-r-none"
                          placeholder="Add a skill (e.g., JavaScript, Project Management)"
                        />
                        <button
                          type="button"
                          onClick={handleAddSkill}
                          className="bg-blue-600 text-white px-4 py-2 rounded-r hover:bg-blue-700"
                        >
                          <FiPlus />
                        </button>
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t border-gray-200">
                      <h3 className="text-lg font-medium text-gray-900 mb-3">Languages</h3>
                      
                      <div className="space-y-3 mb-4">
                        {profile.languages && profile.languages.length > 0 ? (
                          profile.languages.map((lang, index) => (
                            <div key={index} className="flex justify-between items-center bg-gray-50 p-3 rounded">
                              <div>
                                <span className="font-medium">{lang.language}</span>
                                <span className="text-gray-600 text-sm ml-2">({lang.proficiency})</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemoveLanguage(index)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <FiTrash2 />
                              </button>
                            </div>
                          ))
                        ) : (
                          <p className="text-gray-500 italic">No languages added yet.</p>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                        <input
                          type="text"
                          value={newLanguage.language}
                          onChange={(e) => setNewLanguage({...newLanguage, language: e.target.value})}
                          className="form-input"
                          placeholder="Language name"
                        />
                        
                        <select
                          value={newLanguage.proficiency}
                          onChange={(e) => setNewLanguage({...newLanguage, proficiency: e.target.value})}
                          className="form-input"
                        >
                          <option value="Beginner">Beginner</option>
                          <option value="Intermediate">Intermediate</option>
                          <option value="Advanced">Advanced</option>
                          <option value="Fluent">Fluent</option>
                          <option value="Native">Native</option>
                        </select>
                      </div>
                      
                      <button
                        type="button"
                        onClick={handleAddLanguage}
                        className="flex items-center py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        <FiPlus className="mr-2" /> Add Language
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeSection === 'links' && (
                <motion.div
                  key="links"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200"
                >
                  <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-800">Social & Portfolio Links</h2>
                    <p className="text-sm text-gray-600">Add links to your social profiles and portfolio</p>
                  </div>
                  
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          LinkedIn Profile
                        </label>
                        <input
                          type="text"
                          name="socialLinks.linkedin"
                          value={profile.socialLinks.linkedin}
                          onChange={handleChange}
                          className="form-input w-full rounded-lg border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-shadow"
                          placeholder="https://linkedin.com/in/username"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          GitHub Profile
                        </label>
                        <input
                          type="text"
                          name="socialLinks.github"
                          value={profile.socialLinks.github}
                          onChange={handleChange}
                          className="form-input w-full rounded-lg border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-shadow"
                          placeholder="https://github.com/username"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Portfolio Website
                        </label>
                        <input
                          type="text"
                          name="socialLinks.portfolio"
                          value={profile.socialLinks.portfolio}
                          onChange={handleChange}
                          className="form-input w-full rounded-lg border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-shadow"
                          placeholder="https://yourportfolio.com"
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeSection === 'preferences' && (
                <motion.div
                  key="preferences"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200"
                >
                  <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-800">Job Preferences</h2>
                    <p className="text-sm text-gray-600">Specify your job preferences</p>
                  </div>
                  
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div>
                        <div className="flex items-center mb-4">
                          <input
                            type="checkbox"
                            id="remoteWork"
                            name="jobPreferences.remoteWork"
                            checked={profile.jobPreferences.remoteWork}
                            onChange={handleChange}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label htmlFor="remoteWork" className="ml-2 block text-sm text-gray-700">
                            Open to remote work
                          </label>
                        </div>
                        
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="relocation"
                            name="jobPreferences.relocation"
                            checked={profile.jobPreferences.relocation}
                            onChange={handleChange}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label htmlFor="relocation" className="ml-2 block text-sm text-gray-700">
                            Open to relocation
                          </label>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Expected Salary
                        </label>
                        <input
                          type="text"
                          name="jobPreferences.expectedSalary"
                          value={profile.jobPreferences.expectedSalary}
                          onChange={handleChange}
                          className="form-input w-full rounded-lg border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-shadow"
                          placeholder="e.g., $80,000 - $100,000"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Notice Period
                        </label>
                        <input
                          type="text"
                          name="jobPreferences.noticePeriod"
                          value={profile.jobPreferences.noticePeriod}
                          onChange={handleChange}
                          className="form-input w-full rounded-lg border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-shadow"
                          placeholder="e.g., 2 weeks, 1 month"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-3">Preferred Industries</h3>
                      
                      <div className="flex flex-wrap gap-2 mb-3">
                        {profile.jobPreferences.preferredIndustries && profile.jobPreferences.preferredIndustries.length > 0 ? (
                          profile.jobPreferences.preferredIndustries.map((industry, index) => (
                            <div key={index} className="bg-green-100 text-green-800 px-3 py-1 rounded-full flex items-center">
                              {industry}
                              <button
                                type="button"
                                onClick={() => handleRemoveIndustry(index)}
                                className="ml-2 text-green-600 hover:text-green-800"
                              >
                                <FiTrash2 size={14} />
                              </button>
                            </div>
                          ))
                        ) : (
                          <p className="text-gray-500 italic">No preferred industries added yet.</p>
                        )}
                      </div>
                      
                      <div className="flex">
                        <input
                          type="text"
                          value={newIndustry}
                          onChange={(e) => setNewIndustry(e.target.value)}
                          className="form-input flex-1 rounded-r-none"
                          placeholder="Add an industry (e.g., Technology, Finance)"
                        />
                        <button
                          type="button"
                          onClick={handleAddIndustry}
                          className="bg-green-600 text-white px-4 py-2 rounded-r hover:bg-green-700"
                        >
                          <FiPlus />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ResumePage;