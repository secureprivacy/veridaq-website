import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowRight } from 'lucide-react';
import { Link } from './ui/Link';

const ScrollCTA: React.FC = () => {
  const { t } = useTranslation('scrollCTA');
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      
      // Show CTA when user scrolls 50% of the page
      const scrollPercentage = (scrolled / (documentHeight - windowHeight)) * 100;
      
      if (scrollPercentage > 50 && !isDismissed) {
        setIsVisible(true);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isDismissed]);

  if (!isVisible || isDismissed) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-primary-600 text-white p-4 shadow-lg transform transition-transform duration-500">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h3 className="font-bold text-lg">{t('title')}</h3>
            <p className="text-sm text-primary-100">{t('subtitle')}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <Link
            href="#contact"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-primary-600 font-semibold rounded-xl hover:bg-neutral-50 transition-colors"
            onClick={(e) => {
              setIsDismissed(true);
            }}
          >
            {t('cta')}
            <ArrowRight className="w-4 h-4" />
          </Link>

          <button
            onClick={() => setIsDismissed(true)}
            className="p-2 text-white hover:bg-primary-700 rounded-lg transition-colors"
          >
            <span className="text-lg">✕</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScrollCTA;