import { createClient } from '@supabase/supabase-js';
import { create } from 'xmlbuilder2';
import { writeFileSync } from 'fs';
import { join } from 'path';

// Load environment variables from .env file if available
try {
  const { config } = await import('dotenv');
  config();
} catch (e) {
  // dotenv not available, continue with process.env
}

// Supabase configuration
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;
const SITE_BASE_URL = 'https://veridaq.com';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Error: Supabase environment variables are not set.');
  console.error('Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are configured.');
  process.exit(1);
}

// Check if we're using demo/placeholder values
if (SUPABASE_URL.includes('your-project-ref') || SUPABASE_ANON_KEY.includes('your-anon-key')) {
  console.warn('⚠️ Using demo Supabase credentials - generating static sitemap only');
  generateStaticSitemap();
  process.exit(0);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Supported languages for the site
const supportedLanguages = [
  'en', 'da', 'sv', 'no', 'fi', 'de', 'fr', 'es', 'it', 'pt', 'nl'
];

async function generateSitemap() {
  try {
    console.log('🚀 Starting dynamic sitemap generation...');

    // Create sitemap-core.xml
    const coreRoot = create({ version: '1.0', encoding: 'UTF-8' })
      .ele('urlset', {
        xmlns: 'http://www.sitemaps.org/schemas/sitemap/0.9',
        'xmlns:xhtml': 'http://www.w3.org/1999/xhtml',
        'xmlns:image': 'http://www.google.com/schemas/sitemap-image/1.1'
      });

    addStaticPages(coreRoot);
    addROICalculatorPages(coreRoot);

    const corePath = join(process.cwd(), 'public', 'sitemap-core.xml');
    writeFileSync(corePath, coreRoot.end({ prettyPrint: true }));
    console.log(`✅ Created sitemap-core.xml with ${coreRoot.node.children.length} URLs`);

    // Create industry sitemaps by language
    const industrySitemaps = await generateIndustrySitemaps();
    console.log(`✅ Created ${industrySitemaps.length} industry sitemaps`);

    // Create blog sitemaps by language
    const blogSitemaps = await generateBlogSitemaps();
    console.log(`✅ Created ${blogSitemaps.length} blog sitemaps`);

    // Create sitemap index
    generateSitemapIndex([...industrySitemaps, ...blogSitemaps]);
    console.log('✅ Sitemap index generated successfully');

    const totalUrls = coreRoot.node.children.length +
                      industrySitemaps.reduce((sum, s) => sum + s.count, 0) +
                      blogSitemaps.reduce((sum, s) => sum + s.count, 0);
    console.log(`📊 Generated ${totalUrls} URLs across all sitemaps`);

  } catch (error) {
    console.error('❌ Error generating sitemap:', error);

    // Fallback to static sitemap if dynamic generation fails
    console.log('🔄 Falling back to static sitemap generation...');
    generateStaticSitemap();
  }
}

function addStaticPages(root) {
  console.log('📄 Adding static pages to sitemap...');
  
  // Homepage
  const homeUrl = root.ele('url');
  homeUrl.ele('loc').txt(SITE_BASE_URL);
  homeUrl.ele('lastmod').txt(new Date().toISOString().split('T')[0]);
  homeUrl.ele('changefreq').txt('weekly');
  homeUrl.ele('priority').txt('1.0');
  
  // Add hero image
  const imageElement = homeUrl.ele('image:image');
  imageElement.ele('image:loc').txt(`${SITE_BASE_URL}/images/hero-dashboard.png`);
  imageElement.ele('image:caption').txt('Veridaq KYC & AML Dashboard Interface');
  imageElement.ele('image:title').txt('EU AMLR 2027 Compliance Platform');
  
  // Add hreflang alternates for homepage
  supportedLanguages.forEach(lang => {
    const href = lang === 'en' ? SITE_BASE_URL : `${SITE_BASE_URL}/${lang}`;
    homeUrl.ele('xhtml:link', {
      rel: 'alternate',
      hreflang: lang,
      href: href
    });
  });
  homeUrl.ele('xhtml:link', {
    rel: 'alternate',
    hreflang: 'x-default',
    href: SITE_BASE_URL
  });

  // Blog listing pages
  supportedLanguages.forEach(lang => {
    const blogUrl = root.ele('url');
    const href = lang === 'en' ? `${SITE_BASE_URL}/blog` : `${SITE_BASE_URL}/${lang}/blog`;
    
    blogUrl.ele('loc').txt(href);
    blogUrl.ele('lastmod').txt(new Date().toISOString().split('T')[0]);
    blogUrl.ele('changefreq').txt('weekly');
    blogUrl.ele('priority').txt('0.8');
    
    // Add hreflang alternates for blog listings
    supportedLanguages.forEach(altLang => {
      const altHref = altLang === 'en' ? `${SITE_BASE_URL}/blog` : `${SITE_BASE_URL}/${altLang}/blog`;
      blogUrl.ele('xhtml:link', {
        rel: 'alternate',
        hreflang: altLang,
        href: altHref
      });
    });
    blogUrl.ele('xhtml:link', {
      rel: 'alternate',
      hreflang: 'x-default',
      href: `${SITE_BASE_URL}/blog`
    });
  });

  // Language-specific homepages
  supportedLanguages.forEach(lang => {
    if (lang === 'en') return; // Already handled above
    
    const langUrl = root.ele('url');
    langUrl.ele('loc').txt(`${SITE_BASE_URL}/${lang}`);
    langUrl.ele('lastmod').txt(new Date().toISOString().split('T')[0]);
    langUrl.ele('changefreq').txt('weekly');
    langUrl.ele('priority').txt('0.9');
    
    // Add hreflang alternates for language homepages
    supportedLanguages.forEach(altLang => {
      const altHref = altLang === 'en' ? SITE_BASE_URL : `${SITE_BASE_URL}/${altLang}`;
      langUrl.ele('xhtml:link', {
        rel: 'alternate',
        hreflang: altLang,
        href: altHref
      });
    });
    langUrl.ele('xhtml:link', {
      rel: 'alternate',
      hreflang: 'x-default',
      href: SITE_BASE_URL
    });
  });
}

function addROICalculatorPages(root) {
  console.log('🧮 Adding ROI Calculator pages to sitemap...');

  supportedLanguages.forEach(lang => {
    const calculatorUrl = root.ele('url');
    const href = lang === 'en'
      ? `${SITE_BASE_URL}/roi-calculator`
      : `${SITE_BASE_URL}/${lang}/roi-calculator`;

    calculatorUrl.ele('loc').txt(href);
    calculatorUrl.ele('lastmod').txt(new Date().toISOString().split('T')[0]);
    calculatorUrl.ele('changefreq').txt('monthly');
    calculatorUrl.ele('priority').txt('0.9');

    // Add hreflang alternates for ROI calculator
    supportedLanguages.forEach(altLang => {
      const altHref = altLang === 'en'
        ? `${SITE_BASE_URL}/roi-calculator`
        : `${SITE_BASE_URL}/${altLang}/roi-calculator`;
      calculatorUrl.ele('xhtml:link', {
        rel: 'alternate',
        hreflang: altLang,
        href: altHref
      });
    });
    calculatorUrl.ele('xhtml:link', {
      rel: 'alternate',
      hreflang: 'x-default',
      href: `${SITE_BASE_URL}/roi-calculator`
    });
  });

  console.log(`✅ Added ${supportedLanguages.length} ROI Calculator pages to core sitemap`);
}

function addIndustryPages(root) {
  console.log('🏭 Adding industry pages to sitemap...');

  // Industry slugs for each language
  const industrySlugs = {
    en: {
      financialServices: 'traditional-banking',
      fintech: 'fintech-digital-banking',
      crypto: 'cryptocurrency-digital-assets',
      realEstate: 'real-estate-property',
      gaming: 'gaming-igaming',
      ecommerce: 'ecommerce-marketplaces',
      legalServices: 'legal-law-firms',
      accounting: 'accounting-tax-advisory',
      investmentAdvisors: 'investment-advisors-wealth-management'
    },
    da: {
      financialServices: 'traditionel-bankvirksomhed',
      fintech: 'fintech-digital-bankvirksomhed',
      crypto: 'kryptovaluta-digitale-aktiver',
      realEstate: 'fast-ejendom',
      gaming: 'gaming-underholdning',
      ecommerce: 'e-handel-markedspladser',
      legalServices: 'juridiske-tjenester-advokatfirmaer',
      accounting: 'regnskab-skatteraadgivning',
      investmentAdvisors: 'investeringsraadgivere-formueforvaltning'
    },
    sv: {
      financialServices: 'traditionell-bankverksamhet',
      fintech: 'fintech-digital-bankverksamhet',
      crypto: 'kryptovaluta-digitala-tillgangar',
      realEstate: 'fastigheter',
      gaming: 'spel-underhallning',
      ecommerce: 'e-handel-marknadsplatser',
      legalServices: 'juridiska-tjanster-advokatbyraer',
      accounting: 'redovisning-skatteradgivning',
      investmentAdvisors: 'investeringsradgivare-formogenhetsforvaltning'
    },
    no: {
      financialServices: 'tradisjonell-bankvirksomhet',
      fintech: 'fintech-digital-bankvirksomhet',
      crypto: 'kryptovaluta-digitale-eiendeler',
      realEstate: 'eiendom',
      gaming: 'gaming-underholdning',
      ecommerce: 'e-handel-markedsplasser',
      legalServices: 'juridiske-tjenester-advokatfirmaer',
      accounting: 'regnskap-skatteradgivning',
      investmentAdvisors: 'investeringsradgivere-formuesforvaltning'
    },
    fi: {
      financialServices: 'perinteinen-pankkitoiminta',
      fintech: 'fintech-digitaalinen-pankkitoiminta',
      crypto: 'kryptovaluutta-digitaaliset-varat',
      realEstate: 'kiinteistot',
      gaming: 'pelaaminen-viihde',
      ecommerce: 'verkkokauppa-markkinapaikat',
      legalServices: 'lakipalvelut-asianajotoimistot',
      accounting: 'kirjanpito-veroneuvonta',
      investmentAdvisors: 'sijoitusneuvojat-varallisuudenhallinta'
    },
    de: {
      financialServices: 'traditionelles-bankwesen',
      fintech: 'fintech-digitales-bankwesen',
      crypto: 'kryptowaehrung-digitale-vermoegenswerte',
      realEstate: 'immobilien',
      gaming: 'gaming-unterhaltung',
      ecommerce: 'e-commerce-marktplaetze',
      legalServices: 'rechtsdienstleistungen-anwaltskanzleien',
      accounting: 'buchhaltung-steuerberatung',
      investmentAdvisors: 'anlageberater-vermoegensverwaltung'
    },
    fr: {
      financialServices: 'banque-traditionnelle',
      fintech: 'fintech-banque-digitale',
      crypto: 'cryptomonnaie-actifs-numeriques',
      realEstate: 'immobilier',
      gaming: 'jeux-divertissement',
      ecommerce: 'e-commerce-places-de-marche',
      legalServices: 'services-juridiques-cabinets-avocats',
      accounting: 'comptabilite-conseil-fiscal',
      investmentAdvisors: 'conseillers-investissement-gestion-patrimoine'
    },
    es: {
      financialServices: 'banca-tradicional',
      fintech: 'fintech-banca-digital',
      crypto: 'criptomoneda-activos-digitales',
      realEstate: 'bienes-raices',
      gaming: 'juegos-entretenimiento',
      ecommerce: 'comercio-electronico-mercados',
      legalServices: 'servicios-legales-bufetes',
      accounting: 'contabilidad-asesoria-fiscal',
      investmentAdvisors: 'asesores-inversion-gestion-patrimonial'
    },
    it: {
      financialServices: 'banche-tradizionali',
      fintech: 'fintech-banca-digitale',
      crypto: 'criptovaluta-asset-digitali',
      realEstate: 'immobiliare',
      gaming: 'giochi-intrattenimento',
      ecommerce: 'e-commerce-mercati',
      legalServices: 'servizi-legali-studi-legali',
      accounting: 'contabilita-consulenza-fiscale',
      investmentAdvisors: 'consulenti-investimento-gestione-patrimonio'
    },
    pt: {
      financialServices: 'banca-tradicional',
      fintech: 'fintech-banca-digital',
      crypto: 'criptomoeda-ativos-digitais',
      realEstate: 'imoveis',
      gaming: 'jogos-entretenimento',
      ecommerce: 'comercio-eletronico-mercados',
      legalServices: 'servicos-juridicos-escritorios-advocacia',
      accounting: 'contabilidade-consultoria-fiscal',
      investmentAdvisors: 'consultores-investimento-gestao-patrimonio'
    },
    nl: {
      financialServices: 'traditioneel-bankwezen',
      fintech: 'fintech-digitaal-bankwezen',
      crypto: 'cryptocurrency-digitale-activa',
      realEstate: 'vastgoed',
      gaming: 'gaming-entertainment',
      ecommerce: 'e-commerce-marktplaatsen',
      legalServices: 'juridische-diensten-advocatenkantoren',
      accounting: 'boekhouding-belastingadvies',
      investmentAdvisors: 'beleggingsadviseurs-vermogensbeheer'
    }
  };

  const industryIds = Object.keys(industrySlugs.en);

  // Generate sitemap entries for each industry
  industryIds.forEach(industryId => {
    // Collect URLs for all language versions of this industry
    const industryUrls = new Map();

    supportedLanguages.forEach(lang => {
      const slug = industrySlugs[lang][industryId];
      const href = lang === 'en'
        ? `${SITE_BASE_URL}/industries/${slug}`
        : `${SITE_BASE_URL}/${lang}/industries/${slug}`;
      industryUrls.set(lang, href);
    });

    // Create URL entry for each language version
    supportedLanguages.forEach(lang => {
      const industryUrl = root.ele('url');
      industryUrl.ele('loc').txt(industryUrls.get(lang));
      industryUrl.ele('lastmod').txt(new Date().toISOString().split('T')[0]);
      industryUrl.ele('changefreq').txt('monthly');
      industryUrl.ele('priority').txt('0.8');

      // Add hreflang alternates for this industry page
      supportedLanguages.forEach(altLang => {
        industryUrl.ele('xhtml:link', {
          rel: 'alternate',
          hreflang: altLang,
          href: industryUrls.get(altLang)
        });
      });
      industryUrl.ele('xhtml:link', {
        rel: 'alternate',
        hreflang: 'x-default',
        href: industryUrls.get('en')
      });
    });
  });

  console.log(`✅ Added ${industryIds.length * supportedLanguages.length} industry pages to sitemap`);
}

async function addBlogContent(root) {
  console.log('📝 Fetching blog posts and translations...');
  
  try {
    // Fetch all published posts
    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select('id, slug, title, updated_at, published_at, featured_image_url')
      .eq('status', 'published')
      .order('published_at', { ascending: false });

    if (postsError) {
      console.warn('⚠️ Error fetching posts:', postsError.message);
      return;
    }

    console.log(`📊 Found ${posts?.length || 0} published posts`);

    // Fetch all completed translations
    const { data: translations, error: translationsError } = await supabase
      .from('post_translations')
      .select('post_id, language_code, slug, title, updated_at, published')
      .eq('translation_status', 'completed')
      .eq('published', true);

    if (translationsError) {
      console.warn('⚠️ Error fetching translations:', translationsError.message);
    }

    console.log(`🌍 Found ${translations?.length || 0} published translations`);

    if (!posts || posts.length === 0) {
      console.log('📝 No published posts found, skipping blog content');
      return;
    }

    // Organize content by post ID
    const contentMap = new Map();
    
    // Add original posts
    posts.forEach(post => {
      contentMap.set(post.id, {
        original: {
          slug: post.slug,
          title: post.title,
          lastmod: post.updated_at || post.published_at,
          url: `${SITE_BASE_URL}/blog/${post.slug}`,
          featured_image_url: post.featured_image_url
        },
        translations: new Map()
      });
    });

    // Add translations
    if (translations) {
      translations.forEach(translation => {
        const postContent = contentMap.get(translation.post_id);
        if (postContent) {
          postContent.translations.set(translation.language_code, {
            slug: translation.slug,
            title: translation.title,
            lastmod: translation.updated_at,
            url: `${SITE_BASE_URL}/${translation.language_code}/blog/${translation.slug}`
          });
        }
      });
    }

    // Generate sitemap entries for each post and its translations
    contentMap.forEach((postContent, postId) => {
      const { original, translations } = postContent;
      
      // Collect all available URLs for this post
      const availableUrls = new Map();
      availableUrls.set('en', original.url);
      
      translations.forEach((translation, langCode) => {
        availableUrls.set(langCode, translation.url);
      });

      // Create URL entry for original English post
      const originalUrlElement = root.ele('url');
      originalUrlElement.ele('loc').txt(original.url);
      originalUrlElement.ele('lastmod').txt(new Date(original.lastmod).toISOString().split('T')[0]);
      originalUrlElement.ele('changefreq').txt('weekly');
      originalUrlElement.ele('priority').txt('0.7');

      // Add featured image if available
      if (original.featured_image_url) {
        const imageElement = originalUrlElement.ele('image:image');
        imageElement.ele('image:loc').txt(original.featured_image_url);
        imageElement.ele('image:caption').txt(`${original.title} - EU Compliance Insights`);
        imageElement.ele('image:title').txt(original.title);
      }

      // Add hreflang alternates for original post
      supportedLanguages.forEach(lang => {
        const alternateUrl = availableUrls.get(lang) || original.url; // Fallback to English if translation not available
        originalUrlElement.ele('xhtml:link', {
          rel: 'alternate',
          hreflang: lang,
          href: alternateUrl
        });
      });
      originalUrlElement.ele('xhtml:link', {
        rel: 'alternate',
        hreflang: 'x-default',
        href: original.url
      });

      // Create URL entries for each translation
      translations.forEach((translation, langCode) => {
        const translationUrlElement = root.ele('url');
        translationUrlElement.ele('loc').txt(translation.url);
        translationUrlElement.ele('lastmod').txt(new Date(translation.lastmod).toISOString().split('T')[0]);
        translationUrlElement.ele('changefreq').txt('weekly');
        translationUrlElement.ele('priority').txt('0.7');

        // Add hreflang alternates for translation
        supportedLanguages.forEach(lang => {
          const alternateUrl = availableUrls.get(lang) || original.url; // Fallback to English if translation not available
          translationUrlElement.ele('xhtml:link', {
            rel: 'alternate',
            hreflang: lang,
            href: alternateUrl
          });
        });
        translationUrlElement.ele('xhtml:link', {
          rel: 'alternate',
          hreflang: 'x-default',
          href: original.url
        });
      });
    });

    console.log(`✅ Added ${contentMap.size} blog posts with their translations to sitemap`);
    
  } catch (error) {
    console.error('❌ Error adding blog content to sitemap:', error);
  }
}

async function generateIndustrySitemaps() {
  const sitemaps = [];

  // Industry slugs (same structure as before)
  const industrySlugs = {
    en: {
      financialServices: 'traditional-banking',
      fintech: 'fintech-digital-banking',
      crypto: 'cryptocurrency-digital-assets',
      realEstate: 'real-estate-property',
      gaming: 'gaming-igaming',
      ecommerce: 'ecommerce-marketplaces',
      legalServices: 'legal-law-firms',
      accounting: 'accounting-tax-advisory',
      investmentAdvisors: 'investment-advisors-wealth-management'
    },
    da: {
      financialServices: 'traditionel-bankvirksomhed',
      fintech: 'fintech-digital-bankvirksomhed',
      crypto: 'kryptovaluta-digitale-aktiver',
      realEstate: 'fast-ejendom',
      gaming: 'gaming-underholdning',
      ecommerce: 'e-handel-markedspladser',
      legalServices: 'juridiske-tjenester-advokatfirmaer',
      accounting: 'regnskab-skatteraadgivning',
      investmentAdvisors: 'investeringsraadgivere-formueforvaltning'
    },
    sv: {
      financialServices: 'traditionell-bankverksamhet',
      fintech: 'fintech-digital-bankverksamhet',
      crypto: 'kryptovaluta-digitala-tillgangar',
      realEstate: 'fastigheter',
      gaming: 'spel-underhallning',
      ecommerce: 'e-handel-marknadsplatser',
      legalServices: 'juridiska-tjanster-advokatbyraer',
      accounting: 'redovisning-skatteradgivning',
      investmentAdvisors: 'investeringsradgivare-formogenhetsforvaltning'
    },
    no: {
      financialServices: 'tradisjonell-bankvirksomhet',
      fintech: 'fintech-digital-bankvirksomhet',
      crypto: 'kryptovaluta-digitale-eiendeler',
      realEstate: 'eiendom',
      gaming: 'gaming-underholdning',
      ecommerce: 'e-handel-markedsplasser',
      legalServices: 'juridiske-tjenester-advokatfirmaer',
      accounting: 'regnskap-skatteradgivning',
      investmentAdvisors: 'investeringsradgivere-formuesforvaltning'
    },
    fi: {
      financialServices: 'perinteinen-pankkitoiminta',
      fintech: 'fintech-digitaalinen-pankkitoiminta',
      crypto: 'kryptovaluutta-digitaaliset-varat',
      realEstate: 'kiinteistot',
      gaming: 'pelaaminen-viihde',
      ecommerce: 'verkkokauppa-markkinapaikat',
      legalServices: 'lakipalvelut-asianajotoimistot',
      accounting: 'kirjanpito-veroneuvonta',
      investmentAdvisors: 'sijoitusneuvojat-varallisuudenhallinta'
    },
    de: {
      financialServices: 'traditionelles-bankwesen',
      fintech: 'fintech-digitales-bankwesen',
      crypto: 'kryptowaehrung-digitale-vermoegenswerte',
      realEstate: 'immobilien',
      gaming: 'gaming-unterhaltung',
      ecommerce: 'e-commerce-marktplaetze',
      legalServices: 'rechtsdienstleistungen-anwaltskanzleien',
      accounting: 'buchhaltung-steuerberatung',
      investmentAdvisors: 'anlageberater-vermoegensverwaltung'
    },
    fr: {
      financialServices: 'banque-traditionnelle',
      fintech: 'fintech-banque-digitale',
      crypto: 'cryptomonnaie-actifs-numeriques',
      realEstate: 'immobilier',
      gaming: 'jeux-divertissement',
      ecommerce: 'e-commerce-places-de-marche',
      legalServices: 'services-juridiques-cabinets-avocats',
      accounting: 'comptabilite-conseil-fiscal',
      investmentAdvisors: 'conseillers-investissement-gestion-patrimoine'
    },
    es: {
      financialServices: 'banca-tradicional',
      fintech: 'fintech-banca-digital',
      crypto: 'criptomoneda-activos-digitales',
      realEstate: 'bienes-raices',
      gaming: 'juegos-entretenimiento',
      ecommerce: 'comercio-electronico-mercados',
      legalServices: 'servicios-legales-bufetes',
      accounting: 'contabilidad-asesoria-fiscal',
      investmentAdvisors: 'asesores-inversion-gestion-patrimonial'
    },
    it: {
      financialServices: 'banche-tradizionali',
      fintech: 'fintech-banca-digitale',
      crypto: 'criptovaluta-asset-digitali',
      realEstate: 'immobiliare',
      gaming: 'giochi-intrattenimento',
      ecommerce: 'e-commerce-mercati',
      legalServices: 'servizi-legali-studi-legali',
      accounting: 'contabilita-consulenza-fiscale',
      investmentAdvisors: 'consulenti-investimento-gestione-patrimonio'
    },
    pt: {
      financialServices: 'banca-tradicional',
      fintech: 'fintech-banca-digital',
      crypto: 'criptomoeda-ativos-digitais',
      realEstate: 'imoveis',
      gaming: 'jogos-entretenimento',
      ecommerce: 'comercio-eletronico-mercados',
      legalServices: 'servicos-juridicos-escritorios-advocacia',
      accounting: 'contabilidade-consultoria-fiscal',
      investmentAdvisors: 'consultores-investimento-gestao-patrimonio'
    },
    nl: {
      financialServices: 'traditioneel-bankwezen',
      fintech: 'fintech-digitaal-bankwezen',
      crypto: 'cryptocurrency-digitale-activa',
      realEstate: 'vastgoed',
      gaming: 'gaming-entertainment',
      ecommerce: 'e-commerce-marktplaatsen',
      legalServices: 'juridische-diensten-advocatenkantoren',
      accounting: 'boekhouding-belastingadvies',
      investmentAdvisors: 'beleggingsadviseurs-vermogensbeheer'
    }
  };

  const industryIds = Object.keys(industrySlugs.en);

  // Create separate sitemap for each language
  for (const lang of supportedLanguages) {
    const root = create({ version: '1.0', encoding: 'UTF-8' })
      .ele('urlset', {
        xmlns: 'http://www.sitemaps.org/schemas/sitemap/0.9',
        'xmlns:xhtml': 'http://www.w3.org/1999/xhtml',
        'xmlns:image': 'http://www.google.com/schemas/sitemap-image/1.1'
      });

    // Add industry pages for this language
    industryIds.forEach(industryId => {
      const industryUrls = new Map();

      supportedLanguages.forEach(l => {
        const slug = industrySlugs[l][industryId];
        const href = l === 'en'
          ? `${SITE_BASE_URL}/industries/${slug}`
          : `${SITE_BASE_URL}/${l}/industries/${slug}`;
        industryUrls.set(l, href);
      });

      const industryUrl = root.ele('url');
      industryUrl.ele('loc').txt(industryUrls.get(lang));
      industryUrl.ele('lastmod').txt(new Date().toISOString().split('T')[0]);
      industryUrl.ele('changefreq').txt('monthly');
      industryUrl.ele('priority').txt('0.8');

      // Add hreflang alternates
      supportedLanguages.forEach(altLang => {
        industryUrl.ele('xhtml:link', {
          rel: 'alternate',
          hreflang: altLang,
          href: industryUrls.get(altLang)
        });
      });
      industryUrl.ele('xhtml:link', {
        rel: 'alternate',
        hreflang: 'x-default',
        href: industryUrls.get('en')
      });
    });

    const filename = `sitemap-industries-${lang}.xml`;
    const filePath = join(process.cwd(), 'public', filename);
    writeFileSync(filePath, root.end({ prettyPrint: true }));

    sitemaps.push({
      filename,
      count: industryIds.length,
      lastmod: new Date().toISOString().split('T')[0]
    });
  }

  return sitemaps;
}

async function generateBlogSitemaps() {
  const sitemaps = [];

  try {
    // Fetch all published posts
    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select('id, slug, title, updated_at, published_at, featured_image_url')
      .eq('status', 'published')
      .order('published_at', { ascending: false });

    if (postsError || !posts || posts.length === 0) {
      console.log('📝 No published posts found, creating empty blog sitemaps');

      // Create empty sitemaps for each language
      for (const lang of supportedLanguages) {
        const root = create({ version: '1.0', encoding: 'UTF-8' })
          .ele('urlset', {
            xmlns: 'http://www.sitemaps.org/schemas/sitemap/0.9',
            'xmlns:xhtml': 'http://www.w3.org/1999/xhtml',
            'xmlns:image': 'http://www.google.com/schemas/sitemap-image/1.1'
          });

        // Add blog listing page
        const blogUrl = root.ele('url');
        const href = lang === 'en' ? `${SITE_BASE_URL}/blog` : `${SITE_BASE_URL}/${lang}/blog`;
        blogUrl.ele('loc').txt(href);
        blogUrl.ele('lastmod').txt(new Date().toISOString().split('T')[0]);
        blogUrl.ele('changefreq').txt('daily');
        blogUrl.ele('priority').txt('0.8');

        supportedLanguages.forEach(altLang => {
          const altHref = altLang === 'en' ? `${SITE_BASE_URL}/blog` : `${SITE_BASE_URL}/${altLang}/blog`;
          blogUrl.ele('xhtml:link', {
            rel: 'alternate',
            hreflang: altLang,
            href: altHref
          });
        });
        blogUrl.ele('xhtml:link', {
          rel: 'alternate',
          hreflang: 'x-default',
          href: `${SITE_BASE_URL}/blog`
        });

        const filename = `sitemap-blog-${lang}.xml`;
        const filePath = join(process.cwd(), 'public', filename);
        writeFileSync(filePath, root.end({ prettyPrint: true }));

        sitemaps.push({
          filename,
          count: 1,
          lastmod: new Date().toISOString().split('T')[0]
        });
      }

      return sitemaps;
    }

    // Fetch translations
    const { data: translations } = await supabase
      .from('post_translations')
      .select('post_id, language_code, slug, title, updated_at, published')
      .eq('translation_status', 'completed')
      .eq('published', true);

    // Organize content by language
    const contentByLang = new Map();

    supportedLanguages.forEach(lang => {
      contentByLang.set(lang, []);
    });

    // Add posts and translations to appropriate languages
    posts.forEach(post => {
      contentByLang.get('en').push({
        slug: post.slug,
        title: post.title,
        lastmod: post.updated_at || post.published_at,
        featured_image_url: post.featured_image_url,
        translations: new Map()
      });
    });

    if (translations) {
      translations.forEach(translation => {
        const post = posts.find(p => p.id === translation.post_id);
        if (post) {
          const enContent = contentByLang.get('en').find(c => c.slug === post.slug);
          if (enContent) {
            enContent.translations.set(translation.language_code, {
              slug: translation.slug,
              title: translation.title,
              lastmod: translation.updated_at
            });
          }

          contentByLang.get(translation.language_code).push({
            slug: translation.slug,
            title: translation.title,
            lastmod: translation.updated_at,
            featured_image_url: null,
            originalSlug: post.slug
          });
        }
      });
    }

    // Generate sitemap for each language
    for (const lang of supportedLanguages) {
      const root = create({ version: '1.0', encoding: 'UTF-8' })
        .ele('urlset', {
          xmlns: 'http://www.sitemaps.org/schemas/sitemap/0.9',
          'xmlns:xhtml': 'http://www.w3.org/1999/xhtml',
          'xmlns:image': 'http://www.google.com/schemas/sitemap-image/1.1'
        });

      // Add blog listing page
      const blogUrl = root.ele('url');
      const href = lang === 'en' ? `${SITE_BASE_URL}/blog` : `${SITE_BASE_URL}/${lang}/blog`;
      blogUrl.ele('loc').txt(href);
      blogUrl.ele('lastmod').txt(new Date().toISOString().split('T')[0]);
      blogUrl.ele('changefreq').txt('daily');
      blogUrl.ele('priority').txt('0.8');

      supportedLanguages.forEach(altLang => {
        const altHref = altLang === 'en' ? `${SITE_BASE_URL}/blog` : `${SITE_BASE_URL}/${altLang}/blog`;
        blogUrl.ele('xhtml:link', {
          rel: 'alternate',
          hreflang: altLang,
          href: altHref
        });
      });
      blogUrl.ele('xhtml:link', {
        rel: 'alternate',
        hreflang: 'x-default',
        href: `${SITE_BASE_URL}/blog`
      });

      // Add blog posts for this language
      const langContent = contentByLang.get(lang) || [];
      langContent.forEach(content => {
        const postUrl = root.ele('url');
        const postHref = lang === 'en'
          ? `${SITE_BASE_URL}/blog/${content.slug}`
          : `${SITE_BASE_URL}/${lang}/blog/${content.slug}`;

        postUrl.ele('loc').txt(postHref);
        postUrl.ele('lastmod').txt(new Date(content.lastmod).toISOString().split('T')[0]);
        postUrl.ele('changefreq').txt('daily');
        postUrl.ele('priority').txt('0.7');

        // Add featured image for English posts
        if (lang === 'en' && content.featured_image_url) {
          const imageElement = postUrl.ele('image:image');
          imageElement.ele('image:loc').txt(content.featured_image_url);
          imageElement.ele('image:caption').txt(`${content.title} - EU Compliance Insights`);
          imageElement.ele('image:title').txt(content.title);
        }

        // Add hreflang alternates
        if (lang === 'en' && content.translations) {
          supportedLanguages.forEach(altLang => {
            const translation = content.translations.get(altLang);
            const altHref = altLang === 'en'
              ? `${SITE_BASE_URL}/blog/${content.slug}`
              : translation
                ? `${SITE_BASE_URL}/${altLang}/blog/${translation.slug}`
                : postHref;
            postUrl.ele('xhtml:link', {
              rel: 'alternate',
              hreflang: altLang,
              href: altHref
            });
          });
          postUrl.ele('xhtml:link', {
            rel: 'alternate',
            hreflang: 'x-default',
            href: `${SITE_BASE_URL}/blog/${content.slug}`
          });
        }
      });

      const filename = `sitemap-blog-${lang}.xml`;
      const filePath = join(process.cwd(), 'public', filename);
      writeFileSync(filePath, root.end({ prettyPrint: true }));

      sitemaps.push({
        filename,
        count: langContent.length + 1,
        lastmod: new Date().toISOString().split('T')[0]
      });
    }

    return sitemaps;
  } catch (error) {
    console.error('❌ Error generating blog sitemaps:', error);
    return sitemaps;
  }
}

function generateSitemapIndex(otherSitemaps) {
  const root = create({ version: '1.0', encoding: 'UTF-8' })
    .ele('sitemapindex', {
      xmlns: 'http://www.sitemaps.org/schemas/sitemap/0.9'
    });

  // Add core sitemap
  const coreSitemap = root.ele('sitemap');
  coreSitemap.ele('loc').txt(`${SITE_BASE_URL}/sitemap-core.xml`);
  coreSitemap.ele('lastmod').txt(new Date().toISOString().split('T')[0]);

  // Add all other sitemaps
  otherSitemaps.forEach(sitemap => {
    const sitemapElement = root.ele('sitemap');
    sitemapElement.ele('loc').txt(`${SITE_BASE_URL}/${sitemap.filename}`);
    sitemapElement.ele('lastmod').txt(sitemap.lastmod);
  });

  const indexPath = join(process.cwd(), 'public', 'sitemap.xml');
  writeFileSync(indexPath, root.end({ prettyPrint: true }));
}

function generateStaticSitemap() {
  console.log('📄 Generating static sitemap (demo mode)...');

  const root = create({ version: '1.0', encoding: 'UTF-8' })
    .ele('urlset', {
      xmlns: 'http://www.sitemaps.org/schemas/sitemap/0.9',
      'xmlns:xhtml': 'http://www.w3.org/1999/xhtml',
      'xmlns:image': 'http://www.google.com/schemas/sitemap-image/1.1'
    });

  // Add static pages only
  addStaticPages(root);

  // Add industry pages
  addIndustryPages(root);

  // Write static sitemap
  const sitemapPath = join(process.cwd(), 'public', 'sitemap.xml');
  writeFileSync(sitemapPath, root.end({ prettyPrint: true }));

  console.log('✅ Static sitemap generated successfully');
}

// Run the sitemap generation
generateSitemap();