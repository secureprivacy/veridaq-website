import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export const LANGUAGES = [
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

export const CLAUDE_MODELS = [
    { id: 'claude-3-haiku-20240307', name: 'Claude 3 Haiku', description: 'Fast & Efficient', cost: 'Low', contextWindow: 200000, maxOutput: 4096 },
    { id: 'claude-3-5-haiku-20241022', name: 'Claude 3.5 Haiku', description: 'Balanced Intelligence', cost: 'Medium', contextWindow: 200000, maxOutput: 8192 },
    { id: 'claude-haiku-4-5-20251001', name: 'Claude Haiku 4.5', description: 'Next Gen Intelligence', cost: 'High', contextWindow: 200000, maxOutput: 8192 }
];

export const estimateTokenCount = (text: string): number => {
    // Rough estimation: ~4 characters per token for English text
    return Math.ceil(text.length / 4);
};

export const useTranslationManager = (posts: any[]) => {
    const [translations, setTranslations] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [translating, setTranslating] = useState<Set<string>>(new Set());
    const [updating, setUpdating] = useState<Set<string>>(new Set());
    const [failedTranslations, setFailedTranslations] = useState<Set<string>>(new Set());
    const [retrying, setRetrying] = useState<Set<string>>(new Set());
    const [selectedModel, setSelectedModel] = useState<string>(CLAUDE_MODELS[0].id);

    const fetchTranslations = useCallback(async () => {
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
    }, []);

    useEffect(() => {
        fetchTranslations();
    }, [fetchTranslations]);

    const triggerTranslation = async (postId: string, languages: string[]) => {
        console.log('🚀 triggerTranslation called:', { postId, languages, selectedModel });

        // Create unique keys for each individual language translation
        const translationKeys = languages.map(lang => `${postId}-${lang}`);

        // Add all keys to the translating set
        setTranslating(prev => new Set([...prev, ...translationKeys]));

        try {
            // Get the post data for translation
            const post = posts.find(p => p.id === postId);
            if (!post) {
                throw new Error('Post not found');
            }

            for (const languageCode of languages) {
                const currentKey = `${postId}-${languageCode}`;

                // Check if translation already exists
                const existingTranslation = translations.find(t =>
                    t.post_id === postId && t.language_code === languageCode
                );

                if (existingTranslation) {
                    console.log(`⏭️ Translation for ${languageCode} already exists, skipping`);
                    setTranslating(prev => {
                        const newSet = new Set(prev);
                        newSet.delete(currentKey);
                        return newSet;
                    });
                    continue;
                }

                // Call the translate-post Edge Function
                const requestPayload = {
                    postId: postId,
                    targetLanguages: [languageCode],
                    translationProvider: 'claude', // Changed from 'openai' to 'claude' as per plan
                    model: selectedModel // Pass the selected model
                };

                try {
                    const translationResponse = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/translate-post`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(requestPayload)
                    });

                    const translationResult = await translationResponse.json();

                    if (!translationResult.success) {
                        throw new Error(translationResult.error || 'Translation failed');
                    }

                    // Check for language specific errors
                    const langResult = translationResult.results?.find((r: any) => r.languageCode === languageCode);

                    if (langResult?.status === 'error') {
                        console.log(`❌ Translation failed for ${languageCode}:`, langResult.error);
                        setFailedTranslations(prev => new Set([...prev, currentKey]));
                    }

                    setTranslating(prev => {
                        const newSet = new Set(prev);
                        newSet.delete(currentKey);
                        return newSet;
                    });

                } catch (aiError) {
                    console.error('❌ AI Translation network/API error:', aiError);
                    setFailedTranslations(prev => new Set([...prev, currentKey]));
                    setTranslating(prev => {
                        const newSet = new Set(prev);
                        newSet.delete(currentKey);
                        return newSet;
                    });
                }
            }

            // Refresh translations
            await fetchTranslations();

        } catch (error) {
            console.error('Translation error:', error);

            // Clear all translation keys on error
            setTranslating(prev => {
                const newSet = new Set(prev);
                translationKeys.forEach(key => newSet.delete(key));
                return newSet;
            });
            throw error; // Re-throw to let UI handle notification
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
            await fetchTranslations();
        } catch (error) {
            console.error('Error updating translation status:', error);
            throw error;
        } finally {
            setUpdating(prev => {
                const newSet = new Set(prev);
                newSet.delete(updateKey);
                return newSet;
            });
        }
    };

    const deleteTranslation = async (translationId: string) => {
        try {
            const { error } = await supabase
                .from('post_translations')
                .delete()
                .eq('id', translationId);

            if (error) throw error;
            await fetchTranslations();
        } catch (error) {
            console.error('Error deleting translation:', error);
            throw error;
        }
    };

    const retryTranslation = async (postId: string, languageCode: string) => {
        const retryKey = `retry-${postId}-${languageCode}`;
        setRetrying(prev => new Set([...prev, retryKey]));

        try {
            setFailedTranslations(prev => {
                const newSet = new Set(prev);
                newSet.delete(`${postId}-${languageCode}`);
                return newSet;
            });

            await triggerTranslation(postId, [languageCode]);

        } catch (error) {
            console.error('Error retrying translation:', error);
            throw error;
        } finally {
            setRetrying(prev => {
                const newSet = new Set(prev);
                newSet.delete(retryKey);
                return newSet;
            });
        }
    };

    const cancelPendingTranslation = (postId: string, languageCode: string) => {
        const currentKey = `${postId}-${languageCode}`;

        setTranslating(prev => {
            const newSet = new Set(prev);
            newSet.delete(currentKey);
            return newSet;
        });

        setFailedTranslations(prev => new Set([...prev, currentKey]));
    };

    const forceStopAllTranslations = () => {
        const currentlyTranslating = Array.from(translating);
        setTranslating(new Set());
        setUpdating(new Set());
        setFailedTranslations(prev => new Set([...prev, ...currentlyTranslating]));
    };

    return {
        translations,
        loading,
        translating,
        updating,
        failedTranslations,
        retrying,
        selectedModel,
        setSelectedModel,
        fetchTranslations,
        triggerTranslation,
        toggleTranslationStatus,
        deleteTranslation,
        retryTranslation,
        cancelPendingTranslation,
        forceStopAllTranslations
    };
};
