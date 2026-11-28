"use client";

import Link from "next/link";
import { BadgeCheck, Star } from "lucide-react";
import { AppImage } from "@/components/ui/app-image";
import { Skeleton } from "@/components/ui/skeleton";
import { categories } from "@/config/categories";
import { discountPercent, formatNaira } from "@/domain/money";
import { cn } from "@/lib/cn";
import { useProducts } from "@/queries/catalog";
import { useNearness } from "@/queries/nearby";
import type { CategoryId, ProductQuery, ProductWithBrand } from "@/services/types";
import { CategoryIcon } from "./category-icons";
import { etaText } from "./nearby";
import { QuickAdd } from "./quick-add";

/** Short names that fit under a tile. */
const short: Record<CategoryId, string> = {
  food: "Food",
  fashion: "Fashion",
  beauty: "Beauty",
  tech: "Tech",
  academics: "Academics",
  lifestyle: "Lifestyle",
};

/** The warm colours section labels take, so home isn't all one colour (all pass AA as text). */
export const sectionTone = {
  berry: "#c02655",
  orange: "#b4500a",
  green: "#1e7f46",
  purple: "#6b3fc4",
  sky: "#1f78a8",
} as const;

/** A small coloured label over a bold title, with "See more" in the same colour on the right. */
export function HomeSectionHead({
  eyebrow,
  title,
  href,
  tone = sectionTone.orange,
}: {
  eyebrow?: string;
  title: string;
  href?: string;
  tone?: string;
}) {
  return (
    <div className="mb-3.5 flex items-end justify-between gap-3">
      <div className="min-w-0">
        {eyebrow && (
          <p className="text-[13px] font-semibold" style={{ color: tone }}>
            {eyebrow}
          </p>
        )}
        <h2 className="truncate text-[19px] font-semibold tracking-[-0.02em] md:text-[21px]">
          {title}
        </h2>
      </div>
      {href && (
        <Link
          href={href}
          aria-label={`See more: ${title}`}
          className="shrink-0 pb-0.5 text-[14px] font-semibold hover:underline"
          style={{ color: tone }}
        >
          See more
        </Link>
      )}
    </div>
  );
}

/**
 * The six categories in one row under search: an illustration over a short
 * name, no boxes. Swipes sideways on phones; spreads out on wider screens.
 */
