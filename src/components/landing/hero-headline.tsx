"use client";

import { useEffect, useState } from "react";

/** "What do you need?" in Pidgin, Yoruba, Igbo and Hausa. The last word is the red one. */
const lines = [
  { lang: "pcm", lead: "Wetin you", end: "need?" },
  { lang: "yo", lead: "Kí lo", end: "nílò?" },
  { lang: "ig", lead: "Gịnị ka ị", end: "chọrọ?" },
  { lang: "ha", lead: "Me kake", end: "bukata?" },
] as const;

/** How long each language stays before the next one rises in. */
const HOLD_MS = 9600;

/**
 * The landing headline: the biggest thing on the page. Every ~10 seconds the
 * next language rises gently into place over 1.2 seconds. Screen readers
 * always get the Pidgin line; with reduced motion it stays on Pidgin.
 * Two lines on phones so it can be large without squeezing; one line wider.
 */
export function HeroHeadline() {
  const [i, setI] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = window.setInterval(() => setI((n) => (n + 1) % lines.length), HOLD_MS);
    return () => window.clearInterval(t);
  }, []);

  const line = lines[i]!;
  return (
    <h1 className="mt-6 text-[length:clamp(56px,16vw,128px)] leading-[0.92] font-extrabold tracking-[-0.045em] text-balance sm:text-[length:clamp(56px,9.6vw,128px)] sm:whitespace-nowrap">
      <span className="sr-only">Wetin you need?</span>
      <span
        key={line.lang}
        lang={line.lang}
        aria-hidden
        className="block motion-safe:animate-[lp-rise_1.2s_cubic-bezier(0.2,0,0,1)]"
      >
        <span className="block sm:inline">{line.lead}</span>{" "}
        <span className="block text-[#d63426] sm:inline">{line.end}</span>
      </span>
    </h1>
  );
}
