import React from 'react';
import { Globe, Users, MapPin, AlertTriangle, CheckCircle, Lightbulb } from 'lucide-react';

interface LocalizationTabProps {
  formData: any;
  setFormData: (updater: (prev: any) => any) => void;
}

const REGIONAL_MARKETS = [
  {
    region: 'Nordic Countries',
    countries: ['Denmark', 'Sweden', 'Norway', 'Finland'],
    languages: ['da-DK', 'sv-SE', 'no-NO', 'fi-FI'],
    considerations: [
      'Strong emphasis on data privacy and GDPR compliance',
      'Conservative approach to financial regulations',
      'High trust in government and regulatory institutions',
      'Preference for local case studies and examples'
    ]
  },
  {
    region: 'DACH Region',
    countries: ['Germany', 'Austria', 'Switzerland'],
    languages: ['de-DE', 'de-AT', 'de-CH'],
    considerations: [
      'Extremely detailed regulatory documentation preferred',
      'Strong emphasis on technical precision and accuracy',
      'High standards for data protection (beyond GDPR)',
      'Regional variations in banking and finance practices'
    ]
  },
  {
    region: 'Romance Language Markets',
    countries: ['France', 'Spain', 'Italy', 'Portugal'],
    languages: ['fr-FR', 'es-ES', 'it-IT', 'pt-PT'],
    considerations: [
      'Cultural sensitivity around financial privacy',
      'Local regulatory nuances within EU framework',
      'Preference for relationship-based business approach',
      'Regional banking traditions and practices'
    ]
  },
  {
    region: 'Benelux Region',
    countries: ['Netherlands', 'Belgium'],
    languages: ['nl-NL', 'nl-BE', 'fr-BE'],
    considerations: [
      'Multilingual business environments',
      'International finance hub considerations',
      'Cross-border compliance complexity',
      'Strong focus on innovation and technology'
    ]
  }
];

const LOCALIZATION_GUIDELINES = {
  'da-DK': {
    tone: 'Professional but approachable, emphasize trustworthiness',
    examples: 'Use Danish financial institutions as examples',
    regulations: 'Reference Finanstilsynet and Danish FSA guidelines',
    cultural: 'Emphasize transparency and social responsibility'
  },
  'sv-SE': {
    tone: 'Direct and efficient communication, avoid redundancy',
    examples: 'Reference Swedish banks like SEB, Handelsbanken',
    regulations: 'Mention Finansinspektionen (FI) requirements',
    cultural: 'Focus on innovation and digital-first solutions'
  },
  'no-NO': {
    tone: 'Straightforward and practical, emphasize reliability',
    examples: 'Use Norges Bank and Norwegian financial sector examples',
    regulations: 'Reference Finanstilsynet Norway guidelines',
    cultural: 'Highlight environmental and ethical considerations'
  },
  'fi-FI': {
    tone: 'Technical precision, methodical approach',
    examples: 'Reference Finnish banking sector and Nordea',
    regulations: 'Mention FIN-FSA (Finanssivalvonta) requirements',
    cultural: 'Emphasize technological innovation and efficiency'
  },
  'de-DE': {
    tone: 'Highly detailed and technical, authoritative',
    examples: 'Reference BaFin regulations and German banking standards',
    regulations: 'Detailed compliance with German financial law',
    cultural: 'Emphasize engineering precision and thoroughness'
  },
  'de-AT': {
    tone: 'Professional with Austrian business etiquette',
    examples: 'Reference FMA Austria and Austrian banking practices',
    regulations: 'Austrian-specific interpretations of EU directives',
    cultural: 'Balance between German precision and Austrian formality'
  },
  'fr-FR': {
    tone: 'Sophisticated and relationship-focused',
    examples: 'Reference ACPR and French banking institutions',
    regulations: 'French implementation of EU regulations',
    cultural: 'Emphasize quality, sophistication, and tradition'
  },
  'es-ES': {
    tone: 'Warm but professional, relationship-oriented',
    examples: 'Reference Bank of Spain and Spanish financial sector',
    regulations: 'Spanish regulatory framework within EU context',
    cultural: 'Emphasize trust-building and personal relationships'
  },
  'it-IT': {
    tone: 'Elegant and design-conscious presentation',
    examples: 'Reference Bank of Italy and Italian banking traditions',
    regulations: 'Italian regulatory nuances and compliance culture',
    cultural: 'Appreciate style, tradition, and family business values'
  },
  'pt-PT': {
    tone: 'Respectful and traditional, emphasize heritage',
    examples: 'Reference Bank of Portugal and Portuguese financial sector',
    regulations: 'Portuguese regulatory framework and EU compliance',
    cultural: 'Highlight tradition, family values, and community focus'
  },
  'nl-NL': {
    tone: 'Direct and practical, no-nonsense approach',
    examples: 'Reference DNB Netherlands and Dutch banking sector',
    regulations: 'Dutch regulatory interpretation and implementation',
    cultural: 'Emphasize pragmatism, innovation, and international outlook'
  }
};

const LocalizationTab: React.FC<LocalizationTabProps> = ({ formData, setFormData }) => {
  const [selectedMarket, setSelectedMarket] = React.useState<string>('');

  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Localization Settings */}
        <div className="lg:col-span-2 space-y-6">
          <div className="modern-card p-8 rounded-3xl">
            <h3 className="text-xl font-bold text-neutral-900 mb-6 flex items-center gap-2">
              <Globe className="w-5 h-5 text-primary-600" />
              Localization Instructions
            </h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  Cultural Adaptation Notes
                </label>
                <textarea
                  value={formData.localization_notes || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, localization_notes: e.target.value }))}
                  placeholder="Provide specific instructions for cultural adaptation:
