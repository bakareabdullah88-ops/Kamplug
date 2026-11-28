"use client";

import { motion } from "motion/react";
import { useMode, type Mode } from "@/components/shell/mode";
import { spring } from "@/design/motion";
import { cn } from "@/lib/cn";
import { useMyBrand } from "@/queries/studio";
import { useNavBadges } from "./nav-badges";
import { centerOf } from "@/components/shell/mode-curtain";
import { useSwitchWorkspace } from "./workspace";

/**
 * Buy ⇄ Sell, as one pill with a filled thumb that slides to the side you're on.
 * Both words always show; the pill is sized around them.
 */
export function WorkspaceSwitch({ className }: { className?: string }) {
  const mode = useMode();
  const { data: brand } = useMyBrand();
  const badges = useNavBadges();
  const go = useSwitchWorkspace();
  const options: { value: Mode; label: string; title: string; count?: number }[] = [
    { value: "buying", label: "Buy", title: "Buy: the market" },
    {
      value: "selling",
      label: "Sell",
      title: brand ? `Sell: ${brand.name}` : "Sell: open a shop",
      count: badges.newOrders,
    },
  ];
  return (
    <div
      role="radiogroup"
      aria-label="Buy or sell"
      className={cn("inline-flex shrink-0 items-center rounded-full bg-ink/[0.06] p-1", className)}
    >
      {options.map((o) => {
        const active = mode === o.value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={o.title}
            title={o.title}
            onClick={(e) => go(o.value, centerOf(e.currentTarget))}
            className={cn(
              "relative flex h-9 min-w-[68px] flex-1 items-center justify-center gap-1.5 rounded-full px-4 text-[14px] font-bold transition-colors duration-150",
              active ? "text-on-accent" : "text-ink-2 hover:text-ink",
            )}
          >
            {active && (
              <motion.span
                layoutId="workspace-thumb"
                transition={spring.snappy}
                className="absolute inset-0 rounded-full bg-accent"
                aria-hidden
              />
            )}
            <span className="relative">{o.label}</span>
            {!!o.count && (
              <span
                className={cn(
                  "relative grid h-[18px] min-w-[18px] place-items-center rounded-full px-1 text-[10px] font-bold tabular",
                  active ? "bg-white text-accent-ink" : "bg-badge text-white",
                )}
              >
                {o.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
