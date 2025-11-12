import React from 'react';
import { Target, AlertTriangle, CheckCircle } from 'lucide-react';
import { 
  getMetaTitleFeedback,
  getMetaDescFeedback,
  getKeywordDensityFeedback,
  getReadabilityFeedback,
  getContentLengthRecommendation
} from '../../utils/seoAnalysis';

interface SEOTabProps {
  formData: any;
  setFormData: (updater: (prev: any) => any) => void;
  seoAnalysis: any;
}

const SEOTab: React.FC<SEOTabProps> = ({ formData, setFormData, seoAnalysis }) => {
  const titleFeedback = seoAnalysis ? getMetaTitleFeedback(seoAnalysis.metaTitleLength) : null;
  const descFeedback = seoAnalysis ? getMetaDescFeedback(seoAnalysis.metaDescLength) : null;
  const keywordFeedback = seoAnalysis ? getKeywordDensityFeedback(seoAnalysis.keywordDensity) : null;
  const readabilityFeedback = seoAnalysis ? getReadabilityFeedback(seoAnalysis.readabilityScore) : null;
  const lengthRecommendation = seoAnalysis ? getContentLengthRecommendation(seoAnalysis.wordCount, 1500) : null;

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      {/* SEO Settings */}
      <div className="space-y-6">
        <div className="modern-card p-8 rounded-3xl">
          <h3 className="text-xl font-bold text-neutral-900 mb-6 flex items-center gap-2">
            <Target className="w-5 h-5 text-primary-600" />
            SEO Configuration
          </h3>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-2">
                Focus Keyword
              </label>
              <input
                type="text"
                value={formData.focus_keyword}
                onChange={(e) => setFormData(prev => ({ ...prev, focus_keyword: e.target.value }))}
                placeholder="EU compliance, KYC verification, AML screening..."
                className="modern-input"
              />
              <p className="text-xs text-neutral-500 mt-1">
                Primary keyword to optimize this content for
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-2">
                Meta Keywords
              </label>
              <textarea
                value={formData.meta_keywords}
                onChange={(e) => setFormData(prev => ({ ...prev, meta_keywords: e.target.value }))}
                placeholder="EU compliance, KYC verification, AML screening, GDPR compliance, financial regulations, European Union, compliance platform, regulatory requirements"
                className="modern-input resize-none"
                rows={3}
              />
              <p className="text-xs text-neutral-500 mt-1">
                Comma-separated keywords for search engines and content categorization
              </p>
            </div>
          </div>
        </div>

        {/* EU Compliance Content Guidelines */}
        <div className="modern-card p-6 rounded-2xl bg-primary-50 border border-primary-200">
          <h4 className="font-bold text-primary-900 mb-4 flex items-center gap-2">
            🇪🇺 EU Compliance Content Guidelines
          </h4>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-primary-600 mt-0.5 flex-shrink-0" />
              <span>Focus on EU AMLR 2027 requirements and implementation</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-primary-600 mt-0.5 flex-shrink-0" />
              <span>Include country-specific compliance considerations</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-primary-600 mt-0.5 flex-shrink-0" />
              <span>Address GDPR compliance and data protection</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-primary-600 mt-0.5 flex-shrink-0" />
              <span>Provide actionable compliance strategies</span>
            </div>
          </div>
        </div>
      </div>

      {/* SEO Analysis Results */}
      <div className="space-y-6">
        {seoAnalysis && (
          <>
            <div className="modern-card p-6 rounded-2xl">
              <h3 className="text-lg font-bold text-neutral-900 mb-4 flex items-center gap-2">
                📊 Content Analysis
              </h3>
              
              <div className="space-y-4">
                {lengthRecommendation && (
                  <div className={`flex items-center justify-between p-3 rounded-xl ${
                    lengthRecommendation.status === 'good' 
                      ? 'bg-success-50 border border-success-200' 
                      : 'bg-warning-50 border border-warning-200'
                  }`}>
                    <span className="text-sm text-neutral-700">Content Length</span>
                    <div className="text-right">
                      <div className={`text-sm font-semibold ${lengthRecommendation.color}`}>
                        {seoAnalysis.wordCount} words
                      </div>
                      <div className="text-xs text-neutral-500">
                        {lengthRecommendation.message}
                      </div>
                    </div>
                  </div>
                )}
                
                {readabilityFeedback && (
                  <div className={`flex items-center justify-between p-3 rounded-xl ${
                    readabilityFeedback.level.includes('Easy') || readabilityFeedback.level === 'Standard'
                      ? 'bg-success-50 border border-success-200'
                      : 'bg-warning-50 border border-warning-200'
                  }`}>
                    <span className="text-sm text-neutral-700">Readability</span>
                    <div className="text-right">
                      <div className={`text-sm font-semibold ${readabilityFeedback.color}`}>
                        {readabilityFeedback.level}
                      </div>
                      <div className="text-xs text-neutral-500">
                        Score: {Math.round(seoAnalysis.readabilityScore)}%
                      </div>
                    </div>
                  </div>
                )}

                {keywordFeedback && (
                  <div className={`flex items-center justify-between p-3 rounded-xl ${
                    keywordFeedback.status === 'good'
                      ? 'bg-success-50 border border-success-200'
                      : 'bg-warning-50 border border-warning-200'
                  }`}>
                    <span className="text-sm text-neutral-700">Keyword Density</span>
                    <div className="text-right">
                      <div className={`text-sm font-semibold ${keywordFeedback.color}`}>
                        {seoAnalysis.keywordDensity.toFixed(1)}%
                      </div>
                      <div className="text-xs text-neutral-500">
                        {keywordFeedback.message}
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-xl border border-neutral-200">
                  <span className="text-sm text-neutral-700">Internal Links</span>
                  <div className="text-right">
                    <span className={`text-sm font-semibold ${lengthRecommendation.color}`}>
                      {seoAnalysis.internalLinks}
                    </span>
                    <div className="text-xs text-neutral-500">
                      {seoAnalysis.internalLinks > 0 ? 'Good linking' : 'Add more links'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Structure Analysis */}
            <div className="modern-card p-6 rounded-2xl">
              <h3 className="text-lg font-bold text-neutral-900 mb-4">Content Structure</h3>
              
              <div className="space-y-3">
                <div className={`flex items-center gap-3 p-2 rounded ${
                  seoAnalysis.contentStructure?.hasIntroduction ? 'bg-success-50' : 'bg-warning-50'
                }`}>
                  <div className={`w-4 h-4 rounded-full ${seoAnalysis.contentStructure?.hasIntroduction ? 'bg-success-500' : 'bg-warning-500'}`}></div>
                  <span className="text-sm font-medium">Strong introduction paragraph</span>
                  {!seoAnalysis.contentStructure?.hasIntroduction && (
                    <span className="text-xs text-warning-600 ml-auto">Needs improvement</span>
                  )}
                </div>
                <div className={`flex items-center gap-3 p-2 rounded ${
                  seoAnalysis.contentStructure?.hasConclusion ? 'bg-success-50' : 'bg-warning-50'
                }`}>
                  <div className={`w-4 h-4 rounded-full ${seoAnalysis.contentStructure?.hasConclusion ? 'bg-success-500' : 'bg-warning-500'}`}></div>
                  <span className="text-sm font-medium">Conclusion section</span>
                  {!seoAnalysis.contentStructure?.hasConclusion && (
                    <span className="text-xs text-warning-600 ml-auto">Add conclusion</span>
                  )}
                </div>
                <div className={`flex items-center gap-3 p-2 rounded ${
                  seoAnalysis.contentStructure?.hasBulletPoints ? 'bg-success-50' : 'bg-neutral-50'
                }`}>
                  <div className={`w-4 h-4 rounded-full ${seoAnalysis.contentStructure?.hasBulletPoints ? 'bg-success-500' : 'bg-neutral-300'}`}></div>
                  <span className="text-sm font-medium">Bullet points or lists</span>
                  {seoAnalysis.contentStructure?.hasBulletPoints && (
                    <span className="text-xs text-success-600 ml-auto">✓ Good structure</span>
                  )}
                </div>
                <div className={`flex items-center gap-3 p-2 rounded ${
                  seoAnalysis.headingStructure?.length >= 3 ? 'bg-success-50' : 'bg-warning-50'
                }`}>
                  <div className={`w-4 h-4 rounded-full ${seoAnalysis.headingStructure?.length >= 3 ? 'bg-success-500' : 'bg-warning-500'}`}></div>
                  <span className="text-sm font-medium">Proper heading structure</span>
                  <span className="text-xs text-neutral-500 ml-auto">
                    {seoAnalysis.headingStructure?.length || 0} headings
                  </span>
                </div>
              </div>
            </div>

            {/* Geo-Optimization Analysis */}
            {seoAnalysis?.geoOptimization && (
              <div className="modern-card p-6 rounded-2xl">
                <h3 className="text-lg font-bold text-neutral-900 mb-4">🌍 Geo-Optimization</h3>
                
                <div className="space-y-4">
                  <div className={`p-3 rounded-xl border ${
                    seoAnalysis.geoOptimization.hasLocalReferences
                      ? 'bg-success-50 border-success-200'
                      : 'bg-warning-50 border-warning-200'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">EU/Local References</span>
                      <span className={`text-xs font-bold ${
                        seoAnalysis.geoOptimization.hasLocalReferences ? 'text-success-700' : 'text-warning-700'
                      }`}>
                        {seoAnalysis.geoOptimization.hasLocalReferences ? '✓ Found' : '⚠ Missing'}
                      </span>
                    </div>
                    {seoAnalysis.geoOptimization.localReferencesFound?.length > 0 && (
                      <div className="text-xs text-success-600 mt-1">
                        Found: {seoAnalysis.geoOptimization.localReferencesFound.slice(0, 3).join(', ')}
                      </div>
                    )}
                  </div>
                  
                  <div className={`p-3 rounded-xl border ${
                    seoAnalysis.geoOptimization.hasLocalKeywords
                      ? 'bg-success-50 border-success-200'
                      : 'bg-warning-50 border-warning-200'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Geo Keywords</span>
                      <span className={`text-xs font-bold ${
                        seoAnalysis.geoOptimization.hasLocalKeywords ? 'text-success-700' : 'text-warning-700'
                      }`}>
                        {seoAnalysis.geoOptimization.geoKeywordsFound?.length || 0} found
                      </span>
                    </div>
                  </div>
                  
                  {seoAnalysis.geoOptimization.recommendedGeoKeywords?.length > 0 && (
                    <div className="p-3 rounded-xl bg-primary-50 border border-primary-200">
                      <div className="text-sm font-medium text-primary-900 mb-2">Recommended Geo Keywords:</div>
                      <div className="flex flex-wrap gap-2">
                        {seoAnalysis.geoOptimization.recommendedGeoKeywords.slice(0, 3).map((keyword: string, index: number) => (
                          <span key={index} className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded-full">
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Competitive Analysis */}
            {seoAnalysis.competitiveAnalysis && (
              <div className="modern-card p-6 rounded-2xl">
                <h3 className="text-lg font-bold text-neutral-900 mb-4">Competitive Analysis</h3>
                
                <div className="space-y-4">
                  <div>
                    <div className="text-sm font-medium text-neutral-700 mb-2">Recommended Length</div>
                    <div className="text-lg font-bold text-primary-600">
                      {seoAnalysis.competitiveAnalysis.recommendedWordCount} words
                    </div>
                    <div className="text-xs text-neutral-500">
                      For competitive EU compliance keywords
                    </div>
                  </div>

                  {seoAnalysis.competitiveAnalysis.missingTopics?.length > 0 && (
                    <div>
                      <div className="text-sm font-medium text-neutral-700 mb-2">Suggested Topics to Cover</div>
                      <div className="space-y-1">
                        {seoAnalysis.competitiveAnalysis.missingTopics.map((topic: string, index: number) => (
                          <div key={index} className="text-xs text-warning-600 flex items-center gap-2">
                            <AlertTriangle className="w-3 h-3" />
                            {topic}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Performance & Accessibility */}
            <div className="modern-card p-6 rounded-2xl">
              <h3 className="text-lg font-bold text-neutral-900 mb-4">Performance & Accessibility</h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-xl border border-neutral-200">
                  <span className="text-sm text-neutral-700">Performance Score</span>
                  <div className="text-right">
                    <div className={`text-sm font-semibold ${
                      seoAnalysis.performanceScore >= 80 ? 'text-success-600' :
                      seoAnalysis.performanceScore >= 60 ? 'text-warning-600' : 'text-error-600'
                    }`}>
                      {Math.round(seoAnalysis.performanceScore)}%
                    </div>
                    <div className="text-xs text-neutral-500">
                      {seoAnalysis.performanceScore >= 80 ? 'Excellent' :
                       seoAnalysis.performanceScore >= 60 ? 'Good' : 'Needs work'}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-xl border border-neutral-200">
                  <span className="text-sm text-neutral-700">Accessibility Score</span>
                  <div className="text-right">
                    <div className={`text-sm font-semibold ${
                      seoAnalysis.accessibilityScore >= 90 ? 'text-success-600' :
                      seoAnalysis.accessibilityScore >= 70 ? 'text-warning-600' : 'text-error-600'
                    }`}>
                      {Math.round(seoAnalysis.accessibilityScore)}%
                    </div>
                    <div className="text-xs text-neutral-500">
                      {seoAnalysis.accessibilityScore >= 90 ? 'Excellent' :
                       seoAnalysis.accessibilityScore >= 70 ? 'Good' : 'Needs work'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SEOTab;