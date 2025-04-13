/**
 * Resume Parser Utility
 * 
 * This utility uses a combination of techniques to extract information from resumes:
 * 1. For PDF files: Uses PDF.js to extract text
 * 2. For Word files: Uses mammoth.js to convert to HTML then extract text
 * 3. Uses regex patterns and NLP techniques to identify relevant information
 */

import * as pdfjs from 'pdfjs-dist';
import mammoth from 'mammoth';

// Initialize PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

// Common skill keywords to help with identification
const COMMON_SKILLS = [
  // Programming Languages
  'javascript', 'python', 'java', 'c\\+\\+', 'c#', 'ruby', 'php', 'swift', 'kotlin', 'typescript',
  'html', 'css', 'sql', 'nosql', 'r', 'golang', 'perl', 'scala', 'rust', 'dart',
  
  // Frameworks and Libraries
  'react', 'angular', 'vue', 'node', 'express', 'django', 'spring', 'flask', 'laravel',
  'jquery', 'bootstrap', 'tailwind', 'material ui', 'next.js', 'nuxt', 'gatsby', 'svelte',
  
  // Databases
  'mysql', 'postgresql', 'mongodb', 'oracle', 'sql server', 'sqlite', 'firebase',
  'dynamodb', 'redis', 'cassandra', 'elasticsearch', 'mariadb', 'supabase',
  
  // Cloud & DevOps
  'aws', 'azure', 'gcp', 'google cloud', 'docker', 'kubernetes', 'jenkins', 'terraform',
  'github actions', 'gitlab ci', 'ansible', 'puppet', 'chef', 'prometheus', 'grafana',
  
  // Tools & Methodologies
  'git', 'github', 'gitlab', 'bitbucket', 'jira', 'confluence', 'agile', 'scrum', 'kanban',
  'tdd', 'ci/cd', 'rest api', 'graphql', 'microservices', 'serverless',
  
  // Business & Management
  'project management', 'leadership', 'team management', 'strategic planning', 'budgeting',
  'stakeholder management', 'business analysis', 'product management', 'marketing',
  
  // Soft Skills
  'communication', 'teamwork', 'problem solving', 'critical thinking', 'creativity',
  'time management', 'adaptability', 'attention to detail', 'conflict resolution',
  
  // Data Science & AI
  'machine learning', 'deep learning', 'data analysis', 'statistics', 'natural language processing',
  'computer vision', 'pandas', 'numpy', 'scikit-learn', 'tensorflow', 'pytorch', 'keras',
  'tableau', 'power bi', 'data visualization', 'big data', 'hadoop', 'spark',
  
  // Design
  'ui/ux', 'photoshop', 'illustrator', 'figma', 'sketch', 'indesign', 'adobe xd',
  'graphic design', 'user research', 'prototyping', 'wireframing', 'responsive design',
  
  // Mobile
  'ios', 'android', 'react native', 'flutter', 'xamarin', 'mobile development',
  'app development', 'swift', 'objective-c', 'kotlin', 'java',
  
  // Other Technical
  'seo', 'blockchain', 'ar/vr', 'iot', 'embedded systems', 'network administration',
  'cybersecurity', 'ethical hacking', 'cryptography', 'web security'
];

// Common industries for job preferences
const COMMON_INDUSTRIES = [
  'technology', 'healthcare', 'finance', 'banking', 'insurance', 'education', 'retail',
  'manufacturing', 'telecommunications', 'media', 'entertainment', 'hospitality', 'tourism',
  'transportation', 'logistics', 'energy', 'utilities', 'construction', 'real estate',
  'agriculture', 'food', 'beverage', 'pharmaceutical', 'biotechnology', 'consulting',
  'professional services', 'legal', 'government', 'non-profit', 'automotive', 'aerospace',
  'defense', 'consumer goods', 'e-commerce', 'marketing', 'advertising', 'public relations'
];

// Common job titles to help identify positions
const COMMON_JOB_TITLES = [
  // Engineering
  'software engineer', 'frontend developer', 'backend developer', 'full stack developer',
  'devops engineer', 'site reliability engineer', 'data engineer', 'mobile developer',
  'systems engineer', 'qa engineer', 'test engineer', 'network engineer', 'security engineer',
  'cloud engineer', 'embedded engineer', 'hardware engineer', 'database administrator',
  
  // Data Science & Analytics
  'data scientist', 'data analyst', 'business analyst', 'machine learning engineer',
  'ai researcher', 'bi developer', 'statistician', 'quantitative analyst',
  
  // Management & Leadership
  'cto', 'cio', 'tech lead', 'engineering manager', 'product manager', 'project manager',
  'program manager', 'scrum master', 'agile coach', 'director of engineering',
  'vp of engineering', 'vp of technology', 'chief architect',
  
  // Design & UX
  'ui designer', 'ux designer', 'ui/ux designer', 'product designer', 'graphic designer',
  'visual designer', 'interaction designer', 'user researcher', 'creative director',
  
  // Marketing & Sales
  'marketing manager', 'digital marketer', 'seo specialist', 'content strategist',
  'social media manager', 'sales representative', 'account executive', 'sales manager',
  'business development manager', 'growth hacker',
  
  // Support & Operations
  'customer support', 'technical support', 'it support', 'operations manager',
  'systems administrator', 'office manager', 'executive assistant',
  
  // Finance & Accounting
  'financial analyst', 'accountant', 'auditor', 'tax specialist', 'financial controller',
  'finance manager', 'cfo', 'bookkeeper',
  
  // HR & Recruitment
  'hr manager', 'recruiter', 'talent acquisition specialist', 'human resources director',
  'compensation specialist', 'training manager', 'hr business partner',
  
  // Legal
  'attorney', 'lawyer', 'legal counsel', 'paralegal', 'compliance officer',
  
  // Healthcare
  'doctor', 'nurse', 'physician', 'surgeon', 'pharmacist', 'dentist', 'therapist',
  'medical technician', 'healthcare administrator',
  
  // Education
  'teacher', 'professor', 'tutor', 'instructor', 'education consultant',
  'curriculum developer', 'academic advisor'
];

// Common degree titles to identify education
const COMMON_DEGREES = [
  'bachelor', 'master', 'phd', 'doctorate', 'associate', 'b.s.', 'b.a.', 'b.e.', 'b.tech',
  'm.s.', 'm.a.', 'm.e.', 'm.tech', 'mba', 'ph.d', 'b.com', 'm.com', 'llb', 'llm', 'md',
  'bachelor of science', 'bachelor of arts', 'bachelor of engineering', 'bachelor of technology',
  'master of science', 'master of arts', 'master of engineering', 'master of technology',
  'master of business administration', 'doctor of philosophy', 'bachelor of commerce',
  'master of commerce', 'bachelor of laws', 'master of laws', 'doctor of medicine'
];

/**
 * Main resume parsing function
 * @param {File} file The resume file to parse
 * @returns {Object} Parsed profile information
 */
export const parseResume = async (file) => {
  try {
    // Extract text based on file type
    let text = '';
    if (file.type === 'application/pdf') {
      text = await extractTextFromPdf(file);
    } else if (
      file.type === 'application/msword' || 
      file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      text = await extractTextFromWord(file);
    } else {
      throw new Error('Unsupported file format');
    }

    // Parse the extracted text
    return extractProfileInfo(text);
  } catch (error) {
    console.error('Error parsing resume:', error);
    throw error;
  }
};

/**
 * Extract text from PDF file
 * @param {File} file PDF file
 * @returns {String} Extracted text
 */
const extractTextFromPdf = async (file) => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
    
    let fullText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map(item => item.str).join(' ');
      fullText += pageText + '\n';
    }
    
    return fullText;
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw error;
  }
};

/**
 * Extract text from Word document
 * @param {File} file Word document file
 * @returns {String} Extracted text
 */
const extractTextFromWord = async (file) => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  } catch (error) {
    console.error('Error extracting text from Word document:', error);
    throw error;
  }
};

/**
 * Extract profile information from text
 * @param {String} text The text content of the resume
 * @returns {Object} Structured profile information
 */
