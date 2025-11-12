import React, { useState, useEffect } from 'react';
import ContentTab from './ContentTab';
import SEOTab from './SEOTab';
import MetaTab from './MetaTab';
import { 
  analyzeContent, 
  generateSlug
} from '../../utils/seoAnalysis';
import { 
  Save, 
  Globe, 
  X, 
  Search,
  FileText,
  Calendar,
  User,
  TrendingUp
} from 'lucide-react';

interface PostEditorProps {
  post?: any | null;
  onSave: (postData: any) => void;
  onCancel: () => void;
}

const PostEditor: React.FC<PostEditorProps> = ({ post, onSave, onCancel }) => {
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'content' | 'seo' | 'meta'>('content');
  const [seoAnalysis, setSeoAnalysis] = useState<any>(null);
  const [showPublishSuccess, setShowPublishSuccess] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    featured_image_url: '',
    meta_title: '',
    meta_description: '',
    meta_keywords: '',
    status: 'draft' as 'draft' | 'published' | 'archived',
    focus_keyword: ''
  });

  // Load post data if editing
  useEffect(() => {
    if (post) {
      setActiveTab('content');
      setFormData({
        title: post.title || '',
        slug: post.slug || '',
        content: post.content || '',
        excerpt: post.excerpt || '',
        featured_image_url: post.featured_image_url || '',
        meta_title: post.meta_title || '',
        meta_description: post.meta_description || '',
        meta_keywords: post.meta_keywords || '',
        status: post.status || 'draft',
        focus_keyword: ''
      });
    } else {
      // New post defaults for compliance content
      setFormData(prev => ({
        ...prev,
        meta_keywords: 'EU compliance, KYC verification, AML screening, GDPR compliance, financial regulations',
        focus_keyword: 'EU compliance'
      }));
    }
  }, [post]);

  // Auto-generate slug when title changes
  useEffect(() => {
    if (formData.title && (!post || formData.slug === post?.slug)) {
      const newSlug = generateSlug(formData.title);
      setFormData(prev => ({ ...prev, slug: newSlug }));
    }
  }, [formData.title, post]);

  // Auto-generate meta title if empty
  useEffect(() => {
    if (formData.title && !formData.meta_title) {
      const optimizedTitle = `${formData.title} | EU Compliance Guide | Veridaq`;
      setFormData(prev => ({ ...prev, meta_title: optimizedTitle }));
    }
  }, [formData.title]);

  // Perform SEO analysis when content changes
  useEffect(() => {
    if (formData.title || formData.content) {
      const analysis = analyzeContent(
        formData.title,
        formData.content,
        formData.excerpt,
        formData.meta_title,
        formData.meta_description,
        formData.focus_keyword
      );
      setSeoAnalysis(analysis);
    }
  }, [formData.title, formData.content, formData.excerpt, formData.meta_title, formData.meta_description, formData.focus_keyword]);

  const handleSave = (newStatus?: 'draft' | 'published' | 'archived') => {
    setSaving(true);

    // Simulate saving delay and add error handling
    setTimeout(async () => {
      try {
      // Remove focus_keyword as it's not in the database schema
      const { focus_keyword, ...dataToSave } = formData;
      const finalData = {
        ...dataToSave,
        status: newStatus || formData.status
      };
        
        await onSave(finalData);
      
      // Show success message for publishing
      if (newStatus === 'published') {
        setShowPublishSuccess(true);
        setTimeout(() => setShowPublishSuccess(false), 3000);
      }
      } catch (error) {
        // Handle duplicate slug error
        if (error instanceof Error && error.message.includes('duplicate key value violates unique constraint "posts_slug_key"')) {
          // Generate a unique slug by appending timestamp
          const timestamp = Date.now().toString().slice(-6);
          const uniqueSlug = `${formData.slug}-${timestamp}`;
          
          setFormData(prev => ({ ...prev, slug: uniqueSlug }));
          
          // Show helpful error message
          const notification = document.createElement('div');
          notification.className = 'fixed bottom-6 right-6 bg-warning-600 text-white p-4 rounded-xl shadow-lg z-50 flex items-center gap-3 max-w-md';
          notification.innerHTML = `
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <span class="font-semibold block">⚠️ Duplicate URL slug detected</span>
              <span class="text-sm text-warning-100">Updated slug to: ${uniqueSlug}</span>
            </div>
          `;
          document.body.appendChild(notification);
          
          setTimeout(() => {
            if (notification.parentNode) {
              notification.parentNode.removeChild(notification);
            }
          }, 5000);
          
          return; // Don't set saving to false yet, let user try again
        }
        
        // Handle other errors
        const notification = document.createElement('div');
        notification.className = 'fixed bottom-6 right-6 bg-error-600 text-white p-4 rounded-xl shadow-lg z-50 flex items-center gap-3 max-w-md';
        notification.innerHTML = `
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <span class="font-semibold block">❌ Error saving post</span>
            <span class="text-sm text-error-100">${error instanceof Error ? error.message : 'Unknown error'}</span>
          </div>
        `;
        document.body.appendChild(notification);
        
        setTimeout(() => {
          if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
          }
        }, 5000);
      }
      
      setSaving(false);
    }, 1000);
  };

  const tabs = [
    { id: 'content', label: 'Content', icon: <FileText className="w-4 h-4" /> },
    { id: 'seo', label: 'SEO Analysis', icon: <Search className="w-4 h-4" /> },
    { id: 'meta', label: 'Meta & Social', icon: <Search className="w-4 h-4" /> },
    { id: 'localization', label: 'Localization', icon: <Globe className="w-4 h-4" /> }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-50">
      {/* Header */}
      <div className="bg-white/95 backdrop-blur-xl border-b border-neutral-200/50 sticky top-0 z-30 shadow-lg">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onCancel}
                className="p-2 text-neutral-400 hover:text-neutral-600 transition-all duration-200 rounded-xl hover:bg-neutral-100 hover:scale-110"
              >
                <X className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-neutral-900 via-primary-700 to-neutral-900 bg-clip-text text-transparent">
                  {post ? 'Edit Post' : 'Create New Post'}
                </h1>
                <div className="flex items-center gap-3 text-xs text-neutral-500">
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3 text-neutral-400" />
                    Demo User
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-neutral-400" />
                    {new Date().toLocaleDateString()}
                  </span>
                  {seoAnalysis && (
                    <span className="flex items-center gap-1">
                      <TrendingUp className="w-3 h-3 text-neutral-400" />
                      SEO Score: {seoAnalysis.overallSEOScore}%
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                className="px-3 py-2 border border-neutral-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-300 bg-white hover:border-neutral-300 transition-all shadow-sm font-medium"
              >
                <option value="draft">📝 Draft</option>
                <option value="published">🌍 Published</option>
                <option value="archived">📦 Archived</option>
              </select>

              <button
                onClick={() => handleSave('draft')}
                disabled={saving}
                className="px-4 py-2 bg-white border border-neutral-300 text-neutral-700 rounded-xl hover:bg-neutral-50 hover:border-neutral-400 hover:shadow-sm transition-all duration-200 text-sm flex items-center gap-2 font-medium"
              >
                <Save className="w-4 h-4" />
                Save Draft
              </button>

              <button
                onClick={() => handleSave('published')}
                disabled={saving}
                className={`px-5 py-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl hover:from-primary-700 hover:to-primary-800 hover:shadow-lg hover:scale-105 transition-all duration-300 text-sm flex items-center gap-2 font-semibold shadow-md ${saving ? 'opacity-70' : ''}`}
              >
                <Globe className="w-4 h-4" />
                {saving ? 'Publishing...' : 'Publish'}
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-2 mt-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg scale-105'
                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-white/80 border border-neutral-200/50 hover:border-neutral-300 hover:shadow-md hover:scale-[1.02] bg-neutral-50/50'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'content' && (
          <ContentTab 
            formData={formData} 
            setFormData={setFormData}
            seoAnalysis={seoAnalysis}
          />
        )}
        
        {activeTab === 'seo' && (
          <SEOTab 
            formData={formData} 
            setFormData={setFormData}
            seoAnalysis={seoAnalysis}
          />
        )}
        
        {activeTab === 'meta' && (
          <MetaTab 
            formData={formData} 
            setFormData={setFormData}
            seoAnalysis={seoAnalysis}
          />
        )}
        
        {activeTab === 'localization' && (
          <LocalizationTab 
            formData={formData} 
            setFormData={setFormData}
          />
        )}
      </div>
      
      {/* Success Message for Publishing */}
      {showPublishSuccess && (
        <div className="fixed bottom-6 right-6 bg-gradient-to-r from-success-600 to-success-700 text-white p-4 rounded-2xl shadow-2xl z-50 flex items-center gap-3 border border-success-400/20">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="font-bold text-sm">Post published successfully! 🎉</span>
        </div>
      )}
    </div>
  );
};

export default PostEditor;