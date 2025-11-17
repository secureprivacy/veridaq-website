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

const LOCALES_DIR = path.join(__dirname, '..', 'public', 'locales');
const translationCache = {};

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

// HTML template for blog listing page in static-first mode
function createBlogListingHTML(posts, language, translations) {
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
        ...(post.excerpt && { "description": post.excerpt }),
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
    const excerpt = post.excerpt
      ? escapeHtml(post.excerpt)
      : escapeHtml(post.content?.replace(/<[^>]*>/g, ' ').slice(0, 160) || '');

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
  const backToSite = translations.backToSite || 'Back to site';
  const noPosts = translations.noPostsYet || 'No blog posts available yet.';

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
  <footer class="blog-footer">
    <p>&copy; ${new Date().getFullYear()} Veridaq. All rights reserved.</p>
    <p><a href="${langPrefix || '/'}">${escapeHtml(backToSite)}</a></p>
  </footer>
</body>
</html>`;
}

// HTML template for individual blog post
function createBlogPostHTML(post, language, allPosts = [], availableTranslations = {}, translations) {
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
    "description": post.meta_description || post.excerpt || '',
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
    const relatedExcerpt = relatedPost.excerpt
      ? escapeHtml(relatedPost.excerpt)
      : escapeHtml(relatedPost.content?.replace(/<[^>]*>/g, ' ').slice(0, 160) || '');

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
  <meta name="description" content="${escapeHtml(post.meta_description || post.excerpt || '')}">
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
  <meta property="og:description" content="${escapeHtml(post.excerpt || post.meta_description || '')}">
  <meta property="og:type" content="article">
  <meta property="og:url" content="https://veridaq.com${langPrefix}/blog/${post.slug}">
  <meta property="article:published_time" content="${publishedDate}">
  <meta property="article:modified_time" content="${updatedDate}">

  <!-- Twitter Card Tags -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(post.title)}">
  <meta name="twitter:description" content="${escapeHtml(post.excerpt || post.meta_description || '')}">
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
      ${post.excerpt ? `<div class="post-excerpt">${escapeHtml(post.excerpt)}</div>` : ''}
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

  <footer class="blog-footer">
    <p>&copy; ${new Date().getFullYear()} Veridaq. All rights reserved.</p>
    <p><a href="${blogHref}">← ${escapeHtml(backToBlog)}</a></p>
  </footer>
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

        // Generate static blog listing page with hydration data
        const listingHTML = createBlogListingHTML(posts, 'en', languageTranslations);
        const listingPath = path.join(blogDir, 'index.html');
        fs.writeFileSync(listingPath, listingHTML);
        console.log(`   ✅ Generated: /blog/index.html (with ${posts.length} posts)`);
        listingsGenerated++;

        // Generate individual post pages
        for (const post of posts) {
          // Fetch available translations for hreflang tags
          const translations = await fetchTranslationsForPost(post.id);
          translations.en = post.slug; // Add English slug

          const postHTML = createBlogPostHTML(post, 'en', posts, translations, languageTranslations);
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

        // Generate static blog listing page for this language with hydration data
        const langDir = path.join(publicDir, language, 'blog');
        if (!fs.existsSync(langDir)) {
          fs.mkdirSync(langDir, { recursive: true });
        }

        const listingHTML = createBlogListingHTML(translations, language, languageTranslations);
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

          const postHTML = createBlogPostHTML(translation, language, translations, availableTranslations, languageTranslations);
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
