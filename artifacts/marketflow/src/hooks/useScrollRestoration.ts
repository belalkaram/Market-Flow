import { useEffect, useRef } from 'react';
import { useLocation } from 'wouter';

export function useScrollRestoration(scrollRef: React.RefObject<HTMLElement | null>) {
  const [location] = useLocation();
  const prevLocation = useRef<string>(location);
  const isFirstVisit = useRef<Set<string>>(new Set());

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const key = `scroll_pos_${prevLocation.current}`;
    sessionStorage.setItem(key, String(el.scrollTop));
  }, [location]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const key = `scroll_pos_${location}`;
    const saved = sessionStorage.getItem(key);

    if (saved !== null && isFirstVisit.current.has(location)) {
      requestAnimationFrame(() => {
        el.scrollTop = Number(saved);
      });
    } else {
      isFirstVisit.current.add(location);
      el.scrollTop = 0;
    }

    prevLocation.current = location;
  }, [location]);
}
