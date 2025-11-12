import React, { useState, useEffect } from 'react';
import { Link } from '../ui/Link';
import { Mail, Shield, AlertCircle, CheckCircle, Clock, ArrowRight, Key } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { isEmailAuthorized } from '../../hooks/useAuth';
import { requestOtpCode, verifyOtpCode } from '../../lib/auth';

interface MagicLinkAuthProps {
  onAuthSuccess?: (user: any) => void;
  onAuthError?: (error: string) => void;
  redirectTo?: string;
}

const MagicLinkAuth: React.FC<MagicLinkAuthProps> = ({ 
  onAuthSuccess, 
  onAuthError,
  redirectTo 
}) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState<any>(null);
  const [verifying, setVerifying] = useState(true);
  const [otpCode, setOtpCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [verifyingCode, setVerifyingCode] = useState(false);

  useEffect(() => {
    // Get initial session
    getInitialSession();
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('MagicLinkAuth: Auth state changed:', event, session?.user?.email);
      
      if (event === 'SIGNED_IN' && session?.user?.email) {
        if (isEmailAuthorized(session.user.email)) {
          setSession(session);
          setError(null);
          onAuthSuccess?.(session.user);
        } else {
          supabase.auth.signOut();
          setSession(null);
          setError('This email address is not authorized');
          onAuthError?.('Unauthorized email address');
        }
      } else if (event === 'SIGNED_OUT') {
        setSession(null);
        setError(null);
      }
      
      setVerifying(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [onAuthSuccess, onAuthError]);

  const getInitialSession = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Session error:', error);
        setError('Session verification failed');
        setVerifying(false);
        return;
      }
      
      if (session?.user?.email) {
        if (isEmailAuthorized(session.user.email)) {
          setSession(session);
          setError(null);
          onAuthSuccess?.(session.user);
        } else {
          await supabase.auth.signOut();
          setSession(null);
          setError('Unauthorized access');
        }
      } else {
        setSession(null);
      }
    } catch (err) {
      console.error('Session check error:', err);
      setError('Authentication system unavailable');
    }
    
    setVerifying(false);
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    console.log('🔄 handleSubmit called');
    console.log('📧 Email:', email.trim());

    try {
      console.log('🔑 Calling requestOtpCode...');
      await requestOtpCode(email.trim());
      setCodeSent(true);
    } catch (err) {
      console.error('❌ Authentication request failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to send code');
      onAuthError?.(err instanceof Error ? err.message : 'Authentication failed');
    }

    setLoading(false);
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerifyingCode(true);
    setError(null);

    try {
      const result = await verifyOtpCode(email.trim(), otpCode.trim());
      if (result.success && result.session) {
        setSession(result.session);
        onAuthSuccess?.(result.user);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to verify code');
      onAuthError?.(err instanceof Error ? err.message : 'Verification failed');
    }

    setVerifyingCode(false);
  };

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (!error) {
        setSession(null);
        setCodeSent(false);
        setEmail('');
        setError(null);
      } else {
        setError('Failed to sign out');
      }
    } catch (err) {
      setError('Sign out failed');
    }
  };

  // Show loading state while verifying session
  if (verifying) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <h2 className="text-xl font-semibold text-neutral-900 mb-2">Verifying Access...</h2>
          <p className="text-neutral-600">Please wait while we verify your authentication</p>
        </div>
      </div>
    );
  }

  // Show authenticated state
  if (session?.user) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <Link href="#" className="inline-block mb-8">
              <img 
                src="/images/veridaq-logo-transparent.png"
                alt="Veridaq"
                height="40"
                width="160"
              />
            </Link>
            <div className="w-16 h-16 bg-success-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-neutral-900 mb-2">Access Granted</h1>
            <p className="text-neutral-600">Welcome to the Veridaq CMS</p>
          </div>

          <div className="modern-card p-8 rounded-3xl">
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">Authenticated User</h3>
              <p className="text-neutral-600 text-sm">{session.user.email}</p>
            </div>

            <div className="space-y-4">
              <Link
                href="#cms/dashboard"
                className="w-full btn-primary"
                onClick={(e) => {
                  e.preventDefault();
                  window.location.hash = '#cms/dashboard';
                }}
              >
                <span className="flex items-center justify-center gap-2">
                  Enter CMS Dashboard
                  <ArrowRight className="w-5 h-5" />
                </span>
              </Link>

              <button
                onClick={handleSignOut}
                className="w-full px-6 py-3 bg-white border border-neutral-300 text-neutral-700 rounded-xl hover:bg-neutral-50 hover:border-neutral-400 transition-all text-sm font-medium"
              >
                Sign Out
              </button>
            </div>
          </div>

          <div className="text-center mt-6">
            <button 
              onClick={() => window.location.hash = ''}
              className="text-neutral-600 hover:text-neutral-900 transition-colors text-sm cursor-pointer"
            >
              ← Back to Website
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link href="#" className="inline-block mb-8">
            <img 
              src="/images/veridaq-logo-transparent.png"
              alt="Veridaq"
              height="40"
              width="160"
            />
          </Link>
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">CMS Access</h1>
          <p className="text-neutral-600">Secure authentication for authorized users only</p>
        </div>

        <div className="modern-card p-8 rounded-3xl">
          {/* Security Notice */}
          <div className="bg-primary-50 border border-primary-200 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-primary-800 text-sm mb-1">Secure Access</h3>
                <p className="text-primary-700 text-xs">
                  This CMS is restricted to authorized personnel only.
                  Authentication codes and links are valid for 15 minutes and are rate-limited for security.
                </p>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-error-50 border border-error-200 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-error-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-error-800 text-sm mb-1">Authentication Error</h3>
                  <p className="text-error-700 text-xs">{error}</p>
                  {error.includes('not properly configured') && (
                    <div className="mt-3 p-3 bg-warning-50 border border-warning-200 rounded-lg">
                      <h4 className="font-semibold text-warning-800 text-xs mb-1">Setup Required</h4>
                      <p className="text-warning-700 text-xs">
                        Go to your Supabase Dashboard → Authentication → Settings → Auth and enable "Enable email signups" to allow magic link authentication.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {codeSent ? (
            <div className="py-8">
              <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Key className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-neutral-900 mb-2 text-center">Enter Your Code</h3>
              <p className="text-neutral-600 mb-6 text-center">
                We've sent a 6-digit code to <strong>{email}</strong>
              </p>

              <form onSubmit={handleVerifyCode} className="space-y-6">
                <div>
                  <label htmlFor="otp-code" className="block text-sm font-semibold text-neutral-700 mb-2">
                    6-Digit Code *
                  </label>
                  <input
                    type="text"
                    id="otp-code"
                    value={otpCode}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      if (value.length <= 6) {
                        setOtpCode(value);
                      }
                    }}
                    className="modern-input text-center text-2xl tracking-widest"
                    placeholder="000000"
                    maxLength={6}
                    required
                    disabled={verifyingCode}
                    autoFocus
                  />
                  <p className="text-xs text-neutral-500 mt-2 text-center">
                    Enter the 6-digit code from your email
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={verifyingCode || otpCode.length !== 6}
                  className="w-full btn-primary"
                >
                  {verifyingCode ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Verifying Code...
                    </div>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <CheckCircle className="w-5 h-5" />
                      Verify Code
                    </span>
                  )}
                </button>
              </form>

              <div className="mt-6 text-center">
                <button
                  onClick={() => {
                    setCodeSent(false);
                    setOtpCode('');
                    setError(null);
                  }}
                  className="text-primary-600 hover:text-primary-700 font-semibold text-sm transition-colors"
                  disabled={verifyingCode}
                >
                  ← Send a New Code
                </button>
              </div>

              <div className="bg-primary-50 border border-primary-200 rounded-xl p-4 mt-6">
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-primary-800 text-sm mb-1">Code Expires Soon</h4>
                    <p className="text-primary-700 text-xs">
                      For security, this code will expire in 15 minutes.
                      If you don't see the email, check your spam folder.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* OTP Code Information */}
              <div className="bg-primary-50 border border-primary-200 rounded-xl p-4 mb-6">
                <div className="flex items-start gap-3">
                  <Key className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-primary-800 text-sm mb-1">Email Code Authentication</h3>
                    <p className="text-primary-700 text-xs">
                      Enter your authorized email address to receive a 6-digit authentication code. Only existing users can sign in.
                    </p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-neutral-700 mb-2">
                    Authorized Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="modern-input pl-12"
                      placeholder="your.email@company.com"
                      required
                      disabled={loading}
                    />
                  </div>
                  <p className="text-xs text-neutral-500 mt-2">
                    Only pre-authorized email addresses can access this CMS
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading || !email.trim()}
                  className="w-full btn-primary"
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Sending Code...
                    </div>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <Key className="w-5 h-5" />
                      Send Code to Email
                    </span>
                  )}
                </button>

                <div className="text-xs text-neutral-500 text-center">
                  By requesting access, you acknowledge that all authentication attempts are logged for security purposes.
                </div>
              </form>
            </>
          )}
        </div>

        {/* Authorized Users Info */}
        <div className="mt-6 p-4 bg-white rounded-xl border border-neutral-200">
          <h4 className="font-semibold text-neutral-900 text-sm mb-2">Authorized Access</h4>
          <p className="text-xs text-neutral-600 mb-3">
            This system is restricted to authorized personnel only. If you need access, please contact:
          </p>
          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-success-500 rounded-full"></span>
              <span className="text-neutral-700">dan@secureprivacy.ai</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-success-500 rounded-full"></span>
              <span className="text-neutral-700">pal.schakonat@hyperisland.se</span>
            </div>
          </div>
          
          {/* Troubleshooting Section */}
          <div className="mt-4 pt-3 border-t border-neutral-200">
            <h5 className="font-semibold text-neutral-900 text-xs mb-2">🔧 Troubleshooting</h5>
            <div className="space-y-1 text-xs text-neutral-600">
              <div>• Check browser console (F12) for detailed error logs</div>
              <div>• Ensure you're using the exact authorized email address</div>
              <div>• Try requesting a fresh code if the previous one expired</div>
              <div>• Check spam folder if email doesn't arrive within 2 minutes</div>
              <div>• Contact admin if issues persist after multiple attempts</div>
            </div>
          </div>
        </div>

        <div className="text-center mt-6">
          <button 
            onClick={() => window.location.hash = ''}
            className="text-neutral-600 hover:text-neutral-900 transition-colors text-sm cursor-pointer"
          >
            ← Back to Website
          </button>
        </div>
      </div>
    </div>
  );
};

export default MagicLinkAuth;