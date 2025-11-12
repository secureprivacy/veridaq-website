import React, { useState, useEffect } from 'react';
import { Link } from '../ui/Link';
import { useAuth } from '../../hooks/useAuth';
import BlogAdmin from '../blog/BlogAdmin';
import TranslationsView from './TranslationsView';
import ApiSettings from './ApiSettings';
import SecurityDashboard from './SecurityDashboard';
import { useAllPosts } from '../../hooks/useBlogPosts';
import { supabase } from '../../lib/supabase';
import { 
  LayoutDashboard, 
  FileText, 
  Settings, 
  LogOut,
  User,
  Globe,
  Menu,
  X,
  TrendingUp,
  Clock,
  Languages,
  Zap,
  Shield
} from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const { user, signOut: authSignOut, loading: authLoading } = useAuth();
  const { posts, loading: postsLoading } = useAllPosts();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dashboardStats, setDashboardStats] = useState({
    totalPosts: 0,
    publishedPosts: 0,
    draftPosts: 0,
    archivedPosts: 0,
    totalTranslations: 0,
    recentActivity: []
  });
  const [quickAction, setQuickAction] = useState<string | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // Calculate real-time stats
  useEffect(() => {
    if (!postsLoading && posts.length >= 0) {
      calculateRealStats();
    }
  }, [posts, postsLoading]);

  const calculateRealStats = async () => {
    try {
      setStatsLoading(true);
      
      // Calculate post stats
      const totalPosts = posts.length;
      const publishedPosts = posts.filter(p => p.status === 'published').length;
      const draftPosts = posts.filter(p => p.status === 'draft').length;
      const archivedPosts = posts.filter(p => p.status === 'archived').length;

      // Get translation stats
      let totalTranslations = 0;
      let translations = null;
      
      try {
        const { data: translationsData, error: translationError } = await supabase
          .from('post_translations')
          .select('*');

        if (translationError) {
          console.warn('Translation fetch error (expected in demo mode):', translationError);
          // In demo mode, use mock data
          totalTranslations = 0;
        } else {
          translations = translationsData;
          totalTranslations = translations?.length || 0;
        }
      } catch (error) {
        console.warn('Supabase not configured, using demo mode');
        totalTranslations = 0;
      }

      // Get recent activity from both posts and translations
      const recentActivity = [];
      
      // Recent posts (last 10)
      const recentPosts = posts
        .sort((a, b) => new Date(b.updated_at || b.created_at || '').getTime() - new Date(a.updated_at || a.created_at || '').getTime())
        .slice(0, 5);
      
      recentPosts.forEach(post => {
        const wasRecentlyUpdated = post.updated_at && 
          new Date(post.updated_at).getTime() > new Date(post.created_at || '').getTime() + 60000; // Updated more than 1 min after creation
        
        recentActivity.push({
          type: 'post',
          action: wasRecentlyUpdated ? 'Updated' : 
                  post.status === 'published' ? 'Published' : 
                  post.status === 'draft' ? 'Created draft' : 'Archived',
          title: post.title,
          timestamp: post.updated_at || post.created_at || new Date().toISOString(),
          slug: post.slug
        });
      });

      // Recent translations (last 5)
      if (translations && translations.length > 0) {
        const recentTranslations = translations
          .filter(t => t.translation_status === 'completed')
          .sort((a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime())
          .slice(0, 3);

        recentTranslations.forEach(translation => {
          const languageNames: Record<string, string> = {
            'da': 'Danish', 'sv': 'Swedish', 'no': 'Norwegian', 'fi': 'Finnish',
            'de': 'German', 'fr': 'French', 'es': 'Spanish', 'it': 'Italian',
            'pt': 'Portuguese', 'nl': 'Dutch'
          };
          
          recentActivity.push({
            type: 'translation',
            action: `Translated to ${languageNames[translation.language_code] || translation.language_code}`,
            title: translation.title,
            timestamp: translation.created_at || new Date().toISOString(),
            slug: translation.slug
          });
        });
      }

      // Sort all activity by timestamp and take most recent
      const sortedActivity = recentActivity
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 6);

      setDashboardStats({
        totalPosts,
        publishedPosts,
        draftPosts,
        archivedPosts,
        totalTranslations,
        recentActivity: sortedActivity
      });
      
    } catch (error) {
      console.error('Error calculating stats:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    // Initialize from current hash
    const initializeFromHash = () => {
      const hash = window.location.hash.slice(1);
      console.log('AdminDashboard: Initializing from hash:', hash);
      
      if (hash.startsWith('cms/')) {
        const tabName = hash.split('/')[1];
        if (tabName && ['dashboard', 'blog', 'translations', 'settings', 'security'].includes(tabName)) {
          console.log('AdminDashboard: Setting active tab to:', tabName);
          setActiveTab(tabName);
        }
      }
    };

    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      console.log('AdminDashboard: Hash changed to:', hash);
      
      if (hash.startsWith('cms/')) {
        const tabName = hash.split('/')[1];
        if (tabName && ['dashboard', 'blog', 'translations', 'settings', 'security'].includes(tabName)) {
          console.log('AdminDashboard: Setting active tab to:', tabName);
          setActiveTab(tabName);
        }
      }
    };

    // Initialize once, then listen for changes
    initializeFromHash();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Handle quick actions
  const handleQuickAction = (action: string, tab: string) => {
    console.log('Quick action triggered:', action, 'switching to tab:', tab);
    
    // Navigate to the tab first
    handleNavigation(tab);
    
    setQuickAction(action);
    
    // Clear the quick action after components have processed it
    setTimeout(() => {
      console.log('Clearing quick action:', action);
      setQuickAction(null);
    }, 2000);
  };

  const handleNavigation = (tabId: string) => {
    console.log('Navigation clicked:', tabId);
    setSidebarOpen(false);
    
    // Only update hash if it's different
    const newHash = `#cms/${tabId}`;
    console.log('Setting hash to:', newHash);
    window.location.hash = newHash;
    // State will be updated by the hash change handler
  };

  const navigationItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-5 h-5" />,
      description: 'Overview and quick actions'
    },
    {
      id: 'blog',
      label: 'Blog Posts',
      icon: <FileText className="w-5 h-5" />,
      description: 'Content management with SEO tools'
    },
    {
      id: 'translations',
      label: 'Translations',
      icon: <Globe className="w-5 h-5" />,
      description: 'Multi-language content management'
    },
    {
      id: 'settings',
      label: 'API Settings',
      icon: <Settings className="w-5 h-5" />,
      description: 'Configure AI and search engine APIs'
    },
    {
      id: 'security',
      label: 'Security',
      icon: <Shield className="w-5 h-5" />,
      description: 'Authentication logs and security monitoring'
    }
  ];

  const handleSignOut = () => {
    authSignOut();
  };

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-neutral-600">Verifying access...</p>
        </div>
      </div>
    );
  }

  // This component is now wrapped by AuthGuard, so user should always exist here
  if (!user) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-neutral-600">Authentication required</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-50 flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50 w-72 bg-white/95 backdrop-blur-xl border-r border-neutral-200/50 shadow-2xl transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-neutral-200/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img 
                  src="/images/veridaq-logo-transparent.png"
                  alt="Veridaq CMS"
                  height="32"
                  width="128"
                />
                <div className="text-xs bg-gradient-to-r from-primary-500 to-primary-600 text-white px-2 py-1 rounded-full font-semibold shadow-sm">
                  CMS
                </div>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-2 text-neutral-400 hover:text-neutral-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-6">
            <div className="space-y-2">
              {navigationItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavigation(item.id)}
                  className={`w-full flex items-start gap-3 px-4 py-3 rounded-2xl text-left transition-all duration-300 group ${
                    activeTab === item.id
                      ? 'bg-gradient-to-r from-primary-50 to-primary-100 text-primary-700 border border-primary-200/50 shadow-md transform scale-[1.02]'
                      : 'text-neutral-600 hover:text-neutral-900 hover:bg-gradient-to-r hover:from-neutral-50 hover:to-white hover:shadow-sm hover:transform hover:scale-[1.01]'
                  }`}
                >
                  <div className={`flex-shrink-0 transition-transform duration-300 ${activeTab === item.id ? 'scale-110' : 'group-hover:scale-105'}`}>{item.icon}</div>
                  <div>
                    <div className="font-medium">{item.label}</div>
                    <div className={`text-xs transition-colors ${activeTab === item.id ? 'text-primary-600/80' : 'text-neutral-500'}`}>{item.description}</div>
                  </div>
                </button>
              ))}
            </div>
          </nav>
          {/* User Info & Actions */}
          <div className="p-6 border-t border-neutral-200/50">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center shadow-md">
                <User className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-neutral-900 truncate">
                  {user.email}
                </div>
                <div className="text-xs text-neutral-600 flex items-center gap-1">
                  <span className="w-2 h-2 bg-success-500 rounded-full animate-pulse"></span>
                  Authorized Admin
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <button 
                onClick={() => window.open(`${window.location.origin}/blog/`, '_blank')}
                className="w-full px-4 py-2 bg-gradient-to-r from-neutral-100 to-white text-neutral-700 border border-neutral-200 rounded-xl hover:from-neutral-50 hover:to-neutral-100 hover:shadow-sm hover:border-neutral-300 transition-all duration-300 text-sm flex items-center justify-center gap-2 font-medium"
              >
                <Globe className="w-4 h-4" />
                View Website
              </button>
              <button
                onClick={handleSignOut}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-error-600 hover:text-white hover:bg-gradient-to-r hover:from-error-500 hover:to-error-600 rounded-xl transition-all duration-300 hover:shadow-md font-medium"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white/95 backdrop-blur-xl border-b border-neutral-200/50 px-4 py-4 shadow-sm">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-all duration-200"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="font-bold text-neutral-900 text-lg">Veridaq CMS</h1>
            <div className="w-9"></div> {/* Spacer for centering */}
          </div>
        </div>

        {/* Content Area */}
        <main className="flex-1 overflow-auto">
          {activeTab === 'dashboard' && (
            <DashboardOverview 
              stats={dashboardStats} 
              loading={statsLoading}
              onQuickAction={handleQuickAction} 
            />
          )}
          {activeTab === 'blog' && (
            <BlogAdmin 
              quickAction={quickAction}
              key={`blog-${activeTab}`}
            />
          )}
          {activeTab === 'translations' && (
            <TranslationsView 
              quickAction={quickAction}
              key={`translations-${activeTab}`}
            />
          )}
          {activeTab === 'settings' && (
            <ApiSettings 
              quickAction={quickAction}
              key={`settings-${activeTab}`}
            />
          )}
          {activeTab === 'security' && (
            <SecurityDashboard />
          )}
        </main>
      </div>
    </div>
  );
};

