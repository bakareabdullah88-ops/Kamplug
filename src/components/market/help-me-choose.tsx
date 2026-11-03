"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, ChevronRight, RotateCcw, X } from "lucide-react";
import { useMemo, useState } from "react";
import { pagePad } from "@/components/app/layout";
import { ButtonLink, Button } from "@/components/ui/button";
import { categories } from "@/config/categories";
import { spring } from "@/design/motion";
import { WALKING_MINUTES } from "@/domain/distance";
import { cn } from "@/lib/cn";
import { useProducts } from "@/queries/catalog";
import { useBuyerSpot, useNearQuery } from "@/queries/nearby";
import type { CategoryId, FulfilmentMethod, ProductQuery } from "@/services/types";
import { ProductCard, ProductCardSkeleton } from "./product-card";
import { QuickAdd } from "./quick-add";

type Answers = {
  category?: CategoryId | "any";
  budget?: "u2" | "2to5" | "5to15" | "any";
  method?: FulfilmentMethod | "any";
  close?: "walk" | "any";
};
type Option<V> = { value: V; label: string; hint?: string };
type Question = {
  key: keyof Answers;
  title: string;
  options: Option<string>[];
};

const budgets: Record<
  NonNullable<Answers["budget"]>,
  Pick<ProductQuery, "minPriceKobo" | "maxPriceKobo">
> = {
  u2: { maxPriceKobo: 200_000 },
  "2to5": { minPriceKobo: 200_000, maxPriceKobo: 500_000 },
  "5to15": { minPriceKobo: 500_000, maxPriceKobo: 1_500_000 },
  any: {},
};

/**
 * "Help me choose": a few quick taps (what, how much, how, how close), then
 * the products that fit, from real shops. Every answer is a filter the market
 * already understands, so the results are exactly what Discover would show.
 */
export function HelpMeChoose() {
  const spot = useBuyerSpot();
  const near = useNearQuery();
  const questions = useMemo<Question[]>(() => {
    const qs: Question[] = [
      {
        key: "category",
        title: "What are you after?",
        options: [
          ...categories.map((c) => ({ value: c.id, label: c.name, hint: c.blurb })),
          { value: "any", label: "Anything good", hint: "Show me everything" },
        ],
      },
      {
        key: "budget",
        title: "What's your budget?",
        options: [
          { value: "u2", label: "Under ₦2,000" },
          { value: "2to5", label: "₦2,000 to ₦5,000" },
          { value: "5to15", label: "₦5,000 to ₦15,000" },
          { value: "any", label: "Any price" },
        ],
      },
      {
        key: "method",
        title: "How do you want it?",
        options: [
          { value: "delivery", label: "Bring it to me", hint: "Shops that deliver" },
          { value: "pickup", label: "I'll pick it up", hint: "Shops with a pickup spot" },
          { value: "any", label: "Either is fine" },
        ],
      },
    ];
    // Only ask about distance when we know where they are.
    if (spot.onMap)
      qs.push({
        key: "close",
        title: "How close should it be?",
        options: [
          {
            value: "walk",
            label: "Walking distance",
            hint: `${WALKING_MINUTES} minutes or less from ${spot.label ?? "you"}`,
          },
          { value: "any", label: "Anywhere on campus" },
        ],
      });
    return qs;
  }, [spot.onMap, spot.label]);

  const [answers, setAnswers] = useState<Answers>({});
  const [step, setStep] = useState(0);
  const done = step >= questions.length;
  const q = questions[Math.min(step, questions.length - 1)]!;

  const pick = (value: string) => {
    setAnswers((a) => ({ ...a, [q.key]: value }));
    setStep((s) => s + 1);
  };
  const restart = () => {
    setAnswers({});
    setStep(0);
  };

  return (
    <div className={cn(pagePad, "mx-auto w-full max-w-3xl")}>
      <header className="rounded-2xl bg-[#1b1f3b] px-5 pt-5 pb-6 text-white md:px-7">
        <div className="flex items-center gap-2">
          {step > 0 && (
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              aria-label="Previous question"
              className="-ml-2 grid size-9 place-items-center rounded-full hover:bg-white/10"
            >
              <ArrowLeft className="size-5" />
            </button>
          )}
          <p className="flex-1 text-[19px] font-semibold tracking-[-0.01em]" aria-live="polite">
            {done ? "Here's what fits" : `Question ${step + 1}/${questions.length}`}
          </p>
          <Link
            href="/home"
            aria-label="Close"
            className="-mr-2 grid size-9 place-items-center rounded-full hover:bg-white/10"
          >
            <X className="size-5" />
          </Link>
        </div>
        <div
          className="mt-4 h-2 overflow-hidden rounded-full bg-white/15"
          role="progressbar"
          aria-label="Progress"
          aria-valuemin={0}
          aria-valuemax={questions.length}
          aria-valuenow={Math.min(step, questions.length)}
        >
          <motion.div
            className="h-full rounded-full bg-[#ffd23f]"
            initial={false}
            animate={{ width: `${(Math.min(step, questions.length) / questions.length) * 100}%` }}
            transition={spring.smooth}
          />
        </div>
      </header>

      <AnimatePresence mode="wait" initial={false}>
        {done ? (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={spring.smooth}
          >
            <Results answers={answers} near={near} onRestart={restart} />
          </motion.div>
        ) : (
          <motion.section
            key={q.key}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={spring.smooth}
            aria-labelledby={`q-${q.key}`}
            className="mt-7"
          >
            <h1
              id={`q-${q.key}`}
              className="text-[26px] font-semibold tracking-[-0.03em] md:text-[30px]"
            >
              {q.title}
            </h1>
            <ul className="mt-4 divide-y divide-line-thin border-y border-line-thin">
              {q.options.map((o) => {
                const chosen = answers[q.key] === o.value;
                return (
                  <li key={o.value}>
                    <button
                      type="button"
                      onClick={() => pick(o.value)}
                      aria-pressed={chosen}
                      className={cn(
                        "flex w-full items-center gap-3 px-1 py-4 text-left transition-colors hover:text-accent-ink",
                        chosen && "text-accent-ink",
                      )}
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block text-[16px] font-semibold">{o.label}</span>
                        {o.hint && (
                          <span className="mt-0.5 block truncate text-[13.5px] text-muted">
                            {o.hint}
                          </span>
                        )}
                      </span>
                      <ChevronRight className="size-5 shrink-0 text-muted" aria-hidden />
                    </button>
                  </li>
                );
              })}
            </ul>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
}

function Results({
  answers,
  near,
  onRestart,
}: {
  answers: Answers;
  near: ProductQuery["near"];
  onRestart: () => void;
}) {
  const query: ProductQuery = {
    inStock: true,
    pageSize: 24,
    ...(answers.category && answers.category !== "any" ? { category: answers.category } : {}),
    ...budgets[answers.budget ?? "any"],
    ...(answers.method && answers.method !== "any" ? { method: answers.method } : {}),
    ...(near ? { near, sort: "nearest" as const } : { sort: "popular" as const }),
    ...(answers.close === "walk" ? { walking: true } : {}),
  };
  const { data, isPending } = useProducts(query);
  const items = data?.items;
  const category = categories.find((c) => c.id === answers.category);

  return (
    <section aria-label="Results" className="mt-7">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-small text-muted">
          {isPending
            ? "Looking…"
            : `${data?.total ?? 0} ${data?.total === 1 ? "match" : "matches"}${near ? ", nearest first" : ""}`}
        </p>
        <Button
          variant="secondary"
          size="sm"
          onClick={onRestart}
          leadingIcon={<RotateCcw className="size-4" />}
        >
          Start over
        </Button>
      </div>
      {items && items.length === 0 ? (
        <div className="mt-8 border-y border-line-thin py-10 text-center">
          <p className="text-[17px] font-semibold">Nothing fits all of that yet</p>
          <p className="mt-1 text-small text-muted">
            Try a wider budget or &ldquo;either is fine&rdquo;, or browse everything.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <Button variant="secondary" onClick={onRestart}>
              Change answers
            </Button>
            <ButtonLink href={category ? `/explore?category=${category.id}` : "/explore"}>
              {category ? `Browse all ${category.name.toLowerCase()}` : "Browse everything"}
            </ButtonLink>
          </div>
        </div>
      ) : (
        <div className="mt-5 grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3">
          {items
            ? items.map((p, i) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  priority={i < 2}
                  action={<QuickAdd product={p} />}
                />
              ))
            : Array.from({ length: 6 }, (_, i) => <ProductCardSkeleton key={i} />)}
        </div>
      )}
    </section>
  );
}
