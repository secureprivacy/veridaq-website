import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, ChevronDown } from 'lucide-react';
import { SUPPORTED_LANGUAGES, normalizeLanguageCode } from '../utils/languageUtils';
import { supabase } from '../lib/supabase';

const languages = [
  { code: 'en', name: 'English (Global)', flag: '🇬🇧', country: 'GB' },
  { code: 'da-DK', name: 'Dansk (Danmark)', flag: '🇩🇰', country: 'DK' },
  { code: 'sv-SE', name: 'Svenska (Sverige)', flag: '🇸🇪', country: 'SE' },
  { code: 'no-NO', name: 'Norsk (Norge)', flag: '🇳🇴', country: 'NO' },
  { code: 'fi-FI', name: 'Suomi (Suomi)', flag: '🇫🇮', country: 'FI' },
  { code: 'de-DE', name: 'Deutsch (Deutschland)', flag: '🇩🇪', country: 'DE' },
  { code: 'de-AT', name: 'Deutsch (Österreich)', flag: '🇦🇹', country: 'AT' },
  { code: 'fr-FR', name: 'Français (France)', flag: '🇫🇷', country: 'FR' },
  { code: 'es-ES', name: 'Español (España)', flag: '🇪🇸', country: 'ES' },
  { code: 'it-IT', name: 'Italiano (Italia)', flag: '🇮🇹', country: 'IT' },
  { code: 'pt-PT', name: 'Português (Portugal)', flag: '🇵🇹', country: 'PT' },
  { code: 'nl-NL', name: 'Nederlands (Nederland)', flag: '🇳🇱', country: 'NL' },
  { code: 'nl-BE', name: 'Nederlands (België)', flag: '🇧🇪', country: 'BE' },
];

