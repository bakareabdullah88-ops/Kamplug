"use client";

import { useSearchParams } from "next/navigation";
import { Check, Download, Share2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { NavPageHeader } from "@/components/app/nav-header";
import { AppImage } from "@/components/ui/app-image";
import { Button, ButtonLink } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SegmentedControl } from "@/components/ui/tabs";
import { formatNaira } from "@/domain/money";
import { cn } from "@/lib/cn";
import {
  POSTER_H,
  POSTER_W,
  categoryPalette,
  drawPoster,
  headlineFor,
  posterPalettes,
  type PosterItem,
  type PosterStyle,
} from "@/lib/poster";
import { useMyBrand, useStudioProducts } from "@/queries/studio";
import { services } from "@/services";
import type { ImageRef, Product } from "@/services/types";
import { toast } from "@/stores/toast";

const noop = () => () => {};
/** Whether this browser can send an image to the share sheet (most phones can). */
function canShareFiles() {
  if (typeof navigator.canShare !== "function") return false;
  return navigator.canShare({ files: [new File([], "p.png", { type: "image/png" })] });
}

const styles = [
  { value: "stack", label: "Stack" },
  { value: "arc", label: "Arc" },
  { value: "menu", label: "Menu" },
] as const;

/** The photo as something a canvas can draw, from this site only (so the canvas can be saved). */
async function loadPhoto(
  ref: ImageRef | undefined,
): Promise<Pick<PosterItem, "image" | "imageW" | "imageH">> {
  const none = { image: null, imageW: 0, imageH: 0 };
  try {
    let blob: Blob | null = null;
    if (ref?.kind === "blob") blob = await services.media.getImage(ref.id);
    else if (ref?.kind === "url" && ref.src.startsWith("/"))
      blob = await (await fetch(ref.src)).blob();
    if (!blob) return none;
    const bmp = await createImageBitmap(blob);
    return { image: bmp, imageW: bmp.width, imageH: bmp.height };
  } catch {
    return none;
  }
}

/** The page's own heading and body fonts, so posters match the app. */
function useFonts() {
  const displayRef = useRef<HTMLSpanElement>(null);
  const bodyRef = useRef<HTMLSpanElement>(null);
  const [fonts, setFonts] = useState<{ display: string; body: string } | null>(null);
  useEffect(() => {
    const display = displayRef.current && getComputedStyle(displayRef.current).fontFamily;
    const body = bodyRef.current && getComputedStyle(bodyRef.current).fontFamily;
    if (!display || !body) return;
    void Promise.all([
      document.fonts.load(`800 100px ${display}`),
      document.fonts.load(`500 40px ${body}`),
      document.fonts.load(`700 40px ${body}`),
    ]).finally(() => setFonts({ display, body }));
  }, []);
  const probes = (
    <span aria-hidden className="pointer-events-none absolute size-0 overflow-hidden">
      <span ref={displayRef} className="font-display">
        a
      </span>
      <span ref={bodyRef} className="font-sans">
        a
      </span>
    </span>
  );
  return { fonts, probes };
}

/**
 * Posters for WhatsApp status and Instagram: pick a product (or up to three
 * for a menu), a layout and a colour, then download or share it. Drawn right
 * here in the browser from the shop's own photos, names and prices.
 */
