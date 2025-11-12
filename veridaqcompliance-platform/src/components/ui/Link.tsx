import React from 'react';
import { isOnHomepage, navigateToSection, getCurrentLanguage, buildHomepageUrl } from '../../utils/navigation';

interface LinkProps {
  href: string;
  className?: string;
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

export const Link: React.FC<LinkProps> = ({ href, className = '', children, onClick }) => {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Handle different types of navigation
    if (href.startsWith('/')) {
      // Path-based navigation for blog and language routes
      e.preventDefault();

      // Call custom onClick handler if provided (after preventing default)
      if (onClick) {
        onClick(e);
      }

      // Use history.pushState for smoother navigation without full page reload
      window.history.pushState({}, '', href);

      // Trigger popstate event to notify App.tsx of route change
      window.dispatchEvent(new PopStateEvent('popstate', { state: {} }));

      // Scroll to top smoothly
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (href === '#') {
      // Homepage link (logo)
      e.preventDefault();

      // Call custom onClick handler if provided
      if (onClick) {
        onClick(e);
      }

      const currentLanguage = getCurrentLanguage();
      const homepageUrl = buildHomepageUrl(currentLanguage);

      // If already on homepage, just scroll to top
      if (isOnHomepage()) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        // Navigate to homepage using client-side routing
        window.history.pushState({}, '', homepageUrl);
        window.dispatchEvent(new PopStateEvent('popstate', { state: {} }));
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else if (href.startsWith('#') && !href.includes('cms')) {
      // Section navigation with context awareness
      e.preventDefault();

      // Call custom onClick handler if provided
      if (onClick) {
        onClick(e);
      }

      const targetId = href.slice(1);
      const onHomepage = isOnHomepage();

      if (onHomepage) {
        // On homepage: smooth scroll to section
        setTimeout(() => {
          const element = document.getElementById(targetId);
          if (element) {
            const headerOffset = 100;
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
              top: offsetPosition,
              behavior: 'smooth'
            });
          }
        }, 50);
      } else {
        // Not on homepage: navigate to homepage with section hash using client-side routing
        const currentLanguage = getCurrentLanguage();
        const homepageUrlWithHash = buildHomepageUrl(currentLanguage, targetId);

        // Navigate to homepage with hash - this will be handled by HomePageWithHashScroll
        window.history.pushState({}, '', homepageUrlWithHash);
        window.dispatchEvent(new PopStateEvent('popstate', { state: {} }));
      }
    } else if (href.startsWith('#cms')) {
      // CMS navigation
      e.preventDefault();

      // Call custom onClick handler if provided
      if (onClick) {
        onClick(e);
      }

      window.location.hash = href;
    } else {
      // External links or other cases - call custom onClick
      if (onClick) {
        onClick(e);
      }
    }
  };

  return (
    <a
      href={href}
      onClick={handleClick}
      className={`font-medium transition-all duration-200 ${className}`}
    >
      {children}
    </a>
  );
};