import React, { useState } from 'react';
import { useAllPosts } from '../../hooks/useBlogPosts';
import TranslationEditor from './TranslationEditor';
import ManualTranslationCreator from '../blog/ManualTranslationCreator';
import {
  Globe, CheckCircle, Clock, AlertCircle, FileText, Eye, Edit,
  Trash2, Zap, X, PenLine, Settings, AlertTriangle
} from 'lucide-react';
import { useTranslationManager, LANGUAGES, CLAUDE_MODELS, estimateTokenCount } from '../../hooks/useTranslationManager';

interface TranslationsViewProps {
  quickAction?: string | null;
}

const TranslationsView: React.FC<TranslationsViewProps> = ({ quickAction }) => {
  const { posts, loading: postsLoading } = useAllPosts();
  const {
    translations,
    translating,
    updating,
    failedTranslations,
    retrying,
    getPostModel,
    setPostModel,
    triggerTranslation,
    toggleTranslationStatus,
    deleteTranslation,
    retryTranslation,
    cancelPendingTranslation
  } = useTranslationManager(posts);

  const [editingTranslation, setEditingTranslation] = useState<any>(null);
  const [manualCreation, setManualCreation] = useState<{ post: any, langCode: string } | null>(null);

  const getTranslationStatus = (postId: string, langCode: string) => {
    return translations.find(t => t.post_id === postId && t.language_code === langCode);
  };

  const handleTriggerTranslation = async (postId: string, languages: string[]) => {
    try {
      await triggerTranslation(postId, languages);
    } catch (error) {
      // Error is handled in the hook
    }
  };

  const handleRetryTranslation = async (postId: string, langCode: string) => {
    try {
      await retryTranslation(postId, langCode);
    } catch (error) {
      // Error is handled in the hook
    }
  };

  const handleToggleStatus = async (translationId: string, currentStatus: boolean) => {
    try {
      await toggleTranslationStatus(translationId, currentStatus);
    } catch (error) {
      // Error is handled in the hook
    }
  };

  const handleDelete = async (translationId: string, langName: string) => {
    if (window.confirm(`Are you sure you want to delete the ${langName} translation?`)) {
      try {
        await deleteTranslation(translationId);
      } catch (error) {
        // Error is handled in the hook
      }
    }
  };

  const handleCancel = (postId: string, langCode: string, langName: string) => {
    if (window.confirm(`Stop generating ${langName} translation?`)) {
      cancelPendingTranslation(postId, langCode);
    }
  };

  const createManualTranslation = (post: any, langCode: string) => {
    setManualCreation({ post, langCode });
  };

  if (postsLoading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-neutral-200 rounded w-64"></div>
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-64 bg-neutral-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (editingTranslation) {
    return (
      <TranslationEditor
        translation={editingTranslation}
        onClose={() => setEditingTranslation(null)}
        onSave={() => setEditingTranslation(null)}
      />
    );
  }

  if (manualCreation) {
    const language = LANGUAGES.find(l => l.code === manualCreation.langCode);
    return (
      <ManualTranslationCreator
        post={manualCreation.post}
        languageCode={manualCreation.langCode}
        languageName={language?.name || ''}
        languageFlag={language?.flag || ''}
        onCancel={() => setManualCreation(null)}
        onSave={async (translationData: any) => {
          // The onSave handler will be implemented by useTranslationManager
          // For now, just close the manual creation view
          setManualCreation(null);
        }}
      />
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto bg-gradient-to-br from-white via-neutral-50/30 to-white min-h-screen">
      <div className="flex items-center justify-between mb-12">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Globe className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-neutral-900 via-primary-700 to-neutral-900 bg-clip-text text-transparent">Multi-language Management</h1>
            <p className="text-neutral-600">Manage AI-powered translations for your blog content across {LANGUAGES.length} languages</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <div className="bg-rose-50 p-6 rounded-2xl border border-rose-100">
          <div className="w-12 h-12 bg-rose-500 rounded-xl flex items-center justify-center mb-4 shadow-sm text-white">
            <FileText className="w-6 h-6" />
          </div>
          <div className="text-3xl font-bold text-rose-900 mb-1">
            {posts.filter(p => p.status === 'published').length}
          </div>
          <div className="text-rose-600 font-medium">Published Posts</div>
        </div>

        <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100">
          <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center mb-4 shadow-sm text-white">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div className="text-3xl font-bold text-emerald-900 mb-1">
            {translations.filter(t => t.translation_status === 'completed').length}
          </div>
          <div className="text-emerald-600 font-medium">Completed Translations</div>
        </div>
      </div>

      <div className="space-y-8">
        {posts.filter(p => p.status === 'published').map((post) => {
          const missingLanguages = LANGUAGES.filter(lang =>
            !getTranslationStatus(post.id, lang.code) &&
            !translating.has(`${post.id}-${lang.code}`)
          ).map(l => l.code);

          const failedCount = LANGUAGES.filter(lang =>
            getTranslationStatus(post.id, lang.code)?.translation_status === 'failed'
          ).length;

          const estimatedTokens = estimateTokenCount(post.content || '');
          const currentModelId = getPostModel(post.id);
          const currentModel = CLAUDE_MODELS.find(m => m.id === currentModelId);
          const isTokenWarning = currentModel && estimatedTokens > currentModel.maxOutput;

          // Calculate estimated cost (Input + Output)
          // Assuming output is roughly equal to input for translation (1:1 ratio is a safe upper bound estimate for pricing display)
          const estimatedInputCost = currentModel ? (estimatedTokens / 1000000) * currentModel.inputPrice : 0;
          const estimatedOutputCost = currentModel ? (estimatedTokens / 1000000) * currentModel.outputPrice : 0;
          const costPerLang = estimatedInputCost + estimatedOutputCost;
          const totalMissingCost = costPerLang * missingLanguages.length;

          return (
            <div key={post.id} className="bg-white p-8 rounded-3xl shadow-sm border border-neutral-200/50 hover:shadow-lg transition-all duration-500">
              <div className="flex items-start justify-between gap-6 mb-8">
                <div>
                  <h3 className="text-2xl font-bold text-neutral-900 mb-2">{post.title}</h3>
                  <div className="flex items-center gap-4 text-sm text-neutral-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {new Date(post.published_at).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <FileText className="w-4 h-4" />
                      {estimatedTokens.toLocaleString()} tokens
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-2 bg-neutral-50 p-2 rounded-xl border border-neutral-200">
                      <Settings className="w-4 h-4 text-neutral-400" />
                      <select
                        value={currentModelId}
                        onChange={(e) => setPostModel(post.id, e.target.value)}
                        className="bg-transparent border-none text-sm font-medium text-neutral-700 focus:ring-0 cursor-pointer"
                      >
                        {CLAUDE_MODELS.map(model => (
                          <option key={model.id} value={model.id}>
                            {model.name} ({model.cost})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="text-xs text-neutral-500 font-medium text-right">
                      Est. Cost: <span className="text-success-600">${costPerLang.toFixed(4)}</span> / lang
                      {missingLanguages.length > 0 && (
                        <div className="text-neutral-400">
                          Total: <span className="text-success-600">${totalMissingCost.toFixed(4)}</span> ({missingLanguages.length} langs)
                        </div>
                      )}
                    </div>

                    {isTokenWarning && (
                      <div className="flex items-center gap-1 text-xs text-warning-600 bg-warning-50 px-2 py-1 rounded-lg border border-warning-200">
                        <AlertTriangle className="w-3 h-3" />
                        Exceeds max output
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => window.open(`#blog/${post.slug}`, '_blank')}
                      className="px-4 py-2 bg-white border border-neutral-200 text-neutral-600 rounded-xl hover:bg-neutral-50 hover:border-neutral-300 transition-all duration-200 flex items-center gap-2 font-medium text-sm"
                    >
                      <Eye className="w-4 h-4" />
                      View Post
                    </button>

                    {missingLanguages.length > 0 && (
                      <button
                        onClick={() => handleTriggerTranslation(post.id, missingLanguages)}
                        disabled={translating.has(`${post.id}-${missingLanguages.join(',')}`) || !!isTokenWarning}
                        className={`px-4 py-2 rounded-xl transition-all duration-200 flex items-center gap-2 font-medium text-sm shadow-sm ${isTokenWarning
                            ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed border border-neutral-200'
                            : 'bg-rose-500 text-white hover:bg-rose-600 hover:shadow-md border border-rose-600'
                          }`}
                      >
                        <Zap className="w-4 h-4" />
                        Create All Missing
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* English (Original) */}
                <div className="flex items-center justify-between p-4 rounded-xl border border-success-200 bg-success-50/50">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">🇬🇧</span>
                    <div>
                      <div className="text-sm font-semibold text-success-700">English</div>
                      <div className="text-xs text-success-600">Original</div>
                    </div>
                  </div>
                  <button
                    onClick={() => window.open(`#blog/${post.slug}`, '_blank')}
                    className="p-2 text-success-600 hover:text-success-700 hover:bg-success-200/50 rounded-lg transition-all duration-200 hover:scale-110"
                    title="View English version"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>

                {/* All supported languages */}
                {LANGUAGES.map((lang) => {
                  const translation = getTranslationStatus(post.id, lang.code);
                  const isTranslating = translating.has(`${post.id}-${lang.code}`);
                  const isRetrying = retrying.has(`retry-${post.id}-${lang.code}`);
                  const isUpdating = translation?.id && updating.has(`toggle-${translation.id}`);

                  return (
                    <div
                      key={lang.code}
                      className={`relative flex items-center justify-between p-4 rounded-xl border transition-all duration-300 hover:scale-[1.02] ${translation?.translation_status === 'completed' && translation?.published === true
                        ? 'bg-gradient-to-r from-success-50 to-success-100 border-success-200/60 hover:shadow-md'
                        : translation?.translation_status === 'completed' && translation?.published !== true
                          ? 'bg-gradient-to-r from-neutral-100 to-neutral-200 border-neutral-300/60 hover:shadow-md'
                          : isTranslating || isRetrying
                            ? 'bg-gradient-to-r from-warning-50 to-warning-100 border-warning-200/60 hover:shadow-md'
                            : translation?.translation_status === 'failed'
                              ? 'bg-gradient-to-r from-error-50 to-error-100 border-error-200/60 hover:shadow-md'
                              : 'bg-gradient-to-r from-neutral-50 to-white border-neutral-200/60 hover:bg-gradient-to-r hover:from-primary-50 hover:to-primary-100 hover:border-primary-200 hover:shadow-md'
                        }`}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <span className="text-xl flex-shrink-0">{lang.flag}</span>
                        <div className="min-w-0 flex-1">
                          <div className={`text-sm font-semibold truncate ${translation?.translation_status === 'completed' ? 'text-success-700' :
                            translation?.translation_status === 'pending' || isTranslating ? 'text-warning-700' :
                              translation?.translation_status === 'failed' ? 'text-error-700' :
                                'text-neutral-600'
                            }`}>
                            {lang.name}
                          </div>
                          <div className={`text-xs flex items-center gap-1 ${translation?.translation_status === 'completed' ? 'text-success-600' :
                            isTranslating || isRetrying ? 'text-warning-600' :
                              translation?.translation_status === 'failed' ? 'text-error-600' :
                                'text-neutral-500'
                            }`}>
                            <span>
                              {translation?.translation_status === 'completed' ? '✓ Available' :
                                isTranslating ? '⏳ Creating...' :
                                  isRetrying ? '🔄 Retrying...' :
                                    translation?.translation_status === 'failed' ? '❌ Failed' :
                                      '○ Not translated'
                              }
                              {translation?.translation_status === 'completed' && translation?.published === false && ' (Unpublished)'}
                            </span>
                            {translation?.translation_status === 'completed' && translation?.translated_by === 'human' && (
                              <span className="px-1.5 py-0.5 bg-accent-100 text-accent-700 rounded text-[10px] font-semibold" title="Manual translation">
                                Manual
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                        {translation?.translation_status === 'completed' ? (
                          <>
                            <button
                              onClick={() => setEditingTranslation(translation)}
                              className="p-2 text-accent-600 hover:text-accent-700 transition-all duration-200 rounded-lg hover:bg-accent-200/50 hover:scale-110 flex-shrink-0"
                              title={`Edit ${lang.name} translation`}
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            {translation?.published === true && (
                              <button
                                onClick={() => window.open(`${window.location.origin}/${translation.language_code}/blog/${translation.slug}`, '_blank')}
                                className="p-2 text-success-600 hover:text-success-700 transition-all duration-200 rounded-lg hover:bg-success-200/50 hover:scale-110 flex-shrink-0"
                                title={`View ${lang.name} version`}
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => handleToggleStatus(translation.id, translation.published === true)}
                              disabled={isUpdating}
                              className={`p-2 transition-all duration-200 rounded-lg hover:scale-110 flex-shrink-0 ${translation.published === true
                                ? 'text-warning-600 hover:text-warning-700 hover:bg-warning-200/50'
                                : 'text-success-600 hover:text-success-700 hover:bg-success-200/50'
                                }`}
                              title={translation.published === true ? `Unpublish ${lang.name} version` : `Publish ${lang.name} version`}
                            >
                              {isUpdating ? (
                                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                              ) : (
                                <Globe className="w-4 h-4" />
                              )}
                            </button>
                            <button
                              onClick={() => handleDelete(translation.id, lang.name)}
                              className="p-2 text-error-600 hover:text-error-700 transition-all duration-200 rounded-lg hover:bg-error-200/50 hover:scale-110 flex-shrink-0"
                              title={`Delete ${lang.name} translation`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        ) : isTranslating || isRetrying ? (
                          <div className="flex items-center gap-1 flex-shrink-0">
                            {isRetrying ? (
                              <div className="w-4 h-4 border-2 border-warning-600 border-t-transparent rounded-full animate-spin flex-shrink-0"></div>
                            ) : (
                              <div className="w-4 h-4 border-2 border-warning-600 border-t-transparent rounded-full animate-spin flex-shrink-0"></div>
                            )}
                            <button
                              onClick={() => handleCancel(post.id, lang.code, lang.name)}
                              className="p-1 text-warning-600 hover:text-warning-700 transition-all duration-200 rounded hover:bg-warning-200/50 flex-shrink-0"
                              title={`Cancel ${lang.name} translation`}
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ) : translation?.translation_status === 'failed' ? (
                          <button
                            onClick={() => handleRetryTranslation(post.id, lang.code)}
                            disabled={isRetrying || isTranslating || !!isTokenWarning}
                            className={`p-2 text-warning-600 hover:text-warning-700 transition-all duration-200 rounded-lg hover:bg-warning-200/50 hover:scale-110 flex-shrink-0 ${isTokenWarning ? 'opacity-50 cursor-not-allowed' : ''}`}
                            title={isTokenWarning ? 'Token limit exceeded' : `Retry ${lang.name} translation`}
                          >
                            {isRetrying ? (
                              <div className="w-4 h-4 border-2 border-warning-600 border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                              </svg>
                            )}
                          </button>
                        ) : (
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <button
                              onClick={() => handleTriggerTranslation(post.id, [lang.code])}
                              disabled={isTranslating || !!isTokenWarning}
                              className={`p-2 text-primary-600 hover:text-primary-700 transition-all duration-200 rounded-lg hover:bg-primary-100 hover:scale-110 flex-shrink-0 ${isTokenWarning ? 'opacity-50 cursor-not-allowed' : ''}`}
                              title={isTokenWarning ? 'Token limit exceeded' : `AI Translate to ${lang.name}`}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => createManualTranslation(post, lang.code)}
                              className="p-2 text-accent-600 hover:text-accent-700 transition-all duration-200 rounded-lg hover:bg-accent-100 hover:scale-110 flex-shrink-0"
                              title={`Manual entry for ${lang.name}`}
                            >
                              <PenLine className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Bulk Translation Actions */}
              {(missingLanguages.length > 0 || failedCount > 0) && (
                <div className="mt-6 pt-6 border-t border-neutral-200/50">
                  {missingLanguages.length > 0 && (
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="font-bold text-neutral-900">Missing {missingLanguages.length} translations</h4>
                        <p className="text-sm text-neutral-600">Create translations for all missing languages at once</p>
                      </div>
                      <button
                        onClick={() => handleTriggerTranslation(post.id, missingLanguages)}
                        disabled={translating.has(`${post.id}-${missingLanguages.join(',')}`) || !!isTokenWarning}
                        className={`px-6 py-3 rounded-xl transition-all duration-300 flex items-center gap-2 font-semibold shadow-md ${isTokenWarning
                          ? 'bg-neutral-200 text-neutral-500 cursor-not-allowed'
                          : 'bg-gradient-to-r from-primary-600 to-primary-700 text-white hover:from-primary-700 hover:to-primary-800 hover:shadow-lg hover:scale-105'
                          }`}
                      >
                        <Zap className="w-4 h-4" />
                        {translating.has(`${post.id}-${missingLanguages.join(',')}`) ? 'Creating...' : 'Create All Missing'}
                      </button>
                    </div>
                  )}

                  {failedCount > 0 && (
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-error-700">Failed translations detected</h4>
                        <p className="text-sm text-error-600">Retry {failedCount} failed translations at once</p>
                      </div>
                      <button
                        onClick={() => {
                          const postFailedLanguages = Array.from(failedTranslations)
                            .filter(key => key.startsWith(`${post.id}-`))
                            .map(key => key.split('-')[1]);

                          // Retry each failed translation individually
                          postFailedLanguages.forEach((languageCode) => {
                            handleRetryTranslation(post.id, languageCode);
                          });
                        }}
                        disabled={!!isTokenWarning}
                        className={`px-6 py-3 rounded-xl transition-all duration-300 flex items-center gap-2 font-semibold shadow-md ${isTokenWarning
                          ? 'bg-neutral-200 text-neutral-500 cursor-not-allowed'
                          : 'bg-gradient-to-r from-error-600 to-error-700 text-white hover:from-error-700 hover:to-error-800 hover:shadow-lg hover:scale-105'
                          }`}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Retry All Failed
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {posts.filter(p => p.status === 'published').length === 0 && (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gradient-to-br from-neutral-100 to-neutral-200 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm">
              <Globe className="w-10 h-10 text-neutral-400" />
            </div>
            <h3 className="text-xl font-semibold text-neutral-900 mb-3">No Published Posts</h3>
            <p className="text-neutral-600 mb-8 max-w-md mx-auto">
              Publish some blog posts first to see translation options here.
              Translations are automatically available for all published content.
            </p>
            <button
              onClick={() => window.location.hash = '#cms/blog'}
              className="btn-primary shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
            >
              <FileText className="w-4 h-4 mr-2" />
              Create Your First Post
            </button>
          </div>
        )}
      </div>

      {/* Translation Progress Indicator */}
      {translating.size > 0 && (
        <div className="fixed bottom-6 right-6 bg-white/95 backdrop-blur-xl shadow-2xl rounded-2xl p-6 border border-primary-200/50 max-w-sm z-50">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin shadow-sm"></div>
            <div>
              <div className="font-semibold text-neutral-900">Creating Translations</div>
              <div className="text-sm text-neutral-600">{translating.size} translation{translating.size > 1 ? 's' : ''} in progress</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TranslationsView;