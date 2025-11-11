import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useInView } from '../hooks/useInView';
import { Link } from './ui/Link';
import { Shield, Users, Zap, Brain, Globe, ArrowRight } from 'lucide-react';

const Benefits: React.FC = () => {
  const { t } = useTranslation('benefits');
  const benefitsRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(benefitsRef, { threshold: 0.1 });

  const benefits = [
    {
      key: 'onePlatform',
      delay: 0
    },
    {
      key: 'fewerFalsePositives',
      delay: 100
    },
    {
      key: 'fasterOnboarding',
      delay: 200
    },
    {
      key: 'futureProof',
      delay: 300
    }
  ];

  const platformAdvantages = [
    'deploy',
    'builtYourWay',
    'coverage',
    'euNative'
  ];

  return (
    <section className="py-20 md:py-32 bg-slate-50" id="benefits" role="region" aria-labelledby="benefits-heading">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-neutral-50 rounded-xl border border-neutral-200 mb-8">
            <span className="text-sm font-medium text-accent-700">{t('badge')}</span>
          </div>

          <h2 id="benefits-heading" className="heading-lg text-accent-900 mb-8" dangerouslySetInnerHTML={{ __html: t('title') }} />

          <p className="body-lg text-neutral-600 mb-16 max-w-3xl mx-auto">
            {t('subtitle')}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
          <div
            className={`transition-all duration-1000 transform ${
              isInView ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'
            }`}
          >
            <div className="space-y-8">
              {benefits.map((benefit) => (
                <BenefitItem
                  key={benefit.key}
                  title={t(`benefits.${benefit.key}.title`)}
                  description={t(`benefits.${benefit.key}.description`)}
                  delay={benefit.delay}
                  isInView={isInView}
                />
              ))}
            </div>
          </div>

          <div
            ref={benefitsRef}
            className={`transition-all duration-1000 transform ${
              isInView ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'
            }`}
          >
            <div className="bg-white rounded-xl p-8 border border-neutral-200">
              <h3 className="text-2xl font-semibold text-accent-900 mb-8 text-center">
                {t('platformAdvantages.title')}
              </h3>

              <div className="space-y-8">
                {platformAdvantages.map((advantage) => (
                  <AdvantageItem
                    key={advantage}
                    number={t(`platformAdvantages.${advantage}.number`)}
                    title={t(`platformAdvantages.${advantage}.title`)}
                    description={t(`platformAdvantages.${advantage}.description`)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <div className="bg-accent-900 rounded-xl p-10 text-white">
            <h3 className="heading-sm mb-6">{t('cta.title')}</h3>
            <p className="body-lg mb-8 text-neutral-200 max-w-2xl mx-auto">
              {t('cta.subtitle')}
            </p>
            <Link
              href="#contact"
              className="inline-flex items-center gap-2 bg-primary-600 text-white font-semibold px-8 py-4 rounded-xl hover:bg-primary-700 transition-all duration-300 font-display"
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
              {t('cta.button')}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

interface BenefitItemProps {
  title: string;
  description: string;
  delay: number;
  isInView: boolean;
}

const BenefitItem: React.FC<BenefitItemProps> = ({ title, description, delay, isInView }) => {
  return (
    <div
      className={`flex items-start gap-6 transition-all duration-700 transform ${
        isInView ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="flex-shrink-0 w-3 h-3 bg-primary-600 rounded-full mt-2">
      </div>
      <div>
        <h3 className="text-lg font-semibold text-accent-900 mb-2">{title}</h3>
        <p className="text-neutral-600 leading-relaxed">{description}</p>
      </div>
    </div>
  );
};

interface AdvantageItemProps {
  number: string;
  title: string;
  description: string;
}

const AdvantageItem: React.FC<AdvantageItemProps> = ({ number, title, description }) => {
  return (
    <div className="flex items-start gap-4">
      <div className="flex-shrink-0 w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center text-white font-medium text-sm">
        {number}
      </div>
      <div className="flex-1">
        <h4 className="text-lg font-medium text-accent-900 mb-2">{title}</h4>
        <p className="text-neutral-600 leading-relaxed text-sm">{description}</p>
      </div>
    </div>
  );
};

export default Benefits;
