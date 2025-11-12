import React, { useState, useEffect } from 'react';
import { X, Save, Globe, ArrowLeft } from 'lucide-react';
import UnifiedRichTextEditor from '../blog/UnifiedRichTextEditor';
import ImageUploader from '../blog/ImageUploader';

interface TranslationEditorProps {
  translation: any;
  onSave: (translationData: any) => void;
  onCancel: () => void;
}

const TranslationEditor: React.FC<TranslationEditorProps> = ({ translation, onSave, onCancel }) => {
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    meta_title: '',
    meta_description: '',
    meta_keywords: ''
  });

  const getLanguageName = (code: string) => {
    const languageNames: Record<string, string> = {
      'da': 'Danish',
      'sv': 'Swedish', 
      'no': 'Norwegian',
      'fi': 'Finnish',
      'de': 'German',
      'fr': 'French',
      'es': 'Spanish',
      'it': 'Italian',
      'pt': 'Portuguese',
      'nl': 'Dutch'
    };
    return languageNames[code] || code.toUpperCase();
  };

  const getLanguageFlag = (code: string) => {
    const flags: Record<string, string> = {
      'da': '🇩🇰',
      'sv': '🇸🇪',
      'no': '🇳🇴',
      'fi': '🇫🇮',
      'de': '🇩🇪',
      'fr': '🇫🇷',
      'es': '🇪🇸',
      'it': '🇮🇹',
      'pt': '🇵🇹',
      'nl': '🇳🇱'
    };
    return flags[code] || '🌐';
  };

  useEffect(() => {
    if (translation) {
      setFormData({
        title: translation.title || '',
        content: translation.content || '',
        excerpt: translation.excerpt || '',
        meta_title: translation.meta_title || '',
        meta_description: translation.meta_description || '',
        meta_keywords: translation.meta_keywords || ''
      });
    }
  }, [translation]);

  const handleSave = () => {
    setSaving(true);
    
    setTimeout(() => {
      onSave(formData);
      setSaving(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-50">
      {/* Header */}
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
                  <span className="text-2xl">{getLanguageFlag(translation.language_code)}</span>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-neutral-900 via-primary-700 to-neutral-900 bg-clip-text text-transparent">
                    Edit {getLanguageName(translation.language_code)} Translation
                  </h1>
                </div>
                <div className="text-sm text-neutral-600">
                  Original slug: {translation.slug}
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

      {/* Content */}
      <div className="p-6 max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Main Editor */}
          <div className="lg:col-span-3 space-y-6">
            <div className="modern-card p-6 rounded-2xl">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">
                    Title ({getLanguageName(translation.language_code)}) *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder={`Enter ${getLanguageName(translation.language_code)} title...`}
                    className="modern-input text-xl font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">
                    Content ({getLanguageName(translation.language_code)}) *
                  </label>
                  <UnifiedRichTextEditor
                    value={formData.content}
                    onChange={(value) => setFormData(prev => ({ ...prev, content: value }))}
                    placeholder={`Write content in ${getLanguageName(translation.language_code)}...`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">
                    Excerpt ({getLanguageName(translation.language_code)}) *
                  </label>
                  <textarea
                    value={formData.excerpt}
                    onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                    placeholder={`Summary in ${getLanguageName(translation.language_code)}...`}
                    className="modern-input resize-none"
                    rows={3}
                    required
                  />
                </div>
              </div>
            </div>

            {/* SEO Meta Fields */}
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
                    placeholder="SEO optimized title"
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
                    placeholder="SEO description for search results"
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

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Translation Status */}
            <div className="modern-card p-6 rounded-2xl">
              <h4 className="font-bold text-neutral-900 mb-4">Translation Status</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-700">Language</span>
                  <span className="flex items-center gap-2 text-sm font-semibold">
                    {getLanguageFlag(translation.language_code)} {getLanguageName(translation.language_code)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-700">Status</span>
                  <span className="px-2 py-1 bg-success-100 text-success-700 rounded-full text-xs font-semibold">
                    ✓ Completed
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-700">Published</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    translation.published !== false 
                      ? 'bg-success-100 text-success-700' 
                      : 'bg-neutral-100 text-neutral-700'
                  }`}>
                    {translation.published !== false ? '🌍 Live' : '📝 Draft'}
                  </span>
                </div>
              </div>
            </div>


            {/* Translation Guidelines */}
            <div className="modern-card p-6 rounded-2xl bg-accent-50 border border-accent-200">
              <h4 className="font-bold text-accent-900 mb-4">Translation Guidelines</h4>
              <div className="space-y-2 text-xs">
                <div className="flex items-start gap-2">
                  <span className="text-accent-600">🎯</span>
                  <span>Maintain technical accuracy while adapting tone</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-accent-600">🏛️</span>
                  <span>Use local regulatory examples and institutions</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-accent-600">💼</span>
                  <span>Adapt to local business communication style</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-accent-600">📍</span>
                  <span>Include country-specific implementation details</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TranslationEditor;