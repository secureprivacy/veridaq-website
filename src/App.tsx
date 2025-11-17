import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import SEO from './components/SEO';
import Header from './components/Header';
import Hero from './components/Hero';
import Features from './components/Features';
import Benefits from './components/Benefits';
import Industries from './components/Industries';
import EuComplianceSection from './components/EuComplianceSection';
import TrustSignals from './components/TrustSignals';
import ROICalculator from './components/ROICalculator';
import ComplianceChecklist from './components/ComplianceChecklist';
import CTA from './components/CTA';
import ContactForm from './components/ContactForm';
import ScrollCTA from './components/ScrollCTA';
import Footer from './components/Footer';
import AdminDashboard from './components/admin/AdminDashboard';
import AuthGuard from './components/auth/AuthGuard';
import PrivacyPolicy from './components/legal/PrivacyPolicy';
import TermsOfService from './components/legal/TermsOfService';
import PrivacyByDesign from './components/legal/PrivacyByDesign';
import ErrorBoundary from './components/ErrorBoundary';
import { SUPPORTED_LANGUAGES } from './utils/languageUtils';
import i18n from './i18n';

// HomePage Component
const HomePage: React.FC<{ industrySlug?: string }> = ({ industrySlug }) => {
  const { t } = useTranslation('industries');

  console.log('🏠 HomePage component rendering...', industrySlug ? `with industry: ${industrySlug}` : '');

  // Get industry ID from slug for SEO
  let industryId: string | null = null;
  if (industrySlug) {
    const slugs = t('slugs', { returnObjects: true }) as Record<string, string>;
    industryId = Object.keys(slugs).find(id => slugs[id] === industrySlug) || null;
  }

  // Get industry title for SEO
  const industryTitle = industryId ? t(`items.${industryId}.title`) : null;
  const industryDescription = industryId ? t(`items.${industryId}.description`) : null;

  return (
    <div className="min-h-screen bg-white">
      <SEO
        title={industryTitle ? `${industryTitle} | Veridaq` : undefined}
        description={industryDescription ? `${industryDescription} - Advanced KYC & AML Solutions` : undefined}
      />
      <Header />
      <main>
        <Hero />
        {console.log('🎯 About to render Features component...')}
        <Features />
        {console.log('✅ Features component rendered')}
        <Industries industrySlug={industrySlug} />
        <Benefits />
        <ROICalculator />
        <CTA />
        <ContactForm />
      </main>
      <Footer />
      <ScrollCTA />
    </div>
  );
};