export function PosterMaker() {
  const brand = useMyBrand().data;
  const products = useStudioProducts({ status: "published" }).data;
  const params = useSearchParams();
  const first = params.get("product");
  const [style, setStyle] = useState<PosterStyle>("stack");
  const [picked, setPicked] = useState<string[]>(first ? [first] : []);
  const [paletteId, setPaletteId] = useState<string | null>(null);
  const [headline, setHeadline] = useState("");
  const [photos, setPhotos] = useState<Record<string, Awaited<ReturnType<typeof loadPhoto>>>>({});
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { fonts, probes } = useFonts();

  const max = style === "menu" ? 3 : 1;
  const list = useMemo(() => products ?? [], [products]);
  const chosen = useMemo(() => {
    const ids = picked.length ? picked : list[0] ? [list[0].id] : [];
    return ids
      .map((id) => list.find((p) => p.id === id))
      .filter((p): p is Product => !!p)
      .slice(0, max);
  }, [picked, list, max]);
  const palette =
    posterPalettes.find(
      (p) => p.id === (paletteId ?? categoryPalette[chosen[0]?.category ?? "food"]),
    ) ?? posterPalettes[0]!;

  // Load each chosen photo once.
  useEffect(() => {
    for (const p of chosen) {
      if (photos[p.id]) continue;
      void loadPhoto(p.images[0]).then((ph) => setPhotos((s) => ({ ...s, [p.id]: ph })));
    }
  }, [chosen, photos]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !fonts || !brand || !chosen.length) return;
    drawPoster(canvas, {
      style,
      palette,
      shopName: brand.name,
      handle: brand.handle,
      headline,
      display: fonts.display,
      body: fonts.body,
      items: chosen.map((p) => ({
        name: p.name,
        description: p.description,
        priceText: formatNaira(p.priceKobo),
        ...(photos[p.id] ?? { image: null, imageW: 0, imageH: 0 }),
      })),
    });
  }, [style, palette, brand, chosen, photos, fonts, headline]);

  const toggle = (id: string) =>
    setPicked((cur) => {
      const base = cur.length ? cur : chosen.map((p) => p.id);
      if (max === 1) return [id];
      if (base.includes(id)) return base.length > 1 ? base.filter((x) => x !== id) : base;
      return [...base, id].slice(-max);
    });

  const fileName = `${brand?.handle ?? "kamplug"}-${chosen[0]?.slug ?? "poster"}.png`;
  const toBlob = () =>
    new Promise<Blob | null>(
      (ok) => canvasRef.current?.toBlob((b) => ok(b), "image/png") ?? ok(null),
    );
  const download = async () => {
    const blob = await toBlob();
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 2000);
    toast.success("Poster saved", { description: "Post it to your WhatsApp status or Instagram." });
  };
  const canShare = useSyncExternalStore(noop, canShareFiles, () => false);
  const share = async () => {
    const blob = await toBlob();
    if (!blob) return;
    try {
      await navigator.share({
        files: [new File([blob], fileName, { type: "image/png" })],
        title: chosen[0]?.name,
      });
    } catch {
      // Closing the share sheet isn't an error worth showing.
    }
  };

  if (products && products.length === 0) {
    return (
      <>
        <NavPageHeader
          title="Posters"
          description="Turn your products into posters for your status."
        />
        <div className="border-y border-line-thin py-12 text-center">
          <p className="text-[17px] font-semibold">Publish a product first</p>
          <p className="mt-1 text-small text-muted">
            Posters use your product photos, names and prices.
          </p>
          <ButtonLink href="/studio/products/new" className="mt-5">
            Add a product
          </ButtonLink>
        </div>
      </>
    );
  }

  return (
    <>
      {probes}
      <NavPageHeader
        title="Posters"
        description="Turn a product into a poster for your WhatsApp status or Instagram."
      />
      <div className="grid gap-8 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)] lg:gap-12">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <canvas
            ref={canvasRef}
            width={POSTER_W}
            height={POSTER_H}
            role="img"
            aria-label={`Poster for ${chosen.map((p) => p.name).join(", ")}`}
            className="aspect-[4/5] w-full rounded-xl bg-surface-2 ring-1 ring-line"
          />
          <div className="mt-4 flex gap-2">
            <Button
              className="flex-1"
              onClick={() => void download()}
              leadingIcon={<Download className="size-4.5" />}
            >
              Download
            </Button>
            {canShare && (
              <Button
                variant="secondary"
                onClick={() => void share()}
                leadingIcon={<Share2 className="size-4.5" />}
              >
                Share
              </Button>
            )}
          </div>
        </div>

        <div className="flex min-w-0 flex-col gap-7">
          <section aria-labelledby="poster-style">
            <h2 id="poster-style" className="mb-2.5 text-[15px] font-semibold">
              Layout
            </h2>
            <SegmentedControl label="Layout" value={style} onChange={setStyle} options={styles} />
            <p className="mt-2 text-small text-muted">
              {style === "stack"
                ? "One big word repeated behind your photo."
                : style === "arc"
                  ? "The name curving over your photo, the price under it."
                  : "Up to three products, like a menu."}
            </p>
          </section>

          <section aria-labelledby="poster-colour">
            <h2 id="poster-colour" className="mb-2.5 text-[15px] font-semibold">
              Colour
            </h2>
            <div className="flex flex-wrap gap-2.5" role="radiogroup" aria-label="Colour">
              {posterPalettes.map((p) => {
                const on = p.id === palette.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    aria-label={p.name}
                    onClick={() => setPaletteId(p.id)}
                    className={cn(
                      "grid size-11 place-items-center rounded-full ring-offset-2 ring-offset-canvas transition-shadow",
                      on ? "ring-2 ring-ink" : "ring-1 ring-line",
                    )}
                    style={{ background: p.bg, color: p.ink }}
                  >
                    {on && <Check className="size-5" aria-hidden />}
                  </button>
                );
              })}
            </div>
          </section>

          <section aria-labelledby="poster-word">
            <h2 id="poster-word" className="mb-2.5 text-[15px] font-semibold">
              {style === "menu" ? "Title" : "Big word"}
            </h2>
            <Input
              value={headline}
              onChange={(e) => setHeadline(e.target.value.slice(0, style === "menu" ? 24 : 12))}
              placeholder={
                style === "menu" ? (brand?.name ?? "Your shop") : headlineFor(chosen[0]?.name ?? "")
              }
              aria-label={style === "menu" ? "Title" : "Big word"}
            />
          </section>

          <section aria-labelledby="poster-products">
            <h2 id="poster-products" className="mb-1 text-[15px] font-semibold">
              {max === 1 ? "Product" : "Products (up to 3)"}
            </h2>
            <ul className="divide-y divide-line-thin border-y border-line-thin">
              {list.map((p) => {
                const on = chosen.some((c) => c.id === p.id);
                return (
                  <li key={p.id}>
                    <button
                      type="button"
                      onClick={() => toggle(p.id)}
                      aria-pressed={on}
                      className="flex w-full items-center gap-3 py-3 text-left"
                    >
                      <span className="size-12 shrink-0 overflow-hidden rounded-md ring-1 ring-line">
                        <AppImage image={p.images[0] ?? null} alt="" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[15px] font-medium">{p.name}</span>
                        <span className="block font-mono text-small text-muted tabular">
                          {formatNaira(p.priceKobo)}
                        </span>
                      </span>
                      <span
                        className={cn(
                          "grid size-6 place-items-center rounded-full ring-1",
                          on ? "bg-accent text-on-accent ring-accent" : "ring-line-strong",
                        )}
                        aria-hidden
                      >
                        {on && <Check className="size-4" />}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        </div>
      </div>
    </>
  );
}
