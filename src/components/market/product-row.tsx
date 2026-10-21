"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, ViewTransition } from "react";
import { BadgeCheck, ShoppingBag, Star, Store } from "lucide-react";
import { AppImage } from "@/components/ui/app-image";
import { buttonStyles } from "@/components/ui/button";
import { QuantityStepper } from "@/components/ui/misc";
import { Skeleton } from "@/components/ui/skeleton";
import { MAX_LINE_QUANTITY, lineId, purchaseBlock } from "@/domain/bag";
import { formatMetres, formatWhen } from "@/domain/distance";
import { discountPercent, formatNaira } from "@/domain/money";
import { DEFAULT_VARIANT_KEY, findVariant, stockState, totalStock } from "@/domain/variants";
import { flyToBag } from "@/lib/fly-to-bag";
import { cn } from "@/lib/cn";
import { useMediaQuery } from "@/lib/use-media-query";
import { recordEvent, useCampus } from "@/queries/catalog";
import { useNearness } from "@/queries/nearby";
import { useSession } from "@/queries/session";
import type { ProductWithBrand } from "@/services/types";
import { useBag } from "@/stores/bag";
import { toast } from "@/stores/toast";
import { useUi } from "@/stores/ui";
import { etaText } from "./nearby";
import { productTransitionName } from "./product-card";
import { WishlistButton } from "./wishlist-button";

/** Price on top, the old price and saving under it. */
function Price({ kobo, compareAt }: { kobo: number; compareAt?: number | undefined }) {
  const off = discountPercent(kobo, compareAt);
  return (
    <div className="flex flex-col gap-1 md:items-end">
      <p className="text-[18px] leading-none font-semibold tracking-[-0.01em] tabular sm:text-[20px]">
        {formatNaira(kobo)}
      </p>
      {off && compareAt && (
        <p className="flex items-center gap-1.5 text-[12.5px] leading-none">
          <s className="text-muted tabular">{formatNaira(compareAt)}</s>
          <span className="font-semibold text-accent-ink">{off}% off</span>
        </p>
      )}
    </div>
  );
}

/**
 * A full-width result row (image on the left, details on the right), for
 * scanning a long list of products and adding to the bag without leaving it.
 */
