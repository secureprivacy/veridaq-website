import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Supabase configuration
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase configuration');
  console.error('   VITE_SUPABASE_URL:', supabaseUrl ? 'Set' : 'Missing');
  console.error('   VITE_SUPABASE_ANON_KEY:', supabaseKey ? 'Set' : 'Missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Supported languages
const LANGUAGES = ['en', 'da', 'sv', 'no', 'fi', 'de', 'fr', 'es', 'it', 'pt', 'nl'];

const LANGUAGE_LABELS = {
  en: 'English',
  da: 'Danish',
  sv: 'Swedish',
  no: 'Norwegian',
  fi: 'Finnish',
  de: 'German',
  fr: 'French',
  es: 'Spanish',
  it: 'Italian',
  pt: 'Portuguese',
  nl: 'Dutch'
};

const LANGUAGE_FLAGS = {
  en: '🇬🇧',
  da: '🇩🇰',
  sv: '🇸🇪',
  no: '🇳🇴',
  fi: '🇫🇮',
  de: '🇩🇪',
  fr: '🇫🇷',
  es: '🇪🇸',
  it: '🇮🇹',
  pt: '🇵🇹',
  nl: '🇳🇱'
};

const LOCALES_DIR = path.join(__dirname, '..', 'public', 'locales');
const translationCache = {};
const translationFileCache = {};

// Escape HTML special characters
function escapeHtml(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Escape JSON strings
function escapeJson(text) {
  if (!text) return '';
  return String(text)
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t');
}

function deepMergeTranslations(base = {}, override = {}) {
  const result = { ...base };

  for (const [key, value] of Object.entries(override)) {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      result[key] = deepMergeTranslations(base[key] || {}, value);
    } else {
      result[key] = value;
    }
  }

  return result;
}

function loadScopedTranslations(language, fileName) {
  const lang = (language || 'en').split('-')[0];
  const cacheKey = `${lang}:${fileName}`;

  if (translationFileCache[cacheKey]) {
    return translationFileCache[cacheKey];
  }

  const fallbackPath = path.join(LOCALES_DIR, 'en', fileName);
  const fallback = fs.existsSync(fallbackPath)
    ? JSON.parse(fs.readFileSync(fallbackPath, 'utf-8'))
    : {};

  let locale = {};
  if (lang !== 'en') {
    const localePath = path.join(LOCALES_DIR, lang, fileName);
    if (fs.existsSync(localePath)) {
      locale = JSON.parse(fs.readFileSync(localePath, 'utf-8'));
    } else {
      console.warn(`⚠️  Missing translations for ${lang}/${fileName}, falling back to English`);
    }
  }

  const merged = deepMergeTranslations(fallback, locale);
  translationFileCache[cacheKey] = merged;
  return merged;
}

function loadBlogTranslations(language) {
  const lang = (language || 'en').split('-')[0];

  if (translationCache[lang]) {
    return translationCache[lang];
  }

  const fallbackPath = path.join(LOCALES_DIR, 'en', 'blog.json');
  const fallback = fs.existsSync(fallbackPath)
    ? JSON.parse(fs.readFileSync(fallbackPath, 'utf-8'))
    : {};

  let locale = {};
  if (lang !== 'en') {
    const localePath = path.join(LOCALES_DIR, lang, 'blog.json');
    if (fs.existsSync(localePath)) {
      locale = JSON.parse(fs.readFileSync(localePath, 'utf-8'));
    } else {
      console.warn(`⚠️  Missing translations for ${lang}, falling back to English`);
    }
  }

  const merged = {
    ...fallback,
    ...locale,
    languages: {
      ...(fallback.languages || {}),
      ...(locale.languages || {})
    },
    breadcrumbs: {
      ...(fallback.breadcrumbs || {}),
      ...(locale.breadcrumbs || {})
    }
  };

  translationCache[lang] = merged;
  return merged;
}

function loadHeaderTranslations(language) {
  return loadScopedTranslations(language, 'header.json');
}

function loadFooterTranslations(language) {
  return loadScopedTranslations(language, 'footer.json');
}

function resolveLanguageLabel(language, translations = {}) {
  const key = (language || 'en').split('-')[0];
  return translations.languages?.[key] || LANGUAGE_LABELS[key] || language?.toUpperCase() || 'English';
}

function formatTranslation(template, values = {}) {
  if (!template) return '';
  return template.replace(/{{(\w+)}}/g, (_, key) => values[key] ?? '');
}

function formatDateForLanguage(dateString, language) {
  if (!dateString) return '';
  try {
    const locale = language === 'en' ? 'en-US' : language;
    return new Date(dateString).toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (error) {
    return new Date(dateString).toISOString().split('T')[0];
  }
}

function getWordCount(content) {
  if (!content) return 0;
  return content
    .replace(/<[^>]*>/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .length;
}

function calculateReadingTime(content) {
  const words = getWordCount(content);
  return Math.max(1, Math.ceil(words / 200));
}

function getPostDescription(post, maxLength = 160) {
  if (!post) return '';

  const description = [
    post.meta_description,
    post.posts?.meta_description,
    post.excerpt,
    post.posts?.excerpt,
    post.summary,
    post.posts?.summary
  ].find(value => typeof value === 'string' && value.trim().length > 0);

  if (description) {
    return description.trim();
  }

  if (post.content) {
    return post.content
      .replace(/<[^>]*>/g, ' ')
      .trim()
      .slice(0, maxLength)
      .trim();
  }

  return '';
}

function getPublishedDate(post, language) {
  if (!post) return null;
  if (language === 'en') {
    return post.published_at || post.posts?.published_at || post.created_at;
  }
  return post.posts?.published_at || post.published_at || post.created_at;
}

// Get related posts based on shared keywords
function getRelatedPosts(currentPost, allPosts, language, limit = 3) {
  if (!currentPost.meta_keywords || !allPosts || allPosts.length === 0) {
    return [];
  }

  const currentKeywords = currentPost.meta_keywords
    .split(',')
    .map(k => k.trim().toLowerCase())
    .filter(k => k.length > 0);

  if (currentKeywords.length === 0) {
    return allPosts.slice(0, limit);
  }

  const scoredPosts = allPosts
    .filter(p => p.slug !== currentPost.slug)
    .map(post => {
      const postKeywords = (post.meta_keywords || '')
        .split(',')
        .map(k => k.trim().toLowerCase())
        .filter(k => k.length > 0);

      const commonKeywords = currentKeywords.filter(k => postKeywords.includes(k));
      const score = commonKeywords.length / Math.max(currentKeywords.length, postKeywords.length);

      return { post, score };
    })
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(item => item.post);

  if (scoredPosts.length < limit) {
    const remaining = allPosts
      .filter(p => p.slug !== currentPost.slug && !scoredPosts.find(sp => sp.slug === p.slug))
      .slice(0, limit - scoredPosts.length);
    return [...scoredPosts, ...remaining];
  }

  return scoredPosts;
}

function createSiteHeaderHTML(language, headerTranslations) {
  const langPrefix = language === 'en' ? '' : `/${language}`;
  const homeHref = language === 'en' ? '/' : `/${language}/`;
  const nav = headerTranslations.navigation || {};
  const ctaLabel = headerTranslations.cta?.demo || 'Contact Our Experts';
  const logoLabel = headerTranslations.logo || 'Veridaq';
  const menuLabel = headerTranslations.menu || 'Toggle navigation';

  const navLinks = [
    { key: 'solutions', href: `${homeHref}#features` },
    { key: 'industries', href: `${homeHref}#industries` },
    { key: 'blog', href: `${langPrefix}/blog/` },
    { key: 'whyUs', href: `${homeHref}#benefits` },
    { key: 'contact', href: `${homeHref}#contact` }
  ];

  const desktopSwitcher = createLanguageSwitcherHTML(language, headerTranslations, 'desktop');
  const mobileSwitcher = createLanguageSwitcherHTML(language, headerTranslations, 'mobile');

  return `
    <header class="site-header" data-header>
      <div class="blog-container site-header__content">
        <div class="site-header__brand">
          <button class="site-header__menu-toggle" type="button" aria-expanded="false" aria-label="${escapeHtml(menuLabel)}">
            <span class="site-header__menu-icon" aria-hidden="true"></span>
          </button>
          <a class="site-logo" href="${homeHref}" aria-label="${escapeHtml(logoLabel)}">
            <img src="/images/veridaq-logo-transparent.png" alt="${escapeHtml(logoLabel)}" width="128" height="32">
          </a>
        </div>
        <nav class="site-nav" aria-label="Primary navigation">
          ${navLinks.map(link => `
            <a class="site-nav__link" href="${link.href}">${escapeHtml(nav[link.key] || link.key)}</a>
          `).join('')}
        </nav>
        <div class="site-header__actions">
          ${desktopSwitcher}
          <a class="site-header__demo" href="${homeHref}#contact">${escapeHtml(ctaLabel)}</a>
        </div>
      </div>

      <div class="mobile-menu" data-mobile-menu>
        <nav class="mobile-menu__nav" aria-label="Mobile navigation">
          ${navLinks.map(link => `
            <a class="mobile-menu__link" href="${link.href}">${escapeHtml(nav[link.key] || link.key)}</a>
          `).join('')}
        </nav>
        <div class="mobile-menu__actions">
          ${mobileSwitcher}
          <a class="site-header__demo site-header__demo--full" href="${homeHref}#contact">${escapeHtml(ctaLabel)}</a>
        </div>
      </div>
    </header>
  `;
}

function createSiteFooterHTML(language, footerTranslations) {
  const langPrefix = language === 'en' ? '' : `/${language}`;
  const homeHref = language === 'en' ? '/' : `/${language}/`;
  const sections = footerTranslations.sections || {};

  const solutionLinks = sections.solutions || {};
  const industryLinks = sections.industries || {};
  const companyLinks = sections.company || {};

  const contactInfo = footerTranslations.contactInfo || {};
  const bottomLinks = footerTranslations.bottomLinks || {};
  const copyright = footerTranslations.copyright || `© ${new Date().getFullYear()} Veridaq. All rights reserved.`;

  return `
    <footer class="site-footer">
      <div class="blog-container">
        <div class="site-footer__grid">
          <div class="site-footer__brand">
            <a class="site-logo" href="${homeHref}" aria-label="${escapeHtml(companyLinks.title || 'Veridaq')}">
              <img src="/images/veridaq-logo-transparent.png" alt="${escapeHtml(companyLinks.title || 'Veridaq')}" width="128" height="32">
            </a>
            <p class="site-footer__description">${escapeHtml(footerTranslations.description || '')}</p>
            <div class="site-footer__contact">
              ${contactInfo.email ? `<div class="site-footer__contact-item">${escapeHtml(contactInfo.email)}</div>` : ''}
              ${contactInfo.phone ? `<div class="site-footer__contact-item">${escapeHtml(contactInfo.phone)}</div>` : ''}
              ${contactInfo.address ? `<div class="site-footer__contact-item">${escapeHtml(contactInfo.address).replace(/\n/g, '<br>')}</div>` : ''}
            </div>
          </div>
          <div>
            <h3 class="site-footer__heading">${escapeHtml(sections.solutions?.title || 'AI-Powered Solutions')}</h3>
            <ul class="site-footer__list">
              ${solutionLinks.kycVerification ? `<li><a href="${homeHref}#features">${escapeHtml(solutionLinks.kycVerification)}</a></li>` : ''}
              ${solutionLinks.amlScreening ? `<li><a href="${homeHref}#features">${escapeHtml(solutionLinks.amlScreening)}</a></li>` : ''}
              ${solutionLinks.euAmlr2027 ? `<li><a href="${homeHref}#eu-compliance">${escapeHtml(solutionLinks.euAmlr2027)}</a></li>` : ''}
              ${solutionLinks.documentVerification ? `<li><a href="${homeHref}#features">${escapeHtml(solutionLinks.documentVerification)}</a></li>` : ''}
              ${solutionLinks.transactionMonitoring ? `<li><a href="${homeHref}#features">${escapeHtml(solutionLinks.transactionMonitoring)}</a></li>` : ''}
              ${solutionLinks.riskAssessment ? `<li><a href="${homeHref}#features">${escapeHtml(solutionLinks.riskAssessment)}</a></li>` : ''}
            </ul>
          </div>
          <div>
            <h3 class="site-footer__heading">${escapeHtml(sections.industries?.title || 'Industries')}</h3>
            <ul class="site-footer__list">
              ${industryLinks.financialServices ? `<li><a href="${homeHref}#industries">${escapeHtml(industryLinks.financialServices)}</a></li>` : ''}
              ${industryLinks.fintech ? `<li><a href="${homeHref}#industries">${escapeHtml(industryLinks.fintech)}</a></li>` : ''}
              ${industryLinks.cryptocurrency ? `<li><a href="${homeHref}#industries">${escapeHtml(industryLinks.cryptocurrency)}</a></li>` : ''}
              ${industryLinks.realEstate ? `<li><a href="${homeHref}#industries">${escapeHtml(industryLinks.realEstate)}</a></li>` : ''}
              ${industryLinks.gaming ? `<li><a href="${homeHref}#industries">${escapeHtml(industryLinks.gaming)}</a></li>` : ''}
              ${industryLinks.ecommerce ? `<li><a href="${homeHref}#industries">${escapeHtml(industryLinks.ecommerce)}</a></li>` : ''}
            </ul>
          </div>
          <div>
            <h3 class="site-footer__heading">${escapeHtml(sections.company?.title || 'Company')}</h3>
            <ul class="site-footer__list">
              ${companyLinks.blog ? `<li><a href="${langPrefix}/blog/">${escapeHtml(companyLinks.blog)}</a></li>` : ''}
              ${companyLinks.whyChooseUs ? `<li><a href="${homeHref}#benefits">${escapeHtml(companyLinks.whyChooseUs)}</a></li>` : ''}
              ${companyLinks.contactSales ? `<li><a href="${homeHref}#contact">${escapeHtml(companyLinks.contactSales)}</a></li>` : ''}
              ${companyLinks.privacyPolicy ? `<li><a href="/privacy-policy">${escapeHtml(companyLinks.privacyPolicy)}</a></li>` : ''}
              ${companyLinks.termsOfService ? `<li><a href="/terms-of-service">${escapeHtml(companyLinks.termsOfService)}</a></li>` : ''}
              ${companyLinks.gdprCompliance ? `<li><a href="/privacy-by-design">${escapeHtml(companyLinks.gdprCompliance)}</a></li>` : ''}
            </ul>
          </div>
        </div>
        <div class="site-footer__bottom">
          <div class="site-footer__copyright">${formatTranslation(copyright, { year: new Date().getFullYear() })}</div>
          <div class="site-footer__bottom-links">
            ${bottomLinks.security ? `<a href="#">${escapeHtml(bottomLinks.security)}</a>` : ''}
            ${bottomLinks.compliance ? `<a href="#">${escapeHtml(bottomLinks.compliance)}</a>` : ''}
            ${bottomLinks.status ? `<a href="#">${escapeHtml(bottomLinks.status)}</a>` : ''}
            ${bottomLinks.contactExperts ? `<a class="emphasis" href="${homeHref}#contact">${escapeHtml(bottomLinks.contactExperts)}</a>` : ''}
          </div>
        </div>
      </div>
    </footer>
  `;
}

function createLanguageSwitcherHTML(language, translations, variant = 'desktop') {
  const languageOptions = LANGUAGES.map(langCode => ({
    code: langCode,
    name: resolveLanguageLabel(langCode, translations),
    flag: LANGUAGE_FLAGS[langCode] || '🌐'
  }));

  const serializedOptions = escapeHtml(JSON.stringify(languageOptions));
  const currentOption = languageOptions.find(option => option.code === language) || languageOptions[0];

  return `
    <div class="language-switcher" data-variant="${variant}" data-current-language="${language}" data-language-options="${serializedOptions}">
      <button class="language-switcher__toggle" type="button" aria-haspopup="true" aria-expanded="false">
        <span class="language-switcher__icon" aria-hidden="true">🌐</span>
        <span class="language-switcher__text">${escapeHtml(currentOption.name)}</span>
        <span class="language-switcher__flag" aria-hidden="true">${escapeHtml(currentOption.flag)}</span>
        <span class="language-switcher__chevron" aria-hidden="true">▼</span>
      </button>
      <div class="language-switcher__menu" role="listbox" aria-label="Language menu" hidden>
        ${languageOptions.map(option => `
          <button class="language-switcher__option" type="button" data-language="${option.code}" role="option">
            <span class="language-switcher__flag" aria-hidden="true">${escapeHtml(option.flag)}</span>
            <span class="language-switcher__label">${escapeHtml(option.name)}</span>
          </button>
        `).join('')}
      </div>
    </div>
  `;
}

function createLanguageSwitcherScript(language, translations, pageMeta = {}) {
  const languageOptions = LANGUAGES.map(langCode => ({
    code: langCode,
    name: resolveLanguageLabel(langCode, translations),
    flag: LANGUAGE_FLAGS[langCode] || '🌐'
  }));

  const pageContext = {
    currentLanguage: language,
    pageType: 'listing',
    ...pageMeta
  };

  return `
    <script type="module">
      import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

      const SUPABASE_URL = ${JSON.stringify(supabaseUrl)};
      const SUPABASE_ANON_KEY = ${JSON.stringify(supabaseKey)};
      const LANGUAGE_OPTIONS = ${JSON.stringify(languageOptions)};
      const SUPPORTED_LANGUAGES = ${JSON.stringify(LANGUAGES)};
      const PAGE_CONTEXT = ${JSON.stringify(pageContext)};
      const LANGUAGE_FLAGS = ${JSON.stringify(LANGUAGE_FLAGS)};
      const PREFERENCE_KEY = 'preferredLanguage';

      const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

      const normalizeLanguage = (code) => {
        if (!code) return 'en';
        const base = code.toLowerCase().split('-')[0];
        return SUPPORTED_LANGUAGES.includes(base) ? base : 'en';
      };

      const getLanguageFromPath = () => {
        const segments = window.location.pathname.split('/').filter(Boolean);
        if (segments.length > 0 && SUPPORTED_LANGUAGES.includes(segments[0])) {
          return segments[0];
        }
        return 'en';
      };

      const findTranslatedPostSlug = async (currentSlug, currentLang, targetLang) => {
        try {
          if (currentLang === targetLang) return currentSlug;

          if (currentLang === 'en') {
            const { data: postData } = await supabase
              .from('posts')
              .select('id')
              .eq('slug', currentSlug)
              .eq('status', 'published')
              .maybeSingle();

            if (!postData?.id) return null;

            const { data } = await supabase
              .from('post_translations')
              .select('slug')
              .eq('language_code', targetLang)
              .eq('published', true)
              .eq('translation_status', 'completed')
              .eq('post_id', postData.id)
              .maybeSingle();

            return data?.slug || null;
          }

          if (targetLang === 'en') {
            const { data, error } = await supabase
              .from('post_translations')
              .select('post_id')
              .eq('slug', currentSlug)
              .eq('language_code', currentLang)
              .eq('published', true)
              .maybeSingle();

            if (error || !data?.post_id) return null;

            const { data: postData } = await supabase
              .from('posts')
              .select('slug')
              .eq('id', data.post_id)
              .eq('status', 'published')
              .maybeSingle();

            return postData?.slug || null;
          }

          const { data: translationData, error: translationError } = await supabase
            .from('post_translations')
            .select('post_id')
            .eq('slug', currentSlug)
            .eq('language_code', currentLang)
            .eq('published', true)
            .maybeSingle();

          if (translationError || !translationData?.post_id) return null;

          const { data: targetData } = await supabase
            .from('post_translations')
            .select('slug')
            .eq('post_id', translationData.post_id)
            .eq('language_code', targetLang)
            .eq('published', true)
            .eq('translation_status', 'completed')
            .maybeSingle();

          return targetData?.slug || null;
        } catch (error) {
          console.error('Error finding translated post:', error);
          return null;
        }
      };

      const fetchAvailableTranslations = async (currentSlug, currentLang) => {
        try {
          const normalizedCurrent = normalizeLanguage(currentLang);
          let postId = null;

          if (normalizedCurrent === 'en') {
            const { data } = await supabase
              .from('posts')
              .select('id')
              .eq('slug', currentSlug)
              .eq('status', 'published')
              .maybeSingle();

            postId = data?.id || null;
          } else {
            const { data } = await supabase
              .from('post_translations')
              .select('post_id')
              .eq('slug', currentSlug)
              .eq('language_code', normalizedCurrent)
              .eq('published', true)
              .maybeSingle();

            postId = data?.post_id || null;
          }

          if (!postId) return {};

          const translationMap = {};

          const { data: translations } = await supabase
            .from('post_translations')
            .select('language_code, slug')
            .eq('post_id', postId)
            .eq('published', true)
            .eq('translation_status', 'completed');

          translations?.forEach(entry => {
            const baseLang = normalizeLanguage(entry.language_code);
            translationMap[baseLang] = entry.slug;
          });

          const { data: englishPost } = await supabase
            .from('posts')
            .select('slug')
            .eq('id', postId)
            .eq('status', 'published')
            .maybeSingle();

          if (englishPost?.slug) {
            translationMap.en = englishPost.slug;
          }

          return translationMap;
        } catch (error) {
          console.error('Error loading available translations:', error);
          return {};
        }
      };

      const closeMenus = () => {
        document.querySelectorAll('.language-switcher__menu').forEach(menu => {
          menu.setAttribute('hidden', '');
        });
        document.querySelectorAll('.language-switcher__toggle').forEach(toggle => {
          toggle.setAttribute('aria-expanded', 'false');
        });
      };

      const updateActiveLanguage = (language) => {
        const normalized = normalizeLanguage(language);
        document.querySelectorAll('.language-switcher').forEach((switcher) => {
          switcher.setAttribute('data-current-language', normalized);
          const toggleText = switcher.querySelector('.language-switcher__text');
          const toggleFlag = switcher.querySelector('.language-switcher__flag');
          const activeOption = LANGUAGE_OPTIONS.find(opt => opt.code === normalized) || LANGUAGE_OPTIONS[0];

          if (toggleText) toggleText.textContent = activeOption?.name || 'English';
          if (toggleFlag) toggleFlag.textContent = activeOption?.flag || LANGUAGE_FLAGS[normalized] || '🌐';

          switcher.querySelectorAll('.language-switcher__option').forEach(option => {
            const optionLang = option.getAttribute('data-language');
            if (optionLang === normalized) {
              option.classList.add('is-active');
              option.setAttribute('aria-selected', 'true');
            } else {
              option.classList.remove('is-active');
              option.removeAttribute('aria-selected');
            }
          });
        });
      };

      const filterAvailableLanguages = (availableMap = {}) => {
        const availableLanguages = Object.keys(availableMap);
        const restrictOptions = PAGE_CONTEXT.pageType === 'post' && availableLanguages.length > 0;

        document.querySelectorAll('.language-switcher__option').forEach(option => {
          const optionLang = option.getAttribute('data-language');
          if (restrictOptions && !availableLanguages.includes(optionLang)) {
            option.setAttribute('hidden', '');
          } else {
            option.removeAttribute('hidden');
          }
        });
      };

      const handleNavigation = async (targetLanguage) => {
        const baseLanguage = normalizeLanguage(targetLanguage);
        const pathSegments = window.location.pathname.split('/').filter(Boolean);
        const supportedLanguageCodes = SUPPORTED_LANGUAGES.filter(lang => lang !== 'en');

        let currentLang = 'en';
        let pathAfterLang = [...pathSegments];

        if (pathSegments.length > 0 && supportedLanguageCodes.includes(pathSegments[0])) {
          currentLang = pathSegments[0];
          pathAfterLang = pathSegments.slice(1);
        }

        const isBlogPost = pathAfterLang.length >= 2 && pathAfterLang[0] === 'blog' && pathAfterLang[1];
        const isBlogListing = pathAfterLang.length === 1 && pathAfterLang[0] === 'blog';

        if (isBlogPost) {
          const currentSlug = pathAfterLang[1];
          const translatedSlug = await findTranslatedPostSlug(currentSlug, currentLang, baseLanguage);

          if (translatedSlug) {
            const newPath = baseLanguage === 'en'
              ? `/blog/${translatedSlug}/`
              : `/${baseLanguage}/blog/${translatedSlug}/`;
            window.location.assign(newPath);
            return;
          }

          const fallbackPath = baseLanguage === 'en'
            ? '/blog/'
            : `/${baseLanguage}/blog/`;
          window.location.assign(fallbackPath);
          return;
        }

        if (isBlogListing) {
          const listingPath = baseLanguage === 'en'
            ? '/blog/'
            : `/${baseLanguage}/blog/`;
          window.location.assign(listingPath);
          return;
        }

        const defaultPath = baseLanguage === 'en' ? '/' : `/${baseLanguage}/`;
        window.location.assign(defaultPath);
      };

      const buildMenus = (availableTranslations = {}) => {
        document.querySelectorAll('.language-switcher').forEach((switcher) => {
          const toggle = switcher.querySelector('.language-switcher__toggle');
          const menu = switcher.querySelector('.language-switcher__menu');

          if (!toggle || !menu) return;

          const savedPreference = normalizeLanguage(localStorage.getItem(PREFERENCE_KEY) || PAGE_CONTEXT.currentLanguage);
          switcher.setAttribute('data-current-language', savedPreference);
          updateActiveLanguage(savedPreference);

          toggle.addEventListener('click', (event) => {
            event.stopPropagation();
            const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
            closeMenus();
            if (!isExpanded) {
              menu.removeAttribute('hidden');
              toggle.setAttribute('aria-expanded', 'true');
            }
          });

          switcher.querySelectorAll('.language-switcher__option').forEach(option => {
            option.addEventListener('click', async () => {
              const language = option.getAttribute('data-language');
              localStorage.setItem(PREFERENCE_KEY, language);
              updateActiveLanguage(language);
              closeMenus();
              await handleNavigation(language);
            });
          });
        });

        filterAvailableLanguages(availableTranslations);
      };

      document.addEventListener('click', (event) => {
        const isMenuClick = event.target.closest('.language-switcher');
        if (!isMenuClick) {
          closeMenus();
        }
      });

      document.addEventListener('keyup', (event) => {
        if (event.key === 'Escape') closeMenus();
      });

      const setupHeaderToggle = () => {
        const toggle = document.querySelector('.site-header__menu-toggle');
        const mobileMenu = document.querySelector('[data-mobile-menu]');

        if (!toggle || !mobileMenu) return;

        toggle.addEventListener('click', () => {
          const isOpen = mobileMenu.classList.toggle('is-open');
          toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
          if (isOpen) {
            document.body.classList.add('menu-open');
          } else {
            document.body.classList.remove('menu-open');
          }
        });
      };

      const initialize = async () => {
        const detectedLanguage = normalizeLanguage(getLanguageFromPath());
        PAGE_CONTEXT.currentLanguage = detectedLanguage;

        let availableTranslations = PAGE_CONTEXT.availableTranslations || {};

        if (PAGE_CONTEXT.pageType === 'post' && PAGE_CONTEXT.currentSlug) {
          const latestTranslations = await fetchAvailableTranslations(PAGE_CONTEXT.currentSlug, detectedLanguage);
          availableTranslations = Object.keys(latestTranslations).length > 0 ? latestTranslations : availableTranslations;
        }

        buildMenus(availableTranslations);
        setupHeaderToggle();
      };

      initialize();
    </script>
  `;
}

// HTML template for blog listing page in static-first mode
function createBlogListingHTML(posts, language, translations, headerTranslations, footerTranslations) {
  const langPrefix = language === 'en' ? '' : `/${language}`;
  const homeHref = language === 'en' ? '/' : `/${language}/`;
  const languageLabel = resolveLanguageLabel(language, translations);
  const title = `${escapeHtml(translations.title || 'Blog')} | Veridaq`;
  const metaDescription = translations.subtitle || 'Expert insights on EU compliance, KYC verification, AML screening, and GDPR requirements. Stay informed about regulatory changes and best practices.';

  // Generate JSON-LD ItemList schema
  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "itemListElement": posts.map((post, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "BlogPosting",
        "headline": post.title,
        "url": `https://veridaq.com${langPrefix}/blog/${post.slug}`,
        ...(post.featured_image_url && { "image": post.featured_image_url }),
        ...(getPostDescription(post)
          ? { "description": getPostDescription(post) }
          : {}),
        "datePublished": getPublishedDate(post, language),
        "author": {
          "@type": "Organization",
          "name": "Veridaq"
        }
      }
    }))
  };

  // Organization schema
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Veridaq",
    "url": "https://veridaq.com",
    "logo": "https://veridaq.com/images/veridaq-logo-transparent.png",
    "description": "EU's leading KYC & AML compliance platform",
    "sameAs": [
      "https://www.linkedin.com/company/veridaq"
    ]
  };

  const postsHTML = posts.map(post => {
    const publishedDate = getPublishedDate(post, language);
    const formattedDate = formatDateForLanguage(publishedDate, language);
    const readingTime = calculateReadingTime(post.content);
    const categoryLabel = translations.categoryLabel || 'EU Compliance';
    const readMoreLabel = translations.readMore || 'Read more';
    const minReadLabel = translations.minRead || 'min read';
    const description = getPostDescription(post);
    const excerpt = description ? escapeHtml(description) : '';

    return `
      <article class="blog-card">
        ${post.featured_image_url ? `
          <a class="blog-card__media" href="${langPrefix}/blog/${post.slug}/">
            <img src="${post.featured_image_url}" alt="${escapeHtml(post.title)}" loading="lazy" width="800" height="450">
            <span class="blog-card__category">${escapeHtml(categoryLabel)}</span>
          </a>
        ` : ''}
        <div class="blog-card__body">
          <div class="blog-card__meta">
            <span class="meta-chip"><span class="meta-icon" aria-hidden="true">📅</span><time datetime="${publishedDate || ''}">${formattedDate}</time></span>
            <span class="meta-chip"><span class="meta-icon" aria-hidden="true">⏱</span>${readingTime} ${escapeHtml(minReadLabel)}</span>
          </div>
          <h2 class="blog-card__title"><a href="${langPrefix}/blog/${post.slug}/">${escapeHtml(post.title)}</a></h2>
          ${excerpt ? `<p class="blog-card__excerpt">${excerpt}</p>` : ''}
          <a class="blog-card__cta" href="${langPrefix}/blog/${post.slug}/">${escapeHtml(readMoreLabel)} <span aria-hidden="true">→</span></a>
        </div>
      </article>
    `;
  }).join('\n');

  const articleCountText = formatTranslation(translations.articleCount || `${posts.length} curated articles`, { count: posts.length });
  const heroPill = translations.expertInsights || 'Expert compliance insights';
  const heroTitle = translations.title || 'EU Compliance Insights';
  const heroSubtitle = translations.subtitle || 'Expert analysis on KYC, AML, and regulatory change so your team can stay ahead of EU mandates.';
  const breadcrumbHome = translations.breadcrumbs?.home || 'Home';
  const breadcrumbBlog = translations.breadcrumbs?.blog || 'Blog';
  const noPosts = translations.noPostsYet || 'No blog posts available yet.';
  const headerHTML = createSiteHeaderHTML(language, headerTranslations);
  const footerHTML = createSiteFooterHTML(language, footerTranslations);
  const languageSwitcherScript = createLanguageSwitcherScript(language, translations, {
    pageType: 'listing'
  });

  return `<!DOCTYPE html>
<html lang="${language}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <meta name="description" content="${escapeHtml(metaDescription)}">
  <meta name="robots" content="index, follow, max-image-preview:large">
  <meta name="googlebot" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1">
  <link rel="canonical" href="https://veridaq.com${langPrefix}/blog">
  <link rel="stylesheet" href="/blog-static.css">

  <!-- Sitemap discovery for crawlers -->
  <link rel="sitemap" type="application/xml" title="Sitemap" href="https://veridaq.com/sitemap.xml">

  <!-- hreflang tags for multi-language SEO -->
  ${LANGUAGES.map(lang =>
    `<link rel="alternate" hreflang="${lang}" href="https://veridaq.com/${lang === 'en' ? '' : lang + '/'}blog" />`
  ).join('\n  ')}
  <link rel="alternate" hreflang="x-default" href="https://veridaq.com/blog" />

  <!-- JSON-LD Structured Data -->
  <script type="application/ld+json">
${JSON.stringify(itemListSchema, null, 2)}
  </script>

  <script type="application/ld+json">
${JSON.stringify(organizationSchema, null, 2)}
  </script>
</head>
<body class="blog-page">
  ${headerHTML}
  <div class="blog-header-spacer"></div>
  <header class="blog-hero">
    <div class="blog-container hero-content">
      <nav class="breadcrumb-trail" aria-label="Breadcrumb">
        <a href="${homeHref}">${escapeHtml(breadcrumbHome)}</a>
        <span class="current">${escapeHtml(breadcrumbBlog)}</span>
      </nav>
      <div class="hero-pill">📝 <span>${escapeHtml(heroPill)}</span></div>
      <h1 class="hero-title">${escapeHtml(heroTitle)}</h1>
      <p class="hero-subtitle">${escapeHtml(heroSubtitle)}</p>
      <div class="metadata-chips" style="margin-top: 2rem;">
        <span class="meta-chip"><span class="meta-icon" aria-hidden="true">🌐</span>${escapeHtml(translations.readingIn || 'Reading in')} ${escapeHtml(languageLabel)}</span>
        <span class="meta-chip"><span class="meta-icon" aria-hidden="true">📚</span>${escapeHtml(articleCountText)}</span>
      </div>
    </div>
  </header>
  <main class="blog-main">
    <section class="blog-list">
      <div class="blog-container">
        <div class="blog-grid">
          ${postsHTML || `<p>${escapeHtml(noPosts)}</p>`}
        </div>
      </div>
    </section>
  </main>
  ${footerHTML}
  ${languageSwitcherScript}
</body>
</html>`;
}

