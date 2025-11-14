import React from 'react';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, className = '' }) => {
  return (
    <nav
      aria-label="Breadcrumb"
      className={`flex items-center gap-2 text-sm ${className}`}
      itemScope
      itemType="https://schema.org/BreadcrumbList"
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        const position = index + 1;

        return (
          <React.Fragment key={index}>
            {index > 0 && (
              <ChevronRight className="w-4 h-4 text-neutral-400" aria-hidden="true" />
            )}

            <div
              itemProp="itemListElement"
              itemScope
              itemType="https://schema.org/ListItem"
            >
              {!isLast && item.href ? (
                <>
                  <a
                    href={item.href}
                    className="text-neutral-600 hover:text-primary-600 transition-colors flex items-center gap-1"
                    itemProp="item"
                  >
                    {index === 0 && <Home className="w-4 h-4" />}
                    <span itemProp="name">{item.label}</span>
                  </a>
                  <meta itemProp="position" content={position.toString()} />
                </>
              ) : (
                <>
                  <span
                    className="text-neutral-900 font-medium flex items-center gap-1"
                    itemProp="name"
                    aria-current={isLast ? "page" : undefined}
                  >
                    {index === 0 && <Home className="w-4 h-4" />}
                    {item.label}
                  </span>
                  <meta itemProp="position" content={position.toString()} />
                </>
              )}
            </div>
          </React.Fragment>
        );
      })}
    </nav>
  );
};

export const generateBreadcrumbSchema = (items: BreadcrumbItem[], baseUrl: string = 'https://veridaq.com') => {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.label,
      ...(item.href && { "item": `${baseUrl}${item.href}` })
    }))
  };
};
