"use client";

import Link from "next/link";
import {
  ArrowRight,
  Bike,
  ChevronRight,
  Gauge,
  MapPin,
  Search,
  SlidersHorizontal,
  Store,
} from "lucide-react";
import { pagePad } from "@/components/app/layout";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { Switch } from "@/components/ui/controls";
import { ResponsiveSheet } from "@/components/ui/sheet";
import { WALKING_MINUTES, arrivalMinutes, compareNearness, nearness } from "@/domain/distance";
import { formatNaira } from "@/domain/money";
import { isActive, statusLabel } from "@/domain/orders";
import { cn } from "@/lib/cn";
import { useBrands, useCampus, useCampuses, useProducts } from "@/queries/catalog";
import { useBuyerSpot, useNearQuery } from "@/queries/nearby";
import { useMyOrders } from "@/queries/orders";
import { useSession } from "@/queries/session";
import type { Brand, Order, ProductQuery, ProductWithBrand, SortKey } from "@/services/types";
import { useHomeFilters, type HomeSort } from "@/stores/home-filters";
import { useUi } from "@/stores/ui";
import { AddressMenu } from "./address-menu";
import { StoreCard, StoreCardSkeleton } from "./store-card";
import { CategoryGrid, HomeSectionHead, ProductRail, sectionTone } from "./home-sections";

/** Search everywhere; the round button beside it sorts and filters this feed in place. */
function SearchBar({ onFilters, active }: { onFilters: () => void; active: number }) {
  const setCommandOpen = useUi((s) => s.setCommandOpen);
  return (
    <div className="relative flex h-13 w-full items-center rounded-2xl bg-ink/[0.05] transition-colors focus-within:bg-ink/[0.07] hover:bg-ink/[0.07]">
      <button
        type="button"
        onClick={() => setCommandOpen(true)}
        className="flex h-full min-w-0 flex-1 items-center gap-3 rounded-2xl pr-2 pl-4 text-left text-[15px] text-muted"
      >
        <Search className="size-5 shrink-0 text-accent" aria-hidden />
        <span className="truncate">What do you need today?</span>
      </button>
      <button
        type="button"
        onClick={onFilters}
        aria-label={active ? `Sort and filter (${active} on)` : "Sort and filter"}
        aria-haspopup="dialog"
        className="relative mr-1.5 grid size-10 shrink-0 place-items-center rounded-xl text-ink transition-colors hover:bg-ink/[0.06]"
      >
        <SlidersHorizontal className="size-5" aria-hidden />
        {active > 0 && (
          <span className="absolute top-0.5 right-0.5 grid size-4.5 place-items-center rounded-full bg-accent text-[10.5px] font-bold text-on-accent tabular">
            {active}
          </span>
        )}
      </button>
    </div>
  );
}

/**
 * The top of home: where you're getting things to (a menu in place), a
 * dashboard link on big screens, and search.
 */
function HomeHeader({
  spotName,
  onFilters,
  activeFilters,
}: {
  spotName: string | undefined;
  onFilters: () => void;
  activeFilters: number;
}) {
  return (
    <section className="flex flex-col gap-3.5">
      <div className="flex items-center justify-between gap-3">
        <AddressMenu label={spotName} />
        <Link
          href="/account"
          className="hidden h-10 shrink-0 items-center gap-2 rounded-full bg-surface px-4 text-[14px] font-semibold ring-1 ring-line transition-colors hover:bg-surface-2 md:inline-flex"
        >
          <Gauge className="size-4" aria-hidden /> Your dashboard
        </Link>
      </div>
      <h1 className="sr-only">Kamplug home</h1>
      <SearchBar onFilters={onFilters} active={activeFilters} />
    </section>
  );
}

