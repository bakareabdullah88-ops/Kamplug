"use client";

import { motion } from "motion/react";
import type { WeekdayCount } from "@/domain/analytics";
import { cn } from "@/lib/cn";

/** Columns are two dots wide; they grow up to this many rows before dots start standing for more than one item. */
const MAX_ROWS = 12;
const MIN_ROWS = 5;

/**
 * Weekday columns of dots, one dot per item sold, with the busiest day called
 * out. A day too busy to fit makes every dot stand for a few items, and the
 * chart says so.
 */
export function WeekdayDots({ days, peak }: { days: WeekdayCount[]; peak: number | null }) {
  const max = Math.max(0, ...days.map((d) => d.items));
  const perDot = Math.max(1, Math.ceil(max / (MAX_ROWS * 2)));
  const rows = Math.max(MIN_ROWS, Math.ceil(max / perDot / 2));
  // Monday first.
  const ordered = [...days.slice(1), days[0]!];
  return (
    <div>
      <div className="relative flex items-end justify-between gap-1.5 pt-10">
        {ordered.map((d, col) => {
          const filled = Math.ceil(d.items / perDot);
          const isPeak = d.day === peak;
          const label = `${d.label}: ${d.items} item${d.items === 1 ? "" : "s"} sold`;
          return (
            <div
              key={d.day}
              className="relative flex flex-col items-center gap-1.5"
              title={label}
              aria-label={label}
              role="img"
            >
              {isPeak && (
                <span className="absolute -top-9 rounded-full bg-surface px-2.5 py-1 text-[12px] whitespace-nowrap text-muted ring-1 ring-line">
                  Peak: <b className="font-semibold text-ink">{d.label}</b>
                </span>
              )}
              <div className="grid grid-cols-2 gap-[3px]">
                {Array.from({ length: rows * 2 }, (_, k) => {
                  const row = rows - 1 - Math.floor(k / 2);
                  const index = row * 2 + (k % 2);
                  const on = index < filled;
                  return (
                    <motion.span
                      key={k}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{
                        delay: col * 0.04 + row * 0.03,
                        type: "spring",
                        stiffness: 500,
                        damping: 22,
                      }}
                      className={cn(
                        "size-[9px] rounded-full md:size-[10px]",
                        on
                          ? isPeak
                            ? "bg-chart-green"
                            : "bg-chart-mint"
                          : row === 0
                            ? "bg-chart-mint/45"
                            : "bg-transparent",
                      )}
                    />
                  );
                })}
              </div>
              <span className="text-[10.5px] text-muted">{d.label.slice(0, 2)}</span>
            </div>
          );
        })}
      </div>
      <p className="mt-2 text-[11px] text-muted">
        Each dot is {perDot === 1 ? "one item sold" : `${perDot} items sold`}
      </p>
    </div>
  );
}
