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

// HTML template for blog listing page with progressive enhancement
function createBlogListingHTML(posts, language) {
  const langPrefix = language === 'en' ? '' : `/${language}`;
  const title = language === 'en'
    ? 'Blog | EU Compliance Insights | Veridaq'
    : `Blog | Veridaq`;

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
        "datePublished": post.published_at || post.posts?.published_at,
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

  const postsHTML = posts.map(post => `
    <article class="blog-post-card">
      ${post.featured_image_url ? `
        <a href="${langPrefix}/blog/${post.slug}/" class="post-image-link">
          <img src="${post.featured_image_url}" alt="${escapeHtml(post.title)}" loading="lazy" width="800" height="450">
        </a>
      ` : ''}
      <div class="post-content">
        <h2>
          <a href="${langPrefix}/blog/${post.slug}/">${escapeHtml(post.title)}</a>
        </h2>
        ${post.excerpt ? `<p class="excerpt">${escapeHtml(post.excerpt)}</p>` : ''}
        <div class="post-meta">
          <time datetime="${post.published_at || post.posts?.published_at}">
            ${new Date(post.published_at || post.posts?.published_at).toLocaleDateString(language)}
          </time>
        </div>
        <a href="${langPrefix}/blog/${post.slug}/" class="read-more">Read more →</a>
      </div>
    </article>
  `).join('\n');

  return `<!DOCTYPE html>
<html lang="${language}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <meta name="description" content="Expert insights on EU compliance, KYC verification, AML screening, and GDPR requirements. Stay informed about regulatory changes and best practices.">
  <meta name="keywords" content="compliance blog, EU regulations, KYC insights, AML updates, GDPR compliance, regulatory news">
  <meta name="robots" content="index, follow, max-image-preview:large">
  <meta name="googlebot" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1">
  <link rel="canonical" href="https://veridaq.com${langPrefix}/blog">

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

  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      line-height: 1.6;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
      color: #1f2937;
      background: #ffffff;
    }
    header {
      border-bottom: 2px solid #e5e7eb;
      padding-bottom: 20px;
      margin-bottom: 40px;
    }
    header h1 {
      font-size: 2.5rem;
      margin-bottom: 10px;
      color: #111827;
    }
    nav {
      display: flex;
      gap: 15px;
      flex-wrap: wrap;
      margin-top: 15px;
    }
    nav a {
      color: #0284c7;
      text-decoration: none;
      padding: 5px 10px;
      border-radius: 4px;
      transition: background 0.2s;
    }
    nav a:hover {
      background: #e0f2fe;
    }
    .blog-post-card {
      margin-bottom: 40px;
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      overflow: hidden;
      background: #ffffff;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      transition: box-shadow 0.3s, transform 0.3s;
    }
    .blog-post-card:hover {
      box-shadow: 0 10px 25px rgba(0,0,0,0.15);
      transform: translateY(-2px);
    }
    .post-image-link {
      display: block;
      overflow: hidden;
    }
    .blog-post-card img {
      width: 100%;
      height: auto;
      display: block;
      transition: transform 0.3s;
    }
    .blog-post-card:hover img {
      transform: scale(1.05);
    }
    .post-content {
      padding: 30px;
    }
    .post-content h2 {
      margin: 0 0 15px 0;
      font-size: 1.75rem;
      line-height: 1.3;
    }
    .post-content h2 a {
      color: #111827;
      text-decoration: none;
      transition: color 0.2s;
    }
    .post-content h2 a:hover {
      color: #0284c7;
    }
    .post-content .excerpt {
      color: #4b5563;
      margin-bottom: 15px;
      line-height: 1.7;
    }
    .post-meta {
      color: #6b7280;
      font-size: 0.875rem;
      margin-bottom: 15px;
    }
    .read-more {
      display: inline-block;
      margin-top: 10px;
      font-weight: 600;
      color: #0284c7;
      text-decoration: none;
      transition: color 0.2s;
    }
    .read-more:hover {
      color: #0369a1;
    }
    @media (max-width: 768px) {
      body { padding: 15px; }
      header h1 { font-size: 2rem; }
      .post-content { padding: 20px; }
      .post-content h2 { font-size: 1.5rem; }
    }
  </style>
</head>
<body>
  <header>
    <h1>Blog - EU Compliance Insights</h1>
    <p style="color: #6b7280; margin-top: 10px;">Expert insights on KYC, AML, and regulatory compliance</p>
    <nav>
      <a href="/">Home</a>
      ${LANGUAGES.map(lang =>
        `<a href="/${lang === 'en' ? '' : lang + '/'}blog"${lang === language ? ' style="font-weight: bold; background: #e0f2fe;"' : ''}>${lang.toUpperCase()}</a>`
      ).join('')}
    </nav>
  </header>
  <main>
    ${postsHTML || '<p>No blog posts available yet.</p>'}
  </main>
  <footer style="margin-top: 60px; padding-top: 30px; border-top: 1px solid #e5e7eb; color: #6b7280; text-align: center;">
    <p>&copy; ${new Date().getFullYear()} Veridaq. All rights reserved.</p>
  </footer>

  <!-- Root element for React app hydration -->
  <div id="root"></div>

  <!-- NO JavaScript redirect needed - Netlify force redirects handle routing -->
  <!-- Crawlers see this static HTML, browsers get React via _redirects force rules -->
</body>
</html>`;
}

