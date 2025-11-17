import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import BlogList from './BlogList';
import { Languages } from 'lucide-react';
import SEO from '../SEO';
import Header from '../Header';
import Footer from '../Footer';

interface BlogSectionProps {
  language: string;
}

const BlogSection: React.FC<BlogSectionProps> = ({ language }) => {
  const { t } = useTranslation(['blog', 'seo', 'common']);
  const [shouldRenderListing, setShouldRenderListing] = useState(() => {
    const hash = window.location.hash.replace('#', '');
    return hash === 'blog' || hash === 'blog/';
  });

  useEffect(() => {
    const handleRouteChange = () => {
      const hash = window.location.hash.replace('#', '');
      setShouldRenderListing(hash === 'blog' || hash === 'blog/');
    };

    window.addEventListener('popstate', handleRouteChange);
    window.addEventListener('hashchange', handleRouteChange);

    return () => {
      window.removeEventListener('popstate', handleRouteChange);
      window.removeEventListener('hashchange', handleRouteChange);
    };
  }, []);

  useEffect(() => {
    if (shouldRenderListing) {
      window.scrollTo({ top: 0, behavior: 'auto' });
    }
  }, [shouldRenderListing]);

  if (!shouldRenderListing) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Main Content */}
      <main>
        {/* SEO for blog listing page (SPA-only entry via #blog) */}
        <SEO
          title={`Blog | EU Compliance Insights | Veridaq`}
          description={`Expert insights on EU compliance, KYC verification, AML screening, and GDPR requirements. Stay informed about regulatory changes and best practices.`}
          keywords={`compliance blog, EU regulations, KYC insights, AML updates, GDPR compliance, regulatory news`}
          canonical={`https://veridaq.com/${language === 'en' ? '' : language + '/'}blog/`}
        />

        {/* Branded Hero Section */}
        <section className="relative pt-24 pb-12 md:pt-28 md:pb-16 overflow-hidden bg-gradient-to-br from-white via-slate-50/30 to-white">
          {/* Subtle background elements */}
          <div className="absolute top-10 left-10 w-64 h-64 bg-gradient-to-br from-primary-200/20 to-primary-300/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-72 h-72 bg-gradient-to-br from-accent-200/20 to-accent-300/20 rounded-full blur-3xl"></div>

          <div className="container mx-auto px-4 md:px-6 relative z-10">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/95 backdrop-blur-sm border border-white/30 rounded-xl shadow-premium mb-6">
                  <span className="text-2xl">📝</span>
                  <span className="text-sm font-semibold text-accent-900">{t('blog:expertInsights')}</span>
                </div>

                <h1 className="text-3xl md:text-5xl font-bold font-display text-accent-900 mb-4 leading-tight">
                  {t('blog:title')}
                </h1>
                <p className="text-lg md:text-xl text-neutral-600 max-w-3xl mx-auto leading-relaxed">
                  {t('blog:subtitle')}
                </p>

                {/* Language indicator */}
                <div className="mt-6 flex items-center justify-center gap-2 text-sm text-neutral-500">
                  <Languages className="w-4 h-4" />
                  <span>{t('blog:readingIn')} {t(`blog:languages.${language.split('-')[0]}`)}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Blog Content Section */}
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4 md:px-6">
            <BlogList showTitle={false} language={language} />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default BlogSection;