import React from 'react';
import { Link } from './ui/Link';
import { getCurrentLanguage, buildHomepageUrl } from '../utils/navigation';

const Logo: React.FC = () => {
  const currentLanguage = getCurrentLanguage();
  const homepageUrl = buildHomepageUrl(currentLanguage);

  return (
    <Link
      href={homepageUrl}
      className="flex items-center group cursor-pointer"
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