export function CategoryGrid() {
  return (
    <section aria-labelledby="home-categories">
      <h2 id="home-categories" className="sr-only">
        Categories
      </h2>
      <ul className="-mx-(--gutter) scrollbar-none flex snap-x gap-1 overflow-x-auto px-(--gutter) md:mx-0 md:justify-between md:gap-4 md:overflow-visible md:px-0">
        {categories.map((c) => (
          <li key={c.id} className="shrink-0 snap-start">
            <Link
              href={`/explore?category=${c.id}`}
              className="group flex w-[84px] flex-col items-center gap-1.5 rounded-2xl py-1.5 outline-offset-2 md:w-[112px]"
            >
              <span className="grid size-[68px] place-items-center transition-transform duration-200 ease-[cubic-bezier(0.2,0,0,1)] group-hover:-translate-y-0.5 group-active:scale-95 md:size-[76px]">
                <CategoryIcon id={c.id} className="size-full" />
              </span>
              <span className="text-[13.5px] font-semibold tracking-[-0.01em] text-ink md:text-[14.5px]">
                {short[c.id]}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** A product in a sideways row: photo with the shop's logo, price, name, shop, rating and timing. */
function RailCard({ product: p, priority }: { product: ProductWithBrand; priority?: boolean }) {
  const f = p.brand.fulfilment;
  const near = useNearness(f, p.brand.campusId);
  const off = discountPercent(p.priceKobo, p.compareAtKobo);
  const href = `/products/${p.slug}`;
  const way = f?.delivery
    ? f.deliveryFeeKobo
      ? { text: `${formatNaira(f.deliveryFeeKobo)} delivery`, free: false }
      : { text: "Free delivery", free: true }
    : f?.pickup
      ? { text: "Free pickup", free: true }
      : null;
  return (
    <article className="relative w-[156px] md:w-[184px]">
      <div className="relative aspect-square overflow-hidden rounded-xl bg-surface-2 ring-1 ring-line-thin">
        <Link href={href} tabIndex={-1} aria-hidden className="absolute inset-0">
          <AppImage image={p.images[0] ?? null} alt="" priority={priority} sizes="190px" />
        </Link>
        <span className="absolute bottom-2 left-2 size-8 overflow-hidden rounded-full bg-surface ring-2 ring-surface">
          <AppImage image={p.brand.logo} alt="" variant="logo" name={p.brand.name} />
        </span>
        <QuickAdd product={p} className="absolute right-2 bottom-2" />
      </div>
      <p className="mt-2.5 flex flex-wrap items-baseline gap-x-1.5">
        <span
          className={cn(
            "text-[16px] font-semibold tabular md:text-[17px]",
            off ? "text-success" : "text-ink",
          )}
        >
          {formatNaira(p.priceKobo)}
        </span>
        {off && p.compareAtKobo && (
          <span className="inline-flex items-center gap-1 text-[12px]">
            <s className="text-muted tabular">{formatNaira(p.compareAtKobo)}</s>
            <span className="rounded-full bg-success px-1.5 py-px text-[11px] font-semibold text-white">
              −{off}%
            </span>
          </span>
        )}
      </p>
      <h3 className="mt-0.5 line-clamp-2 text-[14.5px] leading-snug">
        <Link href={href} className="hover:text-accent-ink">
          {p.name}
        </Link>
      </h3>
      <p className="mt-1 flex items-center gap-1 truncate text-[13px] text-muted">
        <span className="truncate">{p.brand.name}</span>
        {p.brand.verified && (
          <BadgeCheck className="size-3.5 shrink-0 text-verified" aria-label="Verified shop" />
        )}
      </p>
      <p className="mt-0.5 flex items-center gap-1 text-[13px] text-muted">
        {p.ratingCount > 0 ? (
          <>
            <Star className="size-3.5 fill-[#f59e0b] text-[#f59e0b]" aria-hidden />
            <span className="font-medium text-ink tabular">{p.rating.toFixed(1)}</span>
            <span className="tabular">({p.ratingCount})</span>
          </>
        ) : (
          "New"
        )}
      </p>
      {(near.etaMin !== null || way) && (
        <p className="mt-0.5 truncate text-[13px] text-muted">
          {near.etaMin !== null &&
            etaText(near.etaMin, !!f?.delivery).replace(/^(Arrives|Yours) /, "")}
          {near.etaMin !== null && way && " · "}
          {way && <span className={cn(way.free && "font-medium text-success")}>{way.text}</span>}
        </p>
      )}
    </article>
  );
}

function RailCardSkeleton() {
  return (
    <div className="w-[156px] md:w-[184px]" aria-hidden>
      <Skeleton className="aspect-square w-full" rounded="lg" />
      <Skeleton className="mt-2.5 h-4 w-20" />
      <Skeleton className="mt-1.5 h-4 w-[85%]" />
      <Skeleton className="mt-1.5 h-3 w-24" />
    </div>
  );
}

/** A titled row of products that scrolls sideways. Hidden when there's nothing in it. */
export function ProductRail({
  eyebrow,
  tone,
  title,
  query,
  href,
  skip = [],
  keep,
}: {
  eyebrow?: string;
  tone?: string;
  title: string;
  query: ProductQuery;
  href: string;
  /** Products already shown above, so the same ones don't appear twice. */
  skip?: string[];
  /** Only show products that pass this (e.g. from your faculty). */
  keep?: (p: ProductWithBrand) => boolean;
}) {
  const { data } = useProducts(query);
  const items = data?.items.filter((p) => !skip.includes(p.id) && (!keep || keep(p))).slice(0, 12);
  if (items && items.length === 0) return null;
  return (
    <section className="border-t border-line-thin pt-5 md:pt-6">
      <HomeSectionHead eyebrow={eyebrow} title={title} href={href} tone={tone} />
      <ul className="-mx-(--gutter) scrollbar-none flex snap-x scroll-px-(--gutter) gap-3.5 overflow-x-auto px-(--gutter) pb-1 md:mx-0 md:scroll-px-0 md:gap-4 md:px-0">
        {items
          ? items.map((p, i) => (
              <li key={p.id} className="shrink-0 snap-start">
                <RailCard product={p} priority={i < 2} />
              </li>
            ))
          : Array.from({ length: 5 }, (_, i) => (
              <li key={i} className="shrink-0">
                <RailCardSkeleton />
              </li>
            ))}
      </ul>
    </section>
  );
}
