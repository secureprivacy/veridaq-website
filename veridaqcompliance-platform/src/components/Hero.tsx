import React, { useEffect, useState } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { Link } from './ui/Link';
import { ArrowRight, Shield, Zap, Users } from 'lucide-react';

const Hero: React.FC = () => {
  const { t } = useTranslation('hero');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden bg-gradient-to-br from-white via-slate-50/30 to-white">
      {/* Subtle background elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-primary-200/20 to-primary-300/20 rounded-full blur-3xl animate-float-slow"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-br from-accent-200/20 to-accent-300/20 rounded-full blur-3xl animate-float-slow" style={{ animationDelay: '3s' }}></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-br from-primary-100/10 to-accent-100/10 rounded-full blur-3xl animate-float-slow" style={{ animationDelay: '1.5s' }}></div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className={`text-center mb-16 transition-all duration-1000 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/95 backdrop-blur-sm border border-white/30 rounded-xl shadow-premium mb-8">
              <div className="w-2 h-2 bg-primary-600 rounded-full animate-pulse"></div>
              <span className="text-sm font-semibold text-accent-900">{t('badge')}</span>
            </div>

            <h1 className="heading-xl text-accent-900 mb-8">
              <Trans
                i18nKey="title"
                ns="hero"
                components={{
                  1: <span className="text-primary-600" />,
                  br: <br />
                }}
              />
            </h1>

            <p className="body-lg text-neutral-600 mb-12 max-w-3xl mx-auto">
              {t('subtitle')}
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
              <a
                href="https://amlr-compliance-soft-j7n7.bolt.host/demo"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary group font-display"
              >
                <span className="flex items-center justify-center gap-2">
                  {t('cta.primary')}
                </span>
              </a>

              <Link
                href="#roi-calculator"
                className="btn-secondary group font-display"
              >
                <span className="flex items-center justify-center gap-2">
                  {t('cta.secondary')}
                </span>
              </Link>
            </div>
          </div>

          <div className={`transition-all duration-1000 delay-300 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <ScreenshotSelector />
          </div>
        </div>
      </div>
    </section>
  );
};

interface ScreenshotSelectorProps {}

const ScreenshotSelector: React.FC<ScreenshotSelectorProps> = () => {
  const { t } = useTranslation('hero');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState<boolean[]>([]);

  const screenshots = [
    {
      url: '/images/TransactionMonitoring.png',
      title: t('screenshots.transactionMonitoring.title'),
      description: t('screenshots.transactionMonitoring.description')
    },
    {
      url: '/images/RiskAssessment.png',
      title: t('screenshots.riskAssessment.title'),
      description: t('screenshots.riskAssessment.description')
    },
    {
      url: '/images/BeneficialOwnership.png',
      title: t('screenshots.beneficialOwnership.title'),
      description: t('screenshots.beneficialOwnership.description')
    },
    {
      url: '/images/CustomerDueDiligence.png',
      title: t('screenshots.customerDueDiligence.title'),
      description: t('screenshots.customerDueDiligence.description')
    },
    {
      url: '/images/SanctionsScreening.png',
      title: t('screenshots.sanctionsScreening.title'),
      description: t('screenshots.sanctionsScreening.description')
    },
    {
      url: '/images/RecordKeeping.png',
      title: t('screenshots.recordKeeping.title'),
      description: t('screenshots.recordKeeping.description')
    }
  ];

  const maxSlides = screenshots.length;

  // Preload adjacent images for smoother transitions
  useEffect(() => {
    const preloadImages = () => {
      const toLoad = [currentSlide];
      // Preload next and previous images
      if (currentSlide + 1 < maxSlides) toLoad.push(currentSlide + 1);
      if (currentSlide - 1 >= 0) toLoad.push(currentSlide - 1);

      toLoad.forEach(index => {
        if (!imagesLoaded[index]) {
          const img = new Image();
          img.src = screenshots[index].url;
          img.onload = () => {
            setImagesLoaded(prev => {
              const newLoaded = [...prev];
              newLoaded[index] = true;
              return newLoaded;
            });
          };
        }
      });
    };

    preloadImages();
  }, [currentSlide, maxSlides, imagesLoaded, screenshots]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % maxSlides);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + maxSlides) % maxSlides);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  return (
    <div className="relative bg-white/95 backdrop-blur-xl border border-white/20 shadow-premium-lg rounded-3xl overflow-hidden">
      {/* Platform Header */}
      <div className="p-6 border-b border-neutral-200/50">
        <div className="text-center">
          <h3 className="text-xl font-bold text-neutral-900 mb-2">{t('platformTitle')}</h3>
          <p className="text-neutral-600 text-sm">{t('platformDescription')}</p>
        </div>
      </div>

      {/* Screenshot Slider */}
      <div className="relative">
        <div className="aspect-video overflow-hidden">
          <div
            className="flex transition-transform duration-500 ease-in-out h-full"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {screenshots.map((screenshot, index) => (
              <div key={index} className="w-full flex-shrink-0 relative">
                <img
                  src={screenshot.url}
                  alt={screenshot.title}
                  className="w-full h-full object-cover"
                  loading={index === 0 ? "eager" : "lazy"}
                  fetchpriority={index === 0 ? "high" : "auto"}
                  decoding={index === 0 ? "sync" : "async"}
                  width="1200"
                  height="675"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                <div className="absolute bottom-6 left-6 right-6">
                  <h3 className="text-xl font-bold text-white mb-2">{screenshot.title}</h3>
                  <p className="text-white/90 text-sm">{screenshot.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {maxSlides > 1 && (
          <>
            {/* Previous/Next Arrows */}
            <button
              onClick={prevSlide}
              aria-label="Previous slide"
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white text-neutral-700 p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <button
              onClick={nextSlide}
              aria-label="Next slide"
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white text-neutral-700 p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Slide Indicators */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
              {screenshots.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  aria-label={`Go to slide ${index + 1}`}
                  className={`w-3 h-3 rounded-full transition-all duration-200 ${
                    index === currentSlide
                      ? 'bg-primary-600 scale-110'
                      : 'bg-white/50 hover:bg-white/80'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Hero;
