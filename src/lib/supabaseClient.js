import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;
const siteUrl = import.meta.env.VITE_SITE_URL || window.location.origin;

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storageKey: 'job-autopilot-auth',
    detectSessionInUrl: true,
    flowType: 'pkce',
    debug: true // Enable debug mode to see what's happening with auth
  }
});

// Subscription related functions
const subscriptionService = {
  // Get all available subscription plans
  async getSubscriptionPlans() {
    const { data, error } = await supabase
      .from('subscription_plans')
      .select('*')
      .order('price', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  // Get user's current subscription
  async getUserSubscription(userId) {
    const { data, error } = await supabase
      .from('user_subscriptions')
      .select(`
        *,
        subscription_plans (*)
      `)
      .eq('profile_id', userId)  // Changed from user_id to profile_id
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (error && error.code !== 'PGRST116') { // No rows returned is not an error for us
      throw error;
    }
    
    return data;
  },

  // Add a new subscription for user
  async subscribeUser(userId, planId) {
    // First deactivate any existing subscription
    await this.deactivateCurrentSubscription(userId);
    
    // Create end date (1 month from now)
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1);
    
    // Create new subscription
    const { data, error } = await supabase
      .from('user_subscriptions')
      .insert({
        profile_id: userId,  // Changed from user_id to profile_id
        plan_id: planId,
        start_date: new Date().toISOString(),
        end_date: endDate.toISOString(),
        is_active: true
      })
      .select();
    
    if (error) throw error;
    return data;
  },

  // Deactivate current subscription
  async deactivateCurrentSubscription(userId) {
    const { error } = await supabase
      .from('user_subscriptions')
      .update({ is_active: false })
      .eq('profile_id', userId)  // Changed from user_id to profile_id
      .eq('is_active', true);
    
    if (error) throw error;
    return true;
  },

  // Create a new automation session
  async createAutomationSession(userId, data) {
    const { 
      platform, 
      totalJobsToApply,
      keywords,
      location,
      datePosted,
      workplaceType,
      experience,
      currentSalary,
      expectedSalary,
      filters
    } = data;
    
    // Store search parameters in a structured way
    const searchQuery = {
      keywords,
      location,
      datePosted,
      workplaceType,
      experience,
      currentSalary,
      expectedSalary,
      filters
    };
    
    const { data: session, error } = await supabase
      .from('automation_sessions')
      .insert({
        profile_id: userId,  // Changed from user_id to profile_id
        platform,
        jobs_requested: totalJobsToApply,
        search_query: searchQuery,
        session_start: new Date().toISOString(),
        status: 'started'
      })
      .select();
    
    if (error) throw error;
    return session?.[0] || null;
  },

  // Update an automation session with completed data
  async updateAutomationSession(sessionId, status) {
    const updateData = {
      session_end: new Date().toISOString(),
      status: status,
      updated_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('automation_sessions')
      .update(updateData)
      .eq('id', sessionId)
      .select();
    
    if (error) throw error;
    return data?.[0] || null;
  },

  // Get current month's application count
  async getCurrentMonthApplicationCount(userId) {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);
    
    const { data, error } = await supabase
      .from('automation_sessions')
      .select('jobs_applied')
      .eq('profile_id', userId)  // Changed from user_id to profile_id
      .gte('session_start', firstDayOfMonth.toISOString())
      .lte('session_start', lastDayOfMonth.toISOString());
    
    if (error) throw error;
    
    // Sum up all jobs applied from all sessions this month
    const totalApplied = data?.reduce((sum, session) => sum + (session.jobs_applied || 0), 0) || 0;
    return totalApplied;
  },

  // Get application statistics for analytics
  async getApplicationStats(userId, period = 'month') {
    const now = new Date();
    let startDate, endDate;

    console.log(`Building query for userId: ${userId}, period: ${period}`);

    // First, try to check if there are any records for this user
    const { count, error: countError } = await supabase
      .from('automation_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('profile_id', userId);

    if (countError) {
      console.error('Error checking record count:', countError);
    } else {
      console.log(`Found ${count} total records for user ${userId}`);
    }

    // Build our main query
    let query = supabase
      .from('automation_sessions')
      .select('*')
      .eq('profile_id', userId)
      .order('session_start', { ascending: false });

    // Remove any default limits that might be applied
    query = query.limit(10000);

    // Only apply date filters if not "all" period
    if (period !== 'all') {
      // Calculate the start and end date based on the requested period
      switch(period) {
        case 'day': {
          // Start of today
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
          // End of today
          endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
          break;
        }
        case 'week': {
          const dayOfWeek = now.getDay();
          startDate = new Date(now);
          startDate.setDate(now.getDate() - dayOfWeek);
          startDate.setHours(0, 0, 0, 0);
          endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
          break;
        }
        case 'month': {
          startDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
          endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
          break;
        }
        case 'year': {
          startDate = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
          endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
          break;
        }
        default: {
          startDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
          endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
        }
      }

      // Apply date range filters
      query = query
        .gte('session_start', startDate.toISOString())
        .lte('session_start', endDate.toISOString());
    }

    // Execute the query
    console.log('Executing query...');
    let { data, error } = await query;
    
    if (error) {
      console.error('Query error:', error);
      throw error;
    }
    
    console.log(`Query returned ${data?.length || 0} sessions`);
    
    // Check if we have any data at all for debugging
    if (!data || data.length === 0) {
      console.log('No data returned, checking alternative id field...');
      
      // Try with 'user_id' instead of 'profile_id' as a fallback
      const { data: altData, error: altError } = await supabase
        .from('automation_sessions')
        .select('*')
        .eq('user_id', userId)
        .limit(10000);
        
      if (altError) {
        console.error('Alternative query error:', altError);
      } else if (altData && altData.length > 0) {
        console.log(`Found ${altData.length} records with user_id field instead`);
        data = altData; // Use this data instead
      }
    }
    
    // Debug first and last few records if available
    if (data && data.length > 0) {
      console.log('First record:', data[0]);
      if (data.length > 1) {
        console.log('Last record:', data[data.length-1]);
      }
    }
    
    // Calculate statistics
    const totalSessions = data?.length || 0;
    const totalJobsApplied = data?.reduce((sum, session) => sum + (session.jobs_applied || 0), 0) || 0;
    const sessionsByPlatform = data?.reduce((acc, session) => {
      const platform = session.platform || 'unknown';
      acc[platform] = (acc[platform] || 0) + 1;
      return acc;
    }, {});
    
    const applicationsByPlatform = data?.reduce((acc, session) => {
      const platform = session.platform || 'unknown';
      acc[platform] = (acc[platform] || 0) + (session.jobs_applied || 0);
      return acc;
    }, {});
    
    // Calculate applications by day of week
    const applicationsByDay = data?.reduce((acc, session) => {
      if (session.session_start) {
        const date = new Date(session.session_start);
        const day = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
        acc[day] = (acc[day] || 0) + (session.jobs_applied || 0);
      }
      return acc;
    }, {});
    
    return {
      totalSessions,
      totalJobsApplied,
      sessionsByPlatform,
      applicationsByPlatform,
      applicationsByDay,
      recentSessions: data || []
    };
  },

  // Check if user has reached their subscription limit (monthly and daily per-platform)
  async hasReachedLimit(userId, platform = null) {
    // Get current subscription
    const subscription = await this.getUserSubscription(userId);
    // Get current month's total applications
    const totalApplied = await this.getCurrentMonthApplicationCount(userId);
    // Get today's date range
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0);
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);
    let dailyApplied = 0;
    let dailyLimit = null;
    if (platform) {
      // Query automation_sessions for today and this platform
      const { data: sessions, error } = await supabase
        .from('automation_sessions')
        .select('jobs_applied')
        .eq('profile_id', userId)
        .eq('platform', platform)
        .gte('session_start', startOfDay.toISOString())
        .lte('session_start', endOfDay.toISOString());
      if (!error && sessions) {
        dailyApplied = sessions.reduce((sum, s) => sum + (s.jobs_applied || 0), 0);
      }
      // Get daily limit from plan
      if (subscription && subscription.subscription_plans) {
        const plan = subscription.subscription_plans;
        const key = `${platform}_daily_limit`;
        dailyLimit = plan[key] ?? null;
      }
    }
    if (!subscription) {
      // No subscription, assign default Basic plan limit of 30/month, 5/day
      return { hasReached: totalApplied >= 30, limit: 30, used: totalApplied, dailyHasReached: dailyApplied >= 5, dailyLimit: 5, dailyUsed: dailyApplied };
    }
    // Use subscription plan limit
    const limit = subscription.subscription_plans.monthly_limit;
    // If platform and daily limit is set, check daily
    if (platform && dailyLimit != null) {
      return {
        hasReached: totalApplied >= limit,
        limit,
        used: totalApplied,
        dailyHasReached: dailyApplied >= dailyLimit,
        dailyLimit,
        dailyUsed: dailyApplied,
        subscription
      };
    }
    // Fallback to monthly only
    return {
      hasReached: totalApplied >= limit,
      limit,
      used: totalApplied,
      dailyHasReached: false,
      dailyLimit: null,
      dailyUsed: 0,
      subscription
    };
  },
  
  // Mock function for payment processing (to be implemented later)
  async processPayment(userId, planId, paymentDetails) {
    // This would connect to a payment gateway in the future
    // For now, we'll just create a mock transaction record
    
    // Get the plan price
    const { data: plan } = await supabase
      .from('subscription_plans')
      .select('price')
      .eq('id', planId)
      .single();
    
    if (!plan) throw new Error('Plan not found');
    
    // Get the subscription
    const { data: subscriptions } = await supabase
      .from('user_subscriptions')
      .select('id')
      .eq('profile_id', userId)  // Changed from user_id to profile_id
      .eq('plan_id', planId)
      .eq('is_active', true)
      .limit(1);
    
    const subscriptionId = subscriptions?.[0]?.id;
    
    // Create a mock transaction
    const { data: transaction, error } = await supabase
      .from('payment_transactions')
      .insert({
        profile_id: userId,  // Changed from user_id to profile_id
        subscription_id: subscriptionId,
        amount: plan.price,
        currency: 'INR',
        payment_method: paymentDetails.paymentMethod || 'card',
        payment_gateway: 'mock_gateway',
        transaction_id: `mock_${Date.now()}`,
        transaction_status: 'completed',
        payment_date: new Date().toISOString(),
        metadata: { 
          gateway_response: 'Successful mock payment', 
          card_last4: '4242'
        },
        receipt_url: 'https://example.com/receipt',
        invoice_id: `INV-${Date.now()}`,
        billing_address: paymentDetails.billingAddress || {}
      })
      .select();
    
    if (error) throw error;
    return transaction?.[0];
  },

  // Get automation sessions for a user
  async getAutomationSessions(userId, limit = 50) {
    const { data, error } = await supabase
      .from('automation_sessions')
      .select('*')
      .eq('profile_id', userId)  // Changed from user_id to profile_id
      .order('session_start', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return { data, error: null };
  },

  // Get applied jobs for a user
  async getAppliedJobs(userId, limit = 100) {
    const { data, error } = await supabase
      .from('applied_jobs')
      .select('*')
      .eq('profile_id', userId)
      .order('date_applied', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return { data, error: null };
  },

  // Update job application status
  async updateJobStatus(jobId, newStatus) {
    const { data, error } = await supabase
      .from('applied_jobs')
      .update({ 
        application_status: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', jobId)
      .select();
    
    if (error) throw error;
    return data?.[0] || null;
  },
};

// Add profile service
const profileService = {
  async getProfile(userId) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    return data;
  },
  
  async updateProfile(userId, profileData) {
    const { data, error } = await supabase
      .from('profiles')
      .update(profileData)
      .eq('id', userId)
      .select();
    
    if (error) throw error;
    return data;
  }
};

// Export the services (without re-exporting supabase)
export { subscriptionService, profileService };
