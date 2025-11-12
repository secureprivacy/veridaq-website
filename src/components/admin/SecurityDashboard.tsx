import React, { useState, useEffect } from 'react';
import { Shield, AlertTriangle, CheckCircle, Clock, Users, Activity } from 'lucide-react';
import { getAuthStats } from '../../lib/auth';
import { supabase } from '../../lib/auth';

const SecurityDashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalAttempts: 0,
    successfulAttempts: 0,
    failedAttempts: 0,
    blockedEmails: 0
  });
  const [recentAttempts, setRecentAttempts] = useState<any[]>([]);
  const [blockedUsers, setBlockedUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSecurityData();
    
    // Refresh data every 30 seconds
    const interval = setInterval(fetchSecurityData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchSecurityData = async () => {
    try {
      setLoading(true);
      
      // Get authentication statistics
      const authStats = await getAuthStats();
      setStats(authStats);

      // Get recent authentication attempts
      const { data: attempts } = await supabase
        .from('auth_attempts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      setRecentAttempts(attempts || []);

      // Get currently blocked users
      const { data: blocked } = await supabase
        .from('auth_rate_limits')
        .select('*')
        .eq('is_blocked', true)
        .gt('blocked_until', new Date().toISOString());

      setBlockedUsers(blocked || []);

    } catch (error) {
      console.error('Error fetching security data:', error);
    } finally {
      setLoading(false);
    }
  };

  const unblockUser = async (email: string) => {
    try {
      const { error } = await supabase
        .from('auth_rate_limits')
        .update({ 
          is_blocked: false, 
          blocked_until: null,
          attempt_count: 0 
        })
        .eq('email', email);

      if (error) throw error;

      // Refresh data
      await fetchSecurityData();
      
      alert(`Successfully unblocked ${email}`);
    } catch (error) {
      console.error('Error unblocking user:', error);
      alert('Failed to unblock user');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getAttemptIcon = (attemptType: string, success: boolean) => {
    if (success) {
      return <CheckCircle className="w-4 h-4 text-success-600" />;
    } else {
      return <AlertTriangle className="w-4 h-4 text-error-600" />;
    }
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-neutral-200 rounded w-64"></div>
          <div className="grid md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-neutral-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 bg-gradient-to-br from-white via-neutral-50/30 to-white min-h-screen">
      <div className="flex items-center gap-3 mb-12">
        <div className="w-12 h-12 bg-gradient-to-br from-error-500 to-error-600 rounded-2xl flex items-center justify-center shadow-lg">
          <Shield className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-neutral-900 via-error-700 to-neutral-900 bg-clip-text text-transparent">
            Security Dashboard
          </h1>
          <p className="text-neutral-600">Monitor authentication attempts and security events</p>
        </div>
      </div>

      {/* Security Stats */}
      <div className="grid md:grid-cols-4 gap-6 mb-10">
        <div className="bg-gradient-to-br from-primary-50 to-primary-100 p-6 rounded-2xl border border-primary-200/60 hover:shadow-lg hover:scale-[1.02] transition-all duration-300">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center mb-3 shadow-lg">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <div className="text-2xl font-bold text-primary-700 mb-1">{stats.totalAttempts}</div>
          <div className="text-sm font-semibold text-primary-600">Total Attempts (24h)</div>
        </div>
        
        <div className="bg-gradient-to-br from-success-50 to-success-100 p-6 rounded-2xl border border-success-200/60 hover:shadow-lg hover:scale-[1.02] transition-all duration-300">
          <div className="w-10 h-10 bg-gradient-to-br from-success-500 to-success-600 rounded-xl flex items-center justify-center mb-3 shadow-lg">
            <CheckCircle className="w-5 h-5 text-white" />
          </div>
          <div className="text-2xl font-bold text-success-700 mb-1">{stats.successfulAttempts}</div>
          <div className="text-sm font-semibold text-success-600">Successful</div>
        </div>
        
        <div className="bg-gradient-to-br from-error-50 to-error-100 p-6 rounded-2xl border border-error-200/60 hover:shadow-lg hover:scale-[1.02] transition-all duration-300">
          <div className="w-10 h-10 bg-gradient-to-br from-error-500 to-error-600 rounded-xl flex items-center justify-center mb-3 shadow-lg">
            <AlertTriangle className="w-5 h-5 text-white" />
          </div>
          <div className="text-2xl font-bold text-error-700 mb-1">{stats.failedAttempts}</div>
          <div className="text-sm font-semibold text-error-600">Failed</div>
        </div>
        
        <div className="bg-gradient-to-br from-warning-50 to-warning-100 p-6 rounded-2xl border border-warning-200/60 hover:shadow-lg hover:scale-[1.02] transition-all duration-300">
          <div className="w-10 h-10 bg-gradient-to-br from-warning-500 to-warning-600 rounded-xl flex items-center justify-center mb-3 shadow-lg">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div className="text-2xl font-bold text-warning-700 mb-1">{stats.blockedEmails}</div>
          <div className="text-sm font-semibold text-warning-600">Blocked Users</div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Recent Authentication Attempts */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-neutral-200/50">
          <h2 className="text-xl font-bold text-neutral-900 mb-6 flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary-600" />
            Recent Authentication Attempts
          </h2>
          
          <div className="space-y-4">
            {recentAttempts.length > 0 ? (
              recentAttempts.map((attempt) => (
                <div key={attempt.id} className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    {getAttemptIcon(attempt.attempt_type, attempt.success)}
                    <div>
                      <div className="font-medium text-neutral-900">{attempt.email}</div>
                      <div className="text-sm text-neutral-600">
                        {attempt.attempt_type.replace(/_/g, ' ')} • {formatDate(attempt.created_at)}
                      </div>
                      {attempt.error_message && (
                        <div className="text-xs text-error-600 mt-1">{attempt.error_message}</div>
                      )}
                    </div>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    attempt.success 
                      ? 'bg-success-100 text-success-700' 
                      : 'bg-error-100 text-error-700'
                  }`}>
                    {attempt.success ? 'Success' : 'Failed'}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-neutral-500">
                No recent authentication attempts
              </div>
            )}
          </div>
        </div>

        {/* Blocked Users */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-neutral-200/50">
          <h2 className="text-xl font-bold text-neutral-900 mb-6 flex items-center gap-2">
            <Users className="w-5 h-5 text-warning-600" />
            Blocked Users
          </h2>
          
          <div className="space-y-4">
            {blockedUsers.length > 0 ? (
              blockedUsers.map((blocked) => (
                <div key={blocked.id} className="flex items-center justify-between p-4 bg-warning-50 rounded-xl border border-warning-200">
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-warning-600" />
                    <div>
                      <div className="font-medium text-neutral-900">{blocked.email}</div>
                      <div className="text-sm text-neutral-600">
                        Blocked until: {formatDate(blocked.blocked_until)}
                      </div>
                      <div className="text-xs text-warning-600">
                        {blocked.attempt_count} failed attempts
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => unblockUser(blocked.email)}
                    className="px-3 py-1 bg-warning-600 text-white rounded-lg hover:bg-warning-700 transition-colors text-sm font-medium"
                  >
                    Unblock
                  </button>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-neutral-500">
                No users currently blocked
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Authorized Users */}
      <div className="mt-8 bg-white p-8 rounded-3xl shadow-sm border border-neutral-200/50">
        <h2 className="text-xl font-bold text-neutral-900 mb-6 flex items-center gap-2">
          <Shield className="w-5 h-5 text-success-600" />
          Authorized Users
        </h2>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-4 bg-success-50 rounded-xl border border-success-200">
            <div className="w-8 h-8 bg-success-600 rounded-full flex items-center justify-center">
              <Users className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="font-medium text-success-900">dan@secureprivacy.ai</div>
              <div className="text-sm text-success-700">Primary Administrator</div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-4 bg-success-50 rounded-xl border border-success-200">
            <div className="w-8 h-8 bg-success-600 rounded-full flex items-center justify-center">
              <Users className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="font-medium text-success-900">pal.schakonat@hyperisland.se</div>
              <div className="text-sm text-success-700">Secondary Administrator</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityDashboard;