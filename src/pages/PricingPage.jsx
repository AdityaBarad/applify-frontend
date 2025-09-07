import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCheck, FiLoader, FiX } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { subscriptionService } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

// API base URL from environment
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

// Hardcoded Razorpay test key - replace with your actual test key
const RAZORPAY_KEY_ID = 'rzp_test_RA1f8hC8x7h1jI';

function PricingPage() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [showOrderSummary, setShowOrderSummary] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const { user, subscription, subscribeToPlan, getUserProfile } = useAuth();
  const [profile, setProfile] = useState(null);
  // Fetch user profile for phone number
  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        try {
          const prof = await getUserProfile();
          setProfile(prof);
        } catch (e) {
          setProfile(null);
        }
      } else {
        setProfile(null);
      }
    };
    fetchProfile();
  }, [user]);
  const navigate = useNavigate();

  // Load Razorpay SDK
  useEffect(() => {
    const loadRazorpayScript = () => {
      return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
      });
    };

    loadRazorpayScript();
  }, []);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const data = await subscriptionService.getSubscriptionPlans();
        setPlans(data);
      } catch (error) {
        console.error('Error fetching plans:', error);
        toast.error('Failed to load subscription plans');
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  const handleSubscribe = (planId) => {
    if (!user) {
      toast.error('Please login to subscribe');
      navigate('/login', { state: { returnTo: '/pricing' } });
      return;
    }

    const plan = plans.find(p => p.id === planId);
    setSelectedPlan(plan);
    setSelectedPlanId(planId);
    setShowOrderSummary(true);
  };

  const handleProceedToPayment = async () => {
    setSubscribing(true);
    
    try {
      if (!window.Razorpay) {
        toast.error("Razorpay SDK failed to load. Please try again later.");
        setSubscribing(false);
        return;
      }

      // Create order on the server
      const response = await axios.post(`${API_BASE_URL}/create-order`, {
        planId: selectedPlanId,
        userId: user.id,
        amount: selectedPlan.price,
        planName: selectedPlan.name
      });

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to create order');
      }

      const { order } = response.data;

      // Configure Razorpay payment
      const options = {
        key: RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "Job Application Assistant",
        description: `Subscription to ${selectedPlan.name} Plan`,
        order_id: order.id,
        handler: async function(response) {
          try {
            console.log("Payment successful: ", response);
            
            // Add notes to the response object for verification
            const verificationPayload = {
              ...response,
              notes: {
                userId: user.id,
                planId: selectedPlanId,
                planName: selectedPlan.name,
                amount: selectedPlan.price
              }
            };
            
            console.log("Sending verification payload:", verificationPayload);
            
            // Verify payment
            const paymentVerification = await axios.post(`${API_BASE_URL}/verify-payment`, verificationPayload);

            if (paymentVerification.data.success) {
              toast.success('Payment successful! Your subscription is now active.');
              setShowOrderSummary(false);
              
              // Update local auth context
              await subscribeToPlan(selectedPlanId);
              
              navigate('/dashboard');
            } else {
              toast.error(paymentVerification.data.message || 'Payment verification failed. Please contact support.');
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            const errorMsg = error.response?.data?.message || 'Error verifying payment. Please contact support.';
            toast.error(errorMsg);
            setSubscribing(false);
          }
        },
        prefill: {
          name: user.user_metadata?.full_name || user.email,
          email: user.email,
          contact: profile?.phone || user.user_metadata?.phone || ""
        },
        notes: {
          userId: user.id,
          planId: selectedPlanId,
          planName: selectedPlan.name,
          amount: selectedPlan.price
        },
        theme: {
          color: "#3B82F6" // Blue color matching your UI
        },
        modal: {
          ondismiss: function() {
            setSubscribing(false);
            toast.error('Payment cancelled. You can try again when ready.');
          }
        }
      };

      // Initialize Razorpay
      const rzp = new window.Razorpay(options);
      rzp.open();
      
    } catch (error) {
      console.error('Error processing payment:', error);
      toast.error(error.message || 'Error processing payment. Please try again.');
      setSubscribing(false);
    }
  };

  // Check if user has active subscription for this plan
  const isCurrentPlan = (planId) => {
    return subscription && subscription.plan_id === planId;
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const isPopular = (plan) => {
    return plan.name === 'Standard';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <FiLoader className="animate-spin text-blue-600 text-2xl" />
          <span className="text-gray-700">Loading plans...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Order Summary Modal */}
      {showOrderSummary && selectedPlan && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md p-6 mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Order Summary</h2>
              <button 
                onClick={() => setShowOrderSummary(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FiX className="h-6 w-6" />
              </button>
            </div>
            
            <div className="border-t border-b py-4 my-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">{selectedPlan.name} Plan</h3>
              <p className="text-gray-600 mb-2">{selectedPlan.description}</p>
              
              <div className="flex justify-between mt-4">
                <span className="text-gray-700">Monthly fee</span>
                <span className="font-medium">₹{selectedPlan.price}</span>
              </div>
              
              <div className="flex justify-between mt-2">
                <span className="text-gray-700">Monthly job limit</span>
                <span className="font-medium">{selectedPlan.monthly_limit} jobs</span>
              </div>

              <div className="mt-4 bg-blue-50 p-3 rounded-md">
                <h4 className="text-sm font-medium text-blue-800">What you'll get:</h4>
                <ul className="mt-2 space-y-2">
                  <li className="flex items-start">
                    <FiCheck className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="ml-2 text-sm text-gray-700">Up to {selectedPlan.monthly_limit} job applications per month</span>
                  </li>
                  <li className="flex items-start">
                    <FiCheck className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="ml-2 text-sm text-gray-700">Access to all job platforms</span>
                  </li>
                  {(selectedPlan.name === 'Standard' || selectedPlan.name === 'Premium') && (
                    <li className="flex items-start">
                      <FiCheck className="h-5 w-5 text-green-500 flex-shrink-0" />
                      <span className="ml-2 text-sm text-gray-700">Priority support</span>
                    </li>
                  )}
                  {selectedPlan.name === 'Premium' && (
                    <li className="flex items-start">
                      <FiCheck className="h-5 w-5 text-green-500 flex-shrink-0" />
                      <span className="ml-2 text-sm text-gray-700">Advanced filtering options</span>
                    </li>
                  )}
                </ul>
              </div>
            </div>
            
            <div className="flex justify-between text-lg font-bold mb-6">
              <span>Total</span>
              <span>₹{selectedPlan.price}/month</span>
            </div>
            
            <button
              onClick={handleProceedToPayment}
              disabled={subscribing}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              {subscribing ? (
                <div className="flex items-center justify-center">
                  <FiLoader className="animate-spin mr-2" />
                  Processing Payment...
                </div>
              ) : (
                'Proceed to Payment'
              )}
            </button>
            
            <p className="text-xs text-gray-500 text-center mt-4">
              By proceeding, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </div>
      )}

  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Plans & Pricings
          </h1>

          
          {/* Show current subscription info if user has one */}
          {subscription && (
            <div className="mt-6 inline-block bg-blue-100 border border-blue-200 rounded-lg px-6 py-3">
              <p className="text-blue-800">
                You're currently on the <span className="font-bold">{subscription.subscription_plans.name}</span> plan
                {subscription.end_date && (
                  <span> (expires {formatDate(subscription.end_date)})</span>
                )}
              </p>

            </div>
          )}
        </div>

        <div className="flex flex-col md:flex-row justify-center items-stretch gap-8">
          {plans.map((plan, idx) => {
            // Marketing badges

            let badge = null;
            let badgeColor = '';
            // Assign a unique badge and color to each plan by index (assuming 4 plans: Basic, Standard, Premium, Elite)
            if (idx === 0) {
              badge = 'Lowest Price';
              badgeColor = 'bg-green-500';
            } else if (isPopular(plan)) {
              badge = 'Most Popular';
              badgeColor = 'bg-blue-600';
            } else if (plan.name === 'Premium') {
              badge = 'Best Offer';
              badgeColor = 'bg-pink-500';
            } else if (plan.name === 'Elite' || idx === 3) {
              badge = 'Elite Access';
              badgeColor = 'bg-purple-600';
            } else {
              badge = 'Special';
              badgeColor = 'bg-gray-500';
            }

            // Discount for Premium
            let showDiscount = plan.name === 'Premium';
            let oldPrice = plan.price + 500; // Example: Rs. 500 off for Premium

            return (
              <div
                key={plan.id}
                className={`relative flex-1 min-w-[320px] max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border-2 border-gray-200 transition-all duration-300 hover:scale-105 hover:shadow-xl`}
                style={{}}
              >
                {/* Marketing Badge */}
                {badge && (
                  <div className={`absolute top-0 left-0 right-0 ${badgeColor} text-white text-center py-2 font-bold text-xs tracking-widest z-20`}
                    style={{ letterSpacing: '0.1em' }}>
                    {badge}
                  </div>
                )}

                <div className="p-8 pt-12 flex flex-col h-full">
                  <h3 className="text-2xl font-extrabold text-gray-900 mb-2 text-center flex items-center justify-center gap-2">
                    {plan.name}
                  </h3>
                  <p className="text-gray-600 text-center mb-4">{plan.description}</p>
                  <div className="flex flex-col items-center mb-6">
                    {showDiscount && (
                      <span className="text-sm text-gray-400 line-through">₹{oldPrice}</span>
                    )}
                    <span className="text-4xl font-extrabold text-gray-900">₹{plan.price}</span>
                    <span className="text-base font-medium text-gray-500">/month</span>
                    {showDiscount && (
                      <span className="ml-2 px-2 py-1 bg-pink-100 text-pink-700 rounded text-xs font-semibold mt-1">Save ₹500!</span>
                    )}
                  </div>

                  <ul className="mt-2 space-y-3 mb-8">
                    <li className="flex items-center gap-2">
                      <FiCheck className="h-5 w-5 text-green-500" />
                      <span className="text-sm text-gray-700">Apply to up to <span className="font-bold">{plan.monthly_limit}</span> jobs/month</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <FiCheck className="h-5 w-5 text-green-500" />
                      <span className="text-sm text-gray-700">Access to all job platforms</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <FiCheck className="h-5 w-5 text-green-500" />
                      <span className="text-sm text-gray-700">Email notifications</span>
                    </li>
                    {(plan.name === 'Standard' || plan.name === 'Premium') && (
                      <li className="flex items-center gap-2">
                        <FiCheck className="h-5 w-5 text-green-500" />
                        <span className="text-sm text-gray-700">Priority support</span>
                      </li>
                    )}
                    {plan.name === 'Premium' && (
                      <li className="flex items-center gap-2">
                        <FiCheck className="h-5 w-5 text-green-500" />
                        <span className="text-sm text-gray-700">Advanced filtering options</span>
                      </li>
                    )}
                  </ul>

                  <button
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={isCurrentPlan(plan.id)}
                    className={`w-full mt-auto ${
                      isCurrentPlan(plan.id)
                        ? 'bg-gray-300 cursor-not-allowed'
                        : isPopular(plan)
                        ? 'bg-blue-600 hover:bg-blue-700'
                        : 'bg-gray-800 hover:bg-gray-900'
                    } text-white py-3 px-4 rounded-lg font-bold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors text-lg shadow-md`}
                  >
                    {isCurrentPlan(plan.id) ? 'Current Plan' : `Subscribe to ${plan.name}`}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-600">
            Have questions about our pricing? <button className="text-blue-600 hover:text-blue-500 font-medium">Contact us</button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default PricingPage;
