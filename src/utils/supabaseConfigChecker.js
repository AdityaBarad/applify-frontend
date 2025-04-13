import { supabase } from '../lib/supabaseClient';

/**
 * Utility to check Supabase authentication configuration
 */
export async function checkSupabaseConfig() {
  console.log("Checking Supabase configuration...");
  
  try {
    // Check if we're connected to Supabase
    const { data: healthData, error: healthError } = await supabase
      .from('subscription_plans')
      .select('count(*)', { count: 'exact' });
    
    console.log("Supabase connection check:", healthError ? "Failed" : "Success");
    
    if (healthError) {
      console.error("Supabase connection error:", healthError);
    } else {
      console.log("Connected to Supabase successfully");
    }
    
    // Get auth configuration
    const { publicURL } = supabase.storage;
    console.log("Supabase URL:", supabase.supabaseUrl);
    console.log("Public URL:", publicURL);
    
    // Log site URL which is crucial for redirects
    console.log("Site URL configured:", import.meta.env.VITE_SITE_URL || window.location.origin);
    
    return {
      connected: !healthError,
      url: supabase.supabaseUrl,
      publicURL,
      siteURL: import.meta.env.VITE_SITE_URL || window.location.origin
    };
  } catch (error) {
    console.error("Error checking Supabase configuration:", error);
    return {
      connected: false,
      error: error.message
    };
  }
}

/**
 * Test sending a verification email - for debugging only
 */
export async function testEmailVerification(email) {
  try {
    const { data, error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/email-verification`,
      }
    });
    
    console.log("Test verification email result:", error ? "Failed" : "Success");
    
    return {
      success: !error,
      data,
      error
    };
  } catch (error) {
    console.error("Error testing verification email:", error);
    return {
      success: false,
      error: error.message
    };
  }
}