// HomePageWithScroll Component - Handles scrolling to specific sections
const HomePageWithScroll: React.FC<{ sectionId: string }> = ({ sectionId }) => {
  const [isReady, setIsReady] = React.useState(false);

  // Mark component as ready after initial render
  useEffect(() => {
    setIsReady(true);
  }, []);

  // Scroll to section after component is ready and rendered
  useEffect(() => {
    if (!isReady) return;

    const scrollToSection = () => {
      console.log('🎯 Attempting to scroll to section:', sectionId);
      const element = document.getElementById(sectionId);

      if (element) {
        console.log('✅ Found section element, scrolling...');
        const headerOffset = 100;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      } else {
        console.warn('⚠️ Section element not found:', sectionId);
        // Fallback: try scrolling to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };

    // Use multiple attempts to ensure the section is rendered
    const timer1 = setTimeout(scrollToSection, 100);
    const timer2 = setTimeout(scrollToSection, 500);
    const timer3 = setTimeout(scrollToSection, 1000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [sectionId, isReady]);

  return <HomePage />;
};

// Component to handle hash-based section scrolling on homepage load
const HomePageWithHashScroll: React.FC<{ industrySlug?: string }> = ({ industrySlug }) => {
  const [isReady, setIsReady] = React.useState(false);

  // Mark component as ready after initial render
  useEffect(() => {
    setIsReady(true);
  }, []);

  // Check for hash in URL and scroll to section if present
  useEffect(() => {
    if (!isReady) return;

    const hash = window.location.hash.slice(1);
    if (!hash || hash.startsWith('cms')) return;

    const scrollToSection = () => {
      console.log('🎯 Hash detected on homepage load, scrolling to:', hash);
      const element = document.getElementById(hash);

      if (element) {
        console.log('✅ Found section element, scrolling...');
        const headerOffset = 100;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });

        // Clean up hash from URL after scrolling
        window.history.replaceState({}, '', window.location.pathname);
      }
    };

    // Use multiple attempts to ensure the section is rendered
    const timer1 = setTimeout(scrollToSection, 100);
    const timer2 = setTimeout(scrollToSection, 500);
    const timer3 = setTimeout(scrollToSection, 1000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [isReady]);

  return <HomePage industrySlug={industrySlug} />;
};

function App() {
  const [currentRoute, setCurrentRoute] = React.useState('');
  const [detectedLanguage, setDetectedLanguage] = React.useState('en');
  const languageInitialized = React.useRef(false);

  console.log('🔍 App state:', { currentRoute, detectedLanguage, pathname: window.location.pathname, hash: window.location.hash });

  React.useEffect(() => {
    const parseCurrentRoute = () => {
      const pathname = window.location.pathname;
      const hash = window.location.hash.slice(1);
      const isBlogHash = hash === 'blog' || hash === 'blog/';
      
      console.log('🔍 App: Parsing route - pathname:', pathname, 'hash:', hash);
      
      // Handle Supabase auth callback
      if (pathname === '/auth/callback') {
        console.log('🔄 Processing Supabase auth callback...');
        // Let Supabase handle the callback, then redirect to CMS
        setTimeout(() => {
          window.location.href = '/#cms/dashboard';
        }, 1000);
        return;
      }
      
      // Handle authentication callback from magic link
      if (hash.includes('error=access_denied') || hash.includes('error_code=otp_expired')) {
        console.error('🚨 Authentication error detected in URL:', hash);
        console.log('🔍 Full URL with error:', window.location.href);
        
        // Extract error details for debugging
        const urlParams = new URLSearchParams(hash.replace('#', ''));
        const errorCode = urlParams.get('error_code');
        const errorDescription = urlParams.get('error_description');
        const error = urlParams.get('error');
        
        console.error('📋 Error details:', {
          error,
          errorCode,
          errorDescription: decodeURIComponent(errorDescription || ''),
          fullHash: hash
        });
        
        // Show user-friendly error message
        let userFriendlyMessage = 'Authentication failed';
        if (errorCode === 'otp_expired') {
          userFriendlyMessage = 'Magic link has expired. Please request a new one.';
        } else if (error === 'access_denied') {
          userFriendlyMessage = 'Access denied. Please try requesting a new magic link.';
        } else {
          userFriendlyMessage = `Authentication failed: ${errorDescription ? decodeURIComponent(errorDescription) : error || 'Unknown error'}`;
        }
        
        // Create error notification
        const notification = document.createElement('div');
        notification.className = 'fixed top-6 right-6 bg-error-600 text-white p-6 rounded-xl shadow-lg z-50 max-w-md';
        notification.innerHTML = `
          <div class="flex items-start gap-3">
            <svg class="w-5 h-5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <div class="font-semibold">🔐 Authentication Error</div>
              <div class="text-sm text-error-100 mt-1">${userFriendlyMessage}</div>
              ${errorCode === 'otp_expired' ? 
                '<div class="text-xs text-error-200 mt-2">💡 Tip: Magic links expire after 15 minutes for security</div>' : 
                '<div class="text-xs text-error-200 mt-2">Check console for technical details</div>'
              }
            </div>
          </div>
        `;
        document.body.appendChild(notification);
        
        setTimeout(() => {
          if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
          }
        }, 8000);
        
        // Clear the error from URL and show auth form
        setTimeout(() => {
          window.location.hash = '#cms';
        }, 1000);
        return;
      }
      
      // Handle successful authentication callback
      if (hash.includes('access_token') || hash.includes('refresh_token')) {
        console.log('✅ Magic link authentication callback detected');
        console.log('🔍 Full callback URL:', window.location.href);
        
        // Immediately redirect to CMS dashboard - Supabase will handle auth in background
        console.log('🔄 Redirecting to CMS dashboard while Supabase processes authentication...');
        
        // Clear the auth tokens from URL and redirect to clean CMS URL
        window.history.replaceState({}, '', '/#cms/dashboard');
        setCurrentRoute('cms/dashboard');
        return;
      }
      
      const pathSegments = pathname.split('/').filter(Boolean);
      const supportedLanguages = SUPPORTED_LANGUAGES.filter(lang => lang !== 'en');
      
      // Handle hash-based CMS routing first
      if (hash) {
        if (hash === 'cms' || hash.startsWith('cms/')) {
          console.log('🎯 CMS route detected, setting language to en and route to:', hash);
          setDetectedLanguage('en'); // CMS is always in English
          setCurrentRoute(hash);
          return;
        }

        // Note: Blog routes (#blog) are handled by static HTML files, not the SPA
        // If someone tries to access /#blog, redirect them to the static /blog/ page
        if (isBlogHash) {
          console.log('📝 Blog hash detected, redirecting to static blog page');
          const blogPath = supportedLanguages.includes(pathSegments[0]) ? `/${pathSegments[0]}/blog/` : '/blog/';
          window.location.href = blogPath;
          return;
        }

        // IMPORTANT: Don't return here for other hashes - they might be section anchors
        console.log('⚠️ Non-CMS hash detected:', hash, '- continuing with normal routing');
      }
      
      let detectedLang = 'en';
      let detectedRoute = '';
      
      // Parse path-based routing
      if (pathSegments.length === 0) {
        // Root path - English homepage
        detectedLang = 'en';
        detectedRoute = 'homepage';
      } else if (pathSegments[0] === 'privacy-policy') {
        // Privacy Policy page
        detectedLang = 'en';
        detectedRoute = 'privacy-policy';
      } else if (pathSegments[0] === 'terms-of-service') {
        // Terms of Service page
        detectedLang = 'en';
        detectedRoute = 'terms-of-service';
      } else if (pathSegments[0] === 'privacy-by-design') {
        // Privacy by Design page
        detectedLang = 'en';
        detectedRoute = 'privacy-by-design';
      } else if (pathSegments[0] === 'features') {
        // Features section (/features)
        detectedLang = 'en';
        detectedRoute = 'section/features';
      } else if (pathSegments[0] === 'benefits') {
        // Benefits section (/benefits)
        detectedLang = 'en';
        detectedRoute = 'section/benefits';
      } else if (pathSegments[0] === 'roi-calculator') {
        // ROI Calculator section (/roi-calculator)
        detectedLang = 'en';
        detectedRoute = 'section/roi-calculator';
      } else if (pathSegments[0] === 'contact') {
        // Contact section (/contact)
        detectedLang = 'en';
        detectedRoute = 'section/contact';
      } else if (pathSegments[0] === 'industries' && pathSegments.length === 1) {
        // Industries section overview (/industries)
        detectedLang = 'en';
        detectedRoute = 'section/industries';
      } else if (pathSegments[0] === 'industries' && pathSegments.length === 2) {
        // English industry page (/industries/:slug)
        detectedLang = 'en';
        detectedRoute = `industry/${pathSegments[1]}`;
      } else if (supportedLanguages.includes(pathSegments[0])) {
        // Language-specific paths
        detectedLang = pathSegments[0];

        if (pathSegments.length === 1) {
          // /da - Language homepage
          detectedRoute = 'homepage';
        } else if (pathSegments[1] === 'features') {
          // /da/features - Language features section
          detectedRoute = 'section/features';
        } else if (pathSegments[1] === 'benefits') {
          // /da/benefits - Language benefits section
          detectedRoute = 'section/benefits';
        } else if (pathSegments[1] === 'roi-calculator') {
          // /da/roi-calculator - Language ROI calculator section
          detectedRoute = 'section/roi-calculator';
        } else if (pathSegments[1] === 'contact') {
          // /da/contact - Language contact section
          detectedRoute = 'section/contact';
        } else if (pathSegments[1] === 'industries' && pathSegments.length === 2) {
          // /da/industries - Language industries section
          detectedRoute = 'section/industries';
        } else if (pathSegments[1] === 'industries' && pathSegments.length === 3) {
          // /da/industries/:slug - Language industry page
          detectedRoute = `industry/${pathSegments[2]}`;
        } else {
          // /da/other - fallback to language homepage
          detectedRoute = 'homepage';
        }
      } else {
        // Unknown path - fallback to English homepage
        detectedLang = 'en';
        detectedRoute = 'homepage';
      }
      
      console.log('🎯 App: Final detection - language:', detectedLang, 'route:', detectedRoute);

      // Set language in i18n ONCE on initial mount
      if (!languageInitialized.current && detectedLang !== i18n.language) {
        console.log('🌐 Initializing i18n language to:', detectedLang);
        i18n.changeLanguage(detectedLang);
        languageInitialized.current = true;
      }

      setDetectedLanguage(detectedLang);
      setCurrentRoute(detectedRoute);
    };

    parseCurrentRoute();

    // Listen for both popstate and hashchange events
    window.addEventListener('popstate', parseCurrentRoute);
    window.addEventListener('hashchange', parseCurrentRoute);

    return () => {
      window.removeEventListener('popstate', parseCurrentRoute);
      window.removeEventListener('hashchange', parseCurrentRoute);
    };
  }, []);

  // Route to appropriate component
  const isCMSMode = currentRoute === 'cms' || currentRoute.startsWith('cms/');
  
  console.log('🎯 App: Routing decision - isCMSMode:', isCMSMode, 'currentRoute:', currentRoute);
  
  if (isCMSMode) {
    console.log('App: Showing AdminDashboard for route:', currentRoute);
    return (
      <AuthGuard requireAuth={true}>
        <AdminDashboard />
      </AuthGuard>
    );
  }

  // Note: Blog routes are handled entirely by static HTML files
  // The SPA should never render blog content - redirect to static pages if needed
  if (currentRoute === 'blog') {
    console.log('🎯 App: Blog route detected, redirecting to static HTML');
    window.location.href = detectedLanguage === 'en' ? '/blog/' : `/${detectedLanguage}/blog/`;
    return null;
  }

  if (currentRoute === 'privacy-policy') {
    console.log('🎯 App: Showing PrivacyPolicy');
    return (
      <AuthGuard requireAuth={false}>
        <PrivacyPolicy />
      </AuthGuard>
    );
  }

  if (currentRoute === 'terms-of-service') {
    console.log('🎯 App: Showing TermsOfService');
    return (
      <AuthGuard requireAuth={false}>
        <TermsOfService />
      </AuthGuard>
    );
  }

  if (currentRoute === 'privacy-by-design') {
    console.log('🎯 App: Showing PrivacyByDesign');
    return (
      <AuthGuard requireAuth={false}>
        <PrivacyByDesign />
      </AuthGuard>
    );
  }

  if (currentRoute.startsWith('industry/')) {
    const industrySlug = currentRoute.substring(9);
    console.log('🎯 App: Showing Industry Page for slug:', industrySlug);
    return (
      <AuthGuard requireAuth={false}>
        <HomePageWithHashScroll industrySlug={industrySlug} />
      </AuthGuard>
    );
  }

  if (currentRoute.startsWith('section/')) {
    const sectionId = currentRoute.substring(8);
    console.log('🎯 App: Showing HomePage with section scroll to:', sectionId);

    return (
      <AuthGuard requireAuth={false}>
        <HomePageWithScroll sectionId={sectionId} />
      </AuthGuard>
    );
  }

  // Default to homepage with hash scroll support
  console.log('🎯 App: Showing HomePage (default)');
  return (
    <AuthGuard requireAuth={false}>
      <HomePageWithHashScroll />
    </AuthGuard>
  );
}

export default App;