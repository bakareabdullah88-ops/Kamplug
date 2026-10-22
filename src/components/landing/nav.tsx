"use client";

import { KamplugLogo } from "@/components/app/kamplug-mark";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Menu as MenuIcon, X } from "lucide-react";
import { useEffect, useState } from "react";
import { brand } from "@/config/brand";
import { cn } from "@/lib/cn";
import { useSession } from "@/queries/session";

const links = [
  { label: "Shop", href: "/#shop" },
  { label: "Sell", href: "/#sell" },
  { label: "Delivery", href: "/#delivery" },
  { label: "FAQs", href: "/#faq" },
];

/** The Kamplug wordmark as plain text: "kam" in ink, "plug" in cobalt. */
function LogoText() {
  return (
    <Link href="/" aria-label={`${brand.name} home`} className="text-[25px] md:text-[28px]">
      <KamplugLogo />
    </Link>
  );
}

/**
 * The landing navbar: the wordmark, plain section links in the middle, and log in /
 * sign up on the right. Clear over the hero; once you scroll it gets a white,
 * blurred background with a hairline under it.
 */
export function LandingNav() {
  const { user, isReady } = useSession();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 12);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const cta =
    "flex h-11 shrink-0 items-center gap-1.5 rounded-full bg-[#3a5bff] px-4 text-[15px] font-bold whitespace-nowrap text-white transition-colors hover:bg-[#2a45d6] sm:px-5";

  return (
    <header
      // The whole bar takes the pointer: if gaps let it fall through to the hero,
      // the scene's pointer parallax starts and stops under the links and flickers.
      className="fixed inset-x-0 top-0 z-(--z-header) px-4 py-3 md:px-8"
    >
      {/* Once you scroll, a frosted bar fades in behind the links so page content
          passing underneath never fights with the logo and buttons. */}
      <div
        aria-hidden
        className={cn(
          "absolute inset-0 border-b border-[#1b1f3b]/[0.06] bg-white/65 backdrop-blur-2xl backdrop-saturate-150 transition-opacity duration-300",
          scrolled ? "opacity-100" : "opacity-0",
        )}
      />
      <AnimatePresence>
        {open && (
          <motion.button
            type="button"
            aria-label="Close menu"
            tabIndex={-1}
            onClick={() => setOpen(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pointer-events-auto fixed inset-0 bg-[#1b1f3b]/30 lg:hidden"
          />
        )}
      </AnimatePresence>
      <div className="relative mx-auto flex max-w-[1240px] items-center gap-3">
        <div className="flex h-11 items-center">
          <LogoText />
        </div>
        {/* A plain row of links next to the wordmark. */}
        <nav aria-label="Main" className="ml-8 hidden items-center gap-1 lg:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="flex h-11 items-center rounded-lg px-3.5 text-[15px] font-semibold text-[#1b1f3b]/80 transition-colors hover:bg-[#3a5bff]/[0.08] hover:text-[#3a5bff]"
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          {isReady && user ? (
            <Link href="/home" className={cta} aria-label="Open Kamplug">
              {/* Small phones get the short label so it stays on one line. */}
              Open<span className="hidden min-[400px]:inline"> Kamplug</span>
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden h-11 items-center rounded-lg px-4 text-[15px] font-semibold text-[#1b1f3b] transition-colors hover:bg-[#3a5bff]/[0.08] hover:text-[#3a5bff] sm:flex"
              >
                Log in
              </Link>
              <Link href="/signup" className={cta}>
                Sign up
              </Link>
            </>
          )}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="landing-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            className="grid size-11 place-items-center rounded-lg text-[#1b1f3b] hover:bg-[#1b1f3b]/[0.05] lg:hidden"
          >
            {open ? <X className="size-5" /> : <MenuIcon className="size-5" />}
          </button>
        </div>
        <AnimatePresence>
          {open && (
            <motion.nav
              id="landing-menu"
              aria-label="Main"
              initial={{ opacity: 0, y: -10, rotateX: -20 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              exit={{ opacity: 0, y: -10, rotateX: -20 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              style={{ transformPerspective: 800, transformOrigin: "top" }}
              className="pointer-events-auto absolute top-[calc(100%+12px)] right-0 left-0 rounded-2xl bg-white p-2 ring-1 ring-[#1b1f3b]/10 lg:hidden"
            >
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="flex h-12 items-center rounded-xl px-4 text-[17px] font-bold text-[#1b1f3b] hover:bg-[#f4f5f8]"
                >
                  {l.label}
                </Link>
              ))}
              {!user && (
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="mt-2 flex h-12 items-center justify-center rounded-full text-[16px] font-bold text-[#1b1f3b] ring-2 ring-[#1b1f3b] sm:hidden"
                >
                  Log in
                </Link>
              )}
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