interface DashboardOverviewProps {
  stats: any;
  loading: boolean;
  onQuickAction: (action: string, tab: string) => void;
}

const DashboardOverview: React.FC<DashboardOverviewProps> = ({ stats, loading, onQuickAction }) => {
  if (loading) {
    return (
      <div className="p-6 lg:p-8 bg-gradient-to-br from-white via-neutral-50/30 to-white min-h-screen">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-neutral-200 rounded w-64"></div>
          <div className="grid md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-neutral-200 rounded-xl"></div>
            ))}
          </div>
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 h-64 bg-neutral-200 rounded-xl"></div>
            <div className="h-64 bg-neutral-200 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 bg-gradient-to-br from-white via-neutral-50/30 to-white min-h-screen">
      <div className="flex items-center gap-3 mb-12">
        <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center shadow-lg">
          <LayoutDashboard className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="heading-md text-gradient">Content Management Dashboard</h1>
          <p className="body-base text-neutral-600">Manage your blog content with advanced SEO tools and AI-powered translations across 11 languages <span className="px-2 py-1 bg-accent-100 text-accent-700 rounded-full text-xs font-semibold ml-2">Demo Mode</span></p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid md:grid-cols-4 gap-6 mb-10">
        <div className="bg-gradient-to-br from-primary-50 to-primary-100 p-6 rounded-2xl border border-primary-200/60 hover:shadow-lg hover:scale-[1.02] transition-all duration-300 group">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center mb-3 shadow-lg group-hover:scale-110 transition-transform duration-300">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div className="text-2xl font-bold text-primary-700 mb-1">{stats.totalPosts}</div>
          <div className="text-sm font-semibold text-primary-600">Total Posts</div>
        </div>
        
        <div className="bg-gradient-to-br from-success-50 to-success-100 p-6 rounded-2xl border border-success-200/60 hover:shadow-lg hover:scale-[1.02] transition-all duration-300 group">
          <div className="w-10 h-10 bg-gradient-to-br from-success-500 to-success-600 rounded-xl flex items-center justify-center mb-3 shadow-lg group-hover:scale-110 transition-transform duration-300">
            <Globe className="w-5 h-5 text-white" />
          </div>
          <div className="text-2xl font-bold text-success-700 mb-1">{stats.publishedPosts}</div>
          <div className="text-sm font-semibold text-success-600">Published</div>
        </div>
        
        <div className="bg-gradient-to-br from-accent-50 to-accent-100 p-6 rounded-2xl border border-accent-200/60 hover:shadow-lg hover:scale-[1.02] transition-all duration-300 group">
          <div className="w-10 h-10 bg-gradient-to-br from-accent-500 to-accent-600 rounded-xl flex items-center justify-center mb-3 shadow-lg group-hover:scale-110 transition-transform duration-300">
            <Languages className="w-5 h-5 text-white" />
          </div>
          <div className="text-2xl font-bold text-accent-700 mb-1">11</div>
          <div className="text-sm font-semibold text-accent-600">Languages</div>
        </div>
        
        <div className="bg-gradient-to-br from-warning-50 to-warning-100 p-6 rounded-2xl border border-warning-200/60 hover:shadow-lg hover:scale-[1.02] transition-all duration-300 group">
          <div className="w-10 h-10 bg-gradient-to-br from-warning-500 to-warning-600 rounded-xl flex items-center justify-center mb-3 shadow-lg group-hover:scale-110 transition-transform duration-300">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div className="text-2xl font-bold text-warning-700 mb-1">{stats.totalTranslations}</div>
          <div className="text-sm font-semibold text-warning-600">AI Translations</div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <div className="lg:col-span-2">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-neutral-200/50 hover:shadow-lg transition-all duration-500">
            <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-neutral-900 via-primary-700 to-neutral-900 bg-clip-text text-transparent flex items-center gap-3">
              Quick Actions
            </h2>
            <p className="text-neutral-600 mb-8 leading-relaxed">Get started with common content management tasks</p>
          
            <div className="grid md:grid-cols-2 gap-6">
              <QuickActionCard
                title="Create New Post"
                description="Write and publish a new blog post with SEO optimization"
                action={() => {
                  console.log('Create New Post clicked');
                  onQuickAction('create-post', 'blog');
                }}
                icon={<FileText className="w-6 h-6 text-white" />}
                color="primary"
              />
              <QuickActionCard
                title="Review Drafts"
                description={`${stats.draftPosts} posts waiting for review and publishing`}
                action={() => {
                  console.log('Review Drafts clicked');
                  onQuickAction('filter-drafts', 'blog');
                }}
                icon={<Clock className="w-6 h-6 text-white" />}
                color="warning"
              />
              <QuickActionCard
                title="Manage Translations"
                description="Review and create multilingual content versions"
                action={() => {
                  console.log('Manage Translations clicked');
                  onQuickAction('manage-translations', 'translations');
                }}
                icon={<Globe className="w-6 h-6 text-white" />}
                color="accent"
              />
              <QuickActionCard
                title="Configure APIs"
                description="Set up AI translation and search engine integration"
                action={() => {
                  console.log('Configure APIs clicked');
                  onQuickAction('configure-apis', 'settings');
                }}
                icon={<Settings className="w-6 h-6 text-white" />}
                color="neutral"
              />
            </div>
          </div>
        </div>

        {/* Recent Activity & System Status */}
        <div>
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-neutral-200/50 hover:shadow-lg transition-all duration-500">
            <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-neutral-900 via-primary-700 to-neutral-900 bg-clip-text text-transparent flex items-center gap-3">
              Recent Activity
            </h2>
            <p className="text-neutral-600 mb-8 leading-relaxed">Latest updates and changes to your content</p>
            <div className="space-y-4">
              {stats.recentActivity.length > 0 ? (
                stats.recentActivity.map((activity: any, index: number) => (
                  <ActivityItem
                    key={index}
                    action={activity.action}
                    title={activity.title}
                    time={new Date(activity.timestamp).toLocaleDateString()}
                    slug={activity.slug}
                  />
                ))
              ) : (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-gradient-to-br from-neutral-100 to-neutral-200 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                    <FileText className="w-10 h-10 text-neutral-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-neutral-900 mb-2">No recent activity</h3>
                  <p className="text-neutral-600">Start creating content to see activity here</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface QuickActionCardProps {
  title: string;
  description: string;
  action: () => void;
  icon: React.ReactNode;
  color: 'primary' | 'warning' | 'accent' | 'neutral';
}

const QuickActionCard: React.FC<QuickActionCardProps> = ({ title, description, action, icon, color }) => {
  const colorStyles = {
    primary: 'border-primary-200/60 hover:border-primary-300 hover:shadow-lg hover:shadow-primary-500/10',
    warning: 'border-warning-200/60 hover:border-warning-300 hover:shadow-lg hover:shadow-warning-500/10',
    accent: 'border-accent-200/60 hover:border-accent-300 hover:shadow-lg hover:shadow-accent-500/10',
    neutral: 'border-neutral-200/50 hover:border-neutral-300 hover:shadow-lg'
  };

  const iconColors = {
    primary: 'from-primary-500 to-primary-600',
    warning: 'from-warning-500 to-warning-600',
    accent: 'from-accent-500 to-accent-600',
    neutral: 'from-neutral-500 to-neutral-600'
  };

  return (
    <button
      onClick={action}
      className={`w-full text-left p-8 bg-white border rounded-3xl shadow-sm transition-all duration-500 group hover:shadow-lg hover:scale-[1.02] ${colorStyles[color]}`}
    >
      <div className="flex items-start gap-4">
        <div className={`w-16 h-16 bg-gradient-to-br ${iconColors[color]} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-all duration-300`}>
          {icon}
        </div>
        <div>
          <h3 className="text-xl font-bold text-neutral-900 mb-4 group-hover:text-primary-700 transition-colors">{title}</h3>
          <p className="text-neutral-600 leading-relaxed">{description}</p>
        </div>
      </div>
    </button>
  );
};

interface ActivityItemProps {
  action: string;
  title: string;
  time: string;
  slug?: string;
}

const ActivityItem: React.FC<ActivityItemProps> = ({ action, title, time, slug }) => {
  return (
    <div className="flex items-start gap-4 p-6 bg-gradient-to-r from-neutral-50/50 to-white rounded-2xl border border-neutral-200/50 hover:shadow-md hover:scale-[1.01] transition-all duration-300 group">
      <div className="w-4 h-4 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full mt-1 flex-shrink-0 shadow-md group-hover:scale-110 transition-transform duration-300"></div>
      <div className="flex-1 min-w-0">
        <p className="text-neutral-900 mb-2 group-hover:text-primary-700 transition-colors font-medium">
          <span className="font-semibold">{action}</span>: {title}
        </p>
        <p className="text-sm text-neutral-500 mb-4 font-medium">{time}</p>
        {slug && (
          <button 
            onClick={() => window.open(`${window.location.origin}/#blog/${slug}`, '_blank')}
            className="text-sm text-primary-600 hover:text-primary-700 font-semibold hover:underline transition-all px-3 py-1 bg-primary-50 rounded-lg hover:bg-primary-100"
          >
            View post →
          </button>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;