import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useInView } from '../hooks/useInView';
import { Shield, Users, Zap, Brain, Eye, Globe } from 'lucide-react';

const Features: React.FC = () => {
  const { t, i18n } = useTranslation('features');
  const featuresRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(featuresRef, { threshold: 0.1 });

  if (!i18n.isInitialized) {
    return (
      <section className="py-20 md:py-32 premium-gradient" id="features">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-neutral-600">Loading features...</p>
          </div>
        </div>
      </section>
    );
  }

  const platformFeatures = [
    {
      id: 'kyc-verification',
      icon: <Users className="w-8 h-8 text-white" />,
      title: t('platformFeatures.kycVerification.title'),
      description: t('platformFeatures.kycVerification.description'),
      bgColor: 'bg-gradient-to-br from-blue-600 to-blue-700',
      features: t('platformFeatures.kycVerification.features', { returnObjects: true }) as string[]
    },
    {
      id: 'transaction-monitoring',
      icon: <Eye className="w-8 h-8 text-white" />,
      title: t('platformFeatures.transactionMonitoring.title'),
      description: t('platformFeatures.transactionMonitoring.description'),
      bgColor: 'bg-gradient-to-br from-primary-600 to-primary-700',
      features: t('platformFeatures.transactionMonitoring.features', { returnObjects: true }) as string[]
    },
    {
      id: 'compliance-reporting',
      icon: <Shield className="w-8 h-8 text-white" />,
      title: t('platformFeatures.complianceReporting.title'),
      description: t('platformFeatures.complianceReporting.description'),
      bgColor: 'bg-gradient-to-br from-accent-600 to-accent-700',
      features: t('platformFeatures.complianceReporting.features', { returnObjects: true }) as string[]
    },
    {
      id: 'risk-intelligence',
      icon: <Brain className="w-8 h-8 text-white" />,
      title: t('platformFeatures.riskIntelligence.title'),
      description: t('platformFeatures.riskIntelligence.description'),
      bgColor: 'bg-gradient-to-br from-slate-700 to-slate-900',
      features: t('platformFeatures.riskIntelligence.features', { returnObjects: true }) as string[]
    }
  ];

  const coreCapabilities = [
    {
      icon: <Globe className="w-6 h-6 text-white" />,
      title: t('coreCapabilities.euEidIntegration.title'),
      description: t('coreCapabilities.euEidIntegration.description'),
      bgColor: 'bg-gradient-to-br from-primary-600 to-primary-700'
    },
    {
      icon: <Shield className="w-6 h-6 text-white" />,
      title: t('coreCapabilities.sanctionsScreening.title'),
      description: t('coreCapabilities.sanctionsScreening.description'),
      bgColor: 'bg-gradient-to-br from-blue-600 to-blue-700'
    }
  ];

  return (
    <section className="py-20 md:py-32 premium-gradient" id="features">
      <div className="container mx-auto px-4 md:px-6">
        <div ref={featuresRef} className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/80 backdrop-blur-sm rounded-xl border border-white/40 shadow-md mb-8">
            <Shield className="w-4 h-4 text-primary-600" />
            <span className="text-sm font-semibold text-accent-900">{t('badge')}</span>
          </div>

          <h2 className="heading-lg text-accent-900 mb-8" dangerouslySetInnerHTML={{ __html: t('title') }} />

          <p className="body-lg text-neutral-600 mb-16 max-w-3xl mx-auto">
            {t('subtitle')}
          </p>
        </div>

        <div className={`grid md:grid-cols-2 gap-8 mb-16 transition-all duration-700 ${
          isInView ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-90'
        }`}>
          {platformFeatures.map((feature, index) => (
            <div
              key={feature.id}
              className="bg-white rounded-2xl p-8 border border-neutral-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <div className={`${feature.bgColor} w-16 h-16 rounded-xl flex items-center justify-center mb-6`}>
                {feature.icon}
              </div>
              <h3 className="text-2xl font-bold text-accent-900 mb-4">{feature.title}</h3>
              <p className="text-neutral-600 mb-6 leading-relaxed">{feature.description}</p>
              <ul className="space-y-3">
                {feature.features.map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-neutral-700">
                    <div className="w-1.5 h-1.5 bg-primary-600 rounded-full flex-shrink-0"></div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className={`grid md:grid-cols-2 gap-8 transition-all duration-700 delay-200 ${
          isInView ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-90'
        }`}>
          {coreCapabilities.map((capability, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-8 border border-neutral-200 hover:shadow-xl transition-all duration-300"
            >
              <div className={`${capability.bgColor} w-12 h-12 rounded-xl flex items-center justify-center mb-4`}>
                {capability.icon}
              </div>
              <h4 className="text-xl font-bold text-accent-900 mb-3">{capability.title}</h4>
              <p className="text-neutral-600 leading-relaxed">{capability.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Features;