/** A slim strip for the order you're waiting on. */
function OnTheWay({ order }: { order: Order }) {
  return (
    <Link
      href={`/orders/${order.id}`}
      className="group flex items-center gap-3 border-y border-line-thin py-3.5"
    >
      <span className="grid size-11 shrink-0 place-items-center rounded-full bg-brand text-white">
        <Bike className="size-5" aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[13px] text-ink-2">
          Your order from {order.brandName} · {formatNaira(order.totalKobo)}
        </span>
        <span className="block text-[16px] font-semibold text-accent-ink">
          {statusLabel(order.status, order.fulfilment.method)}
        </span>
      </span>
      <span className="inline-flex items-center gap-1 text-[14px] font-semibold text-accent-ink">
        Track <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}

/**
 * The campus's shops, ranked two ways: the most popular few for the featured
 * row near the top, and the rest in the chosen order for "More stores".
 * Only real numbers decide the order (followers, ratings, distance, age).
 */
function useRankedStores(campusId: string | undefined, view: HomeView) {
  const local = useBrands(campusId ? { campusId } : {}).data;
  const everywhere = useBrands({ limit: 24 }).data;
  const campuses = useCampuses().data;
  // Your campus first; if it has no shops yet, shops from everywhere.
  const pool = local && local.length > 0 ? local : everywhere;
  return useMemo(() => {
    if (!pool) return undefined;
    const rows = pool
      .filter((b) => !b.vacation)
      .map((b) => {
        const campus = campuses?.find((c) => c.id === b.campusId);
        const n = nearness(b.fulfilment, campus, view.buyer);
        return { b, n: { ...n, etaMin: arrivalMinutes(b.fulfilment, n) } };
      });
    const shown = view.walking ? rows.filter((r) => r.n.walking) : rows;
    const score = (b: Brand) => b.followerCount + b.ratingCount * 3 + b.rating;
    // Up to six featured, always leaving a few for "More stores" once there are four or more.
    const n = shown.length;
    const featuredCount = n < 3 ? 0 : n === 3 ? 3 : Math.min(6, Math.max(3, n - 3));
    const featured = [...shown].sort((x, y) => score(y.b) - score(x.b)).slice(0, featuredCount);
    const by: Record<HomeSort, (x: (typeof rows)[number], y: (typeof rows)[number]) => number> = {
      nearest: (x, y) => compareNearness(x.n, y.n) || y.b.followerCount - x.b.followerCount,
      popular: (x, y) => score(y.b) - score(x.b),
      rating: (x, y) => y.b.rating - x.b.rating || y.b.ratingCount - x.b.ratingCount,
      newest: (x, y) => Date.parse(y.b.createdAt) - Date.parse(x.b.createdAt),
    };
    const featuredIds = new Set(featured.map((r) => r.b.id));
    const rest = shown.filter((r) => !featuredIds.has(r.b.id)).sort(by[view.sort]);
    return { featured, rest, total: shown.length };
  }, [pool, campuses, view.buyer, view.walking, view.sort]);
}

type RankedStores = NonNullable<ReturnType<typeof useRankedStores>>;

/** The most popular stores as large cards that swipe sideways. */
function FeaturedStores({ stores }: { stores: RankedStores | undefined }) {
  if (stores && stores.featured.length === 0) return null;
  return (
    <section>
      <HomeSectionHead
        eyebrow="Most loved on campus"
        title="Popular stores"
        href="/explore"
        tone={sectionTone.berry}
      />
      <ul className="-mx-(--gutter) scrollbar-none flex snap-x snap-mandatory scroll-px-(--gutter) gap-4 overflow-x-auto px-(--gutter) pb-1 md:mx-0 md:scroll-px-0 md:px-0 lg:gap-5">
        {stores
          ? stores.featured.map(({ b, n }, i) => (
              <li
                key={b.id}
                className="w-[85vw] max-w-[380px] shrink-0 snap-start sm:w-[360px] lg:w-[calc((100%-2.5rem)/3)] lg:max-w-none"
              >
                <StoreCard brand={b} near={n} priority={i < 2} />
              </li>
            ))
          : Array.from({ length: 3 }, (_, i) => (
              <li
                key={i}
                className="w-[85vw] max-w-[380px] shrink-0 sm:w-[360px] lg:w-[calc((100%-2.5rem)/3)] lg:max-w-none"
              >
                <StoreCardSkeleton />
              </li>
            ))}
      </ul>
    </section>
  );
}

const restTitles: Record<HomeSort, string> = {
  nearest: "Nearest first",
  popular: "Most popular first",
  rating: "Top rated first",
  newest: "Newest first",
};

/** Every other store, the same size as the featured ones, in a grid. */
function MoreStores({
  stores,
  view,
  onFilters,
}: {
  stores: RankedStores | undefined;
  view: HomeView;
  onFilters: () => void;
}) {
  if (!stores) return null;
  if (stores.total === 0 && view.walking)
    return (
      <section className="flex flex-col items-start gap-3 border-y border-line-thin py-6">
        <p className="text-[15px]">No shops within a short walk of {view.buyer.label} yet.</p>
        <Button variant="secondary" size="sm" onClick={onFilters}>
          Change filters
        </Button>
      </section>
    );
  if (stores.rest.length === 0) return null;
  return (
    <section className="border-t border-line-thin pt-6">
      <HomeSectionHead
        eyebrow={
          view.located ? `${restTitles[view.sort]} from ${view.buyer.label}` : restTitles[view.sort]
        }
        title={stores.featured.length ? "More stores" : "Stores on campus"}
        tone={sectionTone.sky}
        href="/explore"
      />
      <ul className="grid grid-cols-1 gap-x-5 gap-y-7 sm:grid-cols-2 lg:grid-cols-3">
        {stores.rest.map(({ b, n }) => (
          <li key={b.id}>
            <StoreCard brand={b} near={n} />
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Sort and narrow the home feed without leaving it. */
function FilterSheet({
  open,
  onOpenChange,
  view,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  view: HomeView;
}) {
  const options: { id: HomeSort; label: string }[] = [
    { id: "nearest", label: "Closest to you" },
    { id: "popular", label: "Popular" },
    { id: "rating", label: "Top rated" },
    { id: "newest", label: "Newest" },
  ];
  return (
    <ResponsiveSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Sort and filter"
      footer={
        <div className="flex gap-2">
          <Button
            variant="secondary"
            className="flex-1"
            onClick={view.reset}
            disabled={view.active === 0}
          >
            Reset
          </Button>
          <Button className="flex-[2]" onClick={() => onOpenChange(false)}>
            Show results
          </Button>
        </div>
      }
    >
      <div className="flex flex-col divide-y divide-line-thin">
        <div className="pb-5">
          <p className="mb-1 text-[13px] text-muted">Measuring from</p>
          <Link
            href="/account/places"
            onClick={() => onOpenChange(false)}
            className="inline-flex items-center gap-1.5 text-[16px] font-semibold hover:underline"
          >
            <MapPin className="size-4 text-accent" aria-hidden />
            {view.buyer.label ?? "Set where you are"}
            <span className="text-[14px] font-medium text-accent-ink">· Change</span>
          </Link>
        </div>
        <fieldset className="py-5">
          <legend className="mb-3 eyebrow text-muted">Sort by</legend>
          <div className="flex flex-wrap gap-2">
            {options.map((o) => (
              <Chip
                key={o.id}
                selected={view.sort === o.id}
                disabled={o.id === "nearest" && !view.located}
                onClick={() => view.set({ sort: o.id })}
              >
                {o.label}
              </Chip>
            ))}
          </div>
          {!view.located && (
            <p className="mt-2 text-[13px] text-muted">Set your spot to sort by distance.</p>
          )}
        </fieldset>
        <div className="pt-5">
          <Switch
            checked={view.walking}
            disabled={!view.located}
            onCheckedChange={(walking) => view.set({ walking })}
            label="Walking distance"
            description={
              view.located
                ? `Only shops about ${WALKING_MINUTES} minutes or less on foot from ${view.buyer.label}.`
                : "Set your spot first."
            }
          />
        </div>
      </div>
    </ResponsiveSheet>
  );
}

type HomeView = ReturnType<typeof useHomeView>;

function useHomeView() {
  const buyer = useBuyerSpot();
  const { sort: picked, walking, set, reset } = useHomeFilters();
  const located = buyer.onMap;
  const fallback: HomeSort = located ? "nearest" : "popular";
  const sort: HomeSort = picked === "nearest" && !located ? "popular" : (picked ?? fallback);
  const walk = walking && located;
  return {
    buyer,
    located,
    sort,
    walking: walk,
    set,
    reset,
    /** Filters that differ from the default, for the badge on the button. */
    active: Number(sort !== fallback) + Number(walk),
  };
}

/** Nothing on Kamplug yet: say so plainly and offer to be first. */
function EmptyMarket() {
  return (
    <section className="flex flex-col items-center gap-3 border-t border-line-thin py-12 text-center">
      <span className="grid size-12 place-items-center rounded-full bg-accent-soft text-accent-ink">
        <Store className="size-6" />
      </span>
      <h2 className="text-[18px] font-semibold">No shops here yet</h2>
      <p className="max-w-sm text-small text-muted">
        Be the first plug on your campus. Opening a shop takes a few minutes.
      </p>
      <Link
        href="/open-shop"
        className="mt-1 inline-flex h-10 items-center rounded-full bg-accent px-5 text-[14px] font-semibold text-on-accent hover:bg-accent-hover"
      >
        Open a shop
      </Link>
    </section>
  );
}

/**
 * The buyer's home is the market: search, categories, shops and what's popular,
 * like opening a delivery app. Spending and to-dos live on the dashboard.
 */
export function DiscoverHome() {
  const { user } = useSession();
  const campus = useCampus(user?.campusId);
  const orders = useMyOrders().data;
  const anyProducts = useProducts({ pageSize: 1 }).data;
  const view = useHomeView();
  const near = useNearQuery();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const openFilters = () => setFiltersOpen(true);
  const onTheWay = (orders ?? [])
    .filter((o) => isActive(o.status))
    .sort((a, b) => Date.parse(b.placedAt) - Date.parse(a.placedAt))[0];
  const empty = anyProducts && anyProducts.items.length === 0;
  const spotCampus = useCampus(view.buyer.campusId);
  const spotName = view.buyer.label
    ? `${view.buyer.label}${spotCampus ? `, ${spotCampus.shortName}` : ""}`
    : campus?.name;
  const stores = useRankedStores(user?.campusId ?? undefined, view);

  // The feed follows the chosen sort; walking distance narrows every section.
  const base: ProductQuery = {
    pageSize: 12,
    inStock: true,
    ...(near ? { near } : {}),
    ...(view.walking ? { walking: true } : {}),
  };
  // The first row follows the chosen sort; "nearest" reads as popular nearby.
  const firstSort: SortKey =
    view.sort === "newest" ? "newest" : view.sort === "rating" ? "rating" : "popular";
  const first = { ...base, sort: firstSort };
  const secondSort: SortKey = firstSort === "newest" ? "popular" : "newest";
  const firstTitle: Record<string, string> = {
    popular: view.located ? "Popular near you" : "Popular right now",
    rating: "Top rated",
    newest: "New on Kamplug",
  };
  // Your faculty first, then your hall: listings from people around you.
  const mine = !!(view.buyer.facultyZoneId || view.buyer.hallZoneId);
  const campusOf = useCampuses().data;
  const fromMine = (p: ProductWithBrand) => {
    const c = campusOf?.find((x) => x.id === p.brand.campusId);
    const r = nearness(p.brand.fulfilment, c, view.buyer).relation;
    return r === "same_faculty" || r === "same_hostel";
  };
  const mineTitle =
    view.buyer.facultyZoneId && view.buyer.hallZoneId
      ? "From your faculty and hall"
      : view.buyer.facultyZoneId
        ? "From your faculty"
        : "From your hall";
  const mineQuery: ProductQuery = { ...base, sort: "nearest", pageSize: 24 };
  const mineData = useProducts(mineQuery, { enabled: mine }).data;
  const mineIds = mine
    ? (mineData?.items
        .filter(fromMine)
        .slice(0, 10)
        .map((p) => p.id) ?? [])
    : [];
  // Each section skips what's already shown above it.
  const firstIds =
    useProducts(first)
      .data?.items.filter((p) => !mineIds.includes(p.id))
      .slice(0, 10)
      .map((p) => p.id) ?? [];

  return (
    <div className={cn(pagePad, "flex flex-col gap-7 md:gap-9")}>
      <HomeHeader spotName={spotName} onFilters={openFilters} activeFilters={view.active} />
      <FilterSheet open={filtersOpen} onOpenChange={setFiltersOpen} view={view} />
      {onTheWay && <OnTheWay order={onTheWay} />}
      <CategoryGrid />

      {empty ? (
        <EmptyMarket />
      ) : (
        <>
          <FeaturedStores stores={stores} />
          <ProductRail
            eyebrow="On campus now"
            tone={sectionTone.orange}
            title={firstTitle[firstSort] ?? "Popular right now"}
            query={first}
            skip={mineIds}
            href={`/explore?sort=${firstSort}${view.walking ? "&walk=1" : ""}`}
          />
          {mine && (
            <ProductRail
              eyebrow="Near you"
              tone={sectionTone.sky}
              title={mineTitle}
              query={mineQuery}
              href="/explore?sort=nearest"
              keep={fromMine}
            />
          )}
          <ProductRail
            eyebrow="Easy on the pocket"
            tone={sectionTone.green}
            title="Under ₦2,000"
            query={{ ...base, sort: "popular", maxPriceKobo: 200_000 }}
            href="/explore?max=2000&sort=price_asc"
          />
          <ProductRail
            eyebrow="Fresh on the market"
            tone={sectionTone.purple}
            title={secondSort === "newest" ? "New on Kamplug" : "Popular right now"}
            query={{ ...base, sort: secondSort }}
            href={`/explore?sort=${secondSort}${view.walking ? "&walk=1" : ""}`}
            skip={[...mineIds, ...firstIds]}
          />
          <MoreStores stores={stores} view={view} onFilters={openFilters} />
        </>
      )}

      <Link
        href="/account"
        className="flex items-center gap-3 border-t border-line-thin pt-5 transition-opacity hover:opacity-80 sm:hidden"
      >
        <span className="grid size-10 place-items-center rounded-full bg-accent-soft text-accent-ink">
          <Gauge className="size-5" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[15px] font-semibold">Your dashboard</span>
          <span className="block text-[13px] text-muted">
            Spending, orders on the way and to-dos
          </span>
        </span>
        <ChevronRight className="size-5 text-muted" />
      </Link>
    </div>
  );
}
