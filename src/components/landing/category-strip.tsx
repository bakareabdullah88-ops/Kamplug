"use client";

import { features } from "@/config/features";
import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/cn";
import { Reveal } from "./reveal";

type Tile = {
  id: string;
  title: string;
  body: string;
  href: string;
  /** A photo of the category, shown as the tile's background. */
  photo: string;
  span: string;
  big?: boolean;
};

const tiles: Tile[] = [
  {
    id: "food",
    title: "Food & groceries",
    body: "Meals, snacks, drinks and groceries from cooks and sellers in your hall.",
    href: "/explore?category=food",
    photo: "/discover/food.jpg",
    span: "col-span-2 md:row-span-2",
    big: true,
  },
  {
    id: "fashion",
    title: "Fashion",
    body: "Thrift, clothes, shoes, bags.",
    href: "/explore?category=fashion",
    photo: "/discover/thrift.jpg",
    span: "col-span-1",
  },
  {
    id: "beauty",
    title: "Beauty",
    body: "Skincare, haircare, makeup.",
    href: "/explore?category=beauty",
    photo: "/discover/beauty.jpg",
    span: "col-span-1",
  },
  {
    id: "tech",
    title: "Technology",
    body: "Chargers, gadgets, accessories.",
    href: "/explore?category=tech",
    photo: "/discover/tech.jpg",
    span: "col-span-1",
  },
  {
    id: "academics",
    title: "Academics",
    body: "Textbooks, past questions, stationery.",
    href: "/explore?category=academics",
    photo: "/discover/books.jpg",
    span: "col-span-1",
  },
];

/** A tile that leans toward the pointer, as if it were a card on a table. */
function TiltLink({
  href,
  className,
  style,
  children,
}: {
  href: string;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLAnchorElement>(null);
  const onMove = (e: React.PointerEvent) => {
    const el = ref.current;
    if (!el || e.pointerType !== "mouse") return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.setProperty("--rx", `${(-y * 8).toFixed(2)}deg`);
    el.style.setProperty("--ry", `${(x * 10).toFixed(2)}deg`);
  };
  const onLeave = () => {
    ref.current?.style.setProperty("--rx", "0deg");
    ref.current?.style.setProperty("--ry", "0deg");
  };
  return (
    <Link
      ref={ref}
      href={href}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className={cn(
        "group relative block h-full [transform:perspective(900px)_rotateX(var(--rx,0deg))_rotateY(var(--ry,0deg))] overflow-hidden rounded-[28px] transition-transform duration-300 ease-out motion-reduce:[transform:none]",
        className,
      )}
      style={style}
    >
      {children}
    </Link>
  );
}

/**
 * The categories as a grid of tiles: food gets the big one, the rest share the
 * row, and a dark tile lists everything else. Tiles swing down into place as
 * they scroll in and lean toward the pointer.
 */
export function CategoryStrip() {
  return (
    <div className="grid grid-cols-2 gap-4 pb-3 md:grid-cols-4 md:grid-rows-[260px_260px] md:gap-5">
      {tiles.map((t, i) => (
        <Reveal key={t.id} from="top" delay={i * 90} className={t.span}>
          <TiltLink
            href={features.waitlist ? "#waitlist" : t.href}
            className={cn(
              "flex flex-col justify-end bg-[#1b1f3b] text-white",
              t.big ? "min-h-[420px] md:min-h-0" : "min-h-[230px]",
            )}
          >
            <Photo src={t.photo} big={t.big} />
            <div className={cn("relative z-10 flex flex-col p-5 md:p-7", t.big && "md:p-9")}>
              <h3
                className={cn(
                  "leading-none font-extrabold tracking-[-0.045em]",
                  t.big ? "text-[40px] md:text-[64px]" : "text-[26px] md:text-[30px]",
                )}
              >
                {t.title}
              </h3>
              <p
                className={cn(
                  "mt-2 max-w-[26ch] leading-snug text-white/90",
                  t.big ? "text-[16px] md:text-[19px]" : "text-[14.5px]",
                )}
              >
                {t.body}
              </p>
              {t.big && (
                <span className="mt-5 inline-flex items-center gap-2 text-[13px] font-extrabold tracking-[0.2em] uppercase">
                  Browse food
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </span>
              )}
            </div>
            <span
              aria-hidden
              className="absolute top-5 right-5 z-10 grid size-9 place-items-center rounded-full bg-white text-[#1b1f3b] opacity-0 transition-opacity group-hover:opacity-100 max-md:hidden"
            >
              <ArrowUpRight className="size-4" />
            </span>
          </TiltLink>
        </Reveal>
      ))}
      <Reveal from="top" delay={tiles.length * 90} className="col-span-2 md:col-span-4">
        <TiltLink
          href={features.waitlist ? "#waitlist" : "/explore?category=lifestyle"}
          className="flex min-h-[200px] flex-col justify-end bg-[#1b1f3b] text-white"
        >
          <Photo src="/discover/accessories.jpg" wide />
          <div className="relative z-10 flex flex-col p-6 md:p-8">
            <h3 className="text-[26px] leading-none font-extrabold tracking-[-0.045em] md:text-[30px]">
              Lifestyle
            </h3>
            <p className="mt-2 max-w-[36ch] text-[14.5px] leading-snug text-white/90 md:text-[16px]">
              Accessories, gifts and room essentials.
            </p>
            <span className="mt-4 inline-flex items-center gap-2 text-[13px] font-extrabold tracking-[0.2em] uppercase">
              Shop lifestyle
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </span>
          </div>
        </TiltLink>
      </Reveal>
    </div>
  );
}

/** The category photo filling the tile, softly blurred and darkened at the bottom so the white text reads. */
function Photo({ src, big, wide }: { src: string; big?: boolean; wide?: boolean }) {
  return (
    <>
      <Image
        src={src}
        alt=""
        fill
        sizes={
          big ? "(min-width: 768px) 50vw, 100vw" : wide ? "100vw" : "(min-width: 768px) 25vw, 50vw"
        }
        // Softly blurred so the photo sets the mood and the text stays in front;
        // scaled up a touch so the blurred edges never show inside the corners.
        className="scale-110 object-cover blur-[3px] transition-transform duration-700 group-hover:scale-[1.15]"
      />
      <span
        aria-hidden
        className={cn(
          "absolute inset-0",
          wide
            ? "bg-gradient-to-t from-black/85 via-black/55 to-black/25 md:bg-gradient-to-r md:from-black/85 md:via-black/50 md:to-black/10"
            : "bg-gradient-to-t from-black/80 via-black/35 to-black/5",
        )}
      />
    </>
  );
}