const extractProfileInfo = (text) => {
  // Initialize the profile object
  const profile = {
    fullName: '',
    phone: '',
    location: '',
    professionalSummary: '',
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
      preferredIndustries: []
    }
  };

  // Pre-process the text
  const cleanText = text
    .replace(/\r\n/g, '\n')
    .replace(/\n+/g, '\n')
    .trim();

  // Split the text into sections
  const sections = splitIntoSections(cleanText);

  // Extract full name - usually at the beginning of the resume
  const nameMatch = cleanText.split('\n')[0].match(/^([A-Z][a-z]+(?: [A-Z][a-z]+)+)$/);
  if (nameMatch) {
    profile.fullName = nameMatch[0].trim();
  } else {
    // Secondary attempt for names with different formats
    const nameRegex = /^([A-Z][a-z]*(?:\s+[A-Z][a-z]*){1,3})$/m;
    const secondaryNameMatch = cleanText.match(nameRegex);
    if (secondaryNameMatch) {
      profile.fullName = secondaryNameMatch[1].trim();
    }
  }

  // Extract phone number - look for various phone formats
  const phoneRegexes = [
    /(?:(?:\+\d{1,3}[-.\s]?)?(?:\(?\d{3}\)?[-.\s]?)\d{3}[-.\s]?\d{4})/,
    /(?:\+\d{1,3}[-.\s]?)?\d{10}/,
    /(?:\+\d{1,3}[-.\s]?)?\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/
  ];

  for (const regex of phoneRegexes) {
    const phoneMatch = cleanText.match(regex);
    if (phoneMatch) {
      profile.phone = phoneMatch[0];
      break;
    }
  }

  // Extract location - look for common location patterns
  const locationRegexes = [
    /([A-Za-z\s]+,\s*[A-Za-z\s]+(?:,\s*[A-Za-z\s]+)?)/,
    /([A-Za-z\s]+,\s*[A-Za-z\s]+)/,
    /Address(?::|)\s*([^,\n]+,\s*[^,\n]+(?:,\s*[^,\n]+)?)/i
  ];

  for (const regex of locationRegexes) {
    const locationMatch = cleanText.match(regex);
    if (locationMatch && locationMatch[1].length < 80) { // Avoid matching very long text
      profile.location = locationMatch[1].trim();
      break;
    }
  }

  // Extract professional summary
  profile.professionalSummary = extractSummary(cleanText, sections);

  // Extract skills
  profile.skills = extractSkills(cleanText, sections);

  // Extract education
  profile.education = extractEducation(cleanText, sections);

  // Extract work experience
  profile.workExperience = extractWorkExperience(cleanText, sections);

  // Extract social links
  profile.socialLinks = extractSocialLinks(cleanText);

  // Extract languages
  profile.languages = extractLanguages(cleanText, sections);

  // Extract preferred industries
  profile.jobPreferences.preferredIndustries = extractIndustries(cleanText, sections);

  return profile;
};

/**
 * Split the resume text into sections based on common section headers
 * @param {String} text The resume text
 * @returns {Object} Map of section name to section content
 */
const splitIntoSections = (text) => {
  const sections = {};
  
  // Common section headers in resumes
  const sectionHeaders = [
    'education', 'academic background', 'academic qualification', 'qualification',
    'experience', 'work experience', 'employment history', 'professional experience',
    'skills', 'technical skills', 'core competencies', 'expertise',
    'projects', 'project experience', 'professional projects',
    'summary', 'professional summary', 'profile summary', 'career objective', 'objective',
    'languages', 'language proficiency',
    'certifications', 'certificates', 'professional certifications',
    'awards', 'honors', 'achievements',
    'publications', 'research publications', 'papers',
    'interests', 'hobbies', 'extracurricular activities',
    'references', 'professional references'
  ];
  
  // Create a regex pattern that matches any of the section headers
  const sectionPattern = new RegExp(`^(?:${sectionHeaders.join('|')})\\s*:?\\s*$`, 'im');
  
  // Split the text into lines
  const lines = text.split('\n');
  
  let currentSection = 'header';
  sections[currentSection] = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Check if the line is a section header
    if (sectionPattern.test(line)) {
      // Remove any trailing colon and convert to lowercase for consistency
      currentSection = line.toLowerCase().replace(/:\s*$/, '').trim();
      sections[currentSection] = [];
    } else if (line) {
      // Add the line to the current section
      sections[currentSection].push(line);
    }
  }
  
  return sections;
};

/**
 * Extract professional summary from the resume
 * @param {String} text The full resume text
 * @param {Object} sections The sections of the resume
 * @returns {String} The professional summary
 */
