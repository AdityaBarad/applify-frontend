import { createContext, useContext, useState, useEffect } from 'react';
import { supabase, subscriptionService, profileService } from '../lib/supabaseClient';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(true);
  const [currentSession, setCurrentSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
      
      // Fetch subscription data if user is logged in
      if (session?.user) {
        fetchUserSubscription(session.user.id);
      } else {
        setSubscriptionLoading(false);
      }
    });

    const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      
      // Fetch subscription data if user is logged in
      if (session?.user) {
        fetchUserSubscription(session.user.id);
      } else {
        setSubscription(null);
        setSubscriptionLoading(false);
      }
    });

    return () => authSubscription.unsubscribe();
  }, []);

  const fetchUserSubscription = async (userId) => {
    try {
      setSubscriptionLoading(true);
      const userSubscription = await subscriptionService.getUserSubscription(userId);
      setSubscription(userSubscription);
    } catch (error) {
      console.error('Error fetching subscription:', error);
    } finally {
      setSubscriptionLoading(false);
    }
  };

  const register = async (email, password, profileData = {}) => {
    // Check if email is already registered and verified
    const { data: existingProfile, error: profileError } = await supabase
      .from('profiles')
      .select('id, email_verified')
      .eq('email', email)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      // Only throw if it's not a "no rows" error
      throw profileError;
    }

    if (existingProfile && existingProfile.email_verified) {
      throw new Error('Email already registered and verified. Please log in.');
    }

    // Register a new user with Supabase
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
              fullName: profileData.fullName || '',
              phone: profileData.phone || ''
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        // Force email verification by setting this to FALSE
        emailConfirm: false
      }
    });
    
    if (error) throw error;
    
    return data;
  };

  const login = async (email, password, rememberMe = false) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
      options: {
        // Set session duration based on remember me choice
        expiresIn: rememberMe ? 30 * 24 * 60 * 60 : 8 * 60 * 60 // 30 days or 8 hours
      }
    });
    
    if (error) throw error;
    return data;
  };

  const loginWithProvider = async (provider) => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
        // Add specific scopes for Google if needed
        scopes: provider === 'google' ? 'email profile' : undefined
      }
    });
    
    if (error) throw error;
    return data;
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const resetPassword = async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    
    if (error) throw error;
  };

  const updatePassword = async (newPassword) => {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });
    
    if (error) throw error;
  };

  // Add subscription to user
  const subscribeToPlan = async (planId) => {
    if (!user) throw new Error('User must be logged in');
    
    try {
      await subscriptionService.subscribeUser(user.id, planId);
      await fetchUserSubscription(user.id);
      return true;
    } catch (error) {
      console.error('Error subscribing to plan:', error);
      throw error;
    }
  };

  // Start an automation session
  const startAutomationSession = async (automationData) => {
    if (!user) throw new Error('User must be logged in');
    
    try {
      const session = await subscriptionService.createAutomationSession(user.id, automationData);
      setCurrentSession(session);
      return session;
    } catch (error) {
      console.error('Error starting automation session:', error);
      throw error;
    }
  };

  // Update an automation session when it completes
  const completeAutomationSession = async (jobsApplied) => {
    if (!currentSession?.id) {
      console.error("No active session found to complete");
      return null;
    }
    
    try {
      console.log(`Completing session ${currentSession.id} with ${jobsApplied} jobs applied`);
      
      // Get the current actual jobs_applied count from the database first
      const { data: sessionData } = await supabase
        .from('automation_sessions')
        .select('jobs_applied')
        .eq('id', currentSession.id)
        .single();
      
      // Only update the session end time and status, don't override jobs_applied
      // as it's being incremented in real-time now
      const updatedSession = await subscriptionService.updateAutomationSession(
        currentSession.id, 
        'completed'  // Just update the status to completed
      );
      
      // Clear the current session reference
      setCurrentSession(null);
      
      // Update UI by refreshing the subscription data
      if (user) {
        await fetchUserSubscription(user.id);
      }
      
      return updatedSession;
    } catch (error) {
      console.error('Error completing automation session:', error);
      throw error;
    }
  };

  // Check if user can apply to more jobs
  // Strict check: monthly and daily per-platform
  const checkJobApplicationLimit = async (platform = null) => {
    if (!user) {
      return { canApply: false, message: 'You must be logged in' };
    }
    try {
      const { hasReached, limit, used, dailyHasReached, dailyLimit, dailyUsed } = await subscriptionService.hasReachedLimit(user.id, platform);
      if (hasReached) {
        return {
          canApply: false,
          message: `You've reached your monthly limit of ${limit} job applications`,
          limit,
          used
        };
      }
      if (dailyHasReached) {
        return {
          canApply: false,
          message: `You've reached your daily limit of ${dailyLimit} applications for ${platform.charAt(0).toUpperCase() + platform.slice(1)}`,
          limit: dailyLimit,
          used: dailyUsed
        };
      }
      // If both limits are fine
      return {
        canApply: true,
        message: `You've used ${used} of ${limit} job applications this month. Today: ${dailyUsed}/${dailyLimit ?? '∞'} for ${platform ? platform.charAt(0).toUpperCase() + platform.slice(1) : ''}`,
        limit: dailyLimit ?? limit,
        used: dailyUsed ?? used
      };
    } catch (error) {
      console.error('Error checking job application limit:', error);
      return { canApply: false, message: 'Error checking your subscription' };
    }
  };

  // Get application statistics for different time periods
  const getApplicationStats = async (period = 'month') => {
    if (!user) return null;
    
    try {
      console.log(`Fetching stats for period: ${period}, user ID: ${user.id}`);
      const stats = await subscriptionService.getApplicationStats(user.id, period);
      console.log(`Found ${stats?.recentSessions?.length || 0} sessions`);
      return stats;
    } catch (error) {
      console.error('Error getting application statistics:', error);
      return null;
    }
  };

  // Increment job application count
  const incrementJobApplicationCount = async (count = 1) => {
    if (!user) return;
    
    try {
      await subscriptionService.incrementApplicationCount(user.id, count);
      // Refresh subscription data
      await fetchUserSubscription(user.id);
    } catch (error) {
      console.error('Error incrementing job application count:', error);
    }
  };

  // Process a subscription payment (mock for now)
  const processSubscriptionPayment = async (planId, paymentDetails) => {
    if (!user) throw new Error('User must be logged in');
    
    try {
      // Process the payment first (mock for now)
      const transaction = await subscriptionService.processPayment(user.id, planId, paymentDetails);
      
      // Then subscribe the user to the plan
      await subscribeToPlan(planId);
      
      return transaction;
    } catch (error) {
      console.error('Error processing payment:', error);
      throw error;
    }
  };

  // Get user profile
  const getUserProfile = async () => {
    if (!user) return null;
    
    try {
      return await profileService.getProfile(user.id);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  };
  
  // Update user profile
  const updateUserProfile = async (profileData) => {
    if (!user) throw new Error('User must be logged in');
    
    try {
      return await profileService.updateProfile(user.id, profileData);
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  };

  // Update job application status
  const updateJobStatus = async (jobId, newStatus) => {
    if (!user) throw new Error('User must be logged in');
    
    try {
      const updatedJob = await subscriptionService.updateJobStatus(jobId, newStatus);
      return updatedJob;
    } catch (error) {
      console.error('Error updating job status:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      register,
      loginWithProvider,
      resetPassword,
      updatePassword,
      loading, 
      subscription,
      subscriptionLoading,
      subscribeToPlan,
      checkJobApplicationLimit,
      startAutomationSession,
      completeAutomationSession,
      currentSession,
      getApplicationStats,
      processSubscriptionPayment,
      incrementJobApplicationCount,
      getUserProfile,
      updateUserProfile,
      updateJobStatus
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
