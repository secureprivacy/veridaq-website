import { useEffect, useRef, RefObject } from 'react';

export function useScrollAnimation(threshold = 0.1): RefObject<HTMLDivElement> {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      },
      {
        threshold,
      }
    );

    const current = ref.current;
    if (current) {
      current.classList.add('scroll-animation');
      observer.observe(current);
    }

    return () => {
      if (current) {
        observer.unobserve(current);
      }
    };
  }, [threshold]);

  return ref;
}