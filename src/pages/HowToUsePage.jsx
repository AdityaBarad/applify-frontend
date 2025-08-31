import React from 'react';

const HowToUsePage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">How to Use Applify</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-2xl font-semibold mb-4">Getting Started</h2>
        <p className="mb-4">Welcome to our LinkedIn automation platform! Follow these steps to make the most of our features:</p>
        
        <ol className="list-decimal list-inside space-y-3 ml-4 mb-6">
          <li>Complete your profile setup from the <strong>Profile</strong> section</li>
          <li>Upload your resume in the <strong>Resume</strong> section</li>
          <li>Configure your job search preferences in the <strong>Automate</strong> section</li>
        </ol>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-2xl font-semibold mb-4">Automation Features</h2>
        <p className="mb-4">Our platform offers the following automation capabilities:</p>
        
        <div className="space-y-4">
          <div className="border-l-4 border-blue-500 pl-4">
            <h3 className="font-bold text-lg">Job Search Automation</h3>
            <p>Configure search criteria and let our system find matching positions</p>
          </div>
          
          <div className="border-l-4 border-green-500 pl-4">
            <h3 className="font-bold text-lg">Application Automation</h3>
            <p>Automatically apply to jobs that match your criteria</p>
          </div>
          
          <div className="border-l-4 border-purple-500 pl-4">
            <h3 className="font-bold text-lg">Network Expansion</h3>
            <p>Connect with relevant professionals in your target industry</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold mb-4">Managing Your Applications</h2>
        <p className="mb-4">Use the <strong>Manage</strong> section to:</p>
        
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>Track the status of your applications</li>
          <li>Review upcoming interview schedules</li>
          <li>Manage your connection requests</li>
          <li>View analytics on your job search progress</li>
        </ul>
        
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-bold text-lg text-blue-700">Need Help?</h3>
          <p>If you have any questions or need assistance, please contact our Applify support team at support@applify.com</p>
        </div>
      </div>
    </div>
  );
};

export default HowToUsePage;
