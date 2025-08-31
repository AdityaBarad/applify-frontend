import { useState, useEffect } from 'react';
import { FiRefreshCw, FiExternalLink, FiCalendar, FiSearch, FiChevronLeft, FiChevronRight, FiInfo } from 'react-icons/fi';
import axios from 'axios';
import { format, parseISO, isValid } from 'date-fns';

// Mock data to use as fallback when all proxies fail
const MOCK_TELEGRAM_DATA = [
	{
		id: 'mock1',
		message: 'Looking for a <b>Frontend Developer</b> with 2+ years experience in React. Remote position available. Apply at: <a href="https://example.com/jobs">example.com/jobs</a>',
		date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
		link: 'https://t.me/goyalarsh/123',
		rawText: 'Looking for a Frontend Developer with 2+ years experience in React. Remote position available. Apply at: example.com/jobs'
	},
	{
		id: 'mock2',
		message: '🔥 <b>Software Engineering Internship</b> at Google open for applications! 3-month paid internship for students. Last date to apply: June 15. Details: <a href="https://careers.google.com/internships">careers.google.com/internships</a>',
		date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
		link: 'https://t.me/goyalarsh/124',
		rawText: 'Software Engineering Internship at Google open for applications! 3-month paid internship for students. Last date to apply: June 15. Details: careers.google.com/internships'
	},
	{
		id: 'mock3',
		message: 'Job Alert: <b>Data Scientist</b> position at Amazon. 0-2 yrs experience, location: Bangalore. Apply by June 10. <a href="https://amazon.jobs">amazon.jobs</a>',
		date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
		link: 'https://t.me/goyalarsh/125',
		rawText: 'Job Alert: Data Scientist position at Amazon. 0-2 yrs experience, location: Bangalore. Apply by June 10. amazon.jobs'
	}
];

