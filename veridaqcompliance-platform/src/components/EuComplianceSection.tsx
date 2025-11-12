import React, { useRef } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { useInView } from '../hooks/useInView';
import { Link } from './ui/Link';
import { ArrowRight, Shield, Users, CheckCircle } from 'lucide-react';

const EuComplianceSection: React.FC = () => {
  const { t } = useTranslation('compliance');
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { threshold: 0.1 });

  return (
    <section 
      ref={sectionRef}
      className="py-20 md:py-32 bg-gradient-to-br from-blue-50 via-white to-violet-50" 
      id="eu-compliance"
      role="region" 
      aria-labelledby="compliance-heading"
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div 
            className={`transition-all duration-1000 transform ${
              isInView ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'
            }`}
          >
            <div className="bg-white rounded-3xl p-10 shadow-xl border border-slate-200">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-black text-slate-900">
                  {t('timeline.title')}
                </h3>
              </div>
              
              <div className="space-y-6">
                <TimelineItem 
                  year="2023" 
                  title={t('timeline.items.2023.title')}
                  description={t('timeline.items.2023.description')}
                  isActive={true}
                />
                
                <TimelineItem 
                  year="2024" 
                  title={t('timeline.items.2024.title')}
                  description={t('timeline.items.2024.description')}
                  isActive={true}
                />
                
                <TimelineItem 
                  year="2025" 
                  title={t('timeline.items.2025.title')}
                  description={t('timeline.items.2025.description')}
                  isActive={false}
                />
                
                <TimelineItem 
                  year="2026" 
                  title={t('timeline.items.2026.title')}
                  description={t('timeline.items.2026.description')}
                  isActive={false}
                />
                
                <TimelineItem 
                  year="2027" 
                  title={t('timeline.items.2027.title')}
                  description={t('timeline.items.2027.description')}
                  isActive={false}
                  isLast={true}
                />
              </div>
            </div>
          </div>

          <div 
            className={`transition-all duration-1000 transform ${
              isInView ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'
            }`}
          >
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-blue-50 rounded-full border border-blue-200 mb-8">
              <span className="text-sm font-bold text-blue-700">{t('badge')}</span>
            </div>
            
            <h2 id="compliance-heading" className="text-4xl md:text-5xl font-black text-slate-900 mb-8 tracking-tight">
              <Trans 
                i18nKey="title" 
                ns="compliance"
                components={{
                  1: <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent" />
                }}
              />
            </h2>
            
            <p className="text-xl text-slate-600 mb-10 font-medium leading-relaxed">
              {t('subtitle')}
            </p>
            
            <div className="space-y-8 mb-10">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center mt-1 shadow-lg">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-black text-slate-900 text-lg mb-2">{t('features.enhancedDueDiligence.title')}</h4>
                  <p className="text-slate-600 leading-relaxed">{t('features.enhancedDueDiligence.description')}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-gradient-to-r from-violet-600 to-purple-600 rounded-xl flex items-center justify-center mt-1 shadow-lg">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-black text-slate-900 text-lg mb-2">{t('features.nordicRiskScoring.title')}</h4>
                  <p className="text-slate-600 leading-relaxed">{t('features.nordicRiskScoring.description')}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl flex items-center justify-center mt-1 shadow-lg">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-black text-slate-900 text-lg mb-2">{t('features.regulatoryIntelligence.title')}</h4>
                  <p className="text-slate-600 leading-relaxed">{t('features.regulatoryIntelligence.description')}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-gradient-to-r from-amber-600 to-orange-600 rounded-xl flex items-center justify-center mt-1 shadow-lg">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-black text-slate-900 text-lg mb-2">{t('features.multiRegulatorReporting.title')}</h4>
                  <p className="text-slate-600 leading-relaxed">{t('features.multiRegulatorReporting.description')}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-blue-50 to-violet-50 border border-blue-200 rounded-2xl p-8 flex items-start gap-4 mb-10">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center mt-1 shadow-lg">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h4 className="font-black text-slate-900 mb-2">{t('didYouKnow.title')}</h4>
                <p className="text-slate-700 leading-relaxed font-medium">{t('didYouKnow.description')}</p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                href="#contact" 
                className="group bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold px-8 py-4 rounded-xl hover:shadow-xl hover:scale-105 transition-all duration-300"
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
                <span className="flex items-center justify-center gap-2">
                  {t('cta.primary')}
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
              <Link 
                href="#contact" 
                className="bg-white text-slate-700 font-bold px-8 py-4 rounded-xl border-2 border-slate-200 hover:border-blue-300 hover:bg-blue-50 hover:shadow-xl transition-all duration-300"
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
                {t('cta.secondary')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

interface TimelineItemProps {
  year: string;
  title: string;
  description: string;
  isActive: boolean;
  isLast?: boolean;
}

const TimelineItem: React.FC<TimelineItemProps> = ({ year, title, description, isActive, isLast = false }) => {
  return (
    <div className="flex">
      <div className="flex flex-col items-center mr-6">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-sm shadow-lg ${
          isActive 
            ? 'bg-gradient-to-r from-emerald-600 to-green-600 text-white' 
            : 'bg-slate-200 text-slate-500'
        }`}>
          {isActive ? <CheckCircle className="w-6 h-6" /> : year.slice(-2)}
        </div>
        {!isLast && <div className={`w-1 h-16 my-2 rounded-full ${
          isActive ? 'bg-gradient-to-b from-emerald-600 to-green-600' : 'bg-slate-200'
        }`}></div>}
      </div>
      
      <div>
        <div className={`font-bold text-sm mb-2 ${isActive ? 'text-emerald-600' : 'text-slate-500'}`}>
          {year}
        </div>
        <h4 className="font-black text-slate-900 text-lg mb-3">{title}</h4>
        <p className="text-slate-600 leading-relaxed font-medium">{description}</p>
      </div>
    </div>
  );
};

export default EuComplianceSection;