import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

// Authorized email addresses
const AUTHORIZED_EMAILS = [
  'dan@secureprivacy.ai',
  'pal.schakonat@hyperisland.se'
];

export function isEmailAuthorized(email: string): boolean {
  return AUTHORIZED_EMAILS.includes(email.toLowerCase().trim());
}

// Sign up function for creating new accounts
export async function signUp(email: string, password: string, fullName: string) {
  try {
    // Check if email is authorized
    if (!isEmailAuthorized(email)) {
      return {
        data: null,
        error: 'This email address is not authorized to access the CMS'
      };
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName
        }
      }
    });

    return { data, error };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Sign up failed'
    };
  }
}
export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Get initial session
    getInitialSession();
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 Auth state changed:', event, session?.user?.email);
      console.log('📊 Session details:', {
        hasSession: !!session,
        hasUser: !!session?.user,
        userEmail: session?.user?.email,
        sessionExpiry: session?.expires_at,
        currentTime: new Date().toISOString()
      });
      
      if (event === 'SIGNED_IN' && session?.user?.email) {
        console.log('✅ User signed in successfully:', session.user.email);

        // Verify the signed-in user is authorized
        if (!isEmailAuthorized(session.user.email)) {
          console.warn('🚫 Unauthorized user signed in:', session.user.email);
          await supabase.auth.signOut();
          setUser(null);
          setError('This email address is not authorized to access the CMS');
          return;
        }

        console.log('🎉 User authorized, setting user state');
        setUser(session.user);
        setError(null);
      } else if (event === 'INITIAL_SESSION' && session?.user?.email) {
        console.log('🔄 Initial session detected:', session.user.email);
        
        // Verify the user is authorized
        if (!isEmailAuthorized(session.user.email)) {
          console.warn('🚫 Unauthorized user in initial session:', session.user.email);
          await supabase.auth.signOut();
          setUser(null);
          setError('This email address is not authorized to access the CMS');
          return;
        }
        
        console.log('✅ Initial session authorized, setting user state');
        setUser(session.user);
        setError(null);
      } else if (event === 'SIGNED_OUT') {
        console.log('👋 User signed out');
        setUser(null);
        setError(null);
      } else if (event === 'TOKEN_REFRESHED' && session?.user?.email) {
        console.log('🔄 Token refreshed for user:', session.user.email);
        if (isEmailAuthorized(session.user.email)) {
          setUser(session.user);
          setError(null);
        }
      } else if (event === 'INITIAL_SESSION' && !session) {
        console.log('❓ No initial session found');
        setUser(null);
      } else {
        console.log('❓ Auth event with no valid session:', event);
      }
      
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const getInitialSession = async () => {
    setLoading(true);
    
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Session error:', error);
        setError('Session verification failed');
        setLoading(false);
        return;
      }
      
      if (session?.user?.email) {
        // Verify email is authorized
        if (isEmailAuthorized(session.user.email)) {
          setUser(session.user);
          setError(null);
        } else {
          await supabase.auth.signOut();
          setUser(null);
          setError('Unauthorized access');
        }
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error('Session check error:', err);
      setError('Authentication system unavailable');
    }
    
    setLoading(false);
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (!error) {
        setUser(null);
        setError(null);
        // Redirect to home page
        window.location.hash = '';
      }
      
      return { success: !error, error: error?.message };
    } catch (err) {
      setUser(null);
      setError(null);
      window.location.hash = '';
      return { success: false, error: 'Sign out failed' };
    }
  };

  // Check if user has admin role (all authorized users are admins)
  const isAdmin = () => {
    return user && isEmailAuthorized(user.email || '');
  };

  // Check if user has editor role (all authorized users are editors)
  const isEditor = () => {
    return user && isEmailAuthorized(user.email || '');
  };

  // Check if user has specific role
  const hasRole = (roleName: string) => {
    if (!user) return false;
    // All authorized users have admin and editor roles
    return isEmailAuthorized(user.email || '') && ['admin', 'editor'].includes(roleName);
  };

  return {
    user,
    userRoles: user ? [{ role: { name: 'admin', permissions: {} } }] : [],
    loading,
    error,
    isAdmin,
    isEditor,
    signUp,
    hasRole,
    signOut,
    checkSession: getInitialSession
  };
}