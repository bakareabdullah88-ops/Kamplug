"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { BadgeCheck, Star } from "lucide-react";
import { AppImage } from "@/components/ui/app-image";
import { Skeleton } from "@/components/ui/skeleton";
import { categories, categoryName } from "@/config/categories";
import { discountPercent, formatNaira } from "@/domain/money";
import { cn } from "@/lib/cn";
import { categoryWord, paletteFor, posterPalettes, type PosterPalette } from "@/lib/poster";
import { useProducts } from "@/queries/catalog";
import { useNearness } from "@/queries/nearby";
import type { CategoryId, ImageRef, ProductQuery, ProductWithBrand } from "@/services/types";
import { CategoryArt } from "./category-art";
import { etaText } from "./nearby";
import { QuickAdd } from "./quick-add";

const palette = (id: string): PosterPalette =>
  posterPalettes.find((p) => p.id === id) ?? posterPalettes[0]!;

/** Short names that fit under a tile. */
const short: Record<CategoryId, string> = {
  fashion: "Fashion",
  thrift: "Thrift",
  food: "Food",
  beauty: "Beauty",
  accessories: "Extras",
  print: "Print",
  tech: "Tech",
  books: "Books",
};

/** A small grey line over a bold title, with "See more" on the right. */
export function HomeSectionHead({
  eyebrow,
  title,
  href,
}: {
  eyebrow?: string;
  title: string;
  href?: string;
}) {
  return (
    <div className="mb-3.5 flex items-end justify-between gap-3">
      <div className="min-w-0">
        {eyebrow && <p className="text-[13px] text-muted">{eyebrow}</p>}
        <h2 className="truncate text-[19px] font-semibold tracking-[-0.02em] md:text-[21px]">
          {title}
        </h2>
      </div>
      {href && (
        <Link
          href={href}
          aria-label={`See more: ${title}`}
          className="shrink-0 pb-0.5 text-[14px] font-semibold text-accent-ink hover:underline"
        >
          See more
        </Link>
      )}
    </div>
  );
}

