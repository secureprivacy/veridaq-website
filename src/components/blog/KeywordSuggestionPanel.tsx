import React, { useState, useEffect } from 'react';
import { Search, Plus, X, TrendingUp, Target, Lightbulb, Users } from 'lucide-react';

interface KeywordSuggestionPanelProps {
  selectedKeywords: string[];
  onKeywordsChange: (keywords: string[]) => void;
  focusKeyword: string;
  onFocusKeywordChange: (keyword: string) => void;
}

const TRENDING_KEYWORDS = [
  { keyword: 'EU AMLR 2027', volume: 12000, difficulty: 65, trend: '+15%' },
  { keyword: 'KYC verification', volume: 8500, difficulty: 58, trend: '+12%' },
  { keyword: 'AML screening', volume: 6200, difficulty: 62, trend: '+8%' },
  { keyword: 'GDPR compliance', volume: 15000, difficulty: 72, trend: '+5%' },
  { keyword: 'financial compliance', volume: 9800, difficulty: 68, trend: '+18%' }
];

const SEMANTIC_KEYWORDS = [
  { keyword: 'customer due diligence', volume: 4500, difficulty: 45 },
  { keyword: 'beneficial ownership', volume: 3200, difficulty: 52 },
  { keyword: 'transaction monitoring', volume: 5800, difficulty: 58 },
  { keyword: 'sanctions screening', volume: 2900, difficulty: 48 },
  { keyword: 'compliance automation', volume: 4100, difficulty: 55 }
];

const LOW_COMPETITION = [
  { keyword: 'EU compliance platform 2024', volume: 1200, difficulty: 28 },
  { keyword: 'automated KYC solutions', volume: 1800, difficulty: 32 },
  { keyword: 'Nordic compliance requirements', volume: 900, difficulty: 25 },
  { keyword: 'FinTech AML solutions', volume: 1500, difficulty: 35 },
  { keyword: 'European regulatory technology', volume: 1100, difficulty: 30 }
];

const CONTENT_BASED = [
  { keyword: 'compliance best practices', volume: 3200, difficulty: 42 },
  { keyword: 'regulatory reporting guide', volume: 2100, difficulty: 38 },
  { keyword: 'KYC implementation steps', volume: 1700, difficulty: 35 },
  { keyword: 'AML risk assessment', volume: 2800, difficulty: 48 },
  { keyword: 'compliance framework', volume: 2400, difficulty: 45 }
];