• Regional examples to include (e.g., 'Use Danish banks like Danske Bank for examples')
• Cultural sensitivities to consider
• Local regulatory nuances to emphasize
• Tone adjustments for different markets
• Currency and measurement preferences"
                  className="modern-input resize-none"
                  rows={6}
                />
                <p className="text-xs text-neutral-500 mt-1">
                  Instructions for translators on how to adapt content for specific cultural contexts
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  Regional Focus Markets (Select primary targets)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {REGIONAL_MARKETS.map((market) => (
                    <label key={market.region} className="flex items-start p-3 bg-neutral-50 rounded-xl border border-neutral-200 hover:bg-primary-50 transition-colors cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="mt-1 mr-3 text-primary-600" 
                        onChange={(e) => {
                          const currentMarkets = formData.target_markets || [];
                          if (e.target.checked) {
                            setFormData(prev => ({ ...prev, target_markets: [...currentMarkets, market.region] }));
                          } else {
                            setFormData(prev => ({ ...prev, target_markets: currentMarkets.filter((m: string) => m !== market.region) }));
                          }
                        }}
                        checked={(formData.target_markets || []).includes(market.region)}
                      />
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-neutral-900">{market.region}</div>
                        <div className="text-xs text-neutral-600">{market.countries.join(', ')}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  Content Adaptation Priority
                </label>
                <select
                  value={formData.adaptation_priority || 'medium'}
                  onChange={(e) => setFormData(prev => ({ ...prev, adaptation_priority: e.target.value }))}
                  className="modern-input"
                >
                  <option value="low">Low - Basic translation sufficient</option>
                  <option value="medium">Medium - Moderate cultural adaptation</option>
                  <option value="high">High - Extensive localization required</option>
                </select>
                <p className="text-xs text-neutral-500 mt-1">
                  Determines how much cultural adaptation is needed beyond translation
                </p>
              </div>
            </div>
          </div>

          {/* Translation Quality Guidelines */}
          <div className="modern-card p-6 rounded-2xl bg-accent-50 border border-accent-200">
            <h4 className="font-bold text-accent-900 mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Translation Quality Guidelines
            </h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <span className="text-accent-600">🎯</span>
                <span><strong>Accuracy:</strong> Maintain technical precision while adapting tone</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-accent-600">🌍</span>
                <span><strong>Cultural Relevance:</strong> Use local examples, regulations, and institutions</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-accent-600">💼</span>
                <span><strong>Business Context:</strong> Adapt to local business practices and etiquette</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-accent-600">⚖️</span>
                <span><strong>Regulatory Focus:</strong> Emphasize country-specific compliance nuances</span>
              </div>
            </div>
          </div>
        </div>

        {/* Regional Guidelines Sidebar */}
        <div className="space-y-6">
          <div className="modern-card p-6 rounded-2xl">
            <h4 className="font-bold text-neutral-900 mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary-600" />
              Regional Markets
            </h4>
            <div className="space-y-4">
              {REGIONAL_MARKETS.map((market) => (
                <button
                  key={market.region}
                  onClick={() => setSelectedMarket(selectedMarket === market.region ? '' : market.region)}
                  className="w-full text-left p-3 bg-neutral-50 rounded-xl border border-neutral-200 hover:bg-primary-50 hover:border-primary-200 transition-colors"
                >
                  <div className="font-semibold text-sm text-neutral-900 mb-1">{market.region}</div>
                  <div className="text-xs text-neutral-600">{market.countries.join(', ')}</div>
                  
                  {selectedMarket === market.region && (
                    <div className="mt-3 pt-3 border-t border-neutral-200">
                      <div className="space-y-2">
                        {market.considerations.map((consideration, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <span className="text-primary-600">•</span>
                            <span className="text-xs text-neutral-700">{consideration}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Localization Checklist */}
          <div className="modern-card p-6 rounded-2xl">
            <h4 className="font-bold text-neutral-900 mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-success-600" />
              Localization Checklist
            </h4>
            <div className="space-y-3">
              <ChecklistItem text="Include regional regulatory examples" />
              <ChecklistItem text="Adapt currency and measurement units" />
              <ChecklistItem text="Use local business terminology" />
              <ChecklistItem text="Reference country-specific institutions" />
              <ChecklistItem text="Adjust tone for cultural preferences" />
              <ChecklistItem text="Include local contact information" />
            </div>
          </div>

          {/* AI Translation Instructions */}
          <div className="modern-card p-6 rounded-2xl bg-primary-50 border border-primary-200">
            <h4 className="font-bold text-primary-900 mb-4 flex items-center gap-2">
              <Lightbulb className="w-5 h-5" />
              AI Translation Prompt
            </h4>
            <div className="space-y-3 text-sm">
              <div>
                <div className="font-semibold text-primary-800 mb-1">Enhanced Translation Instructions:</div>
                <div className="text-primary-700 text-xs bg-white/50 p-3 rounded-lg">
                  "Translate this compliance content to {`{language}`} with cultural localization. 
                  Adapt examples to use local financial institutions, reference country-specific 
                  regulatory bodies, and adjust the tone to match local business communication 
                  preferences. Maintain technical accuracy while making content culturally relevant."
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface ChecklistItemProps {
  text: string;
  checked?: boolean;
}

const ChecklistItem: React.FC<ChecklistItemProps> = ({ text, checked = false }) => {
  return (
    <div className={`flex items-center gap-3 p-2 rounded-lg ${checked ? 'bg-success-50' : ''}`}>
      <div className={`w-4 h-4 rounded ${checked ? 'bg-success-500' : 'bg-neutral-200'} flex items-center justify-center`}>
        {checked && <CheckCircle className="w-3 h-3 text-white" />}
      </div>
      <span className="text-xs text-neutral-700">{text}</span>
    </div>
  );
};

export default LocalizationTab;