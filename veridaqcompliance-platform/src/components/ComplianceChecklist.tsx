import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useInView } from '../hooks/useInView';
import { Download, ArrowRight } from 'lucide-react';

const ComplianceChecklist: React.FC = () => {
  const { t } = useTranslation('complianceChecklist');
  const checklistRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(checklistRef, { threshold: 0.1 });
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setIsSubmitted(true);
      // Here you would typically send the email to your backend
    }
  };

  const checklistItems = [
    {
      category: t('categories.customerIdentification'),
      items: [
        t('items.customerIdentification.0'),
        t('items.customerIdentification.1'),
        t('items.customerIdentification.2'),
        t('items.customerIdentification.3')
      ]
    },
    {
      category: t('categories.riskAssessment'),
      items: [
        t('items.riskAssessment.0'),
        t('items.riskAssessment.1'),
        t('items.riskAssessment.2'),
        t('items.riskAssessment.3')
      ]
    },
    {
      category: t('categories.ongoingMonitoring'),
      items: [
        t('items.ongoingMonitoring.0'),
        t('items.ongoingMonitoring.1'),
        t('items.ongoingMonitoring.2'),
        t('items.ongoingMonitoring.3')
      ]
    },
    {
      category: t('categories.recordKeeping'),
      items: [
        t('items.recordKeeping.0'),
        t('items.recordKeeping.1'),
        t('items.recordKeeping.2'),
        t('items.recordKeeping.3')
      ]
    }
  ];

  return (
    <section 
      ref={checklistRef}
      className="py-20 md:py-32 bg-neutral-50" 
      id="compliance-checklist"
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          <div 
            className={`transition-all duration-1000 transform ${
              isInView ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'
            }`}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 rounded-full border border-primary-200 mb-8">
              <span className="text-primary-600">📋</span>
              <span className="text-sm font-semibold text-primary-700">{t('badge')}</span>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-8">
              {t('title')}
            </h2>
            
            <p className="text-xl text-neutral-600 mb-10 font-light leading-relaxed">
              {t('subtitle')}
            </p>

            {!isSubmitted ? (
              <form onSubmit={handleSubmit} className="modern-card p-8 rounded-2xl">
                <h3 className="text-xl font-bold text-neutral-900 mb-6">{t('form.title')}</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-2">
                      {t('form.email')}
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={t('form.emailPlaceholder')}
                      required
                      className="modern-input"
                    />
                  </div>
                  
                  <button
                    type="submit"
                    className="w-full btn-primary"
                  >
                    <span className="flex items-center justify-center gap-2">
                      <span>📥</span>
                      {t('form.download')}
                    </span>
                  </button>
                  
                  <p className="text-xs text-neutral-500 text-center">
                    {t('form.privacy')}
                  </p>
                </div>
              </form>
            ) : (
              <div className="modern-card p-8 rounded-2xl text-center">
                <div className="w-16 h-16 bg-success-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-white text-2xl">✅</span>
                </div>
                <h3 className="text-xl font-bold text-neutral-900 mb-4">{t('success.title')}</h3>
                <p className="text-neutral-600 mb-6">{t('success.message')}</p>
                <a
                  href="#contact"
                  className="inline-flex items-center gap-2 btn-primary"
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
                  {t('success.cta')}
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            )}
          </div>

          <div 
            className={`transition-all duration-1000 transform ${
              isInView ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'
            }`}
          >
            <div className="modern-card p-10 rounded-3xl">
              <div className="flex items-center gap-3 mb-8">
                <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8m4-5V8a2 2 0 00-2-2h-2m0 0V4a2 2 0 10-4 0v2m4 0a2 2 0 104 0v2" />
                </svg>
                <h3 className="text-2xl font-bold text-neutral-900">{t('preview.title')}</h3>
              </div>
              
              <div className="space-y-8">
                {checklistItems.map((category, categoryIndex) => (
                  <div key={categoryIndex}>
                    <h4 className="font-bold text-lg text-neutral-900 mb-4 flex items-center gap-2">
                      <svg className="w-5 h-5 text-warning-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                      </svg>
                      {category.category}
                    </h4>
                    <div className="space-y-2">
                      {category.items.slice(0, 2).map((item, itemIndex) => (
                        <div key={itemIndex} className="flex items-start gap-3">
                          <svg className="w-4 h-4 text-accent-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-sm text-neutral-600">{item}</span>
                        </div>
                      ))}
                      {category.items.length > 2 && (
                        <div className="text-sm text-neutral-500 italic">
                          +{category.items.length - 2} {t('preview.moreItems')}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-8 p-4 bg-primary-50 rounded-xl border border-primary-200">
                <div className="flex items-start gap-3">
                  <svg className="w-4 h-4 text-primary-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm text-primary-700 font-medium">
                  {t('preview.note')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ComplianceChecklist;