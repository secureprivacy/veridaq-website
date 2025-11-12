import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useInView } from '../hooks/useInView';
import { Shield, Globe, Zap, Users, CheckCircle, Award } from 'lucide-react';

const TrustSignals: React.FC = () => {
  const { t } = useTranslation('trustSignals');
  const trustRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(trustRef, { threshold: 0.1 });

  const certifications = [
    {
      icon: <img src="/images/MitID.png" alt="MitID" className="w-8 h-8 object-contain" />,
      title: t('certifications.mitid.title'),
      description: t('certifications.mitid.desc'),
      status: t('certifications.mitid.status'),
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    {
      icon: <img src="/images/BankID.png" alt="BankID" className="w-8 h-8 object-contain" />,
      title: t('certifications.bankid.title'),
      description: t('certifications.bankid.desc'),
      status: t('certifications.bankid.status'),
      bgColor: 'bg-violet-50',
      borderColor: 'border-violet-200'
    },
    {
      icon: <img src="/images/Freja.png" alt="Freja eID" className="w-8 h-8 object-contain" />,
      title: t('certifications.freja.title'),
      description: t('certifications.freja.desc'),
      status: t('certifications.freja.status'),
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200'
    },
    {
      icon: <img src="/images/norwegian-bankid.png" alt="Norwegian BankID" className="w-8 h-8" />,
      title: t('certifications.registerAccess.title'),
      description: t('certifications.registerAccess.desc'),
      status: t('certifications.registerAccess.status'),
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200'
    },
    {
      icon: <img src="/images/finnish-trust-network.png" alt="Finnish Trust Network" className="w-8 h-8" />,
      title: t('certifications.finnishTrust.title'),
      description: t('certifications.finnishTrust.desc'),
      status: t('certifications.finnishTrust.status'),
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-200'
    }
  ];

  const capabilities = [
    {
      icon: <Zap className="w-6 h-6 text-blue-600" />,
      title: t('capabilities.realTime.title'),
      description: t('capabilities.realTime.desc'),
      metric: '< 100ms'
    },
    {
      icon: <Shield className="w-6 h-6 text-violet-600" />,
      title: t('capabilities.security.title'),
      description: t('capabilities.security.desc'),
      metric: '256-bit AES'
    },
    {
      icon: <Globe className="w-6 h-6 text-emerald-600" />,
      title: t('capabilities.coverage.title'),
      description: t('capabilities.coverage.desc'),
      metric: '200+ Countries'
    },
    {
      icon: <Users className="w-6 h-6 text-amber-600" />,
      title: t('capabilities.integration.title'),
      description: t('capabilities.integration.desc'),
      metric: 'RESTful APIs'
    }
  ];

  return (
    <section className="py-20 md:py-32 bg-slate-50" ref={trustRef}>
      <div className="container mx-auto px-4 md:px-6">
        {/* Trust Badges */}
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-semibold leading-tight tracking-tight text-slate-900 mb-12">
            {t('title')}
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {certifications.map((cert, index) => (
              <div 
                key={index}
                className={`${cert.bgColor} border ${cert.borderColor} p-8 rounded-3xl text-center transition-all duration-700 transform hover:scale-105 hover:shadow-xl ${
                  isInView ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="w-16 h-16 bg-white rounded-2xl shadow-lg flex items-center justify-center mx-auto mb-6">
                  {cert.icon}
                </div>
                <h3 className="font-black text-lg text-slate-900 mb-3">{cert.title}</h3>
                <p className="text-sm text-slate-600 mb-4 font-medium leading-relaxed">{cert.description}</p>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full text-xs font-bold text-slate-700 shadow-md">
                  <CheckCircle className="w-3 h-3 text-emerald-600" />
                  {cert.status}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Technology Showcase */}
        <div className="mb-20">
          <h3 className="text-3xl font-black text-slate-900 text-center mb-12">{t('technology.title')}</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {capabilities.map((capability, index) => (
              <div 
                key={index}
                className="bg-white p-8 rounded-2xl text-center hover:shadow-xl transition-all duration-500 hover:scale-105 border border-slate-200"
              >
                <div className="w-14 h-14 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-6 shadow-md">
                  {capability.icon}
                </div>
                <h4 className="font-black text-slate-900 mb-3">{capability.title}</h4>
                <p className="text-sm text-slate-600 font-medium mb-3 leading-relaxed">{capability.description}</p>
                <div className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                  {capability.metric}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Regulatory Focus */}
        <div className="bg-white rounded-3xl p-12 text-center shadow-xl border border-slate-200">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-xl">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-3xl font-black text-slate-900 mb-6">
            {t('regulatory.title')}
          </h3>
          <p className="text-xl text-slate-600 mb-8 max-w-3xl mx-auto leading-relaxed font-medium">
            {t('regulatory.description')}
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">2027</div>
              <div className="text-sm text-slate-600 font-bold">{t('regulatory.stats.ready')}</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-black bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent mb-2">200+</div>
              <div className="text-sm text-slate-600 font-bold">{t('regulatory.stats.countries')}</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-black bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-2">24/7</div>
              <div className="text-sm text-slate-600 font-bold">{t('regulatory.stats.monitoring')}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustSignals;