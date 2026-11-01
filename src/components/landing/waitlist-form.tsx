"use client";

import { ArrowRight, Check } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { services } from "@/services";
import { errorMessage } from "@/services/errors";

type Role = "buy" | "sell" | "both";
const roles: { value: Role; label: string }[] = [
  { value: "buy", label: "I want to buy" },
  { value: "sell", label: "I want to sell" },
  { value: "both", label: "Both" },
];

/**
 * Join the waitlist: an email and what you want to do on Kamplug. Saved to the
 * shared database; the same email only counts once.
 */
export function WaitlistForm({
  tone = "light",
  anchor = false,
}: {
  tone?: "light" | "dark";
  /**
   * The form every "Join the waitlist" link on the page leads to. A link to
   * "#waitlist" on the page you're already on doesn't move anything, so this
   * one catches those clicks, scrolls itself into view and puts the cursor in
   * the email box.
   */
  anchor?: boolean;
}) {
  const id = useId();
  const boxRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!anchor) return;
    const bring = (focus: boolean) => {
      const box = boxRef.current;
      if (!box) return;
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      box.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
      if (focus) box.querySelector("input")?.focus({ preventScroll: true });
    };
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
      const link = (e.target as Element | null)?.closest?.("a[href]");
      const href = link?.getAttribute("href");
      if (href !== "#waitlist" && href !== "/#waitlist") return;
      // Before the page's own link handling, so it doesn't try (and fail) to navigate.
      e.preventDefault();
      e.stopPropagation();
      bring(true);
    };
    document.addEventListener("click", onClick, true);
    // Sent here from a closed page (/home, /login…): show the form.
    if (window.location.hash === "#waitlist") bring(false);
    return () => document.removeEventListener("click", onClick, true);
  }, [anchor]);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("buy");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{ position: number; already: boolean } | null>(null);
  const dark = tone === "dark";

  if (done) {
    return (
      <div
        role="status"
        className={cn(
          "flex w-full max-w-[600px] items-center gap-3 rounded-3xl p-4 text-left ring-1 md:p-5",
          dark
            ? "bg-white/10 text-white ring-white/20"
            : "bg-white text-[#1b1f3b] ring-[#1b1f3b]/10",
        )}
      >
        <span className="grid size-11 shrink-0 place-items-center rounded-full bg-[#17754c] text-white">
          <Check className="size-5" aria-hidden />
        </span>
        <span>
          <span className="block text-[17px] font-bold">
            {done.already ? "You're already on the list" : "You're on the list"}
          </span>
          <span className={cn("block text-[15px]", dark ? "text-white/80" : "text-[#4a4f68]")}>
            Number {done.position}. We&apos;ll email you the day Kamplug opens at UNILAG.
          </span>
        </span>
      </div>
    );
  }

  const submit = async () => {
    setError(null);
    setPending(true);
    try {
      setDone(await services.waitlist.join({ email, role }));
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setPending(false);
    }
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void submit();
      }}
      className="flex w-full max-w-[600px] flex-col items-center gap-3 text-left"
      aria-label="Join the waitlist"
    >
      <div
        ref={boxRef}
        className="flex h-16 w-full items-center gap-2 rounded-full bg-white p-2 pl-5 ring-1 ring-[#1b1f3b]/10 md:h-[68px]"
      >
        <label htmlFor={`${id}-email`} className="sr-only">
          Your email
        </label>
        <input
          id={`${id}-email`}
          type="email"
          required
          autoComplete="email"
          inputMode="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setError(null);
          }}
          placeholder="Your email"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          className="h-full min-w-0 flex-1 bg-transparent text-[16px] text-[#1b1f3b] outline-none placeholder:text-[#6b6f86] md:text-[17px]"
        />
        <button
          type="submit"
          disabled={pending}
          className="flex h-full shrink-0 items-center gap-1.5 rounded-full bg-[#3a5bff] px-5 text-[15px] font-bold whitespace-nowrap text-white transition-colors hover:bg-[#2a45d6] disabled:opacity-60 md:px-6 md:text-[16px]"
        >
          {pending ? "Joining…" : "Join the waitlist"}
          <ArrowRight className="size-5 max-sm:hidden" aria-hidden />
        </button>
      </div>
      {error && (
        <p
          id={`${id}-error`}
          role="alert"
          className={cn("text-[14px] font-semibold", dark ? "text-[#ffd23f]" : "text-[#b42318]")}
        >
          {error}
        </p>
      )}
      <fieldset className="flex flex-wrap justify-center gap-2">
        <legend className="sr-only">What do you want to do on Kamplug?</legend>
        {roles.map((r) => (
          <label
            key={r.value}
            className={cn(
              "flex h-10 cursor-pointer items-center rounded-full px-4 text-[14px] font-semibold ring-1 transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-[#3a5bff]",
              role === r.value
                ? dark
                  ? "bg-white text-[#1b1f3b] ring-white"
                  : "bg-[#1b1f3b] text-white ring-[#1b1f3b]"
                : dark
                  ? "text-white ring-white/40 hover:bg-white/10"
                  : "bg-white text-[#1b1f3b] ring-[#1b1f3b]/15 hover:ring-[#1b1f3b]/40",
            )}
          >
            <input
              type="radio"
              name={`${id}-role`}
              value={r.value}
              checked={role === r.value}
              onChange={() => setRole(r.value)}
              className="sr-only"
            />
            {r.label}
          </label>
        ))}
      </fieldset>
    </form>
  );
}
