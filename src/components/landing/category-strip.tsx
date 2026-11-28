"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CategoryIcon } from "@/components/market/category-icons";
import { categories, categoryTint } from "@/config/categories";
import { features } from "@/config/features";
import { Reveal } from "./reveal";

/**
 * The six categories as plain, equal tiles: each on its own soft colour with the
 * same flat illustration the app's home screen uses, the name, and what's inside.
 * The way grocery and delivery apps (Instacart, Glovo, DoorDash) show
 * categories, and it ties the landing page to the app.
 */
export function CategoryStrip() {
  return (
    <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5">
      {categories.map((c, i) => (
        <li key={c.id} className="h-full">
          <Reveal delay={i * 50} className="h-full">
            <Link
              href={features.waitlist ? "#waitlist" : `/explore?category=${c.id}`}
              className="group flex h-full min-h-[230px] flex-col rounded-[24px] p-4 outline-offset-4 transition-transform duration-200 ease-[cubic-bezier(0.2,0,0,1)] hover:-translate-y-1 md:min-h-[320px] md:p-7"
              style={{ background: categoryTint[c.id] }}
            >
              <CategoryIcon
                id={c.id}
                className="-mt-1 -ml-1 size-24 transition-transform duration-300 ease-[cubic-bezier(0.2,0,0,1)] group-hover:-translate-y-1 group-hover:-rotate-3 md:size-36"
              />
              <span className="mt-auto pt-4">
                <span className="flex items-center justify-between gap-2 text-[17px] leading-tight font-extrabold tracking-[-0.02em] text-[#1f1a17] md:text-[24px]">
                  {c.name}
                  <ArrowRight
                    className="size-5 shrink-0 transition-transform duration-200 group-hover:translate-x-1 max-md:hidden"
                    aria-hidden
                  />
                </span>
                <span className="mt-1 block text-[13.5px] leading-snug text-[#1f1a17]/70 md:text-[16px]">
                  {c.blurb}
                </span>
              </span>
            </Link>
          </Reveal>
        </li>
      ))}
    </ul>
  );
}
