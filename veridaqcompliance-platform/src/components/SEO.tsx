import React from 'react';
import { useTranslation } from 'react-i18next';
import { SUPPORTED_LANGUAGES } from '../utils/languageUtils';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  type?: string;
  canonical?: string;
  article?: {
    publishedTime?: string;
    modifiedTime?: string;
    author?: string;
    section?: string;
    tags?: string[];
  };
}

const SEO: React.FC<SEOProps> = ({
  title,
  description,
  keywords,
  image = '/images/hero-dashboard.png',
  type = 'website',
  canonical,
  article
}) => {
  const { t, i18n } = useTranslation(['seo', 'common']);
  
  const siteTitle = title || t('seo:defaultTitle');
  const siteDescription = description || t('seo:defaultDescription');
  const siteKeywords = keywords || t('seo:defaultKeywords');
  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
  const canonicalUrl = canonical || currentUrl;
  
  // Get alternate language URLs
  const supportedLanguages = SUPPORTED_LANGUAGES;
  
  React.useEffect(() => {
    // Update document title
    document.title = siteTitle;
    
    // Update meta description
    updateMetaTag('description', siteDescription);
    updateMetaTag('keywords', siteKeywords);
    
    // Open Graph tags
    updateMetaTag('og:title', siteTitle, 'property');
    updateMetaTag('og:description', siteDescription, 'property');
    updateMetaTag('og:type', type, 'property');
    updateMetaTag('og:url', canonicalUrl, 'property');
    updateMetaTag('og:image', image, 'property');
    updateMetaTag('og:site_name', 'Veridaq', 'property');
    updateMetaTag('og:locale', i18n.language === 'en' ? 'en_US' : `${i18n.language}_${i18n.language.toUpperCase()}`, 'property');
    
    // Twitter Card tags
    updateMetaTag('twitter:card', 'summary_large_image', 'name');
    updateMetaTag('twitter:title', siteTitle, 'name');
    updateMetaTag('twitter:description', siteDescription, 'name');
    updateMetaTag('twitter:image', image, 'name');
    
    // Additional SEO meta tags
    updateMetaTag('robots', 'index,follow', 'name');
    updateMetaTag('googlebot', 'index,follow', 'name');
    updateMetaTag('author', 'Veridaq', 'name');
    updateMetaTag('theme-color', '#0284c7', 'name');
    updateMetaTag('language', i18n.language, 'name');
    updateMetaTag('geo.region', 'EU', 'name');
    updateMetaTag('geo.placename', 'Copenhagen, Denmark', 'name');
    updateMetaTag('ICBM', '55.6761,12.5683', 'name');
    
    // Article-specific meta tags
    if (type === 'article' && article) {
      updateMetaTag('article:published_time', article.publishedTime || '', 'property');
      updateMetaTag('article:modified_time', article.modifiedTime || '', 'property');
      updateMetaTag('article:author', article.author || 'Veridaq Team', 'property');
      updateMetaTag('article:section', article.section || 'EU Compliance', 'property');
      if (article.tags) {
        article.tags.forEach(tag => {
          const metaElement = document.createElement('meta');
          metaElement.setAttribute('property', 'article:tag');
          metaElement.setAttribute('content', tag);
          document.head.appendChild(metaElement);
        });
      }
    }
    
    // Canonical URL
    updateLinkTag('canonical', canonicalUrl);
    
    // Hreflang tags for multilingual SEO
    supportedLanguages.forEach(lang => {
      const hreflangUrl = canonicalUrl.replace(/\/(da|sv|no|fi|de|fr|es|it|pt|nl)(\/|$)/, '/').replace(/\/$/, '') + (lang === 'en' ? '' : `/${lang}`);
      updateLinkTag('alternate', hreflangUrl, lang === 'en' ? 'x-default' : lang);
    });
    
    // Update JSON-LD structured data
    updateStructuredData();
    
  }, [siteTitle, siteDescription, siteKeywords, canonicalUrl, image, type, i18n.language, article]);

  const updateMetaTag = (name: string, content: string, attribute: 'name' | 'property' = 'name') => {
    let element = document.querySelector(`meta[${attribute}="${name}"]`);
    if (!element) {
      element = document.createElement('meta');
      element.setAttribute(attribute, name);
      document.head.appendChild(element);
    }
    element.setAttribute('content', content);
  };

  const updateLinkTag = (rel: string, href: string, hreflang?: string) => {
    const selector = hreflang ? `link[rel="${rel}"][hreflang="${hreflang}"]` : `link[rel="${rel}"]`;
    let element = document.querySelector(selector);
    if (!element) {
      element = document.createElement('link');
      element.setAttribute('rel', rel);
      if (hreflang) element.setAttribute('hreflang', hreflang);
      document.head.appendChild(element);
    }
    element.setAttribute('href', href);
  };

  const updateStructuredData = () => {
    let structuredData;
    
    if (type === 'article' && article) {
      // Article schema for blog posts
      structuredData = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": siteTitle,
        "description": siteDescription,
        "image": {
          "@type": "ImageObject",
          "url": image.startsWith('http') ? image : `${window.location.origin}${image}`,
          "width": 1200,
          "height": 630
        },
        "url": canonicalUrl,
        "datePublished": article.publishedTime || new Date().toISOString(),
        "dateModified": article.modifiedTime || new Date().toISOString(),
        "author": {
          "@type": "Organization",
          "name": article.author || "Veridaq Team",
          "url": "https://veridaq.com"
        },
        "publisher": {
          "@type": "Organization",
          "name": "Veridaq",
          "logo": {
            "@type": "ImageObject",
            "url": `${window.location.origin}/images/veridaq-logo-transparent.png`,
            "width": 300,
            "height": 60
          }
        },
        "mainEntityOfPage": {
          "@type": "WebPage",
          "@id": canonicalUrl
        },
        "keywords": siteKeywords,
        "articleSection": article.section || "EU Compliance",
        "inLanguage": i18n.language,
        "about": {
          "@type": "Thing",
          "name": "EU AMLR 2027 Compliance"
        },
        "mentions": [
          {
            "@type": "Thing",
            "name": "KYC Verification"
          },
          {
            "@type": "Thing", 
            "name": "AML Screening"
          },
          {
            "@type": "Thing",
            "name": "GDPR Compliance"
          }
        ]
      };
    } else {
      // Organization schema for main pages
      structuredData = {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "Veridaq",
        "description": siteDescription,
        "url": canonicalUrl.replace(/\/(da|sv|no|fi|de|fr|es|it|pt|nl)(\/|$)/, '/'),
        "logo": {
          "@type": "ImageObject",
          "url": `${window.location.origin}/images/veridaq-logo-transparent.png`,
          "width": 300,
          "height": 60
        },
        "image": {
          "@type": "ImageObject",
          "url": `${window.location.origin}${image}`,
          "width": 1200,
          "height": 630
        },
        "contactPoint": {
          "@type": "ContactPoint",
          "telephone": "+45-31272726",
          "contactType": "sales",
          "email": "sales@veridaq.com",
          "availableLanguage": supportedLanguages,
          "areaServed": {
            "@type": "Place",
            "name": "European Union"
          }
        },
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "Fruebjergvej 3",
          "addressLocality": "Copenhagen",
          "postalCode": "2100",
          "addressCountry": "DK",
          "addressRegion": "Capital Region"
        },
        "areaServed": {
          "@type": "Place",
          "name": "European Union"
        },
        "serviceType": [
          "KYC Verification",
          "AML Screening", 
          "Compliance Management",
          "Risk Assessment",
          "Transaction Monitoring"
        ],
        "industry": "Financial Technology",
        "foundingDate": "2024",
        "sameAs": [],
        "knowsAbout": [
          "EU AMLR 2027",
          "GDPR Compliance", 
          "Financial Regulations",
          "KYC Verification",
          "AML Screening"
        ],
        "slogan": "Advanced KYC & AML Solutions for EU AMLR 2027 Compliance"
      };
    };

    let scriptElement = document.querySelector('script[type="application/ld+json"]');
    if (!scriptElement) {
      scriptElement = document.createElement('script');
      scriptElement.setAttribute('type', 'application/ld+json');
      document.head.appendChild(scriptElement);
    }
    scriptElement.textContent = JSON.stringify(structuredData);
  };

  return null;
};

export default SEO;