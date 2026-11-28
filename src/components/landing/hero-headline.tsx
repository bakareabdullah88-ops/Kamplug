"use client";

import { useEffect, useState } from "react";

/** "What do you need?" in Pidgin, Yoruba, Igbo and Hausa. Each language's last word has its own warm colour, bright enough for large text (3:1 or better). */
const lines = [
  { lang: "pcm", lead: "Wetin you", end: "need?", color: "#e85d0c" },
  { lang: "yo", lead: "Kí lo", end: "nílò?", color: "#2a8bc9" },
  { lang: "ig", lead: "Gịnị ka ị", end: "chọrọ?", color: "#1f9a55" },
  { lang: "ha", lead: "Me kake", end: "bukata?", color: "#7c4ddb" },
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
        <span className="block sm:inline" style={{ color: line.color }}>
          {line.end}
        </span>
      </span>
    </h1>
  );
}
