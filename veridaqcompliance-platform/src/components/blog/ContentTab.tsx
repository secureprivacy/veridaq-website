import React from 'react';
import UnifiedRichTextEditor from './UnifiedRichTextEditor';
import ImageUploader from './ImageUploader';
import { generateSlug } from '../../utils/seoAnalysis';
import { CheckCircle, AlertTriangle, FileText, Plus, Target, Lightbulb, Globe } from 'lucide-react';

interface ContentTabProps {
  formData: any;
  setFormData: (updater: (prev: any) => any) => void;
  seoAnalysis: any;
}

const ContentTab: React.FC<ContentTabProps> = ({ formData, setFormData, seoAnalysis }) => {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="grid lg:grid-cols-5 gap-6">
        {/* Main Content Editor */}
        <div className="lg:col-span-4 space-y-6">
          <div className="modern-card p-6 rounded-2xl">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  Post Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter a compelling title for your EU compliance content..."
                  className="modern-input text-xl font-bold focus:ring-2 focus:ring-primary-500/30 focus:border-primary-300 hover:border-neutral-300 transition-all shadow-sm"
                  required
                />
                {seoAnalysis && (
                  <div className="mt-2 text-xs flex items-center gap-4">
                    <span className={`${formData.title.length <= 60 ? 'text-success-600' : 'text-warning-600'}`}>
                      {formData.title.length}/60 characters (title)
                    </span>
                    {seoAnalysis.titleOptimization?.hasPowerWords && (
                      <span className="text-success-600 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Power words detected
                      </span>
                    )}
                    {formData.meta_title && formData.meta_title !== formData.title && (
                      <span className="text-xs text-neutral-500">
                        SEO title: {seoAnalysis.metaTitleLength} chars
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  URL Slug *
                </label>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-neutral-500 text-sm">veridaq.com/blog/</span>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                    className="modern-input text-sm font-mono flex-1 focus:ring-2 focus:ring-primary-500/30 focus:border-primary-300 hover:border-neutral-300 transition-all shadow-sm"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  Content *
                </label>
                <UnifiedRichTextEditor
                  value={formData.content}
                  onChange={(value) => setFormData(prev => ({ ...prev, content: value }))}
                  placeholder="Start writing your compliance content..."
                />
                {seoAnalysis && (
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                    <div className={`p-3 rounded-xl border transition-all duration-200 hover:scale-[1.02] ${seoAnalysis.wordCount >= 800 ? 'bg-gradient-to-r from-success-50 to-success-100 text-success-800 border-success-200/60' : 'bg-gradient-to-r from-warning-50 to-warning-100 text-warning-800 border-warning-200/60'}`}>
                      📊 {seoAnalysis.wordCount} words
                    </div>
                    <div className={`p-3 rounded-xl border transition-all duration-200 hover:scale-[1.02] ${seoAnalysis.readabilityScore >= 60 ? 'bg-gradient-to-r from-success-50 to-success-100 text-success-800 border-success-200/60' : 'bg-gradient-to-r from-warning-50 to-warning-100 text-warning-800 border-warning-200/60'}`}>
                      📖 {Math.round(seoAnalysis.readabilityScore)}% readable
                    </div>
                    <div className={`p-3 rounded-xl border transition-all duration-200 hover:scale-[1.02] ${seoAnalysis.keywordDensity >= 0.5 && seoAnalysis.keywordDensity <= 2.5 ? 'bg-gradient-to-r from-success-50 to-success-100 text-success-800 border-success-200/60' : 'bg-gradient-to-r from-warning-50 to-warning-100 text-warning-800 border-warning-200/60'}`}>
                      🎯 {seoAnalysis.keywordDensity.toFixed(1)}% density
                    </div>
                    <div className={`p-3 rounded-xl border transition-all duration-200 hover:scale-[1.02] ${seoAnalysis.internalLinks > 0 ? 'bg-gradient-to-r from-success-50 to-success-100 text-success-800 border-success-200/60' : 'bg-gradient-to-r from-neutral-50 to-neutral-100 text-neutral-700 border-neutral-200/60'}`}>
                      🔗 {seoAnalysis.internalLinks} links
                    </div>
                    <div className={`p-3 rounded-xl border transition-all duration-200 hover:scale-[1.02] ${seoAnalysis.geoOptimization?.hasLocalReferences ? 'bg-gradient-to-r from-success-50 to-success-100 text-success-800 border-success-200/60' : 'bg-gradient-to-r from-warning-50 to-warning-100 text-warning-800 border-warning-200/60'}`}>
                      🌍 {seoAnalysis.geoOptimization?.localReferencesFound?.length || 0} geo refs
                    </div>
                    <div className={`p-3 rounded-xl border transition-all duration-200 hover:scale-[1.02] ${seoAnalysis.performanceScore >= 80 ? 'bg-gradient-to-r from-success-50 to-success-100 text-success-800 border-success-200/60' : 'bg-gradient-to-r from-warning-50 to-warning-100 text-warning-800 border-warning-200/60'}`}>
                      ⚡ {Math.round(seoAnalysis.performanceScore)}% perf
                    </div>
                    <div className={`p-3 rounded-xl border transition-all duration-200 hover:scale-[1.02] ${seoAnalysis.accessibilityScore >= 90 ? 'bg-gradient-to-r from-success-50 to-success-100 text-success-800 border-success-200/60' : 'bg-gradient-to-r from-warning-50 to-warning-100 text-warning-800 border-warning-200/60'}`}>
                      ♿ {Math.round(seoAnalysis.accessibilityScore)}% a11y
                    </div>
                    <div className={`p-3 rounded-xl border transition-all duration-200 hover:scale-[1.02] ${seoAnalysis.overallSEOScore >= 80 ? 'bg-gradient-to-r from-primary-50 to-primary-100 text-primary-800 border-primary-200/60' : seoAnalysis.overallSEOScore >= 60 ? 'bg-gradient-to-r from-warning-50 to-warning-100 text-warning-800 border-warning-200/60' : 'bg-gradient-to-r from-error-50 to-error-100 text-error-800 border-error-200/60'}`}>
                      📈 {seoAnalysis.overallSEOScore}% SEO
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  Post Summary *
                </label>
                <textarea
                  value={formData.excerpt}
                  onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                  placeholder="Write a compelling summary that captures the key value and takeaways from your compliance content..."
                  className="modern-input resize-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-300 hover:border-neutral-300 transition-all shadow-sm"
                  rows={3}
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* SEO Score */}
          {seoAnalysis && (
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-neutral-200/50 hover:shadow-lg transition-all duration-300">
              <h3 className="text-lg font-bold text-neutral-900 mb-4 flex items-center gap-2">
                <div className="w-7 h-7 bg-gradient-to-br from-accent-500 to-accent-600 rounded-xl flex items-center justify-center shadow-md">
                  <span className="text-white text-sm">📊</span>
                </div>
                SEO Score
              </h3>
              
              <div className="text-center mb-6">
                <div className={`text-4xl font-bold mb-2 ${
                  seoAnalysis.overallSEOScore >= 80 ? 'text-success-600' :
                  seoAnalysis.overallSEOScore >= 60 ? 'text-warning-600' : 'text-error-600'
                }`}>
                  {seoAnalysis.overallSEOScore}%
                </div>
                <div className={`px-3 py-1.5 rounded-full text-xs font-bold shadow-sm ${
                  seoAnalysis.overallSEOScore >= 80 ? 'bg-success-100 text-success-700' :
                  seoAnalysis.overallSEOScore >= 60 ? 'bg-warning-100 text-warning-700' : 'bg-error-100 text-error-700'
                }`}>
                  {seoAnalysis.overallSEOScore >= 80 ? 'Excellent' : 
                   seoAnalysis.overallSEOScore >= 60 ? 'Good' : 'Needs Work'}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-neutral-700 font-medium">Content Quality</span>
                  <span className="text-xs font-bold text-primary-600">{seoAnalysis.contentStructure?.contentDepthScore || 0}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-neutral-700 font-medium">Keywords</span>
                  <span className="text-xs font-bold text-primary-600">{Math.min(100, seoAnalysis.keywordDensity * 20)}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-neutral-700 font-medium">Readability</span>
                  <span className="text-xs font-bold text-primary-600">{Math.round(seoAnalysis.readabilityScore)}%</span>
                </div>
              </div>
            </div>
          )}

          {/* Focus Keyword */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-neutral-200/50 hover:shadow-lg transition-all duration-300">
            <h4 className="font-bold text-neutral-900 mb-3 flex items-center gap-2">
              <div className="w-6 h-6 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center shadow-md">
                <Target className="w-3 h-3 text-white" />
              </div>
              Focus Keyword
            </h4>
            <div>
              <input
                type="text"
                value={formData.focus_keyword}
                onChange={(e) => setFormData(prev => ({ ...prev, focus_keyword: e.target.value }))}
                placeholder="EU compliance"
                className="modern-input focus:ring-2 focus:ring-primary-500/30 focus:border-primary-300 hover:border-neutral-300 transition-all shadow-sm"
              />
              <p className="text-xs text-neutral-500 mt-1">
                Primary keyword to optimize this post for (e.g., "EU compliance", "KYC verification")
              </p>
            </div>
          </div>

          {/* Featured Image */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-neutral-200/50 hover:shadow-lg transition-all duration-300">
            <ImageUploader
              value={formData.featured_image_url}
              onChange={(url) => setFormData(prev => ({ ...prev, featured_image_url: url }))}
              label="Featured Image"
              placeholder="https://images.pexels.com/photos/..."
            />
          </div>

          {/* Content Templates */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-neutral-200/50 hover:shadow-lg transition-all duration-300">
            <h4 className="font-bold text-neutral-900 mb-3 flex items-center gap-2">
              <div className="w-6 h-6 bg-gradient-to-br from-accent-500 to-accent-600 rounded-lg flex items-center justify-center shadow-md">
                <span className="text-white text-xs">📝</span>
              </div>
              Content Templates
            </h4>
            <div className="space-y-3">
              <button
                onClick={() => {
                  const template = '<h2>Key Benefits</h2><ul><li>Benefit 1: Improved compliance efficiency</li><li>Benefit 2: Reduced regulatory risk</li><li>Benefit 3: Cost savings</li></ul>';
                  setFormData(prev => ({ ...prev, content: prev.content + template }));
                }}
                className="w-full flex items-center gap-3 p-3 bg-neutral-50 border border-neutral-200 rounded-xl hover:bg-primary-50 hover:border-primary-300 hover:shadow-sm transition-all duration-200 hover:scale-[1.02]"
              >
                <Plus className="w-4 h-4 text-neutral-600" />
                <div className="text-left">
                  <div className="font-semibold text-neutral-900 text-sm">Benefits List</div>
                  <div className="text-xs text-neutral-600">Add key benefits section</div>
                </div>
              </button>
              
              <button
                onClick={() => {
                  const template = '<h2>Implementation Steps</h2><ol><li>Assessment and planning</li><li>System configuration</li><li>Testing and validation</li><li>Go-live and monitoring</li></ol>';
                  setFormData(prev => ({ ...prev, content: prev.content + template }));
                }}
                className="w-full flex items-center gap-3 p-3 bg-neutral-50 border border-neutral-200 rounded-xl hover:bg-primary-50 hover:border-primary-300 hover:shadow-sm transition-all duration-200 hover:scale-[1.02]"
              >
                <Plus className="w-4 h-4 text-neutral-600" />
                <div className="text-left">
                  <div className="font-semibold text-neutral-900 text-sm">Implementation Steps</div>
                  <div className="text-xs text-neutral-600">Add step-by-step guide</div>
                </div>
              </button>
              
              <button
                onClick={() => {
                  const template = '<div class="callout"><div class="callout-icon">💡</div><div class="callout-content">Pro Tip: Important compliance consideration that readers should remember.</div></div>';
                  setFormData(prev => ({ ...prev, content: prev.content + template }));
                }}
                className="w-full flex items-center gap-3 p-3 bg-neutral-50 border border-neutral-200 rounded-xl hover:bg-primary-50 hover:border-primary-300 hover:shadow-sm transition-all duration-200 hover:scale-[1.02]"
              >
                <Plus className="w-4 h-4 text-neutral-600" />
                <div className="text-left">
                  <div className="font-semibold text-neutral-900 text-sm">Pro Tip Callout</div>
                  <div className="text-xs text-neutral-600">Highlight important info</div>
                </div>
              </button>
            </div>
          </div>

          {/* Writing Tips */}
          <div className="bg-gradient-to-br from-accent-50 to-primary-50 p-5 rounded-2xl border border-accent-200/60 shadow-sm">
            <h4 className="font-bold text-accent-900 mb-3 flex items-center gap-2">
              <div className="w-6 h-6 bg-accent-600 rounded-lg flex items-center justify-center shadow-md">
                <Lightbulb className="w-3 h-3 text-white" />
              </div>
              Writing Tips
            </h4>
            <div>
              <div className="space-y-2 text-xs">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-3 h-3 text-accent-600 mt-0.5 flex-shrink-0" />
                  <span>Use your focus keyword in the first 100 words</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-3 h-3 text-accent-600 mt-0.5 flex-shrink-0" />
                  <span>Include practical examples and case studies</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-3 h-3 text-accent-600 mt-0.5 flex-shrink-0" />
                  <span>Add internal links to related content</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-3 h-3 text-accent-600 mt-0.5 flex-shrink-0" />
                  <span>Aim for 1,500+ words for competitive topics</span>
                </div>
              </div>
            </div>
          </div>

          {/* EU Compliance Guidelines */}
          <div className="bg-gradient-to-br from-primary-50 to-primary-100 p-5 rounded-2xl border border-primary-200/60 shadow-sm">
            <h4 className="font-bold text-primary-900 mb-3 flex items-center gap-2">
              <div className="w-6 h-6 bg-primary-600 rounded-lg flex items-center justify-center shadow-md">
                <span className="text-white text-xs">🇪🇺</span>
              </div>
              EU Compliance Guidelines
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-start gap-2">
                <CheckCircle className="w-3 h-3 text-primary-600 mt-0.5 flex-shrink-0" />
                <span>Focus on EU AMLR 2027 requirements</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-3 h-3 text-primary-600 mt-0.5 flex-shrink-0" />
                <span>Include practical implementation steps</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-3 h-3 text-primary-600 mt-0.5 flex-shrink-0" />
                <span>Address GDPR compliance requirements</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-3 h-3 text-primary-600 mt-0.5 flex-shrink-0" />
                <span>Provide actionable compliance strategies</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-primary-600 mt-0.5 flex-shrink-0" />
                <span>Include local regulatory references and examples</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-primary-600 mt-0.5 flex-shrink-0" />
                <span>Use geo-targeted keywords for specific markets</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentTab;