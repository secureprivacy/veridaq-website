import React, { useState, useEffect } from 'react';
import { useAllPosts } from '../../hooks/useBlogPosts';
import { supabase } from '../../lib/supabase';
import TranslationEditor from './TranslationEditor';
import ManualTranslationCreator from '../blog/ManualTranslationCreator';
import {
  Globe, CheckCircle, Clock, AlertCircle, FileText, Eye, Edit,
  Trash2, Zap, RefreshCw, X, PenLine
} from 'lucide-react';

const LANGUAGES = [
  { code: 'da', name: 'Danish', flag: '🇩🇰' },
  { code: 'sv', name: 'Swedish', flag: '🇸🇪' },
  { code: 'no', name: 'Norwegian', flag: '🇳🇴' },
  { code: 'fi', name: 'Finnish', flag: '🇫🇮' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'it', name: 'Italian', flag: '🇮🇹' },
  { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
  { code: 'nl', name: 'Dutch', flag: '🇳🇱' }
];

interface TranslationsViewProps {
  quickAction?: string | null;
}

const TranslationsView: React.FC<TranslationsViewProps> = ({ quickAction }) => {
  const { posts, loading: postsLoading } = useAllPosts();
  const [translations, setTranslations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [translating, setTranslating] = useState<Set<string>>(new Set());
  const [updating, setUpdating] = useState<Set<string>>(new Set());
  const [failedTranslations, setFailedTranslations] = useState<Set<string>>(new Set());
  const [editingTranslation, setEditingTranslation] = useState<any | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [retrying, setRetrying] = useState<Set<string>>(new Set());
  const [creatingManualTranslation, setCreatingManualTranslation] = useState<{ post: any; language: any } | null>(null);
  const [showManualCreator, setShowManualCreator] = useState(false);

  useEffect(() => {
    fetchTranslations();
  }, []);

  useEffect(() => {
    if (quickAction === 'manage-translations') {
      const notification = document.createElement('div');
      notification.className = 'fixed top-6 right-6 bg-accent-600 text-white p-4 rounded-xl shadow-lg z-50 flex items-center gap-3 max-w-sm';
      notification.innerHTML = `
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
        <div>
          <div className="font-semibold">🌍 Translation Management</div>
          <div className="text-sm text-accent-100">Manage multilingual content versions</div>
        </div>
      `;
      document.body.appendChild(notification);
      
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 5000);
    }
  }, [quickAction]);

  const fetchTranslations = async () => {
    try {
      setLoading(true);
      console.log('🔄 Fetching translations from database...');
      const { data, error } = await supabase
        .from('post_translations')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      console.log('📊 Translations fetched:', data?.length || 0, 'records');
      setTranslations(data || []);
    } catch (err) {
      console.error('❌ Error fetching translations:', err);
    } finally {
      setLoading(false);
    }
  };

  const triggerTranslation = async (postId: string, languages: string[]) => {
    console.log('🚀 triggerTranslation called:', { postId, languages });
    
    // Create unique keys for each individual language translation
    const translationKeys = languages.map(lang => `${postId}-${lang}`);
    console.log('🔑 Translation keys:', translationKeys);
    
    // Add all keys to the translating set
    setTranslating(prev => new Set([...prev, ...translationKeys]));
    console.log('⏳ Added to translating state, total translating:', translationKeys.length);
    
    try {
      // Get the post data for translation
      const post = posts.find(p => p.id === postId);
      if (!post) {
        console.error('❌ Post not found in local state:', postId);
        throw new Error('Post not found');
      }
      
      console.log('📄 Post found for translation:', post.title);
      
      for (const languageCode of languages) {
        const currentKey = `${postId}-${languageCode}`;
        console.log(`\n🌍 Processing translation for ${languageCode}...`);
        
        // Check if translation already exists
        const existingTranslation = translations.find(t => 
          t.post_id === postId && t.language_code === languageCode
        );

        if (existingTranslation) {
          console.log(`⏭️ Translation for ${languageCode} already exists, skipping`);
          console.log(`Translation for ${languageCode} already exists, skipping`);
          // Remove from translating set since we're skipping
          setTranslating(prev => {
            const newSet = new Set(prev);
            newSet.delete(currentKey);
            return newSet;
          });
          continue;
        }

        // Call the translate-post Edge Function
        console.log('📡 Calling translate-post Edge Function...');
        const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/translate-post`;
        console.log('🔗 API URL:', apiUrl);
        
        const requestPayload = {
          postId: postId,
          targetLanguages: [languageCode],
          translationProvider: 'openai'
        };
        console.log('📦 Request payload:', requestPayload);
        
        try {
          const translationResponse = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/translate-post`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestPayload)
          });
          
          console.log('📡 Edge Function response status:', translationResponse.status);

          const translationResult = await translationResponse.json();
          console.log('📋 Edge Function response:', translationResult);

          if (!translationResult.success) {
            console.error('❌ Translation function returned error:', translationResult.error);
            throw new Error(translationResult.error || 'Translation failed');
          }

          console.log('🎉 AI Translation completed successfully:', translationResult);
          
          // Remove from translating set and add to failed set if there were errors
          const langResult = translationResult.results?.find((r: any) => r.languageCode === languageCode);
          console.log('🔍 Language-specific result:', langResult);
          
          if (langResult?.status === 'error') {
            console.log(`❌ Translation failed for ${languageCode}:`, langResult.error);
            setFailedTranslations(prev => new Set([...prev, currentKey]));
          }
          
          setTranslating(prev => {
            const newSet = new Set(prev);
            newSet.delete(currentKey);
            return newSet;
          });
          
          console.log('✅ State updated for', languageCode);
        } catch (aiError) {
          console.error('❌ AI Translation network/API error:', aiError);
          
          // Mark as failed (no database entry)
          setFailedTranslations(prev => new Set([...prev, currentKey]));
          
          setTranslating(prev => {
            const newSet = new Set(prev);
            newSet.delete(currentKey);
            return newSet;
          });
        }
      }

      // Refresh translations
      console.log('🔄 Refreshing translations from database...');
      await fetchTranslations();
      
      const languageNames = languages.map(code => {
        const lang = LANGUAGES.find(l => l.code === code);
        return lang ? lang.name : code;
      }).join(', ');
      
      const notification = document.createElement('div');
      notification.className = 'fixed bottom-6 right-6 bg-success-600 text-white p-4 rounded-xl shadow-lg z-50 flex items-center gap-3';
      notification.innerHTML = `
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="font-semibold">🤖 Translation completed for: ${languageNames}</span>
      `;
      document.body.appendChild(notification);
      
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 3000);
      
    } catch (error) {
      console.error('Translation error:', error);
      
      // Clear all translation keys on error
      setTranslating(prev => {
        const newSet = new Set(prev);
        translationKeys.forEach(key => newSet.delete(key));
        return newSet;
      });
      
      // Show error notification instead of alert
      const notification = document.createElement('div');
      notification.className = 'fixed bottom-6 right-6 bg-error-600 text-white p-4 rounded-xl shadow-lg z-50 flex items-center gap-3 max-w-md';
      notification.innerHTML = `
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <div>
          <span className="font-semibold block">❌ Translation Failed</span>
          <span className="text-sm text-error-100">${error instanceof Error ? error.message : 'Unknown error'}</span>
        </div>
      `;
      document.body.appendChild(notification);
      
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 5000);
    }
  };

  const toggleTranslationStatus = async (translationId: string, currentStatus: boolean) => {
    const updateKey = `toggle-${translationId}`;
    setUpdating(prev => new Set([...prev, updateKey]));
    
    try {
      const { error } = await supabase
        .from('post_translations')
        .update({ published: !currentStatus })
        .eq('id', translationId);

      if (error) throw error;

      // Refresh translations
      await fetchTranslations();
      
      const notification = document.createElement('div');
      notification.className = 'fixed bottom-6 right-6 bg-success-600 text-white p-4 rounded-xl shadow-lg z-50 flex items-center gap-3';
      notification.innerHTML = `
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="font-semibold">🌍 Translation ${!currentStatus ? 'published' : 'unpublished'} successfully!</span>
      `;
      document.body.appendChild(notification);
      
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 3000);
      
    } catch (error) {
      console.error('Error updating translation status:', error);
      alert(`Failed to update translation status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setUpdating(prev => {
        const newSet = new Set(prev);
        newSet.delete(updateKey);
        return newSet;
      });
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

      const notification = document.createElement('div');
      notification.className = 'fixed bottom-6 right-6 bg-success-600 text-white p-4 rounded-xl shadow-lg z-50 flex items-center gap-3';
      notification.innerHTML = `
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span class="font-semibold">Manual translation created successfully!</span>
      `;
      document.body.appendChild(notification);

      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 3000);
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

      // Refresh translations
      await fetchTranslations();
      setShowEditor(false);
      setEditingTranslation(null);

      // Show success notification
      const notification = document.createElement('div');
      notification.className = 'fixed bottom-6 right-6 bg-success-600 text-white p-4 rounded-xl shadow-lg z-50 flex items-center gap-3';
      notification.innerHTML = `
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span class="font-semibold">🌍 Translation updated successfully!</span>
      `;
      document.body.appendChild(notification);
      
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 3000);
    } catch (error) {
      alert(`Error updating translation: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const deleteTranslation = async (translationId: string, languageName: string) => {
    if (confirm(`Are you sure you want to delete the ${languageName} translation? This action cannot be undone.`)) {
      try {
        const { error } = await supabase
          .from('post_translations')
          .delete()
          .eq('id', translationId);

        if (error) throw error;

        // Refresh translations
        await fetchTranslations();

        // Show success notification
        const notification = document.createElement('div');
        notification.className = 'fixed bottom-6 right-6 bg-error-600 text-white p-4 rounded-xl shadow-lg z-50 flex items-center gap-3';
        notification.innerHTML = `
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          <span className="font-semibold">🗑️ ${languageName} translation deleted</span>
        `;
        document.body.appendChild(notification);
        
        setTimeout(() => {
          if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
          }
        }, 3000);
      } catch (error) {
        alert(`Error deleting translation: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  };

  const retryTranslation = async (postId: string, languageCode: string) => {
    const retryKey = `retry-${postId}-${languageCode}`;
    setRetrying(prev => new Set([...prev, retryKey]));
    
    try {
      // Remove from failed set (this allows retry)
      setFailedTranslations(prev => {
        const newSet = new Set(prev);
        newSet.delete(`${postId}-${languageCode}`);
        return newSet;
      });

      // Now trigger a new translation
      await triggerTranslation(postId, [languageCode]);

    } catch (error) {
      console.error('Error retrying translation:', error);
      alert(`Failed to retry translation: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setRetrying(prev => {
        const newSet = new Set(prev);
        newSet.delete(retryKey);
        return newSet;
      });
    }
  };

  const cancelPendingTranslation = (postId: string, languageCode: string, languageName: string) => {
    if (confirm(`Cancel the pending ${languageName} translation?`)) {
      // Simply remove from translating state and mark as failed locally
      const currentKey = `${postId}-${languageCode}`;
      
      setTranslating(prev => {
        const newSet = new Set(prev);
        newSet.delete(currentKey);
        return newSet;
      });
      
      setFailedTranslations(prev => new Set([...prev, currentKey]));
      
      // Show notification
      const notification = document.createElement('div');
      notification.className = 'fixed bottom-6 right-6 bg-warning-600 text-white p-4 rounded-xl shadow-lg z-50 flex items-center gap-3';
      notification.innerHTML = `
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <span className="font-semibold">⚠️ ${languageName} translation canceled</span>
      `;
      document.body.appendChild(notification);
      
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 3000);
    }
  };

  const forceStopAllTranslations = () => {
    console.log('🛑 FORCE STOPPING ALL TRANSLATIONS');
    
    // Move all currently translating items to failed state
    const currentlyTranslating = Array.from(translating);
    
    setTranslating(new Set());
    setUpdating(new Set());
    
    // Mark all currently translating items as failed
    setFailedTranslations(prev => new Set([...prev, ...currentlyTranslating]));
    
    // Show immediate feedback
    const notification = document.createElement('div');
    notification.className = 'fixed top-6 right-6 bg-error-600 text-white p-4 rounded-xl shadow-lg z-50 flex items-center gap-3';
    notification.innerHTML = `
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
      </svg>
      <span className="font-semibold">🛑 ALL TRANSLATIONS FORCE STOPPED</span>
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 4000);
    
  };
  const getTranslationStatus = (postId: string, languageCode: string) => {
    const dbTranslation = translations.find(t => t.post_id === postId && t.language_code === languageCode);
    if (dbTranslation) return dbTranslation;
    
    // Check for failed translations in local state
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
    
    // Also exclude languages that failed (in local state)
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

  if (postsLoading || loading) {
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
      <div className="flex items-center gap-3 mb-12">
        <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center shadow-lg">
          <Globe className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-neutral-900 via-primary-700 to-neutral-900 bg-clip-text text-transparent">Multi-language Management</h1>
          <p className="text-neutral-600">Manage AI-powered translations for your blog content across 11 languages</p>
        </div>
        
        {/* Emergency Stop Button - Always visible when there are any running/pending translations */}
        {(translating.size > 0 || translations.some(t => t.translation_status === 'pending')) && (
          <div className="ml-auto">
            <button
              onClick={forceStopAllTranslations}
              className="flex items-center gap-2 px-4 py-2 bg-error-600 text-white rounded-xl hover:bg-error-700 shadow-lg hover:scale-105 transition-all duration-300 animate-pulse border border-error-400"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
              🛑 FORCE STOP ALL
            </button>
          </div>
        )}
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
          
          // Count pending and failed from local state
          const pendingCount = Array.from(translating).filter(key => key.startsWith(`${post.id}-`)).length;
          const failedCount = Array.from(failedTranslations).filter(key => key.startsWith(`${post.id}-`)).length;
          
          const missingLanguages = getAllMissingLanguages(post.id);
          
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
                      onClick={() => triggerTranslation(post.id, missingLanguages)}
                      disabled={translating.has(`${post.id}-${missingLanguages.join(',')}`)}
                      className="px-4 py-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl hover:from-primary-700 hover:to-primary-800 hover:shadow-lg hover:scale-105 transition-all duration-300 text-sm flex items-center gap-2 font-semibold shadow-md disabled:opacity-70"
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
                      className={`relative flex items-center justify-between p-4 rounded-xl border transition-all duration-300 hover:scale-[1.02] ${
                        translation?.translation_status === 'completed' && translation?.published === true
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
                          <div className={`text-sm font-semibold truncate ${
                            translation?.translation_status === 'completed' ? 'text-success-700' :
                            translation?.translation_status === 'pending' || isTranslating ? 'text-warning-700' :
                            translation?.translation_status === 'failed' ? 'text-error-700' :
                            'text-neutral-600'
                          }`}>
                            {lang.name}
                          </div>
                          <div className={`text-xs flex items-center gap-1 ${
                            translation?.translation_status === 'completed' ? 'text-success-600' :
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
                              onClick={() => toggleTranslationStatus(translation.id, translation.published === true)}
                              disabled={isUpdating}
                              className={`p-2 transition-all duration-200 rounded-lg hover:scale-110 flex-shrink-0 ${
                                translation.published === true
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
                              onClick={() => deleteTranslation(translation.id, lang.name)}
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
                              onClick={() => cancelPendingTranslation(post.id, lang.code, lang.name)}
                              className="p-1 text-warning-600 hover:text-warning-700 transition-all duration-200 rounded hover:bg-warning-200/50 flex-shrink-0"
                              title={`Cancel ${lang.name} translation`}
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ) : translation?.translation_status === 'failed' ? (
                          <button
                            onClick={() => retryTranslation(post.id, lang.code)}
                            disabled={isRetrying || isTranslating}
                            className="p-2 text-warning-600 hover:text-warning-700 transition-all duration-200 rounded-lg hover:bg-warning-200/50 hover:scale-110 flex-shrink-0"
                            title={`Retry ${lang.name} translation`}
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
                              onClick={() => triggerTranslation(post.id, [lang.code])}
                              disabled={isTranslating}
                              className="p-2 text-primary-600 hover:text-primary-700 transition-all duration-200 rounded-lg hover:bg-primary-100 hover:scale-110 flex-shrink-0"
                              title={`AI Translate to ${lang.name}`}
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
                        onClick={() => triggerTranslation(post.id, missingLanguages)}
                        disabled={translating.has(`${post.id}-${missingLanguages.join(',')}`)}
                        className="px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl hover:from-primary-700 hover:to-primary-800 hover:shadow-lg hover:scale-105 transition-all duration-300 flex items-center gap-2 font-semibold shadow-md disabled:opacity-70"
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
                          retryTranslation(post.id, languageCode);
                        });
                      }}
                      className="px-6 py-3 bg-gradient-to-r from-error-600 to-error-700 text-white rounded-xl hover:from-error-700 hover:to-error-800 hover:shadow-lg hover:scale-105 transition-all duration-300 flex items-center gap-2 font-semibold shadow-md"
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