// HTML template for individual blog post
function createBlogPostHTML(post, language, allPosts = [], availableTranslations = {}, translations, headerTranslations, footerTranslations) {
  const langPrefix = language === 'en' ? '' : `/${language}`;
  const publishedDate = post.published_at || post.posts?.published_at;
  const updatedDate = post.updated_at || post.posts?.updated_at || publishedDate;
  const formattedPublishedDate = formatDateForLanguage(publishedDate, language);
  const readingTime = calculateReadingTime(post.content);
  const postUrl = `https://veridaq.com${langPrefix}/blog/${post.slug}`;
  const homeHref = language === 'en' ? '/' : `/${language}/`;
  const blogHref = `${langPrefix}/blog/`;
  const breadcrumbHome = translations.breadcrumbs?.home || 'Home';
  const breadcrumbBlog = translations.breadcrumbs?.blog || 'Blog';
  const categoryLabel = translations.categoryLabel || 'EU Compliance';
  const backToBlog = translations.backToAllArticles || translations.backToBlog || 'Back to all articles';
  const authorLabel = translations.authorLabel || 'Veridaq Team';
  const minReadLabel = translations.minRead || 'min read';
  const shareOn = translations.shareOn || 'Share on {{platform}}';
  const shareArticle = translations.shareArticle || 'Share this article';
  const shareHelp = translations.shareHelp || 'Help compliance leaders discover these insights.';
  const relatedArticles = translations.relatedArticles || 'Related Articles';
  const noRelatedArticles = translations.noRelatedArticles || 'No related articles available yet.';
  const headerHTML = createSiteHeaderHTML(language, headerTranslations);
  const footerHTML = createSiteFooterHTML(language, footerTranslations);
  const languageSwitcherScript = createLanguageSwitcherScript(language, translations, {
    pageType: 'post',
    currentSlug: post.slug,
    availableTranslations
  });

  // Generate Breadcrumb schema
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": breadcrumbHome,
        "item": `https://veridaq.com${langPrefix}/`
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": breadcrumbBlog,
        "item": `https://veridaq.com${langPrefix}/blog`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": post.title
      }
    ]
  };

  // Calculate word count and reading time
  const wordCount = post.content.replace(/<[^>]*>/g, '').split(/\s+/).filter(w => w.length > 0).length;

  // Generate enhanced JSON-LD BlogPosting/Article schema
  const blogPostingSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": post.title,
    "alternativeHeadline": post.meta_title || post.title,
    "description": getPostDescription(post),
    ...(post.featured_image_url && {
      "image": {
        "@type": "ImageObject",
        "url": post.featured_image_url,
        "width": 1200,
        "height": 675,
        "caption": post.title
      }
    }),
    "datePublished": publishedDate,
    "dateModified": updatedDate,
    "author": {
      "@type": "Organization",
      "name": "Veridaq",
      "url": "https://veridaq.com",
      "logo": {
        "@type": "ImageObject",
        "url": "https://veridaq.com/images/veridaq-logo-transparent.png"
      },
      "sameAs": [
        "https://www.linkedin.com/company/veridaq"
      ]
    },
    "publisher": {
      "@type": "Organization",
      "name": "Veridaq",
      "url": "https://veridaq.com",
      "logo": {
        "@type": "ImageObject",
        "url": "https://veridaq.com/images/veridaq-logo-transparent.png",
        "width": 200,
        "height": 60
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://veridaq.com${langPrefix}/blog/${post.slug}`
    },
    "articleSection": "EU Compliance",
    "articleBody": post.content.replace(/<[^>]*>/g, '').substring(0, 5000),
    "wordCount": wordCount,
    ...(post.meta_keywords && { "keywords": post.meta_keywords }),
    "inLanguage": language,
    "url": `https://veridaq.com${langPrefix}/blog/${post.slug}`
  };

  // Organization schema
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Veridaq",
    "url": "https://veridaq.com",
    "logo": "https://veridaq.com/images/veridaq-logo-transparent.png",
    "description": "EU's leading KYC & AML compliance platform"
  };

  // Get related posts based on shared keywords
  const relatedPosts = getRelatedPosts(post, allPosts, language, 3);

  const shareLinks = [
    {
      label: 'LinkedIn',
      icon: 'in',
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(postUrl)}`,
      external: true
    },
    {
      label: 'Twitter',
      icon: 'X',
      href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(postUrl)}&text=${encodeURIComponent(post.title)}`,
      external: true
    },
    {
      label: 'Email',
      icon: '@',
      href: `mailto:?subject=${encodeURIComponent(post.title)}&body=${encodeURIComponent('I thought you might find this EU compliance article interesting: ' + postUrl)}`,
      external: false
    }
  ];

  const relatedHTML = relatedPosts.map(relatedPost => {
    const relatedHref = `${langPrefix}/blog/${relatedPost.slug}/`;
    const relatedExcerpt = getPostDescription(relatedPost)
      ? escapeHtml(getPostDescription(relatedPost))
      : '';

    return `
      <a class="related-card" href="${relatedHref}">
        <span>${escapeHtml(relatedPost.title)}</span>
        ${relatedExcerpt ? `<p>${relatedExcerpt}</p>` : ''}
      </a>
    `;
  }).join('\n');

  return `<!DOCTYPE html>
<html lang="${language}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(post.meta_title || post.title)} | Veridaq</title>
  <meta name="description" content="${escapeHtml(getPostDescription(post))}">
  <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">
  <meta name="googlebot" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1">
  <link rel="canonical" href="https://veridaq.com${langPrefix}/blog/${post.slug}">
  <link rel="stylesheet" href="/blog-static.css">

  <!-- Sitemap discovery for crawlers -->
  <link rel="sitemap" type="application/xml" title="Sitemap" href="https://veridaq.com/sitemap.xml">

  <!-- hreflang tags for multi-language SEO (only for available translations) -->
  ${(() => {
    const hreflangs = [];

    // Add English version if it exists
    if (availableTranslations.en) {
      hreflangs.push(`<link rel="alternate" hreflang="en" href="https://veridaq.com/blog/${availableTranslations.en}" />`);
    }

    // Add other language versions that exist
    LANGUAGES.filter(lang => lang !== 'en').forEach(lang => {
      if (availableTranslations[lang]) {
        hreflangs.push(`<link rel="alternate" hreflang="${lang}" href="https://veridaq.com/${lang}/blog/${availableTranslations[lang]}" />`);
      }
    });

    // Add x-default pointing to English
    if (availableTranslations.en) {
      hreflangs.push(`<link rel="alternate" hreflang="x-default" href="https://veridaq.com/blog/${availableTranslations.en}" />`);
    }

    return hreflangs.join('\n  ');
  })()}

  <!-- Open Graph / Social Media Tags -->
  ${post.featured_image_url ? `<meta property="og:image" content="${post.featured_image_url}">` : ''}
  <meta property="og:title" content="${escapeHtml(post.title)}">
  <meta property="og:description" content="${escapeHtml(getPostDescription(post))}">
  <meta property="og:type" content="article">
  <meta property="og:url" content="https://veridaq.com${langPrefix}/blog/${post.slug}">
  <meta property="article:published_time" content="${publishedDate}">
  <meta property="article:modified_time" content="${updatedDate}">

  <!-- Twitter Card Tags -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(post.title)}">
  <meta name="twitter:description" content="${escapeHtml(getPostDescription(post))}">
  ${post.featured_image_url ? `<meta name="twitter:image" content="${post.featured_image_url}">` : ''}

  <!-- JSON-LD Structured Data -->
  <script type="application/ld+json">
${JSON.stringify(breadcrumbSchema, null, 2)}
  </script>

  <script type="application/ld+json">
${JSON.stringify(blogPostingSchema, null, 2)}
  </script>

  <script type="application/ld+json">
${JSON.stringify(organizationSchema, null, 2)}
  </script>

  <!-- DataFeed schema for AI crawler discovery -->
  <script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "DataFeed",
  "dataFeedElement": {
    "@type": "DataFeedItem",
    "item": {
      "@type": "WebSite",
      "url": "https://veridaq.com",
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://veridaq.com/sitemap.xml"
      }
    }
  },
  "includedDataCatalog": "https://veridaq.com/sitemap.xml"
}
  </script>
</head>
<body class="blog-page">
  ${headerHTML}
  <div class="blog-header-spacer"></div>
  <header class="blog-hero">
    <div class="blog-container post-hero-content">
      <nav class="breadcrumb-trail" aria-label="Breadcrumb">
        <a href="${homeHref}">${escapeHtml(breadcrumbHome)}</a>
        <a href="${blogHref}">${escapeHtml(breadcrumbBlog)}</a>
        <span class="current">${escapeHtml(post.title)}</span>
      </nav>
      <a class="back-pill" href="${blogHref}">← ${escapeHtml(backToBlog)}</a>
      <div class="category-badge">${escapeHtml(categoryLabel)}</div>
      <h1 class="post-title">${escapeHtml(post.title)}</h1>
      <div class="metadata-chips">
        <span class="meta-chip"><span class="meta-icon" aria-hidden="true">👤</span>${escapeHtml(authorLabel)}</span>
        <span class="meta-chip"><span class="meta-icon" aria-hidden="true">📅</span><time datetime="${publishedDate || ''}">${formattedPublishedDate}</time></span>
        <span class="meta-chip"><span class="meta-icon" aria-hidden="true">⏱</span>${readingTime} ${escapeHtml(minReadLabel)}</span>
      </div>
      ${getPostDescription(post) ? `<div class="post-excerpt">${escapeHtml(getPostDescription(post))}</div>` : ''}
    </div>
  </header>

  ${post.featured_image_url ? `
    <div class="featured-image">
      <img src="${post.featured_image_url}" alt="${escapeHtml(post.title)}" width="1200" height="675" loading="eager">
    </div>
  ` : ''}

  <main class="blog-article">
    <div class="blog-container">
      <article class="blog-prose">
${post.content}
      </article>

      <section class="share-strip" aria-label="${escapeHtml(shareArticle)}">
        <div>
          <h3>${escapeHtml(shareArticle)}</h3>
          <p>${escapeHtml(shareHelp)}</p>
        </div>
        <div class="share-links">
          ${shareLinks.map(link => `<a class="share-pill" href="${link.href}" ${link.external ? 'target="_blank" rel="noopener"' : ''} aria-label="${escapeHtml(formatTranslation(shareOn, { platform: link.label }))}">${link.icon}</a>`).join('\n          ')}
        </div>
      </section>

      <section class="related-section">
        <h3>${escapeHtml(relatedArticles)}</h3>
        ${relatedPosts.length > 0 ? `<div class="related-grid">${relatedHTML}</div>` : `<p style="color: var(--color-muted);">${escapeHtml(noRelatedArticles)}</p>`}
      </section>

      <section class="cta-block">
        <div class="cta-icon" aria-hidden="true">⚡</div>
        <h3>${escapeHtml(translations.implementStrategies || 'Implement compliant onboarding strategies')}</h3>
        <p>${escapeHtml(translations.implementDescription || 'Partner with Veridaq experts to operationalise KYC, AML, and ongoing monitoring programs aligned to EU directives.')}</p>
        <a class="cta-button" href="#contact">${escapeHtml(translations.getConsultation || 'Book a consultation')} →</a>
      </section>
    </div>
  </main>

  ${footerHTML}
  ${languageSwitcherScript}
</body>
</html>`;
}