/** Every category as a square tile: the drawing on top, the name under it. Two rows of four on phones. */
export function CategoryGrid() {
  return (
    <section aria-labelledby="home-categories">
      <h2 id="home-categories" className="sr-only">
        Categories
      </h2>
      <ul className="grid grid-cols-4 gap-2.5 md:grid-cols-8 md:gap-3">
        {categories.map((c) => (
          <li key={c.id}>
            <Link
              href={`/explore?category=${c.id}`}
              className="flex aspect-square flex-col items-center justify-center gap-1.5 overflow-hidden rounded-2xl bg-ink/[0.05] px-1 transition-colors hover:bg-ink/[0.08] md:aspect-auto md:h-[112px]"
            >
              <CategoryArt id={c.id} centered still className="h-[56%] w-full" />
              <span className="truncate text-[12px] font-medium md:text-[13px]">{short[c.id]}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

type Banner = {
  key: string;
  palette: PosterPalette;
  eyebrow: string;
  lead?: string;
  big: string;
  tail?: string;
  word: string;
  href: string;
  label: string;
  image: ImageRef | undefined;
};

/** Up to four posters built from what's really on sale today; none when there's nothing to say. */
function useBanners(pool: ProductWithBrand[] | undefined): Banner[] {
  return useMemo(() => {
    if (!pool?.length) return [];
    const out: Banner[] = [];
    const sale = pool
      .map((p) => ({ p, off: discountPercent(p.priceKobo, p.compareAtKobo) ?? 0 }))
      .filter((x) => x.off > 0)
      .sort((a, b) => b.off - a.off);
    if (sale[0]) {
      out.push({
        key: "sale",
        palette: palette("tomato"),
        eyebrow: `${sale.length} ${sale.length === 1 ? "item" : "items"} marked down`,
        lead: "up to",
        big: `${sale[0].off}%`,
        tail: "off",
        word: "DEALS",
        href: "/explore?sale=1",
        label: `Deals: up to ${sale[0].off}% off`,
        image: sale[0].p.images[0],
      });
    }
    const cheapFood = pool
      .filter((p) => p.category === "food" && p.priceKobo <= 200_000)
      .sort((a, b) => a.priceKobo - b.priceKobo);
    if (cheapFood[0]) {
      out.push({
        key: "cheap-food",
        palette: palette("mint"),
        eyebrow: "Food on a budget",
        lead: "under",
        big: "₦2k",
        word: "CHOP",
        href: "/explore?category=food&max=2000&sort=price_asc",
        label: "Food under ₦2,000",
        image: cheapFood[0].images[0],
      });
    }
    // Then the busiest categories.
    const byCat = new Map<CategoryId, ProductWithBrand[]>();
    for (const p of pool) byCat.set(p.category, [...(byCat.get(p.category) ?? []), p]);
    const top = [...byCat.entries()]
      .filter(([c]) => !(c === "food" && cheapFood[0]))
      .sort((a, b) => b[1].length - a[1].length);
    for (const [c, items] of top) {
      if (out.length >= 4) break;
      const shops = new Set(items.map((p) => p.brandId)).size;
      out.push({
        key: c,
        palette: paletteFor(c),
        eyebrow: `${shops} ${shops === 1 ? "shop" : "shops"} selling`,
        big: categoryName(c),
        word: categoryWord[c],
        href: `/explore?category=${c}`,
        label: `${categoryName(c)}: ${items.length} items`,
        image: items[0]?.images[0],
      });
    }
    return out;
  }, [pool]);
}

/** Wide poster banners that swipe sideways, with dots under them. */
export function DealBanners({ pool }: { pool: ProductWithBrand[] | undefined }) {
  const banners = useBanners(pool);
  const ref = useRef<HTMLUListElement>(null);
  const [at, setAt] = useState(0);
  if (!banners.length) return null;
  const onScroll = () => {
    const el = ref.current;
    const first = el?.firstElementChild as HTMLElement | null;
    if (!el || !first) return;
    setAt(Math.round(el.scrollLeft / (first.offsetWidth + 12)));
  };
  return (
    <section aria-label="Deals and picks">
      <ul
        ref={ref}
        onScroll={onScroll}
        className="-mx-(--gutter) scrollbar-none flex snap-x snap-mandatory scroll-px-(--gutter) gap-3 overflow-x-auto px-(--gutter) md:mx-0 md:scroll-px-0 md:px-0"
      >
        {banners.map((b) => (
          <li key={b.key} className="w-[88%] shrink-0 snap-start sm:w-[420px] lg:w-[460px]">
            <Link
              href={b.href}
              aria-label={b.label}
              className="relative flex h-[168px] overflow-hidden rounded-2xl sm:h-[190px]"
              style={{ background: b.palette.bg, color: b.palette.ink }}
            >
              <span
                aria-hidden
                className="pointer-events-none absolute -right-3 -bottom-2 text-right font-display text-[58px] leading-[0.82] font-extrabold tracking-[-0.03em] whitespace-nowrap uppercase opacity-[0.12] select-none"
              >
                {b.word}
                <br />
                {b.word}
                <br />
                {b.word}
              </span>
              <span className="relative z-10 flex min-w-0 flex-1 flex-col justify-center px-5">
                <span className="text-[12.5px] font-semibold opacity-85">{b.eyebrow}</span>
                {b.lead && (
                  <span className="mt-1 text-[14px] leading-none font-bold">{b.lead}</span>
                )}
                <span className="font-display text-[length:clamp(34px,9vw,46px)] leading-[0.95] font-extrabold tracking-[-0.04em]">
                  {b.big}
                </span>
                {b.tail && (
                  <span className="text-[18px] leading-none font-extrabold">{b.tail}</span>
                )}
              </span>
              <span className="relative z-10 my-4 mr-4 aspect-square shrink-0 self-center overflow-hidden rounded-full ring-4 ring-white/20">
                <span className="block size-[108px] sm:size-[132px]">
                  <AppImage image={b.image ?? null} alt="" sizes="150px" />
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
      {banners.length > 1 && (
        <div className="mt-2.5 flex justify-center gap-1.5 md:hidden" aria-hidden>
          {banners.map((b, i) => (
            <span
              key={b.key}
              className={cn(
                "h-1.5 rounded-full transition-[width,background-color]",
                i === at ? "w-4 bg-ink" : "w-1.5 bg-line-strong",
              )}
            />
          ))}
        </div>
      )}
    </section>
  );
}

type Tile = {
  key: string;
  p: PosterPalette;
  top: string;
  big: string;
  href: string;
  label: string;
  image: ImageRef | undefined;
};

/**
 * Tall poster tiles (a line of text, a big figure, a photo at the bottom) for
 * quick ways in: cheap eats, deals, top rated, a short walk. Each one only
 * shows when there are real items behind it.
 */
export function PosterTiles({
  pool,
  located,
}: {
  pool: ProductWithBrand[] | undefined;
  located: boolean;
}) {
  const tiles = useMemo(() => {
    if (!pool?.length) return [];
    const out: Tile[] = [];
    const cheap = pool
      .filter((x) => x.priceKobo <= 250_000)
      .sort((a, b) => a.priceKobo - b.priceKobo);
    if (cheap[0])
      out.push({
        key: "cheap",
        p: palette("tomato"),
        top: "under",
        big: "₦2.5k",
        href: "/explore?max=2500&sort=price_asc",
        label: "Under ₦2,500",
        image: cheap[0].images[0],
      });
    const sale = pool.filter((x) => (discountPercent(x.priceKobo, x.compareAtKobo) ?? 0) > 0);
    if (sale[0])
      out.push({
        key: "sale",
        p: palette("butter"),
        top: "marked",
        big: "down",
        href: "/explore?sale=1",
        label: "On sale",
        image: sale[0].images[0],
      });
    const rated = pool
      .filter((x) => x.ratingCount > 0 && x.rating >= 4.5)
      .sort((a, b) => b.ratingCount - a.ratingCount);
    if (rated[0])
      out.push({
        key: "rated",
        p: palette("night"),
        top: "rated",
        big: "4.5★",
        href: "/explore?rating=4&sort=rating",
        label: "Top rated",
        image: rated[0].images[0],
      });
    if (located)
      out.push({
        key: "walk",
        p: palette("mint"),
        top: "a short",
        big: "walk",
        href: "/explore?walk=1&sort=nearest",
        label: "Within walking distance",
        image: pool[0]?.images[0],
      });
    return out;
  }, [pool, located]);
  if (tiles.length < 2) return null;
  return (
    <section aria-label="Quick picks">
      <ul className="-mx-(--gutter) scrollbar-none flex snap-x gap-3 overflow-x-auto px-(--gutter) md:mx-0 md:px-0">
        {tiles.map((t) => (
          <li key={t.key} className="shrink-0 snap-start">
            <Link
              href={t.href}
              aria-label={t.label}
              className="relative flex h-[176px] w-[136px] flex-col overflow-hidden rounded-2xl md:h-[196px] md:w-[152px]"
              style={{ background: t.p.bg, color: t.p.ink }}
            >
              <span className="px-3 pt-3 text-center text-[14px] leading-none font-bold">
                {t.top}
              </span>
              <span className="px-2 text-center font-display text-[34px] leading-[0.95] font-extrabold tracking-[-0.04em] md:text-[38px]">
                {t.big}
              </span>
              <span className="absolute -bottom-6 left-1/2 size-[112px] -translate-x-1/2 overflow-hidden rounded-full ring-4 ring-white/25 md:size-[124px]">
                <AppImage image={t.image ?? null} alt="" sizes="130px" />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** A coupon-style ticket: notches cut into both sides. */
const ticket = {
  WebkitMask:
    "radial-gradient(circle at 0 50%, transparent 7px, #000 7.5px) left / 51% 100% no-repeat, radial-gradient(circle at 100% 50%, transparent 7px, #000 7.5px) right / 51% 100% no-repeat",
  mask: "radial-gradient(circle at 0 50%, transparent 7px, #000 7.5px) left / 51% 100% no-repeat, radial-gradient(circle at 100% 50%, transparent 7px, #000 7.5px) right / 51% 100% no-repeat",
};

/** "Shopping on a budget?": ticket-shaped price caps that open Discover filtered to them. */
export function BudgetTickets({ pool }: { pool: ProductWithBrand[] | undefined }) {
  const caps = useMemo(() => {
    if (!pool?.length) return [];
    const out: { naira: number; n: number }[] = [];
    for (const naira of [500, 1000, 2000, 5000, 10000]) {
      const n = pool.filter((x) => x.priceKobo <= naira * 100).length;
      if (n > 0 && n !== out[out.length - 1]?.n) out.push({ naira, n });
    }
    return out;
  }, [pool]);
  if (caps.length < 2) return null;
  return (
    <section aria-labelledby="home-budget">
      <h2
        id="home-budget"
        className="mb-3.5 text-[19px] font-semibold tracking-[-0.02em] md:text-[21px]"
      >
        Shopping on a budget?
      </h2>
      <ul className="-mx-(--gutter) scrollbar-none flex snap-x scroll-px-(--gutter) gap-3 overflow-x-auto px-(--gutter) md:mx-0 md:scroll-px-0 md:px-0">
        {caps.map((c, i) => (
          <li key={c.naira} className="shrink-0 snap-start">
            <Link
              href={`/explore?max=${c.naira}&sort=price_asc`}
              aria-label={`Under ${formatNaira(c.naira * 100)}: ${c.n} items`}
              className="flex h-[76px] w-[118px] flex-col items-center justify-center rounded-xl text-white transition-opacity hover:opacity-90"
              style={{ ...ticket, background: i === 0 ? "#17754c" : "#c81e16" }}
            >
              <span className="text-[12.5px] leading-none font-semibold opacity-90">under</span>
              <span className="font-display text-[30px] leading-none font-extrabold tracking-[-0.04em]">
                {c.naira >= 1000 ? `₦${c.naira / 1000}k` : `₦${c.naira}`}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

/**
 * "Categories": colour cards two to a row, the name top-left and a real photo
 * from that category in the corner (or its drawing when there's no photo yet).
 */
export function CategoryCards({ pool }: { pool: ProductWithBrand[] | undefined }) {
  const photo = useMemo(() => {
    const m = new Map<CategoryId, ImageRef>();
    for (const p of pool ?? [])
      if (p.images[0] && !m.has(p.category)) m.set(p.category, p.images[0]);
    return m;
  }, [pool]);
  return (
    <section aria-labelledby="home-category-cards">
      <h2
        id="home-category-cards"
        className="mb-3.5 text-[19px] font-semibold tracking-[-0.02em] md:text-[21px]"
      >
        Categories
      </h2>
      <ul className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {categories.map((c) => {
          const pal = paletteFor(c.id);
          const img = photo.get(c.id);
          return (
            <li key={c.id}>
              <Link
                href={`/explore?category=${c.id}`}
                className="relative block h-[96px] overflow-hidden rounded-2xl md:h-[112px]"
                style={{ background: pal.bg, color: pal.ink }}
              >
                <span className="relative z-10 block px-3.5 pt-3 text-[16px] leading-tight font-bold md:text-[17px]">
                  {categoryName(c.id)}
                </span>
                {img ? (
                  <span className="absolute -right-4 -bottom-5 size-[92px] overflow-hidden rounded-full ring-4 ring-white/20 md:size-[104px]">
                    <AppImage image={img} alt="" sizes="110px" />
                  </span>
                ) : (
                  <CategoryArt
                    id={c.id}
                    centered
                    still
                    className="absolute -right-1 -bottom-1 h-[74%] w-[52%]"
                  />
                )}
              </Link>
            </li>
          );
        })}
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
          <BadgeCheck className="size-3.5 shrink-0 text-accent" aria-label="Verified shop" />
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
  title,
  query,
  href,
  skip = [],
  keep,
}: {
  eyebrow?: string;
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
      <HomeSectionHead eyebrow={eyebrow} title={title} href={href} />
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
