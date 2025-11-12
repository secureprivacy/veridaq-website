import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useInView } from '../hooks/useInView';
import { Euro, DollarSign, ArrowRight } from 'lucide-react';

const ROICalculator: React.FC = () => {
  const { t } = useTranslation('roiCalculator');
  const calculatorRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(calculatorRef, { threshold: 0.1 });
  
  const [formData, setFormData] = useState({
    monthlyTransactions: '',
    currentManualHours: '',
    hourlyRate: '',
    complianceIncidents: '',
    averageFine: ''
  });
  
  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const calculateROI = () => {
    const transactions = parseInt(formData.monthlyTransactions) || 0;
    const manualHours = parseInt(formData.currentManualHours) || 0;
    const hourlyRate = parseInt(formData.hourlyRate) || 50;
    const incidents = parseInt(formData.complianceIncidents) || 0;
    const averageFine = parseInt(formData.averageFine) || 10000;

    // Calculate current costs
    const monthlyCost = manualHours * hourlyRate;
    const annualLaborCost = monthlyCost * 12;
    const annualRiskCost = incidents * averageFine;
    const totalAnnualCost = annualLaborCost + annualRiskCost;

    // Calculate savings with Compli KYC
    const automationSavings = annualLaborCost * 0.7; // 70% automation
    const riskReduction = annualRiskCost * 0.8; // 80% risk reduction
    const totalSavings = automationSavings + riskReduction;

    // Platform cost estimate
    const platformCost = Math.min(50000, transactions * 0.5 * 12); // Rough estimate
    const netSavings = totalSavings - platformCost;
    const roi = platformCost > 0 ? ((netSavings / platformCost) * 100) : 0;
    const paybackMonths = platformCost > 0 ? (platformCost / (totalSavings / 12)) : 0;

    setResults({
      currentCost: totalAnnualCost,
      totalSavings,
      platformCost,
      netSavings,
      roi,
      paybackMonths,
      automationSavings,
      riskReduction
    });
    setShowResults(true);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const CurrencyIcon = () => {
    return <Euro className="w-4 h-4" />;
  };

  const formatCurrency = (value: number) => {
    return `€${Math.round(value).toLocaleString()}`;
  };

  return (
    <section 
      ref={calculatorRef}
      className="py-20 md:py-32 bg-white" 
      id="roi-calculator"
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 rounded-full border border-primary-200 mb-6">
            <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16a2 2 0 002 2z" />
            </svg>
            <span className="text-sm font-semibold text-primary-700">{t('badge')}</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-6">
            {t('title')}
          </h2>
          <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
            {t('subtitle')}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Calculator Form */}
          <div 
            className={`modern-card p-10 rounded-3xl transition-all duration-1000 transform ${
              isInView ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'
            }`}
          >
            <h3 className="text-2xl font-bold text-neutral-900 mb-8">{t('form.title')}</h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  {t('form.monthlyTransactions')}
                </label>
                <input
                  type="number"
                  value={formData.monthlyTransactions}
                  onChange={(e) => handleInputChange('monthlyTransactions', e.target.value)}
                  placeholder="10000"
                  className="modern-input"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  {t('form.manualHours')}
                </label>
                <input
                  type="number"
                  value={formData.currentManualHours}
                  onChange={(e) => handleInputChange('currentManualHours', e.target.value)}
                  placeholder="40"
                  className="modern-input"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  {t('form.hourlyRate')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <CurrencyIcon />
                  </div>
                  <input
                    type="number"
                    value={formData.hourlyRate}
                    onChange={(e) => handleInputChange('hourlyRate', e.target.value)}
                    placeholder="50"
                    className="modern-input pl-10"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  {t('form.complianceIncidents')}
                </label>
                <input
                  type="number"
                  value={formData.complianceIncidents}
                  onChange={(e) => handleInputChange('complianceIncidents', e.target.value)}
                  placeholder="2"
                  className="modern-input"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  {t('form.averageFine')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <CurrencyIcon />
                  </div>
                  <input
                    type="number"
                    value={formData.averageFine}
                    onChange={(e) => handleInputChange('averageFine', e.target.value)}
                    placeholder="10000"
                    className="modern-input pl-10"
                  />
                </div>
              </div>
              
              <button
                onClick={calculateROI}
                className="w-full btn-primary"
              >
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16a2 2 0 002 2z" />
                  </svg>
                  {t('form.calculate')}
                </span>
              </button>
            </div>
          </div>

          {/* Results */}
          <div 
            className={`transition-all duration-1000 transform ${
              isInView ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'
            }`}
          >
            {showResults && results ? (
              <div className="space-y-8">
                <div className="modern-card p-10 rounded-3xl">
                  <h3 className="text-2xl font-bold text-neutral-900 mb-8">{t('results.title')}</h3>
                  
                  <div className="space-y-6">
                    <div className="flex justify-between items-center p-4 bg-primary-50 rounded-xl">
                      <span className="text-neutral-700">{t('results.roi')}</span>
                      <span className="text-2xl font-bold text-primary-600">
                        {Math.round(results.roi)}%
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center p-4 bg-accent-50 rounded-xl">
                      <span className="text-neutral-700">{t('results.payback')}</span>
                      <span className="text-xl font-bold text-accent-600">
                        {Math.round(results.paybackMonths)} {t('results.months')}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-white rounded-xl border border-neutral-200">
                        <div className="text-2xl font-bold text-neutral-900">
                          {formatCurrency(results.netSavings)}
                        </div>
                        <div className="text-sm text-neutral-600">{t('results.annualSavings')}</div>
                      </div>
                      <div className="text-center p-4 bg-white rounded-xl border border-neutral-200">
                        <div className="text-2xl font-bold text-neutral-900">
                          {formatCurrency(results.automationSavings)}
                        </div>
                        <div className="text-sm text-neutral-600">{t('results.automationSavings')}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-neutral-600 mb-6">{t('results.disclaimer')}</p>
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
                    {t('results.getPersonalized')}
                    <ArrowRight className="w-5 h-5" />
                  </a>
                </div>
              </div>
            ) : (
              <div className="modern-card p-10 rounded-3xl text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-neutral-900 mb-4">{t('placeholder.title')}</h3>
                <p className="text-neutral-600">{t('placeholder.description')}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ROICalculator;