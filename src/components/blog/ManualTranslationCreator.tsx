import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, Globe } from 'lucide-react';
import UnifiedRichTextEditor from './UnifiedRichTextEditor';
import { generateSlug } from '../../utils/seoAnalysis';

interface ManualTranslationCreatorProps {
  post: any;
  languageCode: string;
  languageName: string;
  languageFlag: string;
  onSave: (translationData: any) => void;
  onCancel: () => void;
}

const ManualTranslationCreator: React.FC<ManualTranslationCreatorProps> = ({
  post,
  languageCode,
  languageName,
  languageFlag,
  onSave,
  onCancel
}) => {
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    meta_title: '',
    meta_description: '',
    meta_keywords: ''
  });

  useEffect(() => {
    if (formData.title && !formData.slug) {
      const generatedSlug = generateSlug(formData.title);
      setFormData(prev => ({ ...prev, slug: generatedSlug }));
    }
  }, [formData.title]);

  const handleSave = async () => {
    if (!formData.title.trim()) {
      alert('Please enter a title');
      return;
    }
    if (!formData.content.trim()) {
      alert('Please enter content');
      return;
    }
    if (!formData.excerpt.trim()) {
      alert('Please enter an excerpt');
      return;
    }
    if (!formData.slug.trim()) {
      alert('Please enter a slug');
      return;
    }

    setSaving(true);

    try {
      await onSave({
        post_id: post.id,
        language_code: languageCode,
        title: formData.title,
        slug: formData.slug,
        content: formData.content,
        excerpt: formData.excerpt,
        meta_title: formData.meta_title || formData.title,
        meta_description: formData.meta_description || formData.excerpt,
        meta_keywords: formData.meta_keywords || '',
        translation_status: 'completed',
        translated_by: 'human',
        published: true
      });
    } catch (error) {
      console.error('Error saving manual translation:', error);
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-50">
      <div className="bg-white/95 backdrop-blur-xl border-b border-neutral-200/50 sticky top-0 z-30 shadow-lg">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onCancel}
                className="p-2 text-neutral-400 hover:text-neutral-600 transition-all duration-200 rounded-xl hover:bg-neutral-100 hover:scale-110"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-2xl">{languageFlag}</span>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-neutral-900 via-primary-700 to-neutral-900 bg-clip-text text-transparent">
                    Create {languageName} Translation
                  </h1>
                </div>
                <div className="text-sm text-neutral-600">
                  Manual entry for: {post.title}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={onCancel}
                className="px-4 py-2 bg-white border border-neutral-300 text-neutral-700 rounded-xl hover:bg-neutral-50 hover:border-neutral-400 hover:shadow-sm transition-all duration-200 text-sm flex items-center gap-2 font-medium"
              >
                Cancel
              </button>

              <button
                onClick={handleSave}
                disabled={saving}
                className={`px-5 py-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl hover:from-primary-700 hover:to-primary-800 hover:shadow-lg hover:scale-105 transition-all duration-300 text-sm flex items-center gap-2 font-semibold shadow-md ${saving ? 'opacity-70' : ''}`}
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save Translation'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3 space-y-6">
            <div className="modern-card p-6 rounded-2xl">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">
                    Title ({languageName}) *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder={`Enter ${languageName} title...`}
                    className="modern-input text-xl font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">
                    URL Slug *
                  </label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                    placeholder="auto-generated-from-title"
                    className="modern-input font-mono text-sm"
                    required
                  />
                  <p className="text-xs text-neutral-500 mt-1">
                    Auto-generated from title. Edit if needed.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">
                    Content ({languageName}) *
                  </label>
                  <UnifiedRichTextEditor
                    value={formData.content}
                    onChange={(value) => setFormData(prev => ({ ...prev, content: value }))}
                    placeholder={`Write or paste content in ${languageName}...`}
                  />
                  <p className="text-xs text-neutral-500 mt-2">
                    Supports copy-paste from Word documents with formatting
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">
                    Excerpt ({languageName}) *
                  </label>
                  <textarea
                    value={formData.excerpt}
                    onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                    placeholder={`Summary in ${languageName}...`}
                    className="modern-input resize-none"
                    rows={3}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="modern-card p-6 rounded-2xl">
              <h3 className="text-lg font-bold text-neutral-900 mb-4">SEO & Meta Data</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">
                    Meta Title
                  </label>
                  <input
                    type="text"
                    value={formData.meta_title}
                    onChange={(e) => setFormData(prev => ({ ...prev, meta_title: e.target.value }))}
                    placeholder="SEO optimized title (defaults to post title)"
                    className="modern-input"
                    maxLength={60}
                  />
                  <div className="text-xs text-neutral-500 mt-1">{formData.meta_title.length}/60 characters</div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">
                    Meta Description
                  </label>
                  <textarea
                    value={formData.meta_description}
                    onChange={(e) => setFormData(prev => ({ ...prev, meta_description: e.target.value }))}
                    placeholder="SEO description for search results (defaults to excerpt)"
                    className="modern-input resize-none"
                    rows={3}
                    maxLength={160}
                  />
                  <div className="text-xs text-neutral-500 mt-1">{formData.meta_description.length}/160 characters</div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">
                    Meta Keywords
                  </label>
                  <input
                    type="text"
                    value={formData.meta_keywords}
                    onChange={(e) => setFormData(prev => ({ ...prev, meta_keywords: e.target.value }))}
                    placeholder="keyword1, keyword2, keyword3"
                    className="modern-input"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="modern-card p-6 rounded-2xl">
              <h4 className="font-bold text-neutral-900 mb-4">Translation Info</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-700">Language</span>
                  <span className="flex items-center gap-2 text-sm font-semibold">
                    {languageFlag} {languageName}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-700">Type</span>
                  <span className="px-2 py-1 bg-accent-100 text-accent-700 rounded-full text-xs font-semibold">
                    Manual Entry
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-700">Status</span>
                  <span className="px-2 py-1 bg-success-100 text-success-700 rounded-full text-xs font-semibold">
                    Ready to Publish
                  </span>
                </div>
              </div>
            </div>

            <div className="modern-card p-6 rounded-2xl bg-primary-50 border border-primary-200">
              <h4 className="font-bold text-primary-900 mb-4 flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Publishing Info
              </h4>
              <div className="space-y-2 text-sm text-primary-700">
                <p>Your translation will be published automatically when saved.</p>
                <p>You can unpublish it later from the Translations management page if needed.</p>
              </div>
            </div>

            <div className="modern-card p-6 rounded-2xl bg-accent-50 border border-accent-200">
              <h4 className="font-bold text-accent-900 mb-3">Tips</h4>
              <div className="space-y-2 text-xs text-accent-700">
                <div className="flex items-start gap-2">
                  <span>✓</span>
                  <span>Copy-paste from Word maintains formatting</span>
                </div>
                <div className="flex items-start gap-2">
                  <span>✓</span>
                  <span>Slug auto-generates but can be edited</span>
                </div>
                <div className="flex items-start gap-2">
                  <span>✓</span>
                  <span>All required fields marked with *</span>
                </div>
                <div className="flex items-start gap-2">
                  <span>✓</span>
                  <span>Review before publishing</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManualTranslationCreator;