const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Detect current language from URL path instead of i18n.language
  const getCurrentLanguageFromPath = () => {
    const pathname = window.location.pathname;
    const pathSegments = pathname.split('/').filter(Boolean);

    // Check if first segment is a supported language
    const supportedLanguageCodes = SUPPORTED_LANGUAGES.filter(lang => lang !== 'en');

    if (pathSegments.length > 0 && supportedLanguageCodes.includes(pathSegments[0])) {
      // Find the full locale that matches this base language
      const baseLanguage = pathSegments[0];
      const matchingLanguage = languages.find(lang => lang.code.startsWith(baseLanguage));
      return matchingLanguage || languages[0]; // Fallback to English
    }

    return languages[0]; // Default to English
  };
  
  const [currentLanguage, setCurrentLanguage] = useState(getCurrentLanguageFromPath);
  
  // Update current language when URL changes
  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentLanguage(getCurrentLanguageFromPath());
    };
    
    // Listen for both popstate (back/forward) and hashchange
    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isOpen && containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keyup', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keyup', handleEscape);
    };
  }, [isOpen]);

  const findTranslatedPostSlug = async (currentSlug: string, currentLang: string, targetLang: string): Promise<string | null> => {
    try {
      if (currentLang === targetLang) {
        return currentSlug;
      }

      if (currentLang === 'en') {
        const { data, error } = await supabase
          .from('post_translations')
          .select('slug')
          .eq('language_code', targetLang)
          .eq('published', true)
          .eq('post_id', (
            await supabase
              .from('posts')
              .select('id')
              .eq('slug', currentSlug)
              .eq('status', 'published')
              .maybeSingle()
          )?.data?.id || '')
          .maybeSingle();

        if (error || !data) return null;
        return data.slug;
      } else if (targetLang === 'en') {
        const { data, error } = await supabase
          .from('post_translations')
          .select('post_id')
          .eq('slug', currentSlug)
          .eq('language_code', currentLang)
          .eq('published', true)
          .maybeSingle();

        if (error || !data) return null;

        const { data: postData } = await supabase
          .from('posts')
          .select('slug')
          .eq('id', data.post_id)
          .eq('status', 'published')
          .maybeSingle();

        return postData?.slug || null;
      } else {
        const { data: translationData, error: translationError } = await supabase
          .from('post_translations')
          .select('post_id')
          .eq('slug', currentSlug)
          .eq('language_code', currentLang)
          .eq('published', true)
          .maybeSingle();

        if (translationError || !translationData) return null;

        const { data: targetData } = await supabase
          .from('post_translations')
          .select('slug')
          .eq('post_id', translationData.post_id)
          .eq('language_code', targetLang)
          .eq('published', true)
          .maybeSingle();

        return targetData?.slug || null;
      }
    } catch (error) {
      console.error('Error finding translated post:', error);
      return null;
    }
  };

  const handleLanguageChange = async (languageCode: string) => {
    setIsOpen(false);

    const newLanguage = languages.find(lang => lang.code === languageCode) || languages[0];
    setCurrentLanguage(newLanguage);

    const currentPath = window.location.pathname;
    const pathSegments = currentPath.split('/').filter(Boolean);
    const baseLanguage = languageCode.split('-')[0];

    const supportedLanguageCodes = SUPPORTED_LANGUAGES.filter(lang => lang !== 'en');
    let currentLang = 'en';
    let pathAfterLang = pathSegments;

    if (pathSegments.length > 0 && supportedLanguageCodes.includes(pathSegments[0])) {
      currentLang = pathSegments[0];
      pathAfterLang = pathSegments.slice(1);
    }

    const isBlogPost = pathAfterLang.length >= 2 && pathAfterLang[0] === 'blog' && pathAfterLang[1];
    const isBlogListing = pathAfterLang.length === 1 && pathAfterLang[0] === 'blog';

    let newPath = '/';

    if (isBlogPost) {
      const currentSlug = pathAfterLang[1];
      const translatedSlug = await findTranslatedPostSlug(currentSlug, currentLang, baseLanguage);

      if (translatedSlug) {
        newPath = baseLanguage === 'en'
          ? `/blog/${translatedSlug}/`
          : `/${baseLanguage}/blog/${translatedSlug}/`;
      } else {
        newPath = baseLanguage === 'en'
          ? '/blog/'
          : `/${baseLanguage}/blog/`;
      }
    } else if (isBlogListing) {
      newPath = baseLanguage === 'en'
        ? '/blog/'
        : `/${baseLanguage}/blog/`;
    } else {
      newPath = baseLanguage === 'en'
        ? '/'
        : `/${baseLanguage}`;
    }

    i18n.changeLanguage(languageCode);
    document.documentElement.lang = languageCode;

    const shouldHardNavigate = isBlogPost || isBlogListing;

    if (shouldHardNavigate) {
      window.location.assign(newPath);
    } else {
      window.history.pushState({}, '', newPath);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  // Component for rendering flag with fallback
  const FlagIcon: React.FC<{ language: typeof languages[0]; size?: 'sm' | 'md' }> = ({ language, size = 'md' }) => {
    const sizeClass = size === 'sm' ? 'text-base' : 'text-lg';
    
    return (
      <span 
        className={`inline-block ${sizeClass} leading-none`}
        style={{ 
          fontFamily: 'Apple Color Emoji, Segoe UI Emoji, Noto Color Emoji, sans-serif',
          fontSize: size === 'sm' ? '16px' : '18px'
        }}
        title={language.country}
      >
        {language.flag}
      </span>
    );
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-2 px-3 py-2 rounded-md text-neutral-700 hover:text-primary-600 transition-colors"
        aria-label="Select language"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <Globe size={18} />
        <span className="hidden sm:inline flex items-center gap-2">
          <FlagIcon language={currentLanguage} />
          <span>{currentLanguage.name}</span>
        </span>
        <span className="sm:hidden">
          <FlagIcon language={currentLanguage} />
        </span>
        <ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full right-0 mt-2 w-48 bg-white/95 backdrop-blur-sm shadow-lg rounded-md border border-[#E5E8ED] z-20 max-h-64 overflow-y-auto">
            {languages.map((language) => (
              <button
                key={language.code}
                type="button"
                onClick={() => handleLanguageChange(language.code)}
                className={`w-full text-left px-4 py-2 hover:bg-[#F4F7FA] transition-colors flex items-center gap-3 ${
                  i18n.language === language.code ? 'bg-[#24B04B]/10 text-[#24B04B]' : 'text-[#2E3542]'
                }`}
              >
                <FlagIcon language={language} size="sm" />
                <span className="text-sm">{language.name}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default LanguageSwitcher;