const KeywordSuggestionPanel: React.FC<KeywordSuggestionPanelProps> = ({
  selectedKeywords,
  onKeywordsChange,
  focusKeyword,
  onFocusKeywordChange
}) => {
  const [activeTab, setActiveTab] = useState<'trending' | 'semantic' | 'competition' | 'content'>('trending');
  const [customKeyword, setCustomKeyword] = useState('');

  const keywordSets = {
    trending: TRENDING_KEYWORDS,
    semantic: SEMANTIC_KEYWORDS,
    competition: LOW_COMPETITION,
    content: CONTENT_BASED
  };

  const addKeyword = (keyword: string) => {
    if (!selectedKeywords.includes(keyword)) {
      onKeywordsChange([...selectedKeywords, keyword]);
    }
  };

  const removeKeyword = (keyword: string) => {
    onKeywordsChange(selectedKeywords.filter(k => k !== keyword));
  };

  const addCustomKeyword = () => {
    if (customKeyword.trim() && !selectedKeywords.includes(customKeyword.trim())) {
      onKeywordsChange([...selectedKeywords, customKeyword.trim()]);
      setCustomKeyword('');
    }
  };

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty < 40) return 'text-success-600 bg-success-100';
    if (difficulty < 60) return 'text-warning-600 bg-warning-100';
    return 'text-error-600 bg-error-100';
  };

  const getDifficultyLabel = (difficulty: number) => {
    if (difficulty < 40) return 'Easy';
    if (difficulty < 60) return 'Medium';
    return 'Hard';
  };

  const tabs = [
    { id: 'trending', label: 'Trending', icon: <TrendingUp className="w-4 h-4" />, color: 'text-primary-600' },
    { id: 'semantic', label: 'Semantic', icon: <Target className="w-4 h-4" />, color: 'text-accent-600' },
    { id: 'competition', label: 'Low Competition', icon: <Lightbulb className="w-4 h-4" />, color: 'text-success-600' },
    { id: 'content', label: 'Content-Based', icon: <Users className="w-4 h-4" />, color: 'text-warning-600' }
  ];

  return (
    <div className="space-y-6">
      {/* Selected Keywords */}
      {selectedKeywords.length > 0 && (
        <div className="bg-primary-50 border border-primary-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-4 h-4 text-primary-600" />
            <span className="text-sm font-semibold text-primary-700">Selected Keywords ({selectedKeywords.length})</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedKeywords.map((keyword) => (
              <span 
                key={keyword}
                className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm"
              >
                {keyword}
                <button
                  onClick={() => removeKeyword(keyword)}
                  className="ml-1 hover:bg-primary-200 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Focus Keyword Selection */}
      <div>
        <label className="block text-sm font-semibold text-neutral-700 mb-2">
          Focus Keyword (Primary)
        </label>
        <select
          value={focusKeyword}
          onChange={(e) => onFocusKeywordChange(e.target.value)}
          className="modern-input"
        >
          <option value="">Select focus keyword...</option>
          {selectedKeywords.map((keyword) => (
            <option key={keyword} value={keyword}>{keyword}</option>
          ))}
        </select>
        <p className="text-xs text-neutral-500 mt-1">
          Your main keyword to optimize this content for
        </p>
      </div>

      {/* Custom Keyword Input */}
      <div>
        <label className="block text-sm font-semibold text-neutral-700 mb-2">
          Add Custom Keywords
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={customKeyword}
            onChange={(e) => setCustomKeyword(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addCustomKeyword()}
            placeholder="Enter custom keyword..."
            className="modern-input flex-1"
          />
          <button
            onClick={addCustomKeyword}
            className="px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Keyword Research Tabs */}
      <div>
        <div className="flex gap-1 mb-4 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-white border border-neutral-200 shadow-sm'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
              }`}
            >
              <span className={activeTab === tab.id ? tab.color : 'text-neutral-400'}>
                {tab.icon}
              </span>
              {tab.label}
            </button>
          ))}
        </div>

        <div className="space-y-3 max-h-64 overflow-y-auto">
          {keywordSets[activeTab].map((item, index) => {
            const isSelected = selectedKeywords.includes(item.keyword);
            return (
              <div
                key={index}
                className={`p-4 border rounded-xl transition-all cursor-pointer ${
                  isSelected 
                    ? 'bg-primary-50 border-primary-200' 
                    : 'bg-white border-neutral-200 hover:border-primary-200 hover:bg-primary-50/30'
                }`}
                onClick={() => isSelected ? removeKeyword(item.keyword) : addKeyword(item.keyword)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-neutral-900">{item.keyword}</span>
                      {isSelected && <span className="text-primary-600">✓</span>}
                    </div>
                    <div className="flex items-center gap-4 text-xs">
                      <span className="text-neutral-500">Vol: {item.volume.toLocaleString()}</span>
                      <span className={`px-2 py-1 rounded-full ${getDifficultyColor(item.difficulty)}`}>
                        {getDifficultyLabel(item.difficulty)}
                      </span>
                      {'trend' in item && (
                        <span className="text-success-600">{item.trend}</span>
                      )}
                    </div>
                  </div>
                  <button className={`p-1 rounded-full ${isSelected ? 'text-primary-600' : 'text-neutral-400'}`}>
                    {isSelected ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default KeywordSuggestionPanel;