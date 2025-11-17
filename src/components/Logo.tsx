import React from 'react';
import { Link } from './ui/Link';
import { getCurrentLanguage, buildHomepageUrl } from '../utils/navigation';

interface LogoProps {
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ className = '' }) => {
  const currentLanguage = getCurrentLanguage();
  const homepageUrl = buildHomepageUrl(currentLanguage);

  return (
    <Link
      href={homepageUrl}
      className={`${className} flex items-center group cursor-pointer`.trim()}
      aria-label="Go to homepage"
    >
      <img
        src="/images/veridaq-logo-transparent.png"
        alt="Veridaq"
        height="32"
        width="128"
        className="group-hover:scale-105 transition-transform duration-300"
      />
    </Link>
  );
};

export default Logo;
