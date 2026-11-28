"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo, useTransition } from "react";
import { isSubcategoryOf, toCategoryId } from "@/config/categories";
import type { CategoryId, ProductQuery, SortKey } from "@/services/types";

export type ExploreParams = {
  q: string;
  category: CategoryId | "all";
  /** A sub-category inside `category`, e.g. "drinks"; null for all of it. */
  sub: string | null;
  sort: SortKey;
  min: number | null; // naira
  max: number | null; // naira
  campus: string | null;
  zone: string | null;
  rating: number | null;
  stock: boolean;
  /** Only marked-down items. */
  sale: boolean;
  /** Only shops within walking distance of you. */
  walk: boolean;
};

const SORTS: SortKey[] = [
  "relevance",
  "nearest",
  "popular",
  "newest",
  "price_asc",
  "price_desc",
  "rating",
];

export const sortLabels: Record<SortKey, string> = {
  relevance: "Best match",
  nearest: "Closest to you",
  popular: "Popular",
  newest: "Newest",
  price_asc: "Price: low to high",
  price_desc: "Price: high to low",
  rating: "Top rated",
};

function num(v: string | null) {
  if (!v) return null;
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? Math.round(n) : null;
}

export function parseExplore(sp: URLSearchParams): ExploreParams {
  const cat = sp.get("category");
  const sort = sp.get("sort") as SortKey | null;
  const q = sp.get("q")?.trim() ?? "";
  return {
    q,
    // Old links (thrift, books…) open the category those items moved to.
    category: toCategoryId(cat) ?? "all",
    sub: (() => {
      const c = toCategoryId(cat);
      const s = sp.get("sub");
      // An old "thrift" link opens Fashion with Thrift picked.
      const fromLegacy = cat === "thrift" ? "thrift" : cat === "books" ? "textbooks" : null;
      const pick = s ?? fromLegacy;
      return c && isSubcategoryOf(c, pick) ? pick : null;
    })(),
    sort: sort && SORTS.includes(sort) ? sort : q ? "relevance" : "popular",
    min: num(sp.get("min")),
    max: num(sp.get("max")),
    campus: sp.get("campus") || null,
    zone: sp.get("zone") || null,
    rating: num(sp.get("rating")),
    stock: sp.get("stock") === "1",
    sale: sp.get("sale") === "1",
    walk: sp.get("walk") === "1",
  };
}

export function toQuery(p: ExploreParams): Omit<ProductQuery, "page"> {
  return {
    ...(p.q ? { q: p.q } : {}),
    ...(p.category !== "all" ? { category: p.category } : {}),
    ...(p.category !== "all" && p.sub ? { subcategory: p.sub } : {}),
    sort: p.sort,
    ...(p.min !== null ? { minPriceKobo: p.min * 100 } : {}),
    ...(p.max !== null ? { maxPriceKobo: p.max * 100 } : {}),
    ...(p.campus ? { campusId: p.campus } : {}),
    ...(p.zone ? { zoneId: p.zone } : {}),
    ...(p.rating ? { minRating: p.rating } : {}),
    ...(p.stock ? { inStock: true } : {}),
    ...(p.sale ? { onSale: true } : {}),
    ...(p.walk ? { walking: true } : {}),
    pageSize: 24,
  };
}

export function activeFilterCount(p: ExploreParams) {
  return [
    p.min !== null || p.max !== null,
    !!p.campus,
    !!p.zone,
    !!p.rating,
    p.stock,
    p.sale,
    p.walk,
  ].filter(Boolean).length;
}

/** Filters live in the URL so results are shareable and survive refresh/back. */
export function useExploreParams() {
  const sp = useSearchParams();
  const router = useRouter();
  const pathname = usePathname() ?? "/explore";
  const [pending, startTransition] = useTransition();
  const params = useMemo(() => parseExplore(new URLSearchParams(sp.toString())), [sp]);

  const update = useCallback(
    (patch: Partial<ExploreParams>) => {
      const next = { ...params, ...patch };
      // A new category starts on "All" of it.
      if (
        patch.category !== undefined &&
        patch.category !== params.category &&
        patch.sub === undefined
      )
        next.sub = null;
      if (patch.campus !== undefined && patch.campus !== params.campus) next.zone = null;
      const out = new URLSearchParams();
      if (next.q) out.set("q", next.q);
      if (next.category !== "all") out.set("category", next.category);
      if (next.category !== "all" && next.sub) out.set("sub", next.sub);
      const defaultSort = next.q ? "relevance" : "popular";
      if (next.sort !== defaultSort) out.set("sort", next.sort);
      if (next.min !== null) out.set("min", String(next.min));
      if (next.max !== null) out.set("max", String(next.max));
      if (next.campus) out.set("campus", next.campus);
      if (next.zone) out.set("zone", next.zone);
      if (next.rating) out.set("rating", String(next.rating));
      if (next.stock) out.set("stock", "1");
      if (next.sale) out.set("sale", "1");
      if (next.walk) out.set("walk", "1");
      const qs = out.toString();
      startTransition(() => router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false }));
    },
    [params, pathname, router],
  );

  const clearFilters = useCallback(
    () =>
      update({
        min: null,
        max: null,
        campus: null,
        zone: null,
        rating: null,
        stock: false,
        sale: false,
        walk: false,
      }),
    [update],
  );

  return { params, update, clearFilters, pending };
}
