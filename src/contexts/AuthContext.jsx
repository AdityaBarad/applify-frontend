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
    // Register a new user with Supabase
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          ...profileData
        },
        emailRedirectTo: `${window.location.origin}/email-verification`,
        // Force email verification by setting this to FALSE
        emailConfirm: false
      }
    });
    
    if (error) throw error;
    
    // If successful, manually trigger verification email if needed
    if (data?.user && !data.user.email_confirmed_at) {
      try {
        // Optionally force a verification email resend
        await supabase.auth.resend({
          type: 'signup',
          email: email,
          options: {
            emailRedirectTo: `${window.location.origin}/email-verification`,
          }
        });
        console.log("Verification email resent");
      } catch (resendError) {
        console.error('Error sending verification email:', resendError);
      }
    }
    
    // Create a profile entry if registration was successful
    if (data?.user) {
      try {
        await profileService.updateProfile(data.user.id, {
          id: data.user.id,
          email: data.user.email,
          full_name: profileData.fullName || '',
          created_at: new Date().toISOString(),
          email_verified: false // Track email verification status
        });
      } catch (profileError) {
        console.error('Error creating profile:', profileError);
        // We don't throw here to not block the registration flow
      }
    }
    
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
      const { data: currentSession } = await supabase
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
  const checkJobApplicationLimit = async () => {
    if (!user) {
      return { canApply: false, message: 'You must be logged in' };
    }
    
    try {
      const { hasReached, limit, used } = await subscriptionService.hasReachedLimit(user.id);
      
      if (hasReached) {
        return {
          canApply: false,
          message: `You've reached your monthly limit of ${limit} job applications`,
          limit,
          used
        };
      }
      
      return {
        canApply: true, 
        message: `You've used ${used} of ${limit} job applications this month`,
        limit,
        used
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
      return await subscriptionService.getApplicationStats(user.id, period);
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
      updateUserProfile
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
