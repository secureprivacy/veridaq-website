import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from './ui/Link';
import { useInView } from '../hooks/useInView';
import { ArrowRight, Shield, Users, Zap } from 'lucide-react';

const CTA: React.FC = () => {
  const { t } = useTranslation('compliance');
  const ctaRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(ctaRef, { threshold: 0.1 });

  return (
    <section 
      ref={ctaRef}
      id="cta"
      className="py-20 md:py-32 bg-accent-900"
    >
      <div className="container mx-auto px-4 md:px-6">
        <div 
          className={`max-w-6xl mx-auto text-center transition-all duration-1000 transform ${
            isInView ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
          }`}
        >
          <h2 className="text-3xl md:text-4xl font-semibold text-white mb-8 leading-tight">
            Turn Compliance Into Your Competitive Edge
          </h2>

          <p className="text-lg text-neutral-200 mb-12 max-w-3xl mx-auto leading-relaxed">
            While your competitors struggle with spreadsheets and manual reviews, you'll be onboarding customers in seconds and catching real threats before they escalate. Join 500+ European companies that made the switch.
          </p>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white/10 rounded-xl p-6 border border-white/20">
              <div className="flex items-center gap-3 mb-3">
                <Users className="w-6 h-6 text-primary-400" />
                <h3 className="text-lg font-semibold text-white">Customer Verification</h3>
              </div>
              <p className="text-neutral-300 text-sm leading-relaxed">Onboard customers in 30 seconds with smart eID integration. 99.8% accuracy, zero friction.</p>
            </div>

            <div className="bg-white/10 rounded-xl p-6 border border-white/20">
              <div className="flex items-center gap-3 mb-3">
                <Shield className="w-6 h-6 text-primary-400" />
                <h3 className="text-lg font-semibold text-white">Transaction Monitoring</h3>
              </div>
              <p className="text-neutral-300 text-sm leading-relaxed">Catch real threats with AI trained on millions of EU transactions. 92% fewer false positives.</p>
            </div>

            <div className="bg-white/10 rounded-xl p-6 border border-white/20">
              <div className="flex items-center gap-3 mb-3">
                <Zap className="w-6 h-6 text-primary-400" />
                <h3 className="text-lg font-semibold text-white">Compliance Reporting</h3>
              </div>
              <p className="text-neutral-300 text-sm leading-relaxed">Generate audit-ready reports for any regulator with one click. 5-year trails maintained automatically.</p>
            </div>
          </div>

          <div className="text-center">
            <p className="text-neutral-400 mb-6">Book a 30-minute demo and see exactly how much time and money you'll save</p>
            <Link
              href="#contact"
              className="inline-flex items-center gap-2 px-8 py-3 bg-white text-accent-900 font-medium rounded-xl hover:bg-neutral-100 transition-all duration-300"
            >
              Book Your Demo
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;