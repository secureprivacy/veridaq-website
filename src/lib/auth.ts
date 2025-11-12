import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Authorized email addresses
const AUTHORIZED_EMAILS = [
  'dan@secureprivacy.ai',
  'pal.schakonat@hyperisland.se'
];

export function isEmailAuthorized(email: string): boolean {
  return AUTHORIZED_EMAILS.includes(email.toLowerCase().trim());
}


// OTP Code authentication (Copy-Paste Code)
export async function requestOtpCode(email: string) {
  try {
    console.log('🔑 requestOtpCode: Starting OTP code request');
    console.log('📧 Email:', email);

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Please enter a valid email address');
    }

    // Check if email is authorized
    if (!isEmailAuthorized(email)) {
      throw new Error('This email address is not authorized to access the CMS');
    }

    // Check rate limiting
    const rateLimit = await checkRateLimit(email);
    if (!rateLimit.allowed) {
      await logAuthAttempt(email, 'otp_request', false, rateLimit.message);
      throw new Error(rateLimit.message);
    }

    console.log('📡 Calling Supabase signInWithOtp for OTP CODE');
    console.log('📋 Request params:', {
      email: email,
      shouldCreateUser: false
    });

    // Request OTP code from Supabase (6-digit code format)
    // CRITICAL: shouldCreateUser is false to only authenticate existing users
    const { data, error } = await supabase.auth.signInWithOtp({
      email: email,
      options: {
        shouldCreateUser: false
      }
    });

    if (error) {
      console.error('❌ OTP code request error:', error);
      console.error('❌ Error details:', {
        message: error.message,
        status: error.status,
        name: error.name
      });
      await logAuthAttempt(email, 'otp_request', false, error.message);

      if (error.message.includes('Signups not allowed')) {
        throw new Error('User account not found. Please contact an administrator to create your account in Supabase first.');
      }

      if (error.message.includes('otp_disabled')) {
        throw new Error('Email OTP is disabled. Please contact an administrator.');
      }

      throw new Error('Authentication failed. Please ensure your account exists and try again.');
    }

    console.log('✅ OTP code request successful');
    console.log('📬 Check email for 6-digit code');
    await logAuthAttempt(email, 'otp_request', true);
    return { success: true, data };
  } catch (error) {
    throw error;
  }
}

// Verify OTP code
export async function verifyOtpCode(email: string, token: string) {
  try {
    // Validate inputs
    if (!email || !token) {
      throw new Error('Email and code are required');
    }

    // Validate token format (6 digits)
    if (!/^\d{6}$/.test(token)) {
      throw new Error('Code must be 6 digits');
    }

    // Check if email is authorized
    if (!isEmailAuthorized(email)) {
      throw new Error('This email address is not authorized to access the CMS');
    }

    // Verify the OTP code
    const { data, error } = await supabase.auth.verifyOtp({
      email: email,
      token: token,
      type: 'email'
    });

    if (error) {
      console.error('OTP verification error:', error);
      await logAuthAttempt(email, 'otp_verify', false, error.message);

      if (error.message.includes('Token has expired')) {
        throw new Error('Code has expired. Please request a new one.');
      }

      if (error.message.includes('Invalid token')) {
        throw new Error('Invalid code. Please check and try again.');
      }

      throw error;
    }

    // Log successful verification
    await logAuthAttempt(email, 'otp_verify', true);

    return {
      success: true,
      session: data.session,
      user: data.user
    };
  } catch (error) {
    throw error;
  }
}

// Verify current session
export async function verifySession() {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      throw new Error('Session verification failed');
    }
    
    if (!session?.user?.email) {
      throw new Error('No active session found');
    }
    
    // Verify email is still authorized
    if (!isEmailAuthorized(session.user.email)) {
      await supabase.auth.signOut();
      throw new Error('Access revoked - unauthorized email');
    }

    // Log successful session verification
    await logAuthAttempt(session.user.email, 'session_refresh', true);
    
    return { success: true, user: session.user };
  } catch (error) {
    throw error;
  }
}

// Rate limiting check
async function checkRateLimit(email: string): Promise<{ allowed: boolean; message: string }> {
  try {
    const { data, error } = await supabase.rpc('check_rate_limit', {
      email_address: email
    });

    if (error) {
      console.warn('Rate limit check failed:', error);
      return { allowed: true, message: 'Rate limit check unavailable' };
    }

    return data;
  } catch (error) {
    console.warn('Rate limit function unavailable:', error);
    return { allowed: true, message: 'Rate limiting unavailable' };
  }
}

// Log authentication attempts
async function logAuthAttempt(
  email: string, 
  attemptType: string, 
  success: boolean, 
  errorMessage?: string
) {
  try {
    await supabase.from('auth_attempts').insert({
      email,
      attempt_type: attemptType,
      success,
      error_message: errorMessage || null,
      ip_address: null, // Would need server-side implementation for real IP
      user_agent: navigator.userAgent
    });
  } catch (error) {
    console.warn('Failed to log auth attempt:', error);
  }
}

// Get authentication statistics
export async function getAuthStats() {
  try {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    
    const { data: attempts, error } = await supabase
      .from('auth_attempts')
      .select('*')
      .gte('created_at', twentyFourHoursAgo);

    if (error) throw error;

    const totalAttempts = attempts?.length || 0;
    const successfulAttempts = attempts?.filter(a => a.success).length || 0;
    const failedAttempts = attempts?.filter(a => !a.success).length || 0;

    // Get blocked users count
    const { data: blocked } = await supabase
      .from('auth_rate_limits')
      .select('*')
      .eq('is_blocked', true)
      .gt('blocked_until', new Date().toISOString());

    const blockedEmails = blocked?.length || 0;

    return {
      totalAttempts,
      successfulAttempts,
      failedAttempts,
      blockedEmails
    };
  } catch (error) {
    console.error('Error fetching auth stats:', error);
    return {
      totalAttempts: 0,
      successfulAttempts: 0,
      failedAttempts: 0,
      blockedEmails: 0
    };
  }
}