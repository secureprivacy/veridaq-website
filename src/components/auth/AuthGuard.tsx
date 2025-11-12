import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import MagicLinkAuth from './MagicLinkAuth';
import { AlertCircle, Shield, Mail } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  fallback?: React.ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ 
  children, 
  requireAuth = true,
  fallback 
}) => {
  const { user, loading, error } = useAuth();
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    const checkAuthRequired = () => {
      const hash = window.location.hash;
      const isCMSRoute = hash.includes('#cms');

      // Always show auth for CMS routes when no user is present
      if (isCMSRoute && requireAuth && !loading && !user) {
        setShowAuth(true);
      } else if (user || !isCMSRoute || !requireAuth) {
        setShowAuth(false);
      }
    };

    checkAuthRequired();

    // Listen for hash changes to update auth state
    window.addEventListener('hashchange', checkAuthRequired);

    return () => {
      window.removeEventListener('hashchange', checkAuthRequired);
    };
  }, [user, loading, requireAuth]);

  // Show loading state ONLY if auth is required
  // For public pages (requireAuth=false), render immediately without waiting for auth check
  if (loading && requireAuth) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-neutral-600">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  // Show magic link auth if required and user not authenticated
  if (showAuth && requireAuth && !user) {
    return (
      <MagicLinkAuth
        onAuthSuccess={(user) => {
          console.log('Auth success:', user.email);
          setShowAuth(false);
          window.location.hash = '#cms/dashboard';
        }}
        onAuthError={(error) => {
          console.error('Auth error:', error);
        }}
        redirectTo={`${window.location.origin}/#cms/dashboard`}
      />
    );
  }

  // Show authentication error if there's an error
  if (error && requireAuth && !showAuth) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 bg-error-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-neutral-900 mb-4">Authentication Error</h2>
          <p className="text-neutral-600 mb-6">{error}</p>
          <div className="space-y-4">
            <button
              onClick={() => setShowAuth(true)}
              className="w-full btn-primary"
            >
              <Mail className="w-4 h-4 mr-2" />
              Try Magic Link Authentication
            </button>
            <button
              onClick={() => window.location.hash = ''}
              className="text-neutral-600 hover:text-neutral-900 transition-colors text-sm"
            >
              ← Back to Website
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render children if authenticated or auth not required
  return <>{children}</>;
};

export default AuthGuard;