'use client';

import { useEffect, useRef, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  className?: string;
  animation?: 'reveal' | 'reveal-left' | 'reveal-right' | 'reveal-scale';
  delay?: number;
  threshold?: number;
  /** Wrap children in a stagger container */
  stagger?: boolean;
}

/**
 * Wraps children in a div that becomes visible (via CSS .visible class)
 * when it enters the viewport. Pairs with globals.css .reveal* rules.
 */
export default function AnimatedSection({
  children,
  className = '',
  animation = 'reveal',
  delay = 0,
  threshold = 0.15,
  stagger = false,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (delay > 0) {
            setTimeout(() => el.classList.add('visible'), delay);
          } else {
            el.classList.add('visible');
          }
          observer.unobserve(el);
        }
      },
      { threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [delay, threshold]);

  return (
    <div
      ref={ref}
      className={`${animation} ${stagger ? 'stagger-children' : ''} ${className}`}
    >
      {children}
    </div>
  );
}