// Fetch all translation slugs for a given post ID
async function fetchTranslationsForPost(postId) {
  const { data: translations, error } = await supabase
    .from('post_translations')
    .select('language_code, slug')
    .eq('post_id', postId)
    .eq('published', true)
    .eq('translation_status', 'completed');

  if (error || !translations) {
    return {};
  }

  const translationMap = {};
  translations.forEach(t => {
    translationMap[t.language_code] = t.slug;
  });

  return translationMap;
}

// Main generation function
async function generateBlogHTML() {
  console.log('🚀 Starting blog HTML generation (static-first delivery)...');
  console.log('📁 Generating: Static HTML for posts AND listing pages');
  console.log('📁 Static listings include hydration data for React');

  const publicDir = path.join(__dirname, '..', 'public');
  const blogDir = path.join(publicDir, 'blog');

  // Ensure output directory exists
  if (!fs.existsSync(blogDir)) {
    fs.mkdirSync(blogDir, { recursive: true });
    console.log('✅ Created blog output directory');
  }

  let totalGenerated = 0;
  let listingsGenerated = 0;
  let errorCount = 0;

  for (const language of LANGUAGES) {
    console.log(`\n📝 Generating HTML for language: ${language.toUpperCase()}`);

    try {
      if (language === 'en') {
        // Fetch English posts
        const { data: posts, error } = await supabase
          .from('posts')
          .select('*')
          .eq('status', 'published')
          .order('published_at', { ascending: false });

        if (error) {
          console.error(`❌ Error fetching English posts:`, error.message);
          errorCount++;
          continue;
        }

        console.log(`   Found ${posts?.length || 0} published posts`);

        if (!posts || posts.length === 0) {
          console.log('   ⚠️  No posts to generate');
          continue;
        }

        const languageTranslations = loadBlogTranslations('en');
        const headerTranslations = loadHeaderTranslations('en');
        const footerTranslations = loadFooterTranslations('en');

        // Generate static blog listing page with hydration data
        const listingHTML = createBlogListingHTML(posts, 'en', languageTranslations, headerTranslations, footerTranslations);
        const listingPath = path.join(blogDir, 'index.html');
        fs.writeFileSync(listingPath, listingHTML);
        console.log(`   ✅ Generated: /blog/index.html (with ${posts.length} posts)`);
        listingsGenerated++;

        // Generate individual post pages
        for (const post of posts) {
          // Fetch available translations for hreflang tags
          const translations = await fetchTranslationsForPost(post.id);
          translations.en = post.slug; // Add English slug

          const postHTML = createBlogPostHTML(post, 'en', posts, translations, languageTranslations, headerTranslations, footerTranslations);
          const postDir = path.join(blogDir, post.slug);
          if (!fs.existsSync(postDir)) {
            fs.mkdirSync(postDir, { recursive: true });
          }
          const postPath = path.join(postDir, 'index.html');
          fs.writeFileSync(postPath, postHTML);
          console.log(`   ✅ Generated: /blog/${post.slug}/index.html`);
          totalGenerated++;
        }
      } else {
        // Fetch translations
        const { data: translations, error } = await supabase
          .from('post_translations')
          .select(`
            *,
            posts!inner(status, published_at)
          `)
          .eq('language_code', language)
          .eq('translation_status', 'completed')
          .eq('published', true)
          .eq('posts.status', 'published')
          .order('posts(published_at)', { ascending: false });

        if (error) {
          console.error(`❌ Error fetching ${language} translations:`, error.message);
          errorCount++;
          continue;
        }

        console.log(`   Found ${translations?.length || 0} translations`);

        if (!translations || translations.length === 0) {
          console.log(`   ⚠️  No translations available for ${language}`);
          continue;
        }

        const languageTranslations = loadBlogTranslations(language);
        const headerTranslations = loadHeaderTranslations(language);
        const footerTranslations = loadFooterTranslations(language);

        // Generate static blog listing page for this language with hydration data
        const langDir = path.join(publicDir, language, 'blog');
        if (!fs.existsSync(langDir)) {
          fs.mkdirSync(langDir, { recursive: true });
        }

        const listingHTML = createBlogListingHTML(translations, language, languageTranslations, headerTranslations, footerTranslations);
        const listingPath = path.join(langDir, 'index.html');
        fs.writeFileSync(listingPath, listingHTML);
        console.log(`   ✅ Generated: /${language}/blog/index.html (with ${translations.length} posts)`);
        listingsGenerated++;

        // Generate individual post pages
        for (const translation of translations) {
          // Fetch available translations for hreflang (including English original)
          const availableTranslations = await fetchTranslationsForPost(translation.post_id);

          // Add current language translation slug
          availableTranslations[language] = translation.slug;

          // Fetch English slug for this post
          const { data: englishPost } = await supabase
            .from('posts')
            .select('slug')
            .eq('id', translation.post_id)
            .maybeSingle();

          if (englishPost) {
            availableTranslations.en = englishPost.slug;
          }

          const postHTML = createBlogPostHTML(translation, language, translations, availableTranslations, languageTranslations, headerTranslations, footerTranslations);
          const postDir = path.join(langDir, translation.slug);
          if (!fs.existsSync(postDir)) {
            fs.mkdirSync(postDir, { recursive: true });
          }
          const postPath = path.join(postDir, 'index.html');
          fs.writeFileSync(postPath, postHTML);
          console.log(`   ✅ Generated: /${language}/blog/${translation.slug}/index.html`);
          totalGenerated++;
        }
      }
    } catch (err) {
      console.error(`❌ Error processing ${language}:`, err.message);
      errorCount++;
    }
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log(`🎉 Generation complete!`);
  console.log(`   Blog posts: ${totalGenerated} HTML files`);
  console.log(`   Blog listings: ${listingsGenerated} static HTML files with hydration data`);
  console.log(`   Errors: ${errorCount}`);
  console.log(`${'='.repeat(60)}\n`);

  if (errorCount > 0) {
    console.warn('⚠️  Some languages had errors - check logs above');
  }

  console.log('ℹ️  Static listings will be served to crawlers');
  console.log('ℹ️  React will hydrate the listings for interactive features');
}

// Run the script
generateBlogHTML().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
