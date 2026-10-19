"use client";

import { useEffect, useRef } from "react";

/**
 * Arms the ledger's one-time light-up: only when it starts below the fold and the
 * reader allows motion, so the server-rendered state never flickers in view.
 */
export default function LedgerReveal({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (el.getBoundingClientRect().top < window.innerHeight) return;

    el.dataset.ledger = "armed";
    let observed = false;
    const play = () => {
      io.disconnect();
      el.dataset.ledger = "play";
    };
    const io = new IntersectionObserver(
      (entries) => {
        observed = true;
        if (entries.some((e) => e.isIntersecting)) play();
      },
      { threshold: 0.3 }
    );
    io.observe(el);
    // Never leave the data hidden: if the observer never reports (background tab,
    // odd embed), light the ledger up anyway.
    const safety = window.setTimeout(() => {
      if (!observed) play();
    }, 2500);
    return () => {
      io.disconnect();
      window.clearTimeout(safety);
    };
  }, []);

  return <div ref={ref}>{children}</div>;
}