const extractSummary = (text, sections) => {
  // First check if we have a specific summary section
  const summaryKeys = ['summary', 'professional summary', 'profile summary', 'career objective', 'objective'];
  
  for (const key of summaryKeys) {
    if (sections[key] && sections[key].length > 0) {
      return sections[key].join(' ').trim();
    }
  }
  
  // If no specific section, try to find using regex
  const summaryRegex = /(?:Summary|Profile|About Me|Professional Summary|Career Objective)[:\s]*([\s\S]+?)(?=\n\s*\n|\n\s*[A-Z])/i;
  const summaryMatch = text.match(summaryRegex);
  
  if (summaryMatch) {
    return summaryMatch[1].trim();
  }
  
  // If still not found, use the first paragraph after the name and contact info
  // (usually the first 3-5 lines are contact info)
  const lines = text.split('\n');
  let startLine = Math.min(5, Math.floor(lines.length / 4));
  
  // Find the first line with significant text that could be a summary
  for (let i = startLine; i < Math.min(15, lines.length); i++) {
    if (lines[i].length > 30 && !/(?:phone|email|address|linkedin)/i.test(lines[i])) {
      return lines[i].trim();
    }
  }
  
  return '';
};

/**
 * Extract skills from the resume
 * @param {String} text The full resume text
 * @param {Object} sections The sections of the resume
 * @returns {Array} List of skills
 */
const extractSkills = (text, sections) => {
  const skills = new Set();
  
  // First check if we have a specific skills section
  const skillsKeys = ['skills', 'technical skills', 'core competencies', 'expertise'];
  
  for (const key of skillsKeys) {
    if (sections[key] && sections[key].length > 0) {
      // Join the lines and split by common separators
      const skillsText = sections[key].join(' ');
      const extractedSkills = skillsText
        .split(/[,•|\/\n]+/)
        .map(skill => skill.trim())
        .filter(skill => skill.length > 1 && skill.length < 50);
      
      extractedSkills.forEach(skill => skills.add(skill));
    }
  }
  
  // If no specific section or few skills found, try to find using regex
  if (skills.size < 5) {
    const skillsRegex = /(?:Skills|Technical Skills|Core Competencies)[:\s]*([\s\S]+?)(?=\n\s*\n|\n\s*[A-Z])/i;
    const skillsMatch = text.match(skillsRegex);
    
    if (skillsMatch) {
      const skillsText = skillsMatch[1];
      const extractedSkills = skillsText
        .split(/[,•|\/\n]+/)
        .map(skill => skill.trim())
        .filter(skill => skill.length > 1 && skill.length < 50);
      
      extractedSkills.forEach(skill => skills.add(skill));
    }
  }
  
  // If still fewer than 3 skills or no skills found, look for common skill terms throughout the text
  if (skills.size < 3) {
    COMMON_SKILLS.forEach(skill => {
      // Escape special regex characters in the skill name
      const escapedSkill = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`\\b${escapedSkill}\\b`, 'i');
      if (regex.test(text)) {
        // Capitalize first letter of each word
        const formattedSkill = skill.replace(/\b\w/g, match => match.toUpperCase());
        skills.add(formattedSkill);
      }
    });
  }
  
  return Array.from(skills);
};

/**
 * Extract education information from the resume
 * @param {String} text The full resume text
 * @param {Object} sections The sections of the resume
 * @returns {Array} List of education entries
 */
