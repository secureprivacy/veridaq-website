import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from './ui/Link';
import { useAuth } from '../hooks/useAuth';
import Logo from './Logo';
import LanguageSwitcher from './LanguageSwitcher';
import { ChevronDown, Menu, X, Shield, Users, Building2 } from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '../utils/languageUtils';

const Header: React.FC = () => {
  const { t } = useTranslation();
  const { user, isEditor } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSolutionsOpen, setIsSolutionsOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSolutionsClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsSolutionsOpen(!isSolutionsOpen);
  };

  const getCurrentLanguageFromPath = () => {
    const pathSegments = window.location.pathname.split('/').filter(Boolean);
    const supportedLangs = SUPPORTED_LANGUAGES.filter(lang => lang !== 'en');

    if (pathSegments.length > 0 && supportedLangs.includes(pathSegments[0])) {
      return pathSegments[0];
    }
    return 'en';
  };

  const currentLanguage = getCurrentLanguageFromPath();
  const blogHref = currentLanguage === 'en' ? '/blog/' : `/${currentLanguage}/blog/`;

  const navigation = [
    {
      name: t('header:navigation.solutions'),
      href: '#features',
      hasDropdown: true,
      onClick: handleSolutionsClick,
      scrollToSection: true
    },
    { name: t('header:navigation.industries'), href: '#industries', scrollToSection: true },
    { name: t('header:navigation.blog'), href: blogHref, scrollToSection: false },
    { name: t('header:navigation.whyUs'), href: '#benefits', scrollToSection: true },
    { name: t('header:navigation.contact'), href: '#contact', scrollToSection: true }
  ];

  const handleNavClick = (onClick?: (e: React.MouseEvent) => void) => {
    return (e: React.MouseEvent) => {
      // Always close mobile menu first
      setIsMenuOpen(false);

      // Call custom onClick handler if provided
      if (onClick) {
        onClick(e);
        return;
      }

      // Close solutions dropdown for non-solutions links
      setIsSolutionsOpen(false);
    };
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-b border-white/30 shadow-premium">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center gap-8">
            <Link href="#" className="flex-shrink-0">
              <Logo />
            </Link>
            
            <nav className="hidden lg:flex items-center space-x-8">
              {navigation.map((item) => {
                const isBlogLink = item.href.includes('/blog');
                const linkClassName = 'font-sans text-neutral-700 hover:text-primary-600 font-medium transition-colors duration-200 flex items-center gap-1';
                const linkContent = (
                  <>
                    {item.name}
                    {item.hasDropdown && (
                      <ChevronDown className={`w-4 h-4 transition-transform ${isSolutionsOpen ? 'rotate-180' : ''}`} />
                    )}
                  </>
                );

                return (
                  <div key={item.name} className="relative group">
                    {isBlogLink ? (
                      <a
                        href={item.href}
                        onClick={handleNavClick(item.onClick)}
                        className={linkClassName}
                      >
                        {linkContent}
                      </a>
                    ) : (
                      <Link
                        href={item.href}
                        onClick={handleNavClick(item.onClick)}
                        className={linkClassName}
                      >
                        {linkContent}
                      </Link>
                    )}

                    {item.hasDropdown && isSolutionsOpen && (
                      <div className="absolute top-full left-0 mt-2 w-96 glass-card shadow-premium-lg rounded-3xl border border-white/30 p-8 z-50">
                        <div className="space-y-8">
                          <div>
                            <h3 className="font-display font-semibold text-lg text-accent-900 mb-6">
                              Complete KYC/AML Platform
                            </h3>
                            <div className="grid grid-cols-1 gap-4">
                              <div className="p-4 bg-white/60 rounded-xl border border-white/40 hover:bg-white/80 hover:shadow-md transition-all duration-300">
                                <span className="font-display font-medium text-accent-900 block mb-1">Customer Verification</span>
                                <p className="body-sm text-neutral-600">Smart eID integration and instant onboarding</p>
                              </div>
                              <div className="p-4 bg-white/60 rounded-xl border border-white/40 hover:bg-white/80 hover:shadow-md transition-all duration-300">
                                <span className="font-display font-medium text-accent-900 block mb-1">Transaction Monitoring</span>
                                <p className="body-sm text-neutral-600">AI-powered real-time risk detection</p>
                              </div>
                              <div className="p-4 bg-white/60 rounded-xl border border-white/40 hover:bg-white/80 hover:shadow-md transition-all duration-300">
                                <span className="font-display font-medium text-accent-900 block mb-1">Compliance Reporting</span>
                                <p className="body-sm text-neutral-600">Automated multi-jurisdiction reporting</p>
                              </div>
                            </div>
                          </div>

                          <div className="pt-4 border-t border-neutral-200">
                            <div className="p-4 bg-gradient-to-r from-primary-50 to-primary-100 rounded-xl border border-primary-200/60 shadow-sm">
                              <div className="font-display font-medium text-primary-800 text-sm">EU AMLR 2027 Ready</div>
                              <div className="font-sans text-primary-700 text-xs">Enterprise compliance from day one</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>
          </div>
          
          <div className="flex items-center gap-6">
            <LanguageSwitcher />
            
            {user && isEditor() && (
              <Link 
                href="#cms/dashboard"
                className="hidden lg:inline-flex bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold px-6 py-3 rounded-xl hover:from-primary-700 hover:to-primary-800 hover:shadow-lg hover:scale-105 transition-all duration-300 shadow-md font-display"
              >
                CMS
              </Link>
            )}
            
            <Link 
              href="#contact" 
              className="hidden lg:inline-flex bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold px-6 py-3 rounded-xl hover:from-primary-700 hover:to-primary-800 hover:shadow-lg hover:scale-105 transition-all duration-300 shadow-md"
            >
              {t('header:cta.demo')}
            </Link>
            
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 text-neutral-700 hover:text-primary-600 transition-colors"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden py-6 border-t border-neutral-200">
            <nav className="space-y-4">
              {navigation.map((item) => {
                const isBlogLink = item.href.includes('/blog');
                const commonProps = {
                  key: item.name,
                  className: 'block text-neutral-700 hover:text-primary-600 font-medium transition-colors',
                  onClick: handleNavClick(item.onClick)
                } as const;

                return isBlogLink ? (
                  <a
                    {...commonProps}
                    href={item.href}
                  >
                    {item.name}
                  </a>
                ) : (
                  <Link
                    {...commonProps}
                    href={item.href}
                  >
                    {item.name}
                  </Link>
                );
              })}

              {user && isEditor() && (
                <Link
                  href="#cms/dashboard"
                  className="block text-primary-600 font-medium"
                  onClick={handleNavClick()}
                >
                  CMS Access
                </Link>
              )}

              <Link
                href="#contact"
                className="block bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold text-center py-3 rounded-xl mt-6 hover:from-primary-700 hover:to-primary-800 hover:shadow-lg transition-all duration-300 shadow-md"
                onClick={handleNavClick()}
              >
                {t('header:cta.demo')}
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;