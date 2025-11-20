import React, { useEffect, useState } from 'react';
import { useAllPosts } from '../../hooks/useBlogPosts';
import { supabase } from '../../lib/supabase';
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
    loading: translationsLoading,
    translating,
    updating,
    failedTranslations,
    retrying,
    selectedModel,
    setSelectedModel,
    triggerTranslation,
    toggleTranslationStatus,
    deleteTranslation,
    retryTranslation,
    cancelPendingTranslation,
    forceStopAllTranslations,
    fetchTranslations
  } = useTranslationManager(posts);

  const [editingTranslation, setEditingTranslation] = useState<any | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [creatingManualTranslation, setCreatingManualTranslation] = useState<{ post: any; language: any } | null>(null);
  const [showManualCreator, setShowManualCreator] = useState(false);

  useEffect(() => {
    if (quickAction === 'manage-translations') {
      showNotification('🌍 Translation Management', 'Manage multilingual content versions', 'accent');
    }
  }, [quickAction]);

  const showNotification = (title: string, message: string, type: 'success' | 'error' | 'warning' | 'accent' = 'success') => {
    const notification = document.createElement('div');
    const colors = {
      success: 'bg-success-600',
      error: 'bg-error-600',
      warning: 'bg-warning-600',
      accent: 'bg-accent-600'
    };

    notification.className = `fixed bottom-6 right-6 ${colors[type]} text-white p-4 rounded-xl shadow-lg z-50 flex items-center gap-3 max-w-md`;

    // Icon based on type
    let icon = '';
    if (type === 'success') icon = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />';
    else if (type === 'error') icon = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />';
    else if (type === 'warning') icon = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />';
    else icon = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />';

    notification.innerHTML = `
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        ${icon}
      </svg>
      <div>
        <div class="font-semibold">${title}</div>
        ${message ? `<div class="text-sm opacity-90">${message}</div>` : ''}
      </div>
    `;
    document.body.appendChild(notification);

    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 5000);
  };

  const handleTriggerTranslation = async (postId: string, languages: string[]) => {
    try {
      await triggerTranslation(postId, languages);

      const languageNames = languages.map(code => {
        const lang = LANGUAGES.find(l => l.code === code);
        return lang ? lang.name : code;
      }).join(', ');

      showNotification('Translation Completed', `Successfully translated for: ${languageNames}`, 'success');
    } catch (error) {
      showNotification('Translation Failed', error instanceof Error ? error.message : 'Unknown error', 'error');
    }
  };

  const handleRetryTranslation = async (postId: string, languageCode: string) => {
    try {
      await retryTranslation(postId, languageCode);
      // Success notification will be handled by the triggerTranslation call inside retryTranslation if we awaited it, 
      // but retryTranslation in hook calls triggerTranslation which throws on error.
      // However, triggerTranslation in hook doesn't return the result in a way that we can distinguish partial success easily without checking state.
      // But since we await it, if it doesn't throw, it's mostly success.
    } catch (error) {
      showNotification('Retry Failed', error instanceof Error ? error.message : 'Unknown error', 'error');
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      await toggleTranslationStatus(id, currentStatus);
      showNotification('Status Updated', `Translation ${!currentStatus ? 'published' : 'unpublished'} successfully!`, 'success');
    } catch (error) {
      showNotification('Update Failed', error instanceof Error ? error.message : 'Unknown error', 'error');
    }
  };

  const handleDelete = async (id: string, languageName: string) => {
    if (confirm(`Are you sure you want to delete the ${languageName} translation? This action cannot be undone.`)) {
      try {
        await deleteTranslation(id);
        showNotification('Deleted', `${languageName} translation deleted`, 'error'); // Red color for delete
      } catch (error) {
        showNotification('Delete Failed', error instanceof Error ? error.message : 'Unknown error', 'error');
      }
    }
  };

  const handleCancel = (postId: string, languageCode: string, languageName: string) => {
    if (confirm(`Cancel the pending ${languageName} translation?`)) {
      cancelPendingTranslation(postId, languageCode);
      showNotification('Canceled', `${languageName} translation canceled`, 'warning');
    }
  };

  const editTranslation = (translation: any) => {
    setEditingTranslation(translation);
    setShowEditor(true);
  };

  const createManualTranslation = (post: any, languageCode: string) => {
    const language = LANGUAGES.find(l => l.code === languageCode);
    if (!language) return;

    setCreatingManualTranslation({ post, language });
    setShowManualCreator(true);
  };

  const handleSaveManualTranslation = async (translationData: any) => {
    try {
      const { error } = await supabase
        .from('post_translations')
        .insert({
          post_id: translationData.post_id,
          language_code: translationData.language_code,
          title: translationData.title,
          slug: translationData.slug,
          content: translationData.content,
          excerpt: translationData.excerpt,
          meta_title: translationData.meta_title,
          meta_description: translationData.meta_description,
          meta_keywords: translationData.meta_keywords,
          translation_status: 'completed',
          translated_by: 'human',
          published: false
        });

      if (error) throw error;

      await fetchTranslations();
      setShowManualCreator(false);
      setCreatingManualTranslation(null);
      showNotification('Success', 'Manual translation created successfully!', 'success');
    } catch (error) {
      console.error('Error saving manual translation:', error);
      alert(`Error creating translation: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleSaveTranslation = async (translationData: any) => {
    try {
      const { error } = await supabase
        .from('post_translations')
        .update({
          title: translationData.title,
          content: translationData.content,
          excerpt: translationData.excerpt,
          meta_title: translationData.meta_title,
          meta_description: translationData.meta_description,
          meta_keywords: translationData.meta_keywords,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingTranslation.id);

      if (error) throw error;

      await fetchTranslations();
      setShowEditor(false);
      setEditingTranslation(null);
      showNotification('Updated', 'Translation updated successfully!', 'success');
    } catch (error) {
      alert(`Error updating translation: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const getTranslationStatus = (postId: string, languageCode: string) => {
    const dbTranslation = translations.find(t => t.post_id === postId && t.language_code === languageCode);
    if (dbTranslation) return dbTranslation;

    if (failedTranslations.has(`${postId}-${languageCode}`)) {
      return {
        post_id: postId,
        language_code: languageCode,
        translation_status: 'failed'
      };
    }

    return null;
  };

  const getAllMissingLanguages = (postId: string) => {
    const existingLanguages = translations
      .filter(t => t.post_id === postId)
      .map(t => t.language_code);

    const failedLanguages = Array.from(failedTranslations)
      .filter(key => key.startsWith(`${postId}-`))
      .map(key => key.split('-')[1]);

    const allExistingLanguages = [...existingLanguages, ...failedLanguages];

    return LANGUAGES
      .filter(lang => !allExistingLanguages.includes(lang.code))
      .map(lang => lang.code);
  };

  // Calculate stats
  const completedTranslations = translations.filter(t => t.translation_status === 'completed').length;
  const pendingTranslations = translations.filter(t => t.translation_status === 'pending').length;
  const failedTranslationsCount = failedTranslations.size;

  if (showManualCreator && creatingManualTranslation) {
    return (
      <ManualTranslationCreator
        post={creatingManualTranslation.post}
        languageCode={creatingManualTranslation.language.code}
        languageName={creatingManualTranslation.language.name}
        languageFlag={creatingManualTranslation.language.flag}
        onSave={handleSaveManualTranslation}
        onCancel={() => {
          setShowManualCreator(false);
          setCreatingManualTranslation(null);
        }}
      />
    );
  }

  if (showEditor && editingTranslation) {
    return (
      <TranslationEditor
        translation={editingTranslation}
        onSave={handleSaveTranslation}
        onCancel={() => {
          setShowEditor(false);
          setEditingTranslation(null);
        }}
      />
    );
  }

  if (postsLoading || translationsLoading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-neutral-200 rounded w-64"></div>
          <div className="grid md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-neutral-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 bg-gradient-to-br from-white via-neutral-50/30 to-white min-h-screen">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center shadow-lg">
          <Globe className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-neutral-900 via-primary-700 to-neutral-900 bg-clip-text text-transparent">Multi-language Management</h1>
          <p className="text-neutral-600">Manage AI-powered translations for your blog content across {LANGUAGES.length} languages</p>
        </div>

        {/* Emergency Stop Button */}
        {(translating.size > 0 || translations.some(t => t.translation_status === 'pending')) && (
          <div className="ml-auto">
            <button
              onClick={() => {
                forceStopAllTranslations();
                showNotification('Stopped', 'ALL TRANSLATIONS FORCE STOPPED', 'error');
              }}
              className="flex items-center gap-2 px-4 py-2 bg-error-600 text-white rounded-xl hover:bg-error-700 shadow-lg hover:scale-105 transition-all duration-300 animate-pulse border border-error-400"
            >
              <AlertCircle className="w-4 h-4" />
              STOP ALL
            </button>
          </div>
        )}
      </div>

      {/* Model Selection & Settings */}
      <div className="mb-10 bg-white p-6 rounded-2xl border border-neutral-200/60 shadow-sm">
        <div className="flex items-center gap-2 mb-4 text-neutral-800 font-semibold">
          <Settings className="w-5 h-5 text-primary-600" />
          <h2>Translation Settings</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">AI Model</label>
            <div className="relative">
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full p-3 pl-4 pr-10 bg-neutral-50 border border-neutral-200 rounded-xl appearance-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
              >
                {CLAUDE_MODELS.map(model => (
                  <option key={model.id} value={model.id}>
                    {model.name} ({model.description})
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            <div className="mt-2 flex items-center gap-4 text-xs text-neutral-500">
              {CLAUDE_MODELS.find(m => m.id === selectedModel) && (
                <>
                  <span className="flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    Max Output: {CLAUDE_MODELS.find(m => m.id === selectedModel)?.maxOutput} tokens
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="font-bold">$</span>
                    Cost: {CLAUDE_MODELS.find(m => m.id === selectedModel)?.cost}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid md:grid-cols-4 gap-6 mb-10">
        <div className="bg-gradient-to-br from-primary-50 to-primary-100 p-6 rounded-2xl border border-primary-200/60 hover:shadow-lg hover:scale-[1.02] transition-all duration-300 group">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center mb-3 shadow-lg group-hover:scale-110 transition-transform duration-300">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div className="text-2xl font-bold text-primary-700 mb-1 group-hover:scale-105 transition-transform duration-300">{posts.filter(p => p.status === 'published').length}</div>
          <div className="text-sm font-semibold text-primary-600">Published Posts</div>
        </div>
        <div className="bg-gradient-to-br from-success-50 to-success-100 p-6 rounded-2xl border border-success-200/60 hover:shadow-lg hover:scale-[1.02] transition-all duration-300 group">
          <div className="w-10 h-10 bg-gradient-to-br from-success-500 to-success-600 rounded-xl flex items-center justify-center mb-3 shadow-lg group-hover:scale-110 transition-transform duration-300">
            <CheckCircle className="w-5 h-5 text-white" />
          </div>
          <div className="text-2xl font-bold text-success-700 mb-1 group-hover:scale-105 transition-transform duration-300">{completedTranslations}</div>
          <div className="text-sm font-semibold text-success-600">Completed Translations</div>
        </div>
        <div className="bg-gradient-to-br from-warning-50 to-warning-100 p-6 rounded-2xl border border-warning-200/60 hover:shadow-lg hover:scale-[1.02] transition-all duration-300 group">
          <div className="w-10 h-10 bg-gradient-to-br from-warning-500 to-warning-600 rounded-xl flex items-center justify-center mb-3 shadow-lg group-hover:scale-110 transition-transform duration-300">
            <Clock className="w-5 h-5 text-white" />
          </div>
          <div className="text-2xl font-bold text-warning-700 mb-1 group-hover:scale-105 transition-transform duration-300">{pendingTranslations}</div>
          <div className="text-sm font-semibold text-warning-600">In Progress</div>
        </div>
        <div className="bg-gradient-to-br from-accent-50 to-accent-100 p-6 rounded-2xl border border-accent-200/60 hover:shadow-lg hover:scale-[1.02] transition-all duration-300 group">
          <div className="w-10 h-10 bg-gradient-to-br from-accent-500 to-accent-600 rounded-xl flex items-center justify-center mb-3 shadow-lg group-hover:scale-110 transition-transform duration-300">
            <Globe className="w-5 h-5 text-white" />
          </div>
          <div className="text-2xl font-bold text-accent-700 mb-1 group-hover:scale-105 transition-transform duration-300">{failedTranslationsCount}</div>
          <div className="text-sm font-semibold text-accent-600">Failed Translations</div>
        </div>
      </div>

      {/* Posts and Translations */}
      <div className="space-y-6">
        {posts.filter(p => p.status === 'published').map((post) => {
          const postTranslations = translations.filter((t: any) => t.post_id === post.id);
          const completedTranslations = postTranslations.filter((t: any) => t.translation_status === 'completed');

          const pendingCount = Array.from(translating).filter(key => key.startsWith(`${post.id}-`)).length;
          const failedCount = Array.from(failedTranslations).filter(key => key.startsWith(`${post.id}-`)).length;

          const missingLanguages = getAllMissingLanguages(post.id);

          // Token Check
          const estimatedTokens = estimateTokenCount(post.content || '');
          const currentModel = CLAUDE_MODELS.find(m => m.id === selectedModel);
          const isTokenWarning = currentModel && estimatedTokens > currentModel.maxOutput;

          return (
            <div key={post.id} className="bg-white p-8 rounded-3xl shadow-sm border border-neutral-200/50 hover:shadow-lg transition-all duration-500">
              <div className="flex items-start justify-between mb-8">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-neutral-900 mb-3 hover:text-primary-700 transition-colors">{post.title}</h3>
                  <div className="flex items-center gap-6 text-sm text-neutral-600">
                    <span className="flex items-center gap-2">
                      🇬🇧 <span className="font-semibold">Original (English)</span>
                    </span>
                    <span className="text-neutral-300">•</span>
                    <span className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-success-600" />
                      <span>{completedTranslations.length} completed</span>
                    </span>
                    {pendingCount > 0 && (
                      <>
                        <span className="text-neutral-300">•</span>
                        <span className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-warning-600" />
                          <span className="text-warning-600">{pendingCount} pending</span>
                        </span>
                      </>
                    )}
                    {failedCount > 0 && (
                      <>
                        <span className="text-neutral-300">•</span>
                        <span className="flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-error-600" />
                          <span className="text-error-600">{failedCount} failed</span>
                        </span>
                      </>
                    )}
                  </div>

                  {/* Token Warning Banner */}
                  {isTokenWarning && (
                    <div className="mt-4 p-3 bg-warning-50 border border-warning-200 rounded-lg flex items-start gap-3 text-sm text-warning-800 max-w-2xl">
                      <AlertTriangle className="w-5 h-5 text-warning-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="font-semibold">Potential Token Limit Exceeded</div>
                        <p>
                          This post has approximately {estimatedTokens} tokens, which exceeds the {currentModel?.name} max output limit ({currentModel?.maxOutput}).
                          Translation may be truncated. Consider using a model with a larger output window or splitting the post.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => window.open(`${window.location.origin}/blog/${post.slug}`, '_blank')}
                    className="px-4 py-2 bg-white border border-neutral-300 text-neutral-700 rounded-xl hover:bg-neutral-50 hover:border-neutral-400 hover:shadow-sm transition-all duration-200 text-sm flex items-center gap-2 font-medium"
                  >
                    <Eye className="w-4 h-4" />
                    View Post
                  </button>
                  {missingLanguages.length > 0 && (
                    <button
                      onClick={() => handleTriggerTranslation(post.id, missingLanguages)}
                      disabled={translating.has(`${post.id}-${missingLanguages.join(',')}`) || !!isTokenWarning}
                      className={`px-4 py-2 rounded-xl transition-all duration-300 text-sm flex items-center gap-2 font-semibold shadow-md ${isTokenWarning
                          ? 'bg-neutral-200 text-neutral-500 cursor-not-allowed'
                          : 'bg-gradient-to-r from-primary-600 to-primary-700 text-white hover:from-primary-700 hover:to-primary-800 hover:shadow-lg hover:scale-105'
                        }`}
                      title={isTokenWarning ? 'Token limit exceeded' : 'Create all missing translations'}
                    >
                      <Zap className="w-4 h-4" />
                      {translating.has(`${post.id}-${missingLanguages.join(',')}`) ? 'Creating...' : 'Create All Missing'}
                    </button>
                  )}
                </div>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-4">
                {/* Original English Post */}
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-success-50 to-success-100 border border-success-200/60 rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
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
                              onClick={() => editTranslation(translation)}
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