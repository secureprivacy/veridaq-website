import React, { useState, useRef, useEffect } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { useInView } from '../hooks/useInView';
import { Link } from './ui/Link';
import {
  ChevronRight,
  ArrowRight,
  Building2,
  Smartphone,
  Bitcoin,
  Home,
  Gamepad2,
  ShoppingCart
} from 'lucide-react';

interface IndustriesProps {
  industrySlug?: string;
}

const Industries: React.FC<IndustriesProps> = ({ industrySlug }) => {
  const { t, i18n } = useTranslation('industries');
  const [selectedIndustry, setSelectedIndustry] = useState<string | null>(null);
  const industriesRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(industriesRef, { threshold: 0.1 });

  // Wait for i18n to be initialized before rendering
  if (!i18n.isInitialized) {
    return (
      <section className="py-20 md:py-32 bg-white" id="industries">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-neutral-600">Loading industries...</p>
          </div>
        </div>
      </section>
    );
  }

  const industries = [
    {
      id: 'financialServices',
      icon: <Building2 className="w-8 h-8 text-white" />,
      title: t('items.financialServices.title'),
      description: t('items.financialServices.description'),
      challenges: Array.isArray(t('items.financialServices.challenges', { returnObjects: true })) ? t('items.financialServices.challenges', { returnObjects: true }) as string[] : [],
      solutions: Array.isArray(t('items.financialServices.solutions', { returnObjects: true })) ? t('items.financialServices.solutions', { returnObjects: true }) as string[] : [],
      benefits: Array.isArray(t('items.financialServices.benefits', { returnObjects: true })) ? t('items.financialServices.benefits', { returnObjects: true }) as string[] : [],
      bgColor: 'bg-gradient-to-br from-blue-600 to-indigo-700'
    },
    {
      id: 'fintech',
      icon: <Smartphone className="w-8 h-8 text-white" />,
      title: t('items.fintech.title'),
      description: t('items.fintech.description'),
      challenges: Array.isArray(t('items.fintech.challenges', { returnObjects: true })) ? t('items.fintech.challenges', { returnObjects: true }) as string[] : [],
      solutions: Array.isArray(t('items.fintech.solutions', { returnObjects: true })) ? t('items.fintech.solutions', { returnObjects: true }) as string[] : [],
      benefits: Array.isArray(t('items.fintech.benefits', { returnObjects: true })) ? t('items.fintech.benefits', { returnObjects: true }) as string[] : [],
      bgColor: 'bg-gradient-to-br from-violet-600 to-purple-700'
    },
    {
      id: 'crypto',
      icon: <Bitcoin className="w-8 h-8 text-white" />,
      title: t('items.crypto.title'),
      description: t('items.crypto.description'),
      challenges: Array.isArray(t('items.crypto.challenges', { returnObjects: true })) ? t('items.crypto.challenges', { returnObjects: true }) as string[] : [],
      solutions: Array.isArray(t('items.crypto.solutions', { returnObjects: true })) ? t('items.crypto.solutions', { returnObjects: true }) as string[] : [],
      benefits: Array.isArray(t('items.crypto.benefits', { returnObjects: true })) ? t('items.crypto.benefits', { returnObjects: true }) as string[] : [],
      bgColor: 'bg-gradient-to-br from-amber-600 to-orange-700'
    },
    {
      id: 'realEstate',
      icon: <Home className="w-8 h-8 text-white" />,
      title: t('items.realEstate.title'),
      description: t('items.realEstate.description'),
      challenges: Array.isArray(t('items.realEstate.challenges', { returnObjects: true })) ? t('items.realEstate.challenges', { returnObjects: true }) as string[] : [],
      solutions: Array.isArray(t('items.realEstate.solutions', { returnObjects: true })) ? t('items.realEstate.solutions', { returnObjects: true }) as string[] : [],
      benefits: Array.isArray(t('items.realEstate.benefits', { returnObjects: true })) ? t('items.realEstate.benefits', { returnObjects: true }) as string[] : [],
      bgColor: 'bg-gradient-to-br from-emerald-600 to-teal-700'
    },
    {
      id: 'gaming',
      icon: <Gamepad2 className="w-8 h-8 text-white" />,
      title: t('items.gaming.title'),
      description: t('items.gaming.description'),
      challenges: Array.isArray(t('items.gaming.challenges', { returnObjects: true })) ? t('items.gaming.challenges', { returnObjects: true }) as string[] : [],
      solutions: Array.isArray(t('items.gaming.solutions', { returnObjects: true })) ? t('items.gaming.solutions', { returnObjects: true }) as string[] : [],
      benefits: Array.isArray(t('items.gaming.benefits', { returnObjects: true })) ? t('items.gaming.benefits', { returnObjects: true }) as string[] : [],
      bgColor: 'bg-gradient-to-br from-pink-600 to-rose-700'
    },
    {
      id: 'ecommerce',
      icon: <ShoppingCart className="w-8 h-8 text-white" />,
      title: t('items.ecommerce.title'),
      description: t('items.ecommerce.description'),
      challenges: Array.isArray(t('items.ecommerce.challenges', { returnObjects: true })) ? t('items.ecommerce.challenges', { returnObjects: true }) as string[] : [],
      solutions: Array.isArray(t('items.ecommerce.solutions', { returnObjects: true })) ? t('items.ecommerce.solutions', { returnObjects: true }) as string[] : [],
      benefits: Array.isArray(t('items.ecommerce.benefits', { returnObjects: true })) ? t('items.ecommerce.benefits', { returnObjects: true }) as string[] : [],
      bgColor: 'bg-gradient-to-br from-indigo-600 to-blue-700'
    },
    {
      id: 'legalServices',
      icon: <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16l-3-3m3 3l3-3" /></svg>,
      title: t('items.legalServices.title'),
      description: t('items.legalServices.description'),
      challenges: Array.isArray(t('items.legalServices.challenges', { returnObjects: true })) ? t('items.legalServices.challenges', { returnObjects: true }) as string[] : [],
      solutions: Array.isArray(t('items.legalServices.solutions', { returnObjects: true })) ? t('items.legalServices.solutions', { returnObjects: true }) as string[] : [],
      benefits: Array.isArray(t('items.legalServices.benefits', { returnObjects: true })) ? t('items.legalServices.benefits', { returnObjects: true }) as string[] : [],
      bgColor: 'bg-gradient-to-br from-slate-600 to-gray-700'
    },
    {
      id: 'accounting',
      icon: <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16a2 2 0 002 2z" /></svg>,
      title: t('items.accounting.title'),
      description: t('items.accounting.description'),
      challenges: Array.isArray(t('items.accounting.challenges', { returnObjects: true })) ? t('items.accounting.challenges', { returnObjects: true }) as string[] : [],
      solutions: Array.isArray(t('items.accounting.solutions', { returnObjects: true })) ? t('items.accounting.solutions', { returnObjects: true }) as string[] : [],
      benefits: Array.isArray(t('items.accounting.benefits', { returnObjects: true })) ? t('items.accounting.benefits', { returnObjects: true }) as string[] : [],
      bgColor: 'bg-gradient-to-br from-green-600 to-emerald-700'
    },
    {
      id: 'investmentAdvisors',
      icon: <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>,
      title: t('items.investmentAdvisors.title'),
      description: t('items.investmentAdvisors.description'),
      challenges: Array.isArray(t('items.investmentAdvisors.challenges', { returnObjects: true })) ? t('items.investmentAdvisors.challenges', { returnObjects: true }) as string[] : [],
      solutions: Array.isArray(t('items.investmentAdvisors.solutions', { returnObjects: true })) ? t('items.investmentAdvisors.solutions', { returnObjects: true }) as string[] : [],
      benefits: Array.isArray(t('items.investmentAdvisors.benefits', { returnObjects: true })) ? t('items.investmentAdvisors.benefits', { returnObjects: true }) as string[] : [],
      bgColor: 'bg-gradient-to-br from-cyan-600 to-blue-700'
    }
  ];

  // Function to get industry ID from slug
  const getIndustryIdFromSlug = (slug: string): string | null => {
    const slugs = t('slugs', { returnObjects: true }) as Record<string, string>;
    const industryId = Object.keys(slugs).find(id => slugs[id] === slug);
    return industryId || null;
  };

  // Function to get slug from industry ID
  const getSlugFromIndustryId = (id: string): string => {
    const slugs = t('slugs', { returnObjects: true }) as Record<string, string>;
    return slugs[id] || '';
  };

  // Handle industrySlug prop changes
  useEffect(() => {
    if (industrySlug) {
      // Set industry from slug
      const industryId = getIndustryIdFromSlug(industrySlug);
      if (industryId && industryId !== selectedIndustry) {
        setSelectedIndustry(industryId);
        // Scroll to industries section
        setTimeout(() => {
          const element = document.getElementById('industries');
          if (element) {
            const headerOffset = 100;
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
            window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
          }
        }, 100);
      }
    } else if (selectedIndustry) {
      // Clear selection when slug is removed
      setSelectedIndustry(null);
    }
  }, [industrySlug]);

  // Function to handle industry selection with URL update
  const handleIndustrySelect = (industryId: string) => {
    setSelectedIndustry(industryId);
    const slug = getSlugFromIndustryId(industryId);
    const currentLang = i18n.language.split('-')[0];
    const urlPath = currentLang === 'en'
      ? `/industries/${slug}`
      : `/${currentLang}/industries/${slug}`;
    window.history.pushState({}, '', urlPath);
  };

  // Function to handle back navigation with URL update
  const handleBack = () => {
    const currentLang = i18n.language.split('-')[0];
    const urlPath = currentLang === 'en' ? '/#industries' : `/${currentLang}#industries`;

    // Navigate to industries section on homepage
    window.location.href = urlPath;
  };

  const selectedIndustryData = industries.find(industry => industry.id === selectedIndustry);

  return (
    <section className="py-20 md:py-32 bg-white" id="industries" role="region" aria-labelledby="industries-heading">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-neutral-50 rounded-xl border border-neutral-200 mb-8">
            <span className="text-sm font-medium text-accent-700">{t('badge')}</span>
          </div>
          
          <h2 id="industries-heading" className="text-4xl md:text-5xl font-semibold text-accent-900 mb-8">
            <Trans 
              i18nKey="title" 
              ns="industries"
              components={{
                1: <span className="text-primary-600" />
              }}
            />
          </h2>
          <p className="body-lg text-neutral-600 max-w-3xl mx-auto">
            {t('subtitle')}
          </p>
        </div>

        {!selectedIndustry ? (
          <div 
            ref={industriesRef}
            className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {industries.map((industry, index) => (
              <div
                key={industry.id}
                className={`group bg-white rounded-xl p-6 border border-neutral-200 hover:shadow-lg transition-all duration-300 cursor-pointer ${
                  isInView ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
                onClick={() => handleIndustrySelect(industry.id)}
              >
                  
                <h3 className="heading-sm text-accent-900 mb-3">
                  {industry.title}
                </h3>
                
                <p className="body-sm text-neutral-600 mb-4">
                  {industry.description}
                </p>
                
                <div className="font-display text-primary-600 font-medium text-sm">
                  {t('industries:getDemo')}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <IndustryDetail
            industry={selectedIndustryData!}
            onBack={handleBack}
          />
        )}
      </div>
    </section>
  );
};

interface IndustryDetailProps {
  industry: {
    id: string;
    icon: React.ReactNode;
    title: string;
    description: string;
    challenges: string[];
    solutions: string[];
    benefits: string[];
    bgColor: string;
  };
  onBack: () => void;
}

const IndustryDetail: React.FC<IndustryDetailProps> = ({ industry, onBack }) => {
  const { t } = useTranslation('industries');
  
  return (
    <div className="max-w-7xl mx-auto">
      <button 
        onClick={onBack}
        className="flex items-center text-primary-600 hover:text-accent-900 transition-colors mb-12 font-medium"
      >
        ← 
        {t('backToIndustries')}
      </button>

      <div className="grid lg:grid-cols-2 gap-12 items-start mb-12">
        <div>
          <h1 className="text-3xl md:text-4xl font-semibold text-accent-900 mb-4">
            {industry.title}
          </h1>
          <p className="text-lg text-neutral-600 mb-8 leading-relaxed">
            {industry.description}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Link 
              href="#contact" 
              className="bg-primary-600 text-white font-medium px-8 py-3 rounded-xl hover:bg-primary-700 transition-all duration-300"
              onClick={(e) => {
                e.preventDefault();
                const element = document.getElementById('contact');
                if (element) {
                  const headerOffset = 100;
                  const elementPosition = element.getBoundingClientRect().top;
                  const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                  window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
                }
              }}
            >
              {t('getDemo')}
            </Link>
            <Link 
              href="#features" 
              className="bg-white text-accent-700 font-medium px-8 py-3 rounded-xl border border-neutral-200 hover:border-primary-300 hover:bg-neutral-50 transition-all duration-300"
              onClick={(e) => {
                e.preventDefault();
                const element = document.getElementById('features');
                if (element) {
                  const headerOffset = 100;
                  const elementPosition = element.getBoundingClientRect().top;
                  const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                  window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
                }
              }}
            >
              {t('common:exploreFeatures')}
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-xl p-8 border border-neutral-200">
          <h3 className="text-xl font-semibold text-accent-900 mb-6">{t('industryChallenges')}</h3>
          <div className="space-y-6">
            {industry.challenges.map((challenge, index) => (
              <div key={index} className="flex items-start gap-4">
                <div className="w-2 h-2 bg-neutral-400 rounded-full mt-2">
                </div>
                <p className="text-neutral-600 leading-relaxed">{challenge}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 mb-16">
        <div className="bg-white rounded-xl p-8 border border-neutral-200">
          <h3 className="text-xl font-semibold text-accent-900 mb-6">{t('ourSolutions')}</h3>
          <div className="space-y-6">
            {industry.solutions.map((solution, index) => (
              <div key={index} className="flex items-start gap-4">
                <div className="w-2 h-2 bg-primary-600 rounded-full mt-2">
                </div>
                <p className="text-neutral-600 leading-relaxed">{solution}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl p-8 border border-neutral-200">
          <h3 className="text-xl font-semibold text-accent-900 mb-6">{t('keyBenefits')}</h3>
          <div className="space-y-6">
            {industry.benefits.map((benefit, index) => (
              <div key={index} className="flex items-start gap-4">
                <div className="w-2 h-2 bg-success-600 rounded-full mt-2">
                </div>
                <p className="text-neutral-600 leading-relaxed">{benefit}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-accent-900 rounded-xl p-10 text-center text-white">
        <h3 className="text-2xl font-semibold mb-6">
          {t('readyToTransform')}
        </h3>
        <p className="text-lg text-neutral-200 mb-8 max-w-2xl mx-auto leading-relaxed">
          {t('readyToTransformDescription', { industry: industry.title.toLowerCase() })}
        </p>
        <Link 
          href="#contact" 
          className="inline-flex items-center gap-2 bg-primary-600 text-white font-medium px-8 py-3 rounded-xl hover:bg-primary-700 transition-all duration-300"
          onClick={(e) => {
            e.preventDefault();
            const element = document.getElementById('contact');
            if (element) {
              const headerOffset = 100;
              const elementPosition = element.getBoundingClientRect().top;
              const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
              window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
            }
          }}
        >
          {t('getDemo')}
        </Link>
      </div>
    </div>
  );
};

export default Industries;