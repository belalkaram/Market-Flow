import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP);

export function useFadeIn(delay: number = 0, duration: number = 0.5) {
  const ref = useRef<HTMLDivElement>(null);
  
  useGSAP(() => {
    if (ref.current) {
      gsap.fromTo(ref.current, 
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration, delay, ease: "power2.out" }
      );
    }
  }, { scope: ref });
  
  return ref;
}

export function useStaggerFadeIn(selector: string, stagger: number = 0.1, delay: number = 0) {
  const ref = useRef<HTMLDivElement>(null);
  
  useGSAP(() => {
    if (ref.current) {
      gsap.fromTo(gsap.utils.toArray(selector, ref.current),
        { opacity: 0, y: 20 },
        { 
          opacity: 1, 
          y: 0, 
          duration: 0.5, 
          stagger,
          delay,
          ease: "power2.out" 
        }
      );
    }
  }, { scope: ref });
  
  return ref;
}

export function useCounter(value: number, duration: number = 1) {
  const ref = useRef<HTMLSpanElement>(null);
  const valRef = useRef({ val: 0 });
  
  useGSAP(() => {
    if (ref.current) {
      gsap.to(valRef.current, {
        val: value,
        duration,
        ease: "power2.out",
        onUpdate: () => {
          if (ref.current) {
            ref.current.innerHTML = Math.round(valRef.current.val).toLocaleString('en-US');
          }
        }
      });
    }
  }, [value]);
  
  return ref;
}
