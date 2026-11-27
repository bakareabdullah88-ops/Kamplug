"use client";

import Link from "next/link";
import { BadgeCheck, Heart, Star } from "lucide-react";
import { AppImage } from "@/components/ui/app-image";
import { Skeleton } from "@/components/ui/skeleton";
import { categoryName } from "@/config/categories";
import { formatMetres, type Nearness } from "@/domain/distance";
import { formatNaira } from "@/domain/money";
import { cn } from "@/lib/cn";
import { useSession } from "@/queries/session";
import { useToggleFollow } from "@/queries/social";
import type { Brand, CategoryId } from "@/services/types";
import { CategoryIcon } from "./category-icons";
import { etaText } from "./nearby";

export type StoreNear = Nearness & { etaMin: number | null };

/** Soft tints of each category's colour, behind its icon when a shop has no cover photo. */
const noCoverTint: Record<CategoryId, string> = {
  food: "#FFE8D6",
  fashion: "#EEE5FF",
  beauty: "#FFE1E6",
  tech: "#DDF1FB",
  academics: "#DDF3E6",
  lifestyle: "#EEF7D6",
};

/**
 * A store as a large, tappable card: the shop's cover photo in a wide frame,
 * then its logo, name, rating and one line of how far and how you get it.
 * The same size wherever it appears, so rows and grids line up.
 */
export function StoreCard({
  brand: b,
  near,
  priority,
}: {
  brand: Brand;
  near: StoreNear | undefined;
  priority?: boolean;
}) {
  const { user } = useSession();
  const follow = useToggleFollow();
  const following = !!user?.followingBrandIds.includes(b.id);
  const f = b.fulfilment;
  const badge = b.vacation
    ? "On a break"
    : f?.delivery && !f.deliveryFeeKobo
      ? "Free delivery"
      : null;
  const detail = [
    categoryName(b.category),
    near && near.metres !== null
      ? near.metres === 0
        ? "Right by you"
        : `${formatMetres(near.metres)} away`
      : null,
    near && near.etaMin !== null ? etaText(near.etaMin, !!f?.delivery) : null,
    f?.delivery && f.deliveryFeeKobo
      ? `${formatNaira(f.deliveryFeeKobo)} delivery`
      : !f?.delivery && f?.pickup
        ? "Pickup"
        : null,
  ].filter((x): x is string => !!x);

  return (
    <article className="group relative">
      <Link href={`/brands/${b.handle}`} className="block rounded-[18px] outline-offset-4">
        <div className="relative aspect-[16/9] overflow-hidden rounded-[18px] bg-surface-2">
          <div className="size-full transition-transform duration-500 ease-[cubic-bezier(0.2,0,0,1)] group-hover:scale-[1.03]">
            {b.cover.kind === "art" ? (
              // No cover photo yet: the shop's category colour with its icon.
              <span
                className="grid size-full place-items-center"
                style={{ background: noCoverTint[b.category] }}
              >
                <CategoryIcon id={b.category} className="size-[46%] max-h-28" />
              </span>
            ) : (
              <AppImage
                image={b.cover}
                alt=""
                variant="cover"
                priority={priority}
                sizes="(min-width: 1024px) 380px, 85vw"
              />
            )}
          </div>
          {badge && (
            <span
              className={cn(
                "absolute top-3 left-3 rounded-full px-2.5 py-1 text-[12px] font-bold",
                b.vacation ? "bg-surface text-ink" : "bg-warm-green-ink text-white",
              )}
            >
              {badge}
            </span>
          )}
        </div>
        <div className="mt-3 flex items-start gap-3">
          <span className="size-10 shrink-0 overflow-hidden rounded-full bg-surface ring-1 ring-line">
            <AppImage image={b.logo} alt="" variant="logo" name={b.name} />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <h3 className="flex min-w-0 items-center gap-1 text-[16.5px] font-semibold tracking-[-0.01em]">
                <span className="truncate">{b.name}</span>
                {b.verified && (
                  <BadgeCheck className="size-4 shrink-0 text-accent" aria-label="Verified shop" />
                )}
              </h3>
              {b.ratingCount > 0 ? (
                <span className="inline-flex shrink-0 items-center gap-1 text-[14px] font-semibold">
                  <Star className="size-4 fill-warm-sun text-warm-sun" aria-hidden />
                  <span className="tabular">{b.rating.toFixed(1)}</span>
                  <span className="font-normal text-muted tabular">({b.ratingCount})</span>
                </span>
              ) : (
                <span className="shrink-0 text-[13px] font-medium text-muted">New</span>
              )}
            </div>
            <p className="mt-0.5 truncate text-[13.5px] text-muted">{detail.join(" · ")}</p>
          </div>
        </div>
      </Link>
      {user && (
        <button
          type="button"
          aria-pressed={following}
          aria-label={following ? `Unfollow ${b.name}` : `Follow ${b.name}`}
          onClick={() => follow.mutate({ id: b.id, handle: b.handle })}
          className="absolute top-3 right-3 grid size-9 pressable place-items-center rounded-full bg-black/35 backdrop-blur-sm transition-colors hover:bg-black/50"
        >
          <Heart
            className={cn(
              "size-[18px]",
              following ? "fill-warm-berry text-warm-berry" : "text-white",
            )}
          />
        </button>
      )}
    </article>
  );
}

export function StoreCardSkeleton() {
  return (
    <div aria-hidden>
      <Skeleton className="aspect-[16/9] w-full" rounded="lg" />
      <div className="mt-3 flex gap-3">
        <Skeleton className="size-10" rounded="full" />
        <div className="flex-1">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="mt-2 h-3 w-48" />
        </div>
      </div>
    </div>
  );
}