export function ProductRow({
  product: p,
  priority,
  morph = false,
}: {
  product: ProductWithBrand;
  priority?: boolean;
  morph?: boolean;
}) {
  const { user } = useSession();
  const campus = useCampus(p.brand.campusId);
  const add = useBag((s) => s.add);
  const setQuantity = useBag((s) => s.setQuantity);
  const remove = useBag((s) => s.remove);
  const restore = useBag((s) => s.restore);
  // Already in the bag: the button turns into a stepper for how many.
  const inBag = useBag((s) =>
    s.lines.find((l) => l.productId === p.id && l.variantKey === DEFAULT_VARIANT_KEY),
  );
  const setBagOpen = useUi((s) => s.setBagOpen);
  const router = useRouter();
  const desktop = useMediaQuery("(min-width: 1024px)");
  const imageRef = useRef<HTMLDivElement>(null);

  const stock = totalStock(p);
  const state = stockState(stock);
  const hasOptions = p.variants.length > 1;
  const swatches = p.options.find((o) => o.values.some((v) => v.swatch))?.values ?? [];
  const block = purchaseBlock(p, hasOptions ? null : DEFAULT_VARIANT_KEY, {
    userBrandIds: user?.brandIds ?? [],
    brandOnVacation: p.brand.vacation,
  });
  const own = block.blocked && block.reason === "own_product";
  const f = p.brand.fulfilment;
  const near = useNearness(f, p.brand.campusId);
  const href = `/products/${p.slug}`;

  const onAdd = () => {
    const v = findVariant(p, DEFAULT_VARIANT_KEY);
    if (!v || v.stock < 1 || block.blocked) return;
    add({ productId: p.id, brandId: p.brandId, variantKey: v.key, quantity: 1 }, v.stock);
    recordEvent("add_to_bag", p.id);
    flyToBag(imageRef.current);
    toast("Added to bag", {
      description: p.name,
      action: {
        label: "View bag",
        onClick: () => (desktop ? setBagOpen(true) : router.push("/bag")),
      },
    });
  };

  const changeQuantity = (n: number) => {
    if (!inBag) return;
    const id = lineId(inBag);
    if (n > 0) {
      setQuantity(id, n);
      return;
    }
    const line = remove(id);
    if (line)
      toast("Removed from bag", {
        description: p.name,
        action: { label: "Undo", onClick: () => restore(line) },
      });
  };

  const image = (
    <div className="size-full">
      <AppImage
        image={p.images[0]}
        alt={p.name}
        priority={priority}
        sizes="(min-width: 768px) 260px, 130px"
      />
    </div>
  );

  // One quiet line of how you get it: price of delivery, pickup, distance, timing.
  const ways = [
    f?.delivery &&
      (f.deliveryFeeKobo ? `${formatNaira(f.deliveryFeeKobo)} delivery` : "Free delivery"),
    f?.pickup && "Free pickup",
    near.metres !== null &&
      (near.metres === 0 ? "Right by you" : `${formatMetres(near.metres)} away`),
    near.etaMin !== null
      ? etaText(near.etaMin, !!f?.delivery)
      : f && campus && `${campus.shortName} · ready ${formatWhen(f.prepMinutes)}`,
  ].filter((x): x is string => typeof x === "string" && x.length > 0);

  const note = p.brand.vacation
    ? { text: "Shop on a break", tone: "text-warning" }
    : state === "sold_out"
      ? { text: "Sold out", tone: "text-muted" }
      : state === "low"
        ? { text: `Only ${stock} left`, tone: "text-danger" }
        : null;

  return (
    <article className="grid grid-cols-[96px_minmax(0,1fr)] gap-4 py-5 sm:grid-cols-[148px_minmax(0,1fr)] sm:gap-6">
      <div className="relative aspect-square self-start overflow-hidden rounded-md bg-surface-2 ring-1 ring-line-thin">
        <Link
          href={href}
          className="absolute inset-0 block focus-visible:outline-offset-[-4px]"
          tabIndex={-1}
          aria-hidden
        >
          <div ref={imageRef} className="size-full">
            {morph ? (
              <ViewTransition name={productTransitionName(p.id)} share="morph" default="none">
                {image}
              </ViewTransition>
            ) : (
              image
            )}
          </div>
        </Link>
        <WishlistButton
          productId={p.id}
          productName={p.name}
          size="sm"
          className="absolute top-1.5 right-1.5"
        />
      </div>

      <div className="flex min-w-0 flex-col gap-3 md:flex-row md:justify-between md:gap-8">
        <div className="flex min-w-0 flex-col">
          <Link
            href={`/brands/${p.brand.handle}`}
            className="inline-flex max-w-full items-center gap-1 self-start text-[13px] text-muted hover:text-ink"
          >
            <span className="truncate">{p.brand.name}</span>
            {p.brand.verified && (
              <BadgeCheck className="size-3.5 shrink-0 text-accent" aria-label="Verified shop" />
            )}
          </Link>
          <h3 className="mt-0.5 line-clamp-2 text-[16px] leading-snug font-semibold tracking-[-0.01em] sm:text-[18px]">
            <Link href={href} className="hover:text-accent-ink">
              {p.name}
            </Link>
          </h3>
          <p className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px]">
            {p.ratingCount > 0 ? (
              <Link
                href={`${href}#reviews`}
                className="inline-flex items-center gap-1 hover:underline"
              >
                <Star className="size-3.5 fill-[#f59e0b] text-[#f59e0b]" aria-hidden />
                <span className="font-medium tabular">{p.rating.toFixed(1)}</span>
                <span className="text-muted tabular">
                  ({p.ratingCount} review{p.ratingCount === 1 ? "" : "s"})
                </span>
              </Link>
            ) : (
              <span className="text-muted">New</span>
            )}
            {note && (
              <>
                <span className="text-line-strong" aria-hidden>
                  ·
                </span>
                <span className={cn("font-medium", note.tone)}>{note.text}</span>
              </>
            )}
          </p>
          {ways.length > 0 && (
            <p className="mt-1.5 text-[13px] leading-relaxed text-muted">
              {ways.map((w, i) => (
                <span key={w}>
                  {i > 0 && (
                    <span className="mx-1.5 text-line-strong" aria-hidden>
                      ·
                    </span>
                  )}
                  {w}
                </span>
              ))}
            </p>
          )}
          {swatches.length > 0 && (
            <ul className="mt-2.5 flex flex-wrap gap-1.5" aria-label="Colours">
              {swatches.slice(0, 6).map((v) => (
                <li key={v.id}>
                  <span
                    title={v.label}
                    className="block size-4 rounded-full ring-1 ring-line-strong"
                    style={{ background: v.swatch }}
                  />
                  <span className="sr-only">{v.label}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex shrink-0 items-center justify-between gap-4 md:w-44 md:flex-col md:items-end md:justify-center md:gap-3">
          <Price kobo={p.priceKobo} compareAt={p.compareAtKobo} />
          {own ? (
            <Link
              href={`/studio/products/${p.id}`}
              className={buttonStyles({ variant: "secondary", size: "md" })}
            >
              <Store className="size-4" /> Edit yours
            </Link>
          ) : hasOptions ? (
            <Link href={href} className={buttonStyles({ variant: "secondary", size: "md" })}>
              Choose options
            </Link>
          ) : state === "sold_out" || p.brand.vacation ? null : inBag ? (
            <QuantityStepper
              value={inBag.quantity}
              onChange={changeQuantity}
              min={0}
              max={Math.min(stock, MAX_LINE_QUANTITY)}
              label={`${p.name} in bag`}
            />
          ) : (
            <button
              type="button"
              aria-label={`Add ${p.name} to bag`}
              onClick={onAdd}
              disabled={block.blocked}
              className={buttonStyles({ size: "md" })}
            >
              <ShoppingBag className="size-4" />
              Add to bag
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

export function ProductRowSkeleton() {
  return (
    <div
      className="grid grid-cols-[96px_1fr] gap-4 py-5 sm:grid-cols-[148px_1fr] sm:gap-6"
      aria-hidden
    >
      <Skeleton className="aspect-square w-full" rounded="md" />
      <div className="flex flex-col gap-2.5 py-1 md:flex-row md:justify-between">
        <div className="flex flex-1 flex-col gap-2.5">
          <Skeleton className="h-3.5 w-24" />
          <Skeleton className="h-5 w-[70%]" />
          <Skeleton className="h-3.5 w-28" />
          <Skeleton className="h-3.5 w-[55%]" />
        </div>
        <div className="flex items-center justify-between md:w-44 md:flex-col md:items-end md:justify-center md:gap-3">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>
    </div>
  );
}