const extractEducation = (text, sections) => {
  const education = [];
  
  // Check if we have a specific education section
  const educationKeys = ['education', 'academic background', 'academic qualification', 'qualification'];
  let educationText = '';
  
  for (const key of educationKeys) {
    if (sections[key] && sections[key].length > 0) {
      educationText = sections[key].join('\n');
      break;
    }
  }
  
  // If no specific section found, try to find using regex
  if (!educationText) {
    const educationRegex = /(?:Education|Academic Background)[:\s]*([\s\S]+?)(?=\n\s*\n|\n\s*[A-Z])/i;
    const educationMatch = text.match(educationRegex);
    
    if (educationMatch) {
      educationText = educationMatch[1];
    }
  }
  
  if (educationText) {
    // Split the education text into possible entries
    // Education entries are often separated by blank lines or start with a year
    const entries = educationText.split(/\n\s*\n|\n(?=\d{4}|\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\b)/i);
    
    for (const entry of entries) {
      if (entry.trim().length < 10) continue; // Skip very short entries
      
      const educationEntry = {
        institution: '',
        degree: '',
        fieldOfStudy: '',
        startDate: '',
        endDate: '',
        currentlyStudying: false,
        description: ''
      };
      
      // Extract institution - usually contains "University", "College", or "School"
      const institutionRegex = /([A-Za-z\s&,']+(?:University|College|School|Institute)[A-Za-z\s&,']*)/i;
      const institutionMatch = entry.match(institutionRegex);
      
      if (institutionMatch) {
        educationEntry.institution = institutionMatch[1].trim();
      } else {
        // Try to find it as the first capitalized line
        const lines = entry.split('\n');
        for (const line of lines) {
          if (/^[A-Z]/.test(line) && line.length > 5 && !educationEntry.institution) {
            educationEntry.institution = line.trim();
            break;
          }
        }
      }
      
      // Extract degree and field of study
      // Look for common degree patterns and fields
      let degreeFound = false;
      
      // Match degrees like "Bachelor of Science in Computer Science"
      const degreeFieldRegex = new RegExp(`(${COMMON_DEGREES.join('|')})\\s+(?:of|in)?\\s+([A-Za-z\\s&,]+)`, 'i');
      const degreeFieldMatch = entry.match(degreeFieldRegex);
      
      if (degreeFieldMatch) {
        educationEntry.degree = degreeFieldMatch[1].trim();
        educationEntry.fieldOfStudy = degreeFieldMatch[2].trim();
        degreeFound = true;
      }
      
      // If no degree found, look for degree abbreviations
      if (!degreeFound) {
        const abbrevRegex = /\b(B\.S\.|B\.A\.|M\.S\.|M\.A\.|Ph\.D\.?|MBA)\b/i;
        const abbrevMatch = entry.match(abbrevRegex);
        
        if (abbrevMatch) {
          educationEntry.degree = abbrevMatch[1].trim();
          
          // Try to find field of study - often follows the degree
          const fieldRegex = /\b(B\.S\.|B\.A\.|M\.S\.|M\.A\.|Ph\.D\.?|MBA)\b\s*(?:in)?\s*([A-Za-z\s&,]+)/i;
          const fieldMatch = entry.match(fieldRegex);
          
          if (fieldMatch && fieldMatch[2]) {
            educationEntry.fieldOfStudy = fieldMatch[2].trim();
          }
          
          degreeFound = true;
        }
      }
      
      // Extract dates
      // Look for patterns like "2015 - 2019" or "Sep 2015 - May 2019"
      const datePatterns = [
        /\b((?:19|20)\d{2})\s*(?:-|to|–)\s*((?:19|20)\d{2}|Present|Current|Now)\b/i,
        /\b((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+(?:19|20)\d{2})\s*(?:-|to|–)\s*((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+(?:19|20)\d{2}|Present|Current|Now)\b/i
      ];
      
      for (const pattern of datePatterns) {
        const dateMatch = entry.match(pattern);
        
        if (dateMatch) {
          educationEntry.startDate = dateMatch[1].trim();
          educationEntry.endDate = dateMatch[2].trim();
          
          if (/present|current|now/i.test(dateMatch[2])) {
            educationEntry.currentlyStudying = true;
            educationEntry.endDate = '';
          }
          
          break;
        }
      }
      
      // Extract description - anything remaining that seems relevant
      const descriptionLines = entry.split('\n')
        .filter(line => 
          !line.includes(educationEntry.institution) && 
          !line.includes(educationEntry.degree) &&
          !line.match(/\b((?:19|20)\d{2})\s*(?:-|to|–)/)
        );
      
      if (descriptionLines.length > 0) {
        educationEntry.description = descriptionLines.join(' ').trim();
      }
      
      // Only add if we have a degree or institution
      if ((educationEntry.degree || educationEntry.institution) && 
          (educationEntry.institution.length > 0 || educationEntry.degree.length > 0)) {
        education.push(educationEntry);
      }
    }
  }
  
  return education;
};

/**
 * Extract work experience information from the resume
 * @param {String} text The full resume text
 * @param {Object} sections The sections of the resume
 * @returns {Array} List of work experience entries
 */
const extractWorkExperience = (text, sections) => {
  const workExperience = [];
  
  // Check if we have a specific experience section
  const experienceKeys = ['experience', 'work experience', 'employment history', 'professional experience'];
  let experienceText = '';
  
  for (const key of experienceKeys) {
    if (sections[key] && sections[key].length > 0) {
      experienceText = sections[key].join('\n');
      break;
    }
  }
  
  // If no specific section found, try to find using regex
  if (!experienceText) {
    const experienceRegex = /(?:Experience|Work Experience|Employment|Professional Experience)[:\s]*([\s\S]+?)(?=\n\s*\n|\n\s*[A-Z])/i;
    const experienceMatch = text.match(experienceRegex);
    
    if (experienceMatch) {
      experienceText = experienceMatch[1];
    }
  }
  
  if (experienceText) {
    // Split the experience text into possible job entries
    // Job entries often start with a company name, a title, or a date
    const jobRegex = /\n(?=[A-Z][a-z]+|\d{4}|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec))/;
    const entries = experienceText.split(jobRegex);
    
    for (const entry of entries) {
      if (entry.trim().length < 15) continue; // Skip very short entries
      
      const experienceEntry = {
        company: '',
        position: '',
        location: '',
        startDate: '',
        endDate: '',
        currentlyWorking: false,
        description: ''
      };
      
      // Try to identify common job titles first
      let titleFound = false;
      for (const title of COMMON_JOB_TITLES) {
        if (entry.toLowerCase().includes(title)) {
          experienceEntry.position = title.replace(/\b\w/g, match => match.toUpperCase());
          titleFound = true;
          break;
        }
      }
      
      // If no common title found, look for patterns
      if (!titleFound) {
        // Look for capitalized titles, often at the beginning or after dates
        const titleRegex = /^([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,4})/m;
        const titleMatch = entry.match(titleRegex);
        
        if (titleMatch) {
          experienceEntry.position = titleMatch[1].trim();
        }
      }
      
      // Extract company name - often follows/precedes the position or follows keywords like "at" or "with"
      const companyPatterns = [
        /(?:at|with|for)\s+([A-Z][A-Za-z\s&,.]+)(?=\s|$|\n)/,
        /([A-Z][A-Za-z\s&,.]+)\s+(?:Company|Inc|LLC|Ltd|Corporation|Corp|Group)/i,
        /^([A-Z][A-Za-z\s&,.]+)(?=\s|$|\n)/m
      ];
      
      for (const pattern of companyPatterns) {
        const companyMatch = entry.match(pattern);
        
        if (companyMatch && companyMatch[1] && companyMatch[1].length < 50) {
          experienceEntry.company = companyMatch[1].trim();
          break;
        }
      }
      
      // Extract location - often in parentheses or after company
      const locationPatterns = [
        /\(([A-Za-z\s,]+(?:City|Town|County))\)/i,
        /\(([A-Za-z\s,]+,\s*[A-Z]{2})\)/,
        /\(([A-Za-z\s,]+)\)/,
        /([A-Za-z\s,]+,\s*[A-Z]{2})/
      ];
      
      for (const pattern of locationPatterns) {
        const locationMatch = entry.match(pattern);
        
        if (locationMatch && locationMatch[1] && locationMatch[1].length < 50) {
          experienceEntry.location = locationMatch[1].trim();
          break;
        }
      }
      
      // Extract dates - similar to education dates
      const datePatterns = [
        /\b((?:19|20)\d{2})\s*(?:-|to|–)\s*((?:19|20)\d{2}|Present|Current|Now)\b/i,
        /\b((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+(?:19|20)\d{2})\s*(?:-|to|–)\s*((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+(?:19|20)\d{2}|Present|Current|Now)\b/i
      ];
      
      for (const pattern of datePatterns) {
        const dateMatch = entry.match(pattern);
        
        if (dateMatch) {
          experienceEntry.startDate = dateMatch[1].trim();
          experienceEntry.endDate = dateMatch[2].trim();
          
          if (/present|current|now/i.test(dateMatch[2])) {
            experienceEntry.currentlyWorking = true;
            experienceEntry.endDate = '';
          }
          
          break;
        }
      }
      
      // Extract description - everything else that's relevant
      // Split by lines and filter out lines with already extracted information
      const descLines = entry.split('\n')
        .filter(line => 
          !line.includes(experienceEntry.position) && 
          !line.includes(experienceEntry.company) &&
          !line.match(/\b((?:19|20)\d{2})\s*(?:-|to|–)/) &&
          line.trim().length > 0
        );
      
      if (descLines.length > 0) {
        // Filter bullet points and other description indicators
        const cleanDescLines = descLines.map(line => 
          line.replace(/^[\s•\-–—*•]+/, '').trim()
        ).filter(Boolean);
        
        if (cleanDescLines.length > 0) {
          experienceEntry.description = cleanDescLines.join('\n');
        }
      }
      
      // Only add if we have at least position or company
      if ((experienceEntry.position || experienceEntry.company) && 
          (experienceEntry.position.length > 0 || experienceEntry.company.length > 0)) {
        workExperience.push(experienceEntry);
      }
    }
  }
  
  return workExperience;
};

/**
 * Extract social links from the resume
 * @param {String} text The full resume text
 * @returns {Object} Social links object
 */
const extractSocialLinks = (text) => {
  const socialLinks = {
    linkedin: '',
    github: '',
    portfolio: ''
  };
  
  // Extract LinkedIn profile
  const linkedinPatterns = [
    /linkedin\.com\/in\/([A-Za-z0-9_-]+)/i,
    /linkedin\s*:\s*(https?:\/\/(?:www\.)?linkedin\.com\/in\/[A-Za-z0-9_-]+)/i
  ];
  
  for (const pattern of linkedinPatterns) {
    const linkedinMatch = text.match(pattern);
    if (linkedinMatch) {
      socialLinks.linkedin = linkedinMatch[1].includes('linkedin.com') 
        ? linkedinMatch[1] 
        : `https://linkedin.com/in/${linkedinMatch[1]}`;
      break;
    }
  }
  
  // Extract GitHub profile
  const githubPatterns = [
    /github\.com\/([A-Za-z0-9_-]+)/i,
    /github\s*:\s*(https?:\/\/(?:www\.)?github\.com\/[A-Za-z0-9_-]+)/i
  ];
  
  for (const pattern of githubPatterns) {
    const githubMatch = text.match(pattern);
    if (githubMatch) {
      socialLinks.github = githubMatch[1].includes('github.com') 
        ? githubMatch[1] 
        : `https://github.com/${githubMatch[1]}`;
      break;
    }
  }
  
  // Extract portfolio website
  const portfolioPatterns = [
    /portfolio\s*:\s*(https?:\/\/[A-Za-z0-9_.-]+\.[A-Za-z]{2,}(?:\/[A-Za-z0-9_.-]*)*)/i,
    /website\s*:\s*(https?:\/\/[A-Za-z0-9_.-]+\.[A-Za-z]{2,}(?:\/[A-Za-z0-9_.-]*)*)/i,
    /personal\s*site\s*:\s*(https?:\/\/[A-Za-z0-9_.-]+\.[A-Za-z]{2,}(?:\/[A-Za-z0-9_.-]*)*)/i
  ];
  
  for (const pattern of portfolioPatterns) {
    const portfolioMatch = text.match(pattern);
    if (portfolioMatch) {
      socialLinks.portfolio = portfolioMatch[1];
      break;
    }
  }
  
  return socialLinks;
};

/**
 * Extract languages from the resume
 * @param {String} text The full resume text
 * @param {Object} sections The sections of the resume
 * @returns {Array} List of language objects
 */
const extractLanguages = (text, sections) => {
  const languages = [];
  
  // Check if we have a specific languages section
  const languageKeys = ['languages', 'language proficiency'];
  let languageText = '';
  
  for (const key of languageKeys) {
    if (sections[key] && sections[key].length > 0) {
      languageText = sections[key].join('\n');
      break;
    }
  }
  
  // If no specific section found, try to find using regex
  if (!languageText) {
    const languageRegex = /(?:Languages|Language Proficiency)[:\s]*([\s\S]+?)(?=\n\s*\n|\n\s*[A-Z])/i;
    const languageMatch = text.match(languageRegex);
    
    if (languageMatch) {
      languageText = languageMatch[1];
    }
  }
  
  if (languageText) {
    // Common languages
    const commonLanguages = [
      'English', 'Spanish', 'French', 'German', 'Chinese', 'Japanese', 'Korean',
      'Russian', 'Arabic', 'Hindi', 'Portuguese', 'Italian', 'Dutch', 'Swedish',
      'Polish', 'Turkish', 'Vietnamese', 'Thai', 'Indonesian', 'Malay', 'Greek'
    ];
    
    // Check for common languages in the text
    for (const language of commonLanguages) {
      if (new RegExp(`\\b${language}\\b`, 'i').test(languageText)) {
        // Try to extract proficiency level
        const proficiencyRegex = new RegExp(`${language}[:\\s-]*(Native|Fluent|Advanced|Intermediate|Beginner|Basic|Elementary|Professional|Working|Limited)`, 'i');
        const proficiencyMatch = languageText.match(proficiencyRegex);
        
        const langObj = {
          language,
          proficiency: 'Intermediate' // Default
        };
        
        if (proficiencyMatch) {
          langObj.proficiency = determineProficiency(proficiencyMatch[1]);
        }
        
        languages.push(langObj);
      }
    }
    
    // If still no languages found, try splitting the text and extracting language names
    if (languages.length === 0) {
      const langEntries = languageText.split(/[,;\n]/);
      
      for (const entry of langEntries) {
        if (entry.trim().length < 3) continue;
        
        // Look for language: proficiency pattern
        const langProfRegex = /([A-Za-z]+)\s*(?::|-)?\s*(Native|Fluent|Advanced|Intermediate|Beginner|Basic|Elementary|Professional|Working|Limited)?/i;
        const langProfMatch = entry.match(langProfRegex);
        
        if (langProfMatch) {
          const language = langProfMatch[1].trim();
          const proficiency = langProfMatch[2] ? determineProficiency(langProfMatch[2]) : 'Intermediate';
          
          languages.push({
            language,
            proficiency
          });
        } else if (entry.trim().length < 20) {
          // If just a language name with no proficiency
          languages.push({
            language: entry.trim(),
            proficiency: 'Intermediate'
          });
        }
      }
    }
  }
  
  return languages;
};

/**
 * Extract preferred industries from the resume
 * @param {String} text The full resume text
 * @param {Object} sections The sections of the resume
 * @returns {Array} List of preferred industries
 */
const extractIndustries = (text, sections) => {
  const industries = new Set();
  
  // Check if we have sections that might mention industries
  const interestKeys = ['interests', 'objective', 'summary', 'professional summary'];
  
  for (const key of interestKeys) {
    if (sections[key] && sections[key].length > 0) {
      const sectionText = sections[key].join(' ');
      
      // Check for common industries
      for (const industry of COMMON_INDUSTRIES) {
        if (new RegExp(`\\b${industry}\\b`, 'i').test(sectionText)) {
          // Capitalize first letter of each word
          const formattedIndustry = industry.replace(/\b\w/g, match => match.toUpperCase());
          industries.add(formattedIndustry);
        }
      }
    }
  }
  
  // Also check the entire text for industry mentions, but limit to 5 top industries
  if (industries.size < 3) {
    const industryCounts = {};
    
    for (const industry of COMMON_INDUSTRIES) {
      const regex = new RegExp(`\\b${industry}\\b`, 'gi');
      const matches = text.match(regex);
      
      if (matches) {
        industryCounts[industry] = matches.length;
      }
    }
    
    // Sort industries by frequency
    const sortedIndustries = Object.keys(industryCounts)
      .sort((a, b) => industryCounts[b] - industryCounts[a])
      .slice(0, 5 - industries.size);
    
    // Add top industries to the set
    for (const industry of sortedIndustries) {
      // Capitalize first letter of each word
      const formattedIndustry = industry.replace(/\b\w/g, match => match.toUpperCase());
      industries.add(formattedIndustry);
    }
  }
  
  return Array.from(industries);
};

/**
 * Determine standardized proficiency level from various terms
 * @param {String} term The proficiency term from the resume
 * @returns {String} Standardized proficiency level
 */
const determineProficiency = (term) => {
  const term_lower = term ? term.toLowerCase() : '';
  
  if (term_lower.includes('native') || term_lower.includes('mother') || term_lower.includes('bilingual')) {
    return 'Native';
  } else if (term_lower.includes('fluent') || term_lower.includes('full') || term_lower.includes('professional')) {
    return 'Fluent';
  } else if (term_lower.includes('advanced') || term_lower.includes('proficient') || term_lower.includes('business')) {
    return 'Advanced';
  } else if (term_lower.includes('intermediate') || term_lower.includes('working') || term_lower.includes('conversational')) {
    return 'Intermediate';
  } else if (term_lower.includes('basic') || term_lower.includes('beginner') || term_lower.includes('elementary') || term_lower.includes('limited')) {
    return 'Beginner';
  }
  
  return 'Intermediate'; // Default
};
