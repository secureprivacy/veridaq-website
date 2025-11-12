import React, { useState, useRef } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { useInView } from '../hooks/useInView';
import { Mail, Phone, MapPin } from 'lucide-react';

const ContactForm: React.FC = () => {
  const { t } = useTranslation('contact');
  const formRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(formRef, { threshold: 0.1 });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [leadData, setLeadData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    company: '',
    phone: '',
    companySize: '',
    interests: [] as string[],
    message: '',
    subscribe: false
  });
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    
    try {
      const response = await fetch('https://getform.io/f/aolzorgb', {
        method: 'POST',
        body: formData,
      });
      
      if (response.ok) {
        setIsSubmitted(true);
        form.reset();
        
        setTimeout(() => {
          setIsSubmitted(false);
        }, 5000);
      } else {
        throw new Error('Form submission failed');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('There was an error submitting your message. Please try again or contact us directly.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleStepSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep === 1) {
      setCurrentStep(2);
    } else {
      handleSubmit(e);
    }
  };

  const updateLeadData = (field: string, value: any) => {
    setLeadData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <section 
      ref={formRef}
      className="py-20 md:py-32 premium-gradient" 
      id="contact"
      role="region" 
      aria-labelledby="contact-heading"
      itemScope
      itemType="https://schema.org/ContactPage"
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-6 py-3 glass-card rounded-xl border border-white/30 mb-6 shadow-sm">
            <div className="w-2 h-2 bg-primary-600 rounded-full animate-pulse"></div>
            <span className="text-sm font-semibold text-primary-700">{t('badge')}</span>
          </div>
          
          <h2 id="contact-heading" className="text-4xl md:text-5xl font-semibold leading-tight tracking-tight text-gradient mb-6">
            <Trans 
              i18nKey="title" 
              ns="contact"
              components={{
                1: <span className="text-primary-600" />
              }}
            />
          </h2>
          <p className="body-lg text-neutral-600 max-w-4xl mx-auto">
            {t('subtitle')}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-16 items-start">
          <div 
            className={`transition-all duration-1000 transform ${
              isInView ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'
            }`}
          >
            <h3 className="heading-sm text-neutral-900 mb-8">
              {t('contact:whyChoose')}
            </h3>
            
            <div className="space-y-8 mb-12">
              <div className="flex items-start gap-6">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-600 to-primary-700 flex items-center justify-center shadow-premium">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="heading-sm text-neutral-900 mb-3">{t('contact:features.dualSolution.title')}</h4>
                  <p className="body-base text-neutral-600">{t('contact:features.dualSolution.description')}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-6">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent-600 to-accent-700 flex items-center justify-center shadow-premium">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                  </svg>
                </div>
                <div>
                  <h4 className="heading-sm text-neutral-900 mb-3">{t('contact:features.expertSupport.title')}</h4>
                  <p className="body-base text-neutral-600">{t('contact:features.expertSupport.description')}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-6">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-700 flex items-center justify-center shadow-premium">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h4 className="heading-sm text-neutral-900 mb-3">{t('contact:features.fastResults.title')}</h4>
                  <p className="body-base text-neutral-600">{t('contact:features.fastResults.description')}</p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-start gap-6 p-8 glass-card rounded-3xl border border-white/30 shadow-premium hover:shadow-premium-lg hover:scale-[1.01] transition-all duration-500">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-600 to-primary-700 flex items-center justify-center shadow-premium">
                  <Phone className="text-white w-6 h-6" />
                </div>
                <div>
                  <h3 className="heading-sm text-neutral-900 mb-2">{t('contact:contactInfo.phone')}</h3>
                  <p className="text-neutral-600" itemProp="telephone">
                    <a href="tel:+4531272726" className="hover:text-primary-600 transition-colors font-medium">
                      +45 31272726
                    </a>
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-6 p-8 glass-card rounded-3xl border border-white/30 shadow-premium hover:shadow-premium-lg hover:scale-[1.01] transition-all duration-500">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent-600 to-accent-700 flex items-center justify-center shadow-premium">
                  <Mail className="text-white w-6 h-6" />
                </div>
                <div>
                  <h3 className="heading-sm text-neutral-900 mb-2">{t('contact:contactInfo.email')}</h3>
                  <p className="text-neutral-600" itemProp="email">
                    <a href="mailto:sales@veridaq.com" className="hover:text-primary-600 transition-colors font-medium">
                      sales@veridaq.com
                    </a>
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-6 p-8 glass-card rounded-3xl border border-white/30 shadow-premium hover:shadow-premium-lg hover:scale-[1.01] transition-all duration-500">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-700 flex items-center justify-center shadow-premium">
                  <MapPin className="text-white w-6 h-6" />
                </div>
                <div>
                  <h3 className="heading-sm text-neutral-900 mb-2">{t('contact:contactInfo.location')}</h3>
                  <address className="text-neutral-600 whitespace-pre-line not-italic" itemProp="address" itemScope itemType="https://schema.org/PostalAddress">
                    <span itemProp="streetAddress">Fruebjergvej 3</span><br/>
                    <span itemProp="postalCode">2100</span> <span itemProp="addressLocality">Copenhagen</span><br/>
                    <span itemProp="addressCountry">Denmark</span>
                  </address>
                </div>
              </div>
            </div>
          </div>

          <div 
            className={`transition-all duration-1000 transform ${
              isInView ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'
            }`}
          >
            <div className="modern-card p-10 rounded-3xl">
              {isSubmitted ? (
                <div className="text-center py-16">
                  <div className="w-24 h-24 bg-gradient-to-br from-success-600 to-success-700 rounded-full flex items-center justify-center mx-auto mb-8 shadow-premium animate-glow">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="heading-sm text-gradient mb-6">{t('contact:success.title')}</h3>
                  <p className="body-lg text-neutral-600">
                    {t('contact:success.message')}
                  </p>
                </div>
              ) : (
                <form action="https://getform.io/f/aolzorgb" method="POST" onSubmit={handleStepSubmit}>
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="heading-sm text-gradient">{t('contact:form.title')}</h3>
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-2 rounded-full transition-all duration-300 ${currentStep >= 1 ? 'bg-gradient-to-r from-primary-600 to-primary-700 shadow-md' : 'bg-neutral-200'}`}></div>
                      <div className={`w-8 h-2 rounded-full transition-all duration-300 ${currentStep >= 2 ? 'bg-gradient-to-r from-primary-600 to-primary-700 shadow-md' : 'bg-neutral-200'}`}></div>
                    </div>
                  </div>

                  {currentStep === 1 ? (
                    <div className="space-y-6">
                      <div className="text-center mb-8">
                        <h4 className="text-lg font-semibold text-neutral-900 mb-2">{t('contact:form.step1.title')}</h4>
                        <p className="body-base text-neutral-600">{t('contact:form.step1.subtitle')}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <label htmlFor="firstName" className="block text-sm font-semibold text-neutral-700 mb-2">
                            {t('contact:form.firstName')}*
                          </label>
                          <input
                            type="text"
                            id="firstName"
                            name="firstName"
                            value={leadData.firstName}
                            onChange={(e) => updateLeadData('firstName', e.target.value)}
                            required
                            className="modern-input"
                          />
                        </div>
                  
                        <div>
                          <label htmlFor="lastName" className="block text-sm font-semibold text-neutral-700 mb-2">
                            {t('contact:form.lastName')}*
                          </label>
                          <input
                            type="text"
                            id="lastName"
                            name="lastName"
                            value={leadData.lastName}
                            onChange={(e) => updateLeadData('lastName', e.target.value)}
                            required
                            className="modern-input"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label htmlFor="email" className="block text-sm font-semibold text-neutral-700 mb-2">
                          {t('contact:form.email')}*
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={leadData.email}
                          onChange={(e) => updateLeadData('email', e.target.value)}
                          required
                          className="modern-input"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="company" className="block text-sm font-semibold text-neutral-700 mb-2">
                          {t('contact:form.company')}*
                        </label>
                        <input
                          type="text"
                          id="company"
                          name="company"
                          value={leadData.company}
                          onChange={(e) => updateLeadData('company', e.target.value)}
                          required
                          className="modern-input"
                        />
                      </div>
                      
                      <button
                        type="submit"
                        className="w-full btn-primary"
                      >
                        {t('contact:form.step1.continue')}
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="text-center mb-8">
                        <h4 className="text-lg font-semibold text-neutral-900 mb-2">{t('contact:form.step2.title')}</h4>
                        <p className="body-base text-neutral-600">{t('contact:form.step2.subtitle')}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <label htmlFor="phone" className="block text-sm font-semibold text-neutral-700 mb-2">
                            {t('contact:form.phone')}
                          </label>
                          <input
                            type="tel"
                            id="phone"
                            name="phone"
                            value={leadData.phone}
                            onChange={(e) => updateLeadData('phone', e.target.value)}
                            className="modern-input"
                          />
                        </div>
                    
                        <div>
                          <label htmlFor="companySize" className="block text-sm font-semibold text-neutral-700 mb-2">
                            {t('contact:form.companySize')}
                          </label>
                          <select
                            id="companySize"
                            name="companySize"
                            value={leadData.companySize}
                            onChange={(e) => updateLeadData('companySize', e.target.value)}
                            className="modern-input"
                          >
                            <option value="">{t('contact:form.companySizeOptions.placeholder')}</option>
                            <option value="1-10">{t('contact:form.companySizeOptions.1-10')}</option>
                            <option value="11-50">{t('contact:form.companySizeOptions.11-50')}</option>
                            <option value="51-200">{t('contact:form.companySizeOptions.51-200')}</option>
                            <option value="201-1000">{t('contact:form.companySizeOptions.201-1000')}</option>
                            <option value="1000+">{t('contact:form.companySizeOptions.1000+')}</option>
                          </select>
                        </div>
                      </div>
                  
                      <div>
                        <label className="block text-sm font-semibold text-neutral-700 mb-3">
                          {t('contact:form.interests.title')}
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                          {[
                            { key: 'kycDemo', label: t('contact:form.interests.kycDemo') },
                            { key: 'amlDemo', label: t('contact:form.interests.amlDemo') },
                            { key: 'bothDemo', label: t('contact:form.interests.bothDemo') },
                            { key: 'integrationDemo', label: t('contact:form.interests.integrationDemo') }
                          ].map((interest) => (
                            <label key={interest.key} className="flex items-center p-3 bg-neutral-50 rounded-xl border border-neutral-200 hover:bg-primary-50 transition-colors cursor-pointer">
                              <input 
                                type="checkbox" 
                                name="interests[]" 
                                value={interest.label} 
                                checked={leadData.interests.includes(interest.label)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    updateLeadData('interests', [...leadData.interests, interest.label]);
                                  } else {
                                    updateLeadData('interests', leadData.interests.filter(i => i !== interest.label));
                                  }
                                }}
                                className="mr-3 text-primary-600" 
                              />
                              <span className="text-sm font-medium">{interest.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                  
                      <div>
                        <label htmlFor="message" className="block text-sm font-semibold text-neutral-700 mb-2">
                          {t('contact:form.message')}
                        </label>
                        <textarea
                          id="message"
                          name="message"
                          rows={3}
                          value={leadData.message}
                          onChange={(e) => updateLeadData('message', e.target.value)}
                          placeholder={t('contact:form.messagePlaceholder')}
                          className="modern-input resize-none"
                        ></textarea>
                      </div>
                    
                      <div>
                        <label className="flex items-start gap-3 cursor-pointer">
                          <input 
                            type="checkbox" 
                            name="subscribe" 
                            checked={leadData.subscribe}
                            onChange={(e) => updateLeadData('subscribe', e.target.checked)}
                            className="mt-1 text-primary-600" 
                          />
                          <span className="text-sm text-neutral-600">
                            {t('contact:form.subscribe')}
                          </span>
                        </label>
                      </div>
                  

                      <div className="flex gap-4">
                        <button
                          type="button"
                          onClick={() => setCurrentStep(1)}
                          className="flex-1 px-6 py-3 border border-neutral-300 text-neutral-700 rounded-xl hover:bg-neutral-50 transition-colors"
                        >
                          {t('contact:form.step2.back')}
                        </button>
                  

                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className={`flex-1 btn-primary font-display ${
                            isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                          }`}
                        >
                          {isSubmitting ? t('contact:form.submitting') : t('contact:form.submit')}
                        </button>
                      </div>
                    </div>
                  )}
                  
                  <input type="hidden" name="_gotcha" style={{display: 'none !important'}} />
                  
                  {currentStep === 2 && (
                    <p className="text-xs text-neutral-500 mt-4 text-center">
                    {t('contact:form.privacyNotice')}
                    </p>
                  )}
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactForm;