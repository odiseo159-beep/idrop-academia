"use client";

import { useEffect, useRef } from "react";

/**
 * Wraps children and attaches IntersectionObserver to descendants marked
 * with `data-rise`. Adds `.in` class when they enter the viewport.
 */
export function RevealOnScroll({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const els = ref.current.querySelectorAll<HTMLElement>("[data-rise]");
    if (!els.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -60px 0px" }
    );

    els.forEach((el) => {
      const delay = parseInt(el.dataset.riseDelay || "0", 10);
      el.style.transitionDelay = `${delay}ms`;
      el.classList.add("v2-rise");
      io.observe(el);
    });

    return () => io.disconnect();
  }, []);

  return <div ref={ref}>{children}</div>;
}
