
"use client";
import { useEffect, useRef } from "react";

export function useAutoplayOnView(options = { threshold: 0.5 }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const onIntersect = (entries) => {
      entries.forEach((entry) => {
        try {
          if (entry.isIntersecting) el.play();
          else el.pause();
        } catch {}
      });
    };

    const obs = new IntersectionObserver(onIntersect, options);
    obs.observe(el);
    return () => obs.disconnect();
  }, [options]);

  return ref;
}
