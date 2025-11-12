import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Shield, User, Clock, AlertCircle } from 'lucide-react';

const AuthStatus: React.FC = () => {
  const { user, loading, error, signOut } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-warning-50 border border-warning-200 rounded-lg">
        <div className="w-4 h-4 border-2 border-warning-600 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-sm text-warning-700">Verifying...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-error-50 border border-error-200 rounded-lg">
        <AlertCircle className="w-4 h-4 text-error-600" />
        <span className="text-sm text-error-700">Auth Error</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-neutral-100 border border-neutral-200 rounded-lg">
        <Shield className="w-4 h-4 text-neutral-500" />
        <span className="text-sm text-neutral-600">Not Authenticated</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 px-3 py-2 bg-success-50 border border-success-200 rounded-lg">
        <div className="w-2 h-2 bg-success-500 rounded-full animate-pulse"></div>
        <User className="w-4 h-4 text-success-600" />
        <span className="text-sm text-success-700 font-medium">
          {user.email?.split('@')[0]}
        </span>
      </div>
      
      <button
        onClick={signOut}
        className="px-3 py-2 text-sm text-neutral-600 hover:text-error-600 hover:bg-error-50 rounded-lg transition-colors"
        title="Sign Out"
      >
        Sign Out
      </button>
    </div>
  );
};

export default AuthStatus;