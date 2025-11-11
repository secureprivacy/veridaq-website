import { SUPPORTED_LANGUAGES } from './languageUtils';

export const getCurrentLanguage = (): string => {
  const pathSegments = window.location.pathname.split('/').filter(Boolean);
  const supportedLanguages = SUPPORTED_LANGUAGES.filter(lang => lang !== 'en');

  if (pathSegments.length > 0 && supportedLanguages.includes(pathSegments[0])) {
    return pathSegments[0];
  }
  return 'en';
};

export const isOnHomepage = (): boolean => {
  const pathname = window.location.pathname;
  const pathSegments = pathname.split('/').filter(Boolean);
  const supportedLanguages = SUPPORTED_LANGUAGES.filter(lang => lang !== 'en');

  if (pathSegments.length === 0) {
    return true;
  }

  if (pathSegments.length === 1 && supportedLanguages.includes(pathSegments[0])) {
    return true;
  }

  return false;
};

export const buildHomepageUrl = (language: string, sectionId?: string): string => {
  const basePath = language === 'en' ? '/' : `/${language}`;
  return sectionId ? `${basePath}#${sectionId}` : basePath;
};

export const navigateToSection = (sectionId: string, language?: string): void => {
  const currentLanguage = language || getCurrentLanguage();
  const onHomepage = isOnHomepage();

  if (onHomepage) {
    const element = document.getElementById(sectionId);
    if (element) {
      const headerOffset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  } else {
    const homepageUrl = buildHomepageUrl(currentLanguage, sectionId);
    window.location.href = homepageUrl;
  }
};

export const scrollToElement = (elementId: string): void => {
  const element = document.getElementById(elementId);
  if (element) {
    const headerOffset = 100;
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    });
  }
};