// HTML template for individual blog post
function createBlogPostHTML(post, language, allPosts = [], availableTranslations = {}) {
  const langPrefix = language === 'en' ? '' : `/${language}`;
  const publishedDate = post.published_at || post.posts?.published_at;
  const updatedDate = post.updated_at || post.posts?.updated_at || publishedDate;

  // Generate Breadcrumb schema
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": `https://veridaq.com${langPrefix}/`
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Blog",
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

  return `<!DOCTYPE html>
<html lang="${language}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(post.meta_title || post.title)} | Veridaq</title>
  <meta name="description" content="${escapeHtml(post.meta_description || post.excerpt || '')}">
  ${post.meta_keywords ? `<meta name="keywords" content="${escapeHtml(post.meta_keywords)}">` : ''}
  <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">
  <meta name="googlebot" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1">
  <link rel="canonical" href="https://veridaq.com${langPrefix}/blog/${post.slug}">

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

  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      line-height: 1.8;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      color: #1f2937;
      background: #ffffff;
    }
    nav {
      margin-bottom: 30px;
    }
    nav a {
      color: #0284c7;
      text-decoration: none;
      font-weight: 500;
      transition: color 0.2s;
    }
    nav a:hover {
      color: #0369a1;
    }
    article {
      margin: 40px 0;
    }
    article img {
      max-width: 100%;
      height: auto;
      border-radius: 12px;
      margin-bottom: 30px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
    article h1 {
      font-size: 2.5rem;
      margin-bottom: 20px;
      line-height: 1.2;
      color: #111827;
    }
    article .meta {
      color: #6b7280;
      margin-bottom: 30px;
      font-size: 0.95rem;
    }
    article .excerpt {
      font-size: 1.25rem;
      font-style: italic;
      color: #4b5563;
      border-left: 4px solid #0284c7;
      padding-left: 20px;
      margin-bottom: 30px;
    }
    article .content {
      font-size: 1.125rem;
      line-height: 1.8;
    }
    article .content h2 {
      margin-top: 40px;
      margin-bottom: 20px;
      font-size: 1.875rem;
      color: #111827;
    }
    article .content h3 {
      margin-top: 30px;
      margin-bottom: 15px;
      font-size: 1.5rem;
      color: #111827;
    }
    article .content p {
      margin-bottom: 20px;
      line-height: 1.8;
    }
    article .content ul,
    article .content ol {
      margin: 20px 0;
      padding-left: 30px;
    }
    article .content li {
      margin-bottom: 10px;
    }
    article .content a {
      color: #0284c7;
      text-decoration: underline;
    }
    article .content a:hover {
      color: #0369a1;
    }
    article .content code {
      background: #f3f4f6;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 0.9em;
      font-family: 'Courier New', monospace;
    }
    article .content pre {
      background: #1f2937;
      color: #f3f4f6;
      padding: 20px;
      border-radius: 8px;
      overflow-x: auto;
      margin: 20px 0;
    }
    article .content blockquote {
      border-left: 4px solid #e5e7eb;
      padding-left: 20px;
      margin: 20px 0;
      font-style: italic;
      color: #4b5563;
    }
    footer {
      margin-top: 60px;
      padding-top: 30px;
      border-top: 1px solid #e5e7eb;
      color: #6b7280;
      text-align: center;
    }
    @media (max-width: 768px) {
      body { padding: 15px; }
      article h1 { font-size: 2rem; }
      article .content { font-size: 1rem; }
      article .content h2 { font-size: 1.5rem; }
    }
  </style>
</head>
<body>
  <!-- Breadcrumb Navigation -->
  <nav aria-label="Breadcrumb" style="margin-bottom: 20px; font-size: 0.875rem; color: #6b7280;" itemscope itemtype="https://schema.org/BreadcrumbList">
    <span itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
      <a href="${langPrefix}/" itemprop="item" style="color: #0284c7; text-decoration: none;">
        <span itemprop="name">Home</span>
      </a>
      <meta itemprop="position" content="1" />
    </span>
    <span style="margin: 0 8px;">›</span>
    <span itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
      <a href="${langPrefix}/blog" itemprop="item" style="color: #0284c7; text-decoration: none;">
        <span itemprop="name">Blog</span>
      </a>
      <meta itemprop="position" content="2" />
    </span>
    <span style="margin: 0 8px;">›</span>
    <span itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
      <span itemprop="name" style="color: #111827;">${escapeHtml(post.title.length > 50 ? post.title.substring(0, 50) + '...' : post.title)}</span>
      <meta itemprop="position" content="3" />
    </span>
  </nav>
  <nav style="margin-bottom: 20px;">
    <a href="${langPrefix}/blog" style="color: #0284c7; text-decoration: none;">← Back to Blog</a>
  </nav>
  <article>
    ${post.featured_image_url ? `<img src="${post.featured_image_url}" alt="${escapeHtml(post.title)}" width="1200" height="675" loading="eager">` : ''}
    <h1>${escapeHtml(post.title)}</h1>
    <div class="meta">
      <time datetime="${publishedDate}">${new Date(publishedDate).toLocaleDateString(language, { year: 'numeric', month: 'long', day: 'numeric' })}</time>
      ${language === 'en' ? ' · Veridaq Team' : ''}
    </div>
    ${post.excerpt ? `<p class="excerpt">${escapeHtml(post.excerpt)}</p>` : ''}
    <div class="content">
      ${post.content}
    </div>
  </article>
  ${relatedPosts.length > 0 ? `
  <section style="margin-top: 60px; padding: 30px; background: linear-gradient(to bottom right, #f0f9ff, #ffffff, #fef3c7); border: 1px solid #dbeafe; border-radius: 16px;">
    <h2 style="font-size: 1.5rem; font-weight: bold; margin-bottom: 20px; color: #111827;">Related Articles</h2>
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px;">
      ${relatedPosts.map(related => `
        <a href="${langPrefix}/blog/${related.slug}" style="display: block; padding: 20px; background: white; border: 1px solid #e5e7eb; border-radius: 12px; text-decoration: none; transition: all 0.3s;" onmouseover="this.style.borderColor='#0284c7'; this.style.boxShadow='0 4px 6px rgba(0,0,0,0.1)';" onmouseout="this.style.borderColor='#e5e7eb'; this.style.boxShadow='none';">
          <h3 style="font-size: 1rem; font-weight: 600; color: #111827; margin-bottom: 8px; line-height: 1.4;">${escapeHtml(related.title)}</h3>
          ${related.excerpt ? `<p style="font-size: 0.875rem; color: #6b7280; line-height: 1.5;">${escapeHtml(related.excerpt.substring(0, 100))}...</p>` : ''}
        </a>
      `).join('')}
    </div>
  </section>
  ` : ''}
  <footer>
    <p>&copy; ${new Date().getFullYear()} Veridaq. All rights reserved.</p>
    <p style="margin-top: 10px;"><a href="${langPrefix}/blog" style="color: #0284c7;">← Back to all articles</a></p>
  </footer>

  <!-- NO JavaScript redirect needed - Netlify force redirects handle routing -->
  <!-- Crawlers see this static HTML, browsers get React via _redirects force rules -->
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
  console.log('🚀 Starting blog HTML generation with progressive enhancement...');
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

        // Generate static blog listing page with hydration data
        const listingHTML = createBlogListingHTML(posts, 'en');
        const listingPath = path.join(blogDir, 'index.html');
        fs.writeFileSync(listingPath, listingHTML);
        console.log(`   ✅ Generated: /blog/index.html (with ${posts.length} posts)`);
        listingsGenerated++;

        // Generate individual post pages
        for (const post of posts) {
          // Fetch available translations for hreflang tags
          const translations = await fetchTranslationsForPost(post.id);
          translations.en = post.slug; // Add English slug

          const postHTML = createBlogPostHTML(post, 'en', posts, translations);
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

        // Generate static blog listing page for this language with hydration data
        const langDir = path.join(publicDir, language, 'blog');
        if (!fs.existsSync(langDir)) {
          fs.mkdirSync(langDir, { recursive: true });
        }

        const listingHTML = createBlogListingHTML(translations, language);
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

          const postHTML = createBlogPostHTML(translation, language, translations, availableTranslations);
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
