import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Link } from '../ui/Link';
import { Mail, User, Lock, ArrowRight, AlertCircle } from 'lucide-react';

const SignupPage: React.FC = () => {
  const { signUp } = useAuth();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validate password confirmation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      const { error } = await signUp(formData.email, formData.password, formData.fullName);

      if (error) throw error;
      
      // Redirect to login with success message
      alert('Account created successfully! Please contact an administrator to activate your account, then sign in.');
      window.location.hash = '#cms/dashboard';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

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
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">Create CMS Account</h1>
          <p className="text-neutral-600">Create an account to access the content management system</p>
        </div>

        <div className="modern-card p-8 rounded-3xl">
          <div className="bg-warning-50 border border-warning-200 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-warning-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-warning-800 text-sm mb-1">Account Activation Required</h3>
                <p className="text-warning-700 text-xs">
                  After creating your account, an administrator must activate it before you can access the CMS. 
                  Contact admin@veridaq.com for activation.
                </p>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-error-50 border border-error-200 text-error-700 px-4 py-3 rounded-xl mb-6 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="fullName" className="block text-sm font-semibold text-neutral-700 mb-2">
                Full Name *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
                <input
                  type="text"
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                  className="modern-input pl-12"
                  placeholder="John Doe"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-neutral-700 mb-2">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="modern-input pl-12"
                  placeholder="john@company.com"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-neutral-700 mb-2">
                Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
                <input
                  type="password"
                  id="password"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  className="modern-input pl-12"
                  placeholder="Enter password (min 6 characters)"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-neutral-700 mb-2">
                Confirm Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
                <input
                  type="password"
                  id="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  className="modern-input pl-12"
                  placeholder="Confirm your password"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creating Account...
                </div>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Create Account
                  <ArrowRight className="w-5 h-5" />
                </span>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-neutral-600">
              Already have an account?{' '}
              <button 
                onClick={() => window.location.hash = '#cms/dashboard'}
                className="text-primary-600 font-semibold hover:text-primary-700 transition-colors cursor-pointer"
              >
                Sign In
              </button>
            </p>
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

export default SignupPage;