function TelegramOpportunitiesPage() {
	const [messages, setMessages] = useState([]);
	const [filteredMessages, setFilteredMessages] = useState([]);
	const [displayedMessages, setDisplayedMessages] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [searchTerm, setSearchTerm] = useState('');
	const [refreshing, setRefreshing] = useState(false);
	
	// Pagination states
	const [currentPage, setCurrentPage] = useState(1);
	const [itemsPerPage, setItemsPerPage] = useState(5);
	const [totalPages, setTotalPages] = useState(1);

	// Helper function to determine if a message contains job-related content
	const isJobOpportunity = (text) => {
		// Keywords that indicate job opportunities
		const jobKeywords = [
			'job', 'hiring', 'career', 'opportunity', 'position', 'vacancy', 'opening',
			'recruitment', 'apply', 'application', 'internship', 'intern', 'employment',
			'work', 'role', 'jobs', 'openings', 'full-time', 'part-time', 'freelance',
			'remote', 'hybrid', 'on-site', 'on site', 'onsite', 'stipend', 'salary',
			'compensation', 'package', 'ctc', 'lpa', 'per annum', 'per month',
			'experience', 'fresher', 'qualification', 'skill', 'requirement',
			'responsibi', 'location', 'deadline', 'interview', 'graduate', 'undergrad',
			'resume', 'cv', 'placement', 'recruit', 'talent', 'candidate'
		];

		// Convert text to lowercase for case-insensitive matching
		const lowerText = text.toLowerCase();
		
		// Check if the message contains any job keywords
		return jobKeywords.some(keyword => lowerText.includes(keyword.toLowerCase()));
	};

	const fetchTelegramMessages = async () => {
		setRefreshing(true);
		setLoading(true);
		
		// Array of CORS proxies to try in order
		const corsProxies = [
			(url) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
			(url) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
			(url) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
			(url) => `https://cors-anywhere.herokuapp.com/${url}`
		];
		
		const timestamp = new Date().getTime();
		const targetUrl = `https://t.me/s/goyalarsh?nocache=${timestamp}`;
		
		let success = false;
		
		for (let i = 0; i < corsProxies.length && !success; i++) {
			try {
				const proxyUrl = corsProxies[i](targetUrl);
				console.log(`Trying proxy ${i+1}/${corsProxies.length}: ${proxyUrl}`);
				
				const response = await axios.get(proxyUrl, { timeout: 10000 }); // 10 second timeout
				
				// Parse the HTML response to extract messages
				const parser = new DOMParser();
				const doc = parser.parseFromString(response.data, 'text/html');
				
				// Find message containers
				const messageElements = doc.querySelectorAll('.tgme_widget_message');
				console.log(`Found ${messageElements.length} messages in the channel`);
				
				if (messageElements.length === 0) {
					console.log('No message elements found, trying next proxy...');
					continue;
				}
				
				// Convert NodeList to Array and reverse it to get newest messages first
				const messagesArray = Array.from(messageElements).reverse();
				
				const parsedMessages = messagesArray.map((element, index) => {
					// Get message text
					const messageText = element.querySelector('.tgme_widget_message_text')?.innerHTML || '';
					
					// Get raw text for filtering and searching
					const rawText = element.querySelector('.tgme_widget_message_text')?.textContent || '';
					
					// Get message date
					const dateElement = element.querySelector('.tgme_widget_message_date');
					const dateTimeAttribute = dateElement?.getAttribute('datetime') || new Date().toISOString();
					
					// For debugging
					console.log(`Message ${index} date: ${dateTimeAttribute}`);
					
					// Get message link
					const messageLink = dateElement?.href || `https://t.me/goyalarsh/${index}`;
					
					// Get message ID
					const messageId = messageLink.split('/').pop() || index;
					
					return {
						id: messageId,
						message: messageText,
						date: dateTimeAttribute,
						link: messageLink,
						rawText: rawText,
						displayIndex: index
					};
				});
				
				console.log(`Successfully parsed ${parsedMessages.length} messages`);
				
				// Set all messages and apply search filter
				setMessages(parsedMessages);
				const filtered = searchTerm === '' 
					? parsedMessages 
					: parsedMessages.filter(msg => msg.rawText.toLowerCase().includes(searchTerm.toLowerCase()));
					
				setFilteredMessages(filtered);
				setTotalPages(Math.ceil(filtered.length / itemsPerPage));
				setCurrentPage(1);
				setError(null);
				
				success = true;
				break;
				
			} catch (err) {
				console.error(`Error with proxy ${i+1}:`, err);
				// Continue to the next proxy
			}
		}
		
		if (!success) {
			console.log('All proxies failed, using mock data');
			// If all proxies failed, use mock data as fallback
			setMessages(MOCK_TELEGRAM_DATA);
			
			const filtered = searchTerm === '' 
				? MOCK_TELEGRAM_DATA 
				: MOCK_TELEGRAM_DATA.filter(msg => msg.rawText.toLowerCase().includes(searchTerm.toLowerCase()));
				
			setFilteredMessages(filtered);
			setTotalPages(Math.ceil(filtered.length / itemsPerPage));
			setCurrentPage(1);
			
			setError('Could not connect to Telegram. Showing example data instead.');
		}
		
		setLoading(false);
		setRefreshing(false);
	};

	useEffect(() => {
		fetchTelegramMessages();
	}, []);

	// Update the existing filtering effect to only filter by search term, not by date
	useEffect(() => {
		if (messages.length > 0) {
			// Only apply search filter
			const filtered = searchTerm === '' 
				? messages 
				: messages.filter(msg => msg.rawText.toLowerCase().includes(searchTerm.toLowerCase()));
			
			setFilteredMessages(filtered);
			setTotalPages(Math.ceil(filtered.length / itemsPerPage));
			setCurrentPage(1);
		}
	}, [messages, searchTerm, itemsPerPage]);

	// Update displayed messages when page changes or filtered messages change
	useEffect(() => {
		if (filteredMessages.length > 0) {
			const startIndex = (currentPage - 1) * itemsPerPage;
			const endIndex = startIndex + itemsPerPage;
			setDisplayedMessages(filteredMessages.slice(startIndex, endIndex));
		} else {
			setDisplayedMessages([]);
		}
	}, [filteredMessages, currentPage, itemsPerPage]);
	
	// Handle page change
	const handlePageChange = (page) => {
		// Don't go below 1 or above totalPages
		const newPage = Math.max(1, Math.min(page, totalPages));
		setCurrentPage(newPage);
	};

	// Generate page numbers for pagination
	const getPageNumbers = () => {
		const pages = [];
		const maxPagesToShow = 5;
		
		// If we have a small number of pages, show all
		if (totalPages <= maxPagesToShow) {
			for (let i = 1; i <= totalPages; i++) {
				pages.push(i);
			}
			return pages;
		}
		
		// Complex pagination logic for large number of pages
		let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
		let endPage = startPage + maxPagesToShow - 1;
		
		if (endPage > totalPages) {
			endPage = totalPages;
			startPage = Math.max(1, endPage - maxPagesToShow + 1);
		}
		
		for (let i = startPage; i <= endPage; i++) {
			pages.push(i);
		}
		
		return pages;
	};

	// Extract companies, roles, etc. from message text for tags
	const extractTags = (message) => {
		const tags = [];
		const text = message.rawText || '';

		if (text.toLowerCase().includes('internship')) {
			tags.push({ label: 'Internship', color: 'bg-green-100 text-green-800' });
		}

		if (text.toLowerCase().includes('job') || text.toLowerCase().includes('hiring') || text.toLowerCase().includes('vacancy')) {
			tags.push({ label: 'Job', color: 'bg-blue-100 text-blue-800' });
		}

		if (text.toLowerCase().includes('hackathon')) {
			tags.push({ label: 'Hackathon', color: 'bg-purple-100 text-purple-800' });
		}

		if (text.toLowerCase().includes('scholarship')) {
			tags.push({ label: 'Scholarship', color: 'bg-yellow-100 text-yellow-800' });
		}
		
		if (text.toLowerCase().includes('contest') || text.toLowerCase().includes('competition')) {
			tags.push({ label: 'Contest', color: 'bg-orange-100 text-orange-800' });
		}

		// Find company names (expanded implementation)
		const companies = [
			'Google', 'Microsoft', 'Amazon', 'Facebook', 'Apple', 'IBM', 'Walmart', 
			'JPMorgan', 'Goldman Sachs', 'Adobe', 'Infosys', 'TCS', 'Wipro', 
			'Accenture', 'Deloitte', 'KPMG', 'EY', 'PwC', 'Netflix', 'Twitter',
			'LinkedIn', 'Uber', 'Airbnb', 'Tesla', 'Intel', 'AMD', 'Nvidia'
		];
		
		companies.forEach((company) => {
			if (text.includes(company)) {
				tags.push({ label: company, color: 'bg-gray-100 text-gray-800' });
			}
		});

		return tags;
	};

	// Try to extract application link from message
	const extractApplicationLink = (message) => {
		const text = message.rawText || '';
		const urlMatches = text.match(/(https?:\/\/[^\s]+)/g);
		
		if (!urlMatches) return null;
		
		// Try to find application-related links first
		const applyLinks = urlMatches.filter(url => 
			url.toLowerCase().includes('apply') || 
			url.toLowerCase().includes('career') || 
			url.toLowerCase().includes('job') ||
			url.toLowerCase().includes('registration')
		);
		
		return applyLinks.length > 0 ? applyLinks[0] : urlMatches[0];
	};

	// Refresh the data
	const handleRefresh = () => {
		fetchTelegramMessages();
	};

	// Format relative time (e.g., "2 days ago")
	const formatRelativeTime = (dateString) => {
		try {
			const date = parseISO(dateString);
			const now = new Date();
			const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
			const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
			
			if (diffInDays > 0) {
				return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`;
			} else if (diffInHours > 0) {
				return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
			} else {
				return 'Just now';
			}
		} catch (error) {
			return 'Unknown date';
		}
	};

	return (
		<div className="bg-white rounded-lg shadow-sm border border-gray-200">
			<div className="p-4 sm:p-6 border-b border-gray-200">
				<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
					<div>
						<h1 className="text-xl font-semibold text-gray-900">Latest Opportunities</h1>
						<p className="text-sm text-gray-500 mt-1">
							Recent job opportunities from @goyalarsh Telegram channel
							{filteredMessages.length > 0 && ` (${filteredMessages.length} results)`}
						</p>
					</div>

					<div className="flex items-center gap-2">
						<div className="relative">
							<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
								<FiSearch className="text-gray-400" size={16} />
							</div>
							<input
								type="text"
								placeholder="Search opportunities..."
								className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 w-full sm:w-64"
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
							/>
						</div>
						<button
							onClick={handleRefresh}
							disabled={refreshing}
							className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
						>
							<FiRefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
							<span className="hidden sm:inline">Refresh</span>
						</button>
					</div>
				</div>
				
				{/* Add info alert about Telegram's limitations */}
				<div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-lg flex items-start">
					<FiInfo className="text-blue-500 mt-0.5 mr-2 flex-shrink-0" size={16} />
					<div className="text-sm text-blue-700">
						<p>
							Telegram only provides the most recent messages (usually from the last 7 days).
							For older opportunities, please visit the <a 
								href="https://t.me/goyalarsh" 
								target="_blank" 
								rel="noopener noreferrer"
								className="text-blue-600 underline hover:text-blue-800"
							>original Telegram channel</a>.
						</p>
						{error && error.includes('mock data') && (
							<p className="mt-2 font-medium">
								Note: Currently showing example data due to connection issues.
							</p>
						)}
					</div>
				</div>
			</div>

			<div className="p-4 sm:p-6">
				{loading ? (
					<div className="flex justify-center items-center py-12">
						<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
					</div>
				) : error ? (
					<div className="text-center py-8">
						<p className="text-red-500 mb-4">{error}</p>
						<button
							onClick={handleRefresh}
							className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
						>
							Try Again
						</button>
					</div>
				) : filteredMessages.length === 0 && !loading && !error ? (
					<div className="text-center py-12">
						<p className="text-gray-500 mb-2">No opportunities found in the last 30 days.</p>
						<p className="text-gray-400 text-sm mb-4">Try adjusting your search or check back later.</p>
						
						{/* Add alternative view to see all messages regardless of filters */}
						{messages.length > 0 && (
							<button
								onClick={() => {
									// Show all messages from the channel without job filtering
									setFilteredMessages(messages);
									setTotalPages(Math.ceil(messages.length / itemsPerPage));
									setCurrentPage(1);
								}}
								className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 text-sm"
							>
								Show All Channel Messages
							</button>
						)}
					</div>
				) : (
					<>
						<div className="space-y-6">
							{displayedMessages.map((msg) => (
								<div key={msg.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
									<div className="flex items-start justify-between mb-3">
										<div className="flex flex-wrap gap-2">
											{extractTags(msg).map((tag, idx) => (
												<span key={idx} className={`text-xs px-2 py-1 rounded-full ${tag.color}`}>
													{tag.label}
												</span>
											))}
										</div>
										<div className="flex items-center text-xs text-gray-500">
											<FiCalendar size={14} className="mr-1" />
											<span title={format(parseISO(msg.date), 'MMM dd, yyyy, h:mm a')}>
												{formatRelativeTime(msg.date)}
											</span>
										</div>
									</div>

									<div
										className="prose prose-sm max-w-none mb-3"
										dangerouslySetInnerHTML={{ __html: msg.message }}
									/>

									<div className="flex justify-between items-center mt-4">
										<a
											href={msg.link}
											target="_blank"
											rel="noopener noreferrer"
											className="text-xs text-primary-600 hover:text-primary-800 flex items-center"
										>
											View on Telegram <FiExternalLink size={12} className="ml-1" />
										</a>

										{/* Extract application link if present */}
										{extractApplicationLink(msg) && (
											<a
												href={extractApplicationLink(msg)}
												target="_blank"
												rel="noopener noreferrer"
												className="text-xs bg-primary-500 hover:bg-primary-600 text-white px-3 py-1 rounded-full"
											>
												Apply Now
											</a>
										)}
									</div>
								</div>
							))}
						</div>
						
						{/* Pagination controls */}
						{totalPages > 1 && (
							<div className="flex items-center justify-between mt-8 border-t border-gray-200 pt-4">
								<div className="flex items-center text-sm text-gray-500">
									Showing {Math.min(filteredMessages.length, (currentPage - 1) * itemsPerPage + 1)} - {Math.min(filteredMessages.length, currentPage * itemsPerPage)} of {filteredMessages.length} opportunities
								</div>
								
								<div className="flex items-center space-x-1">
									<button
										onClick={() => handlePageChange(currentPage - 1)}
										disabled={currentPage === 1}
										className="p-2 rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
										aria-label="Previous page"
									>
										<FiChevronLeft size={16} />
									</button>
									
									{getPageNumbers().map(page => (
										<button
											key={page}
											onClick={() => handlePageChange(page)}
											className={`w-8 h-8 rounded-md border ${
												currentPage === page 
													? 'bg-primary-100 border-primary-500 text-primary-700 font-medium' 
													: 'border-gray-300 hover:bg-gray-100'
											}`}
										>
											{page}
										</button>
									))}
									
									<button
										onClick={() => handlePageChange(currentPage + 1)}
										disabled={currentPage === totalPages}
										className="p-2 rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
										aria-label="Next page"
									>
										<FiChevronRight size={16} />
									</button>
								</div>
								
								<div className="flex items-center space-x-2">
									<span className="text-sm text-gray-500">Items per page:</span>
									<select
										value={itemsPerPage}
										onChange={(e) => setItemsPerPage(Number(e.target.value))}
										className="border border-gray-300 rounded-md text-sm py-1 px-2"
									>
										<option value={5}>5</option>
										<option value={10}>10</option>
										<option value={20}>20</option>
									</select>
								</div>
							</div>
						)}
					</>
				)}
			</div>

			<div className="p-4 sm:px-6 border-t border-gray-200 text-center">
				<p className="text-xs text-gray-500">
					{error && error.includes('mock data') 
						? 'Displaying example data. Please try refreshing later.'
						: 'Showing all available opportunities from the @goyalarsh Telegram channel.'}
					<br />Due to Telegram's limitations, only the most recent messages are available.
				</p>
				<p className="text-xs text-gray-400 mt-1">Last updated: {format(new Date(), 'MMM dd, yyyy, h:mm a')}</p>
			</div>
		</div>
	);
}

export default TelegramOpportunitiesPage;

