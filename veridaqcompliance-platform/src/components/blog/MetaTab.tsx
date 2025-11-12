import React from 'react';
import { Search, CheckCircle } from 'lucide-react';
import ImageUploader from './ImageUploader';
import { getMetaTitleFeedback, getMetaDescFeedback } from '../../utils/seoAnalysis';

interface MetaTabProps {
  formData: any;
  setFormData: (updater: (prev: any) => any) => void;
  seoAnalysis: any;
}

const MetaTab: React.FC<MetaTabProps> = ({ formData, setFormData, seoAnalysis }) => {
  const titleFeedback = seoAnalysis ? getMetaTitleFeedback(seoAnalysis.metaTitleLength) : null;
  const descFeedback = seoAnalysis ? getMetaDescFeedback(seoAnalysis.metaDescLength) : null;

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      <div className="space-y-6">
        <div className="modern-card p-8 rounded-3xl">
          <h3 className="text-xl font-bold text-neutral-900 mb-6 flex items-center gap-2">
            <Search className="w-5 h-5 text-primary-600" />
            Search Engine Optimization
          </h3>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-2">
                Meta Title
              </label>
              <input
                type="text"
                value={formData.meta_title}
                onChange={(e) => setFormData(prev => ({ ...prev, meta_title: e.target.value }))}
                placeholder="EU Compliance Guide 2027 | KYC & AML Solutions | Veridaq"
                className="modern-input"
                maxLength={60}
              />
              {titleFeedback && (
                <div className="mt-2 flex items-center gap-2">
                  <span className={`text-xs ${titleFeedback.color}`}>
                    {titleFeedback.message}
                  </span>
                  <span className="text-xs text-neutral-500">
                    {seoAnalysis?.metaTitleLength || 0}/60
                  </span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-2">
                Meta Description
              </label>
              <textarea
                value={formData.meta_description}
                onChange={(e) => setFormData(prev => ({ ...prev, meta_description: e.target.value }))}
                placeholder="Comprehensive guide to EU compliance requirements, KYC verification processes, and AML screening solutions. Get ready for EU AMLR 2027 with expert insights and practical implementation strategies."
                className="modern-input resize-none"
                rows={4}
                maxLength={160}
              />
              {descFeedback && (
                <div className="mt-2 flex items-center gap-2">
                  <span className={`text-xs ${descFeedback.color}`}>
                    {descFeedback.message}
                  </span>
                  <span className="text-xs text-neutral-500">
                    {seoAnalysis?.metaDescLength || 0}/160
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Featured Image Upload */}
        <div className="modern-card p-6 rounded-2xl">
          <ImageUploader
            value={formData.featured_image_url}
            onChange={(url) => setFormData(prev => ({ ...prev, featured_image_url: url }))}
            label="Social Media Image"
            placeholder="https://images.pexels.com/photos/..."
          />
        </div>
      </div>

      <div className="space-y-6">
        {/* Social Media Preview */}
        <div className="modern-card p-6 rounded-2xl">
          <h4 className="font-bold text-neutral-900 mb-4">Social Media Preview</h4>
          <div className="border border-neutral-200 rounded-xl p-4 bg-neutral-50">
            {formData.featured_image_url && (
              <div className="aspect-video bg-neutral-200 rounded-lg mb-3 overflow-hidden">
                <img 
                  src={formData.featured_image_url} 
                  alt="Preview"
                  srcSet={`
                    ${formData.featured_image_url}?w=400 400w,
                    ${formData.featured_image_url}?w=600 600w,
                    ${formData.featured_image_url}?w=800 800w
                  `}
                  sizes="(max-width: 400px) 100vw, 400px"
                  loading="lazy"
                  width="400"
                  height="225"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            )}
            <div className="text-primary-600 text-xs mb-1">veridaq.com</div>
            <div className="font-semibold text-sm text-neutral-900 mb-1 line-clamp-2">
              {formData.meta_title || formData.title || 'Post Title'}
            </div>
            <div className="text-xs text-neutral-600 line-clamp-2">
              {formData.meta_description || formData.excerpt || 'Post description...'}
            </div>
          </div>
        </div>

        {/* EU Geo-targeting */}
        <div className="modern-card p-6 rounded-2xl">
          <h4 className="font-bold text-neutral-900 mb-4 flex items-center gap-2">
            🌍 Geographic Targeting
          </h4>
          <div className="space-y-3">
            <div className="text-sm">
              <div className="font-medium text-neutral-700 mb-2">Primary Markets</div>
              <div className="flex flex-wrap gap-2">
                {['Denmark', 'Sweden', 'Norway', 'Finland', 'Germany'].map((country) => (
                  <span key={country} className="px-2 py-1 bg-primary-100 text-primary-700 rounded text-xs">
                    {country}
                  </span>
                ))}
              </div>
            </div>
            <div className="text-sm">
              <div className="font-medium text-neutral-700 mb-2">Secondary Markets</div>
              <div className="flex flex-wrap gap-2">
                {['France', 'Spain', 'Italy', 'Portugal', 'Netherlands'].map((country) => (
                  <span key={country} className="px-2 py-1 bg-accent-100 text-accent-700 rounded text-xs">
                    {country}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Schema Markup Suggestions */}
        {seoAnalysis?.schemaMarkupSuggestions && (
          <div className="modern-card p-6 rounded-2xl">
            <h4 className="font-bold text-neutral-900 mb-4">Schema Markup</h4>
            <div className="space-y-2">
              {seoAnalysis.schemaMarkupSuggestions.map((suggestion: string, index: number) => (
                <div key={index} className="text-xs text-neutral-600 flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-success-600" />
                  {suggestion}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SEO Tips */}
        <div className="modern-card p-6 rounded-2xl bg-accent-50 border border-accent-200">
          <h4 className="font-bold text-accent-900 mb-4">💡 SEO Tips</h4>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-2">
              <span className="text-accent-600">🎯</span>
              <span>Use your focus keyword in the first paragraph</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-accent-600">📝</span>
              <span>Include semantic keywords naturally throughout</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-accent-600">🔗</span>
              <span>Add 2-3 internal links to related content</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-accent-600">📊</span>
              <span>Aim for 1500+ words for competitive keywords</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MetaTab;