"use client";

import { useEffect, useState } from "react";

const FULL_TAGLINE = "Making Your House a Home";

export function TypingTagline() {
  const [display, setDisplay] = useState("");
  const [done, setDone] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mediaQuery.matches);

    const onChange = (event: MediaQueryListEvent) => {
      setReduceMotion(event.matches);
    };

    mediaQuery.addEventListener("change", onChange);
    return () => mediaQuery.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (reduceMotion) {
      setDisplay(FULL_TAGLINE);
      setDone(true);
      return;
    }

    setDisplay("");
    setDone(false);

    let index = 0;
    const timer = window.setInterval(() => {
      index += 1;
      setDisplay(FULL_TAGLINE.slice(0, index));
      if (index >= FULL_TAGLINE.length) {
        window.clearInterval(timer);
        setDone(true);
      }
    }, 65);

    return () => window.clearInterval(timer);
  }, [reduceMotion]);

  return (
    <p className="text-sm tracking-wide text-brand-charcoal/80 min-h-6" aria-live="polite">
      {display}
      <span className={`ml-1 inline-block w-[1px] h-4 bg-brand-charcoal align-middle ${done ? "animate-blink" : "animate-blink"}`} />
    </p>
  );
}
