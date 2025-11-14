import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from './ui/Link';
import Logo from './Logo';
import { Mail, Phone, MapPin, Shield, Users, Building2 } from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '../utils/languageUtils';

const Footer: React.FC = () => {
  const { t } = useTranslation('footer');
  const currentYear = new Date().getFullYear();

  const getCurrentLanguageFromPath = () => {
    const pathSegments = window.location.pathname.split('/').filter(Boolean);
    const supportedLangs = SUPPORTED_LANGUAGES.filter(lang => lang !== 'en');

    if (pathSegments.length > 0 && supportedLangs.includes(pathSegments[0])) {
      return pathSegments[0];
    }
    return 'en';
  };

  const currentLanguage = getCurrentLanguageFromPath();
  const blogHref = currentLanguage === 'en' ? '/blog' : `/${currentLanguage}/blog`;
  
  return (
    <footer className="bg-accent-900 text-white pt-16 pb-8">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <div>
            <div className="mb-6">
              <Logo />
            </div>
            
            <p className="text-neutral-300 mb-6 max-w-xs leading-relaxed">
              {t('description')}
            </p>
            
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3">
                <span className="body-sm text-neutral-300">{t('contactInfo.email')}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="body-sm text-neutral-300">{t('contactInfo.phone')}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="body-sm text-neutral-300 whitespace-pre-line">{t('contactInfo.address')}</span>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="font-display font-semibold text-lg mb-6 text-white">
              {t('sections.solutions.title')}
            </h3>
            <ul className="space-y-4">
              <FooterLink href="#features" text={t('sections.solutions.kycVerification')} />
              <FooterLink href="#features" text={t('sections.solutions.amlScreening')} />
              <FooterLink href="#eu-compliance" text={t('sections.solutions.euAmlr2027')} />
              <FooterLink href="#features" text={t('sections.solutions.documentVerification')} />
              <FooterLink href="#features" text={t('sections.solutions.transactionMonitoring')} />
              <FooterLink href="#features" text={t('sections.solutions.riskAssessment')} />
            </ul>
          </div>
          
          <div>
            <h3 className="font-display font-semibold text-lg mb-6 text-white">
              {t('sections.industries.title')}
            </h3>
            <ul className="space-y-4">
              <FooterLink href="#industries" text={t('sections.industries.financialServices')} />
              <FooterLink href="#industries" text={t('sections.industries.fintech')} />
              <FooterLink href="#industries" text={t('sections.industries.cryptocurrency')} />
              <FooterLink href="#industries" text={t('sections.industries.realEstate')} />
              <FooterLink href="#industries" text={t('sections.industries.gaming')} />
              <FooterLink href="#industries" text={t('sections.industries.ecommerce')} />
            </ul>
          </div>
          
          <div>
            <h3 className="font-display font-semibold text-lg mb-6 text-white">
              {t('sections.company.title')}
            </h3>
            <ul className="space-y-4">
              <FooterLink href={blogHref} text={t('sections.company.blog')} />
              <FooterLink href="#benefits" text={t('sections.company.whyChooseUs')} />
              <FooterLink href="#contact" text={t('sections.company.contactSales')} />
              <FooterLink href="/privacy-policy" text={t('sections.company.privacyPolicy')} />
              <FooterLink href="/terms-of-service" text={t('sections.company.termsOfService')} />
              <FooterLink href="/privacy-by-design" text={t('sections.company.gdprCompliance')} />
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-neutral-700">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-neutral-400 text-sm">
              {t('copyright', { year: currentYear })}
            </div>
            
            <div className="flex flex-wrap justify-center gap-8 text-sm">
              <Link href="#" className="text-neutral-400 hover:text-white transition-colors">
                {t('bottomLinks.security')}
              </Link>
              <Link href="#" className="text-neutral-400 hover:text-white transition-colors">
                {t('bottomLinks.compliance')}
              </Link>
              <Link href="#" className="text-neutral-400 hover:text-white transition-colors">
                {t('bottomLinks.status')}
              </Link>
              <Link href="#contact" className="text-primary-400 hover:text-white transition-colors font-medium">
                {t('bottomLinks.contactExperts')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

interface FooterLinkProps {
  href: string;
  text: string;
}

const FooterLink: React.FC<FooterLinkProps> = ({ href, text }) => {
  const isBlogLink = href.includes('/blog');

  return (
    <li>
      {isBlogLink ? (
        <a href={href} className="text-neutral-300 hover:text-white transition-colors">
          {text}
        </a>
      ) : (
        <Link href={href} className="text-neutral-300 hover:text-white transition-colors">
          {text}
        </Link>
      )}
    </li>
  );
};

export default Footer;