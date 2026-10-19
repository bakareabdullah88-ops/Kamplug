"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/cn";

/**
 * Landing scenery: UNILAG landmarks, clouds and the campus road. Shapes are
 * flat 2D with lit tops, gradients and shaded sides, so they read as 3D.
 */

const NAVY = "#1b1f3b";

/** A box with a lit top and a shaded right side, so a flat rectangle reads as a block. */
export function Block({
  x,
  y,
  w,
  h,
  d = 24,
  front,
  side,
  top,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  d?: number;
  front: string;
  side: string;
  top: string;
}) {
  return (
    <g>
      <path d={`M${x} ${y} l${d} -${d * 0.7} h${w} l-${d} ${d * 0.7} Z`} fill={top} />
      <path d={`M${x + w} ${y} l${d} -${d * 0.7} v${h} l-${d} ${d * 0.7} Z`} fill={side} />
      <rect x={x} y={y} width={w} height={h} fill={front} />
    </g>
  );
}

export function Palm({
  x,
  y,
  s = 1,
  delay = 0,
}: {
  x: number;
  y: number;
  s?: number;
  delay?: number;
}) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path
        d="M0 0 Q6 -60 -4 -120"
        stroke="#8a5a2b"
        strokeWidth="9"
        fill="none"
        strokeLinecap="round"
      />
      <g className="lp-sway" style={{ animationDelay: `${delay}s` }}>
        {[-150, -110, -70, -30, 10].map((a, i) => (
          <path
            key={i}
            d="M-4 -120 q30 -24 64 4 q-34 -8 -64 -4 Z"
            fill={i % 2 ? "#1f9d63" : "#2bb673"}
            transform={`rotate(${a + 60} -4 -120)`}
          />
        ))}
      </g>
    </g>
  );
}

/** Pointer parallax for a scene: writes the pointer position to --px/--py on the
 * enclosing section; each `.lp-layer[data-depth]` moves by its depth. */
export function useParallax(ref: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current?.closest("section") ?? ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // Only with a mouse: on phones a finger drag would restyle the scene every frame.
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    let raf = 0;
    const onMove = (e: PointerEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        el.style.setProperty("--px", px.toFixed(3));
        el.style.setProperty("--py", py.toFixed(3));
      });
    };
    const onLeave = () => {
      el.style.setProperty("--px", "0");
      el.style.setProperty("--py", "0");
    };
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, [ref]);
}

/** Three cloud shapes, each with a lit top and a shaded underside. */
const cloudShapes = {
  puffy: {
    vb: "0 0 240 110",
    top: "M24 96 a30 30 0 0 1 10 -54 a44 44 0 0 1 80 -18 a38 38 0 0 1 66 14 a32 32 0 0 1 36 58 Z",
    under: "M24 96 a30 30 0 0 1 -6 -24 q90 26 196 0 a32 32 0 0 1 2 24 Z",
  },
  long: {
    vb: "0 0 340 80",
    top: "M20 70 a24 24 0 0 1 22 -34 a34 34 0 0 1 60 -12 a40 40 0 0 1 74 -4 a30 30 0 0 1 54 8 a28 28 0 0 1 72 18 a20 20 0 0 1 18 24 Z",
    under: "M20 70 a24 24 0 0 1 -4 -16 q150 22 304 0 a20 20 0 0 1 0 16 Z",
  },
  round: {
    vb: "0 0 150 100",
    top: "M18 88 a28 28 0 0 1 14 -44 a40 40 0 0 1 76 -8 a30 30 0 0 1 24 52 Z",
    under: "M18 88 a28 28 0 0 1 -4 -18 q60 20 120 -2 a30 30 0 0 1 -2 20 Z",
  },
} as const;

type CloudSpec = {
  top: string;
  w: number;
  shape: keyof typeof cloudShapes;
  /** 1 drifts left to right, -1 right to left. */
  dir: 1 | -1;
  dur: string;
  delay: string;
  depth: "far" | "mid" | "near";
  /** How it moves while drifting: bobs, swells and shrinks, or rises and sinks slowly. */
  motion: "bob" | "puff" | "rise";
};

const clouds: CloudSpec[] = [
  {
    top: "6%",
    w: 110,
    shape: "round",
    dir: 1,
    dur: "58s",
    delay: "-12s",
    depth: "far",
    motion: "puff",
  },
  {
    top: "22%",
    w: 180,
    shape: "long",
    dir: -1,
    dur: "70s",
    delay: "-30s",
    depth: "far",
    motion: "rise",
  },
  {
    top: "3%",
    w: 210,
    shape: "puffy",
    dir: 1,
    dur: "38s",
    delay: "-6s",
    depth: "mid",
    motion: "bob",
  },
  {
    top: "34%",
    w: 140,
    shape: "round",
    dir: -1,
    dur: "44s",
    delay: "-20s",
    depth: "mid",
    motion: "puff",
  },
  {
    top: "14%",
    w: 300,
    shape: "long",
    dir: 1,
    dur: "30s",
    delay: "-18s",
    depth: "near",
    motion: "rise",
  },
  {
    top: "44%",
    w: 90,
    shape: "puffy",
    dir: -1,
    dur: "24s",
    delay: "-8s",
    depth: "near",
    motion: "bob",
  },
  {
    top: "10%",
    w: 70,
    shape: "round",
    dir: -1,
    dur: "52s",
    delay: "-40s",
    depth: "far",
    motion: "bob",
  },
  {
    top: "28%",
    w: 250,
    shape: "puffy",
    dir: 1,
    dur: "48s",
    delay: "-36s",
    depth: "mid",
    motion: "puff",
  },
];

/**
 * Clouds at three depths: different shapes and sizes, some drifting left and
 * some right at their own speed, each bobbing, swelling or rising as it goes.
 * Far ones are smaller, paler and slower; near ones are big and quick.
 */
/**
 * Drifting clouds behind a hero. `inApp` heroes follow the app's dark theme:
 * the clouds turn to dusk tones and step back so text on top stays readable.
 */
export function Clouds3D({ inApp = false }: { inApp?: boolean }) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 z-0 overflow-hidden",
        inApp && "opacity-90 dark:opacity-60",
      )}
    >
      {clouds.map((c, i) => {
        const shape = cloudShapes[c.shape];
        return (
          <div
            key={i}
            data-depth={c.depth}
            className={cn("lp-layer absolute inset-x-0", i >= 5 && "max-md:hidden")}
            style={{ top: c.top }}
          >
            <div
              className={c.dir === 1 ? "lp-cloud" : "lp-cloud-rev"}
              style={
                {
                  width: c.w,
                  ["--lp-dur" as string]: c.dur,
                  ["--lp-delay" as string]: c.delay,
                  opacity: c.depth === "far" ? 0.65 : c.depth === "mid" ? 0.9 : 1,
                } as React.CSSProperties
              }
            >
              <div
                className={
                  c.motion === "bob" ? "lp-float" : c.motion === "puff" ? "lp-puff" : "lp-rise"
                }
                style={{ animationDelay: `${i * -1.3}s` }}
              >
                <svg viewBox={shape.vb} className="w-full">
                  <path
                    d={shape.top}
                    className={inApp ? "fill-white dark:fill-[#2c3263]" : undefined}
                    fill="#ffffff"
                  />
                  <path
                    d={shape.under}
                    className={inApp ? "fill-[#dfe5f2] dark:fill-[#222752]" : undefined}
                    fill="#dfe5f2"
                  />
                </svg>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ------------------------------ Hero scene ------------------------------ */

/** A point on a quadratic curve, for laying trusses along a curved roof. */
function onQuad(
  [x0, y0]: [number, number],
  [cx, cy]: [number, number],
  [x1, y1]: [number, number],
  t: number,
): [number, number] {
  const u = 1 - t;
  return [u * u * x0 + 2 * u * t * cx + t * t * x1, u * u * y0 + 2 * u * t * cy + t * t * y1];
}

/** One of the steel canopies beside the gate: a curved roof on a zigzag truss. */
function Canopy() {
  const a: [number, number] = [540, 402];
  const c: [number, number] = [600, 368];
  const b: [number, number] = [660, 388];
  const zig = Array.from({ length: 11 }, (_, i) => {
    const [x, y] = onQuad(a, c, b, i / 10);
    return `${i ? "L" : "M"}${x.toFixed(1)} ${(y + (i % 2 ? 20 : 7)).toFixed(1)}`;
  }).join(" ");
  const posts = [0.14, 0.86].map((t) => onQuad(a, c, b, t));
  return (
    <g>
      {posts.map(([x, y]) => (
        <path key={x} d={`M${x} ${y + 8} V476`} stroke={NAVY} strokeWidth="4" />
      ))}
      <path d={zig} stroke="#5e6fc4" strokeWidth="2" fill="none" strokeLinejoin="round" />
      <path
        d={`M${a[0]} ${a[1]} Q${c[0]} ${c[1]} ${b[0]} ${b[1]} l0 8 Q${c[0]} ${c[1] + 8} ${a[0]} ${a[1] + 8} Z`}
        fill="url(#gs-steel)"
      />
      <path
        d={`M${a[0]} ${a[1]} Q${c[0]} ${c[1]} ${b[0]} ${b[1]}`}
        stroke="#c9d3ff"
        strokeWidth="2"
        fill="none"
      />
    </g>
  );
}

/** One slanted wing of the main gate: beige concrete with a maroon edge. */
function GateWing({ face }: { face: string }) {
  const joints = [0.22, 0.44, 0.66, 0.86].map((t) => {
    const lx = 655 - 83 * t;
    const ly = 472 - 258 * t;
    const rx = 702 - 80 * t;
    const ry = 472 - 266 * t;
    return `M${lx.toFixed(1)} ${ly.toFixed(1)} L${rx.toFixed(1)} ${ry.toFixed(1)}`;
  });
  return (
    <g>
      <path d="M702 472 L714 466 L634 202 L622 206 Z" fill="#7e2f23" />
      <path d="M655 472 L702 472 L622 206 L572 214 Z" fill={face} />
      <path d="M655 472 L672 472 L589 212 L572 214 Z" fill="url(#gs-maroon)" />
      <path d="M572 214 L622 206 L634 202 L584 210 Z" fill="#fbf4e4" />
      <path d={joints.join(" ")} stroke="#b9a37c" strokeWidth="1.5" opacity="0.7" />
    </g>
  );
}

/** A round shrub with a few flowers. */
function Bush({
  x,
  y,
  s = 1,
  color,
  flower,
}: {
  x: number;
  y: number;
  s?: number;
  color: string;
  flower: string;
}) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <circle cx="-22" cy="-14" r="18" fill={color} />
      <circle cx="20" cy="-14" r="20" fill={color} />
      <circle cx="0" cy="-26" r="24" fill={color} />
      <path d="M-40 0 a40 14 0 0 1 80 0 Z" fill={color} />
      <circle cx="-8" cy="-38" r="9" fill="#ffffff" opacity="0.25" />
      {[
        [-20, -22],
        [6, -34],
        [22, -18],
        [-4, -12],
      ].map(([fx, fy], i) => (
        <circle
          key={i}
          className="lp-twinkle"
          style={{ ["--lp-delay" as string]: `${i * -0.6}s` } as React.CSSProperties}
          cx={fx}
          cy={fy}
          r="4"
          fill={flower}
        />
      ))}
    </g>
  );
}

/**
 * The hero scene, drawn from UNILAG itself: Senate House (the grid tower on its
 * round drum), the main gate's slanted wings with the seal between them and the
 * steel canopies, and the Main Library's overhanging inverted-pyramid roof on
 * its fins. Curved hills, the lagoon and palms around them. Layers sit at three
 * depths: they drop in on load and drift with the pointer.
 */
export function GateScene({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useParallax(ref);

  // Columns round the Senate drum: closer together towards the edges, so it reads round.
  const drum = Array.from({ length: 11 }, (_, i) => {
    const a = ((i - 5) / 5) * 1.35;
    return { x: 450 + 112 * Math.sin(a), y: 420 + 17 * Math.cos(a), w: 1 + 3 * Math.cos(a) };
  });

  return (
    <div ref={ref} className={className} aria-hidden>
      <svg
        viewBox="0 120 1440 400"
        preserveAspectRatio="xMidYMax slice"
        className="block h-full w-full overflow-visible"
      >
        <defs>
          <radialGradient id="gs-sun">
            <stop offset="0" stopColor="#fff6c2" />
            <stop offset="0.6" stopColor="#ffd84d" />
            <stop offset="1" stopColor="#ffb84d" />
          </radialGradient>
          <linearGradient id="gs-farhill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#dfe4ff" />
            <stop offset="1" stopColor="#c3cdff" />
          </linearGradient>
          <linearGradient id="gs-midhill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#9af2c9" />
            <stop offset="1" stopColor="#5fe0a8" />
          </linearGradient>
          <linearGradient id="gs-water" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#9fd8ff" />
            <stop offset="1" stopColor="#7d93ff" />
          </linearGradient>
          <linearGradient id="gs-tower" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#f5f7fd" />
            <stop offset="1" stopColor="#cdd5ee" />
          </linearGradient>
          <linearGradient id="gs-drum" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#c9d1ec" />
            <stop offset="0.35" stopColor="#f7f9ff" />
            <stop offset="1" stopColor="#97a5d8" />
          </linearGradient>
          <linearGradient id="gs-wing-l" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#f7eedb" />
            <stop offset="1" stopColor="#dccaa8" />
          </linearGradient>
          <linearGradient id="gs-wing-r" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#eadfc4" />
            <stop offset="1" stopColor="#c9b48e" />
          </linearGradient>
          <linearGradient id="gs-maroon" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#c0553f" />
            <stop offset="1" stopColor="#7e2f23" />
          </linearGradient>
          <radialGradient id="gs-seal" cx="0.35" cy="0.3">
            <stop offset="0" stopColor="#9fb0ff" />
            <stop offset="1" stopColor="#2a45d6" />
          </radialGradient>
          <linearGradient id="gs-steel" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#9fb0ff" />
            <stop offset="1" stopColor="#5e6fc4" />
          </linearGradient>
          <linearGradient id="gs-roof" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#e6d6b6" />
            <stop offset="1" stopColor="#b9a37c" />
          </linearGradient>
          <linearGradient id="gs-fin" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#f7efdf" />
            <stop offset="1" stopColor="#cdb994" />
          </linearGradient>
          <linearGradient id="gs-glass" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#2a3370" />
            <stop offset="1" stopColor="#3a5bff" />
          </linearGradient>
          <linearGradient id="gs-path" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#efe4cf" />
            <stop offset="1" stopColor="#fbf6ea" />
          </linearGradient>
        </defs>

        {/* Far: sun, birds, the lilac hills, Senate House and the lagoon */}
        <g data-depth="far" className="lp-layer">
          <circle className="lp-halo" cx="1330" cy="215" r="78" fill="#ffd84d" opacity="0.35" />
          <circle cx="1330" cy="215" r="50" fill="url(#gs-sun)" />
          <g className="lp-fly">
            {[
              [0, 210, 1],
              [34, 196, 0.8],
              [60, 216, 0.7],
            ].map(([bx, by, bs], i) => (
              <path
                key={i}
                d={`M${bx} ${by} q${8 * bs!} ${-8 * bs!} ${16 * bs!} 0 q${8 * bs!} ${-8 * bs!} ${16 * bs!} 0`}
                stroke={NAVY}
                strokeWidth="2.5"
                fill="none"
                strokeLinecap="round"
                opacity="0.55"
              />
            ))}
          </g>
          <path
            d="M-80 452 C 120 396 300 404 520 430 S 900 392 1140 410 S 1400 388 1520 404 V520 H-80 Z"
            fill="url(#gs-farhill)"
          />

          <g className="lp-drop" style={{ animationDelay: "0.05s" }}>
            {/* The tower, its lit roof and shaded side */}
            <path d="M505 162 l24 -14 V414 l-24 10 Z" fill="#8f9ccf" />
            <path d="M395 162 l24 -14 H529 l-24 14 Z" fill="#ffffff" />
            <rect x="395" y="162" width="110" height="262" fill="url(#gs-tower)" />
            <rect x="395" y="162" width="110" height="10" fill="#e3e8f7" />
            {Array.from({ length: 11 }, (_, r) =>
              [0, 1, 2, 3].map((c) => {
                const lit = (r * 4 + c) % 7 === 3;
                return (
                  <rect
                    key={`${r}-${c}`}
                    x={402 + c * 25.5}
                    y={180 + r * 21.5}
                    width="17"
                    height="14"
                    rx="1.5"
                    fill={lit ? "#ffd84d" : "#3a5bff"}
                    opacity={lit ? undefined : 0.3 + ((r + c) % 3) * 0.18}
                    className={lit ? "lp-glow" : undefined}
                    style={
                      lit
                        ? ({
                            ["--lp-delay" as string]: `${-(r + c) * 0.7}s`,
                          } as React.CSSProperties)
                        : undefined
                    }
                  />
                );
              }),
            )}
            {/* The round drum it stands on */}
            <path
              d="M338 420 A112 17 0 0 0 562 420 V464 A112 17 0 0 1 338 464 Z"
              fill="url(#gs-drum)"
            />
            {drum.map((d, i) => (
              <path
                key={i}
                d={`M${d.x.toFixed(1)} ${d.y.toFixed(1)} v42`}
                stroke="#7d8bc4"
                strokeWidth={d.w.toFixed(1)}
                opacity="0.55"
              />
            ))}
            <ellipse cx="450" cy="420" rx="112" ry="17" fill="#fbfcff" />
            <ellipse
              cx="450"
              cy="420"
              rx="112"
              ry="17"
              fill="none"
              stroke="#c9d1ec"
              strokeWidth="2"
            />
          </g>

          <path d="M-80 470 Q 130 446 340 468 V500 H-80 Z" fill="url(#gs-water)" />
          {[
            [40, 476],
            [170, 484],
            [260, 474],
          ].map(([wx, wy], i) => (
            <path
              key={i}
              className="lp-bob"
              style={{ animationDelay: `${i * -1.1}s` }}
              d={`M${wx} ${wy} h26`}
              stroke="#ffffff"
              strokeWidth="3"
              strokeLinecap="round"
              opacity="0.7"
            />
          ))}
          <g className="lp-bob" style={{ animationDuration: "4.4s" }}>
            <path d="M92 470 h62 l-12 13 h-38 Z" fill="#ff6a4d" />
            <path d="M122 469 V428 l24 38 Z" fill="#ffffff" />
            <path d="M119 469 V436 l-18 30 Z" fill="#b9a6ff" />
          </g>
        </g>

        {/* Mid: the main gate, its canopies and the Main Library */}
        <g data-depth="mid" className="lp-layer">
          <g className="lp-drop" style={{ animationDelay: "0.16s" }}>
            <Canopy />
            <g transform="matrix(-1 0 0 1 1440 0)">
              <Canopy />
            </g>
          </g>
          <g className="lp-drop" style={{ animationDelay: "0.26s" }}>
            <rect x="606" y="466" width="228" height="12" rx="6" fill="#d9c7a6" />
            <path d="M646 300 H794" stroke="#d9c7a6" strokeWidth="9" strokeLinecap="round" />
            <GateWing face="url(#gs-wing-l)" />
            <g transform="matrix(-1 0 0 1 1440 0)">
              <GateWing face="url(#gs-wing-r)" />
            </g>
            {/* The seal: a slowly turning ring round a cobalt medallion */}
            <circle cx="720" cy="300" r="52" fill="#ffffff" />
            <circle
              className="lp-spin-slow"
              cx="720"
              cy="300"
              r="46"
              fill="none"
              stroke="#ffd84d"
              strokeWidth="6"
              strokeDasharray="10 7"
            />
            <circle cx="720" cy="300" r="36" fill="url(#gs-seal)" />
            <path
              d="M720 278 l6 13 l14 2 l-10 10 l2 14 l-12 -7 l-12 7 l2 -14 l-10 -10 l14 -2 Z"
              fill="#ffd84d"
            />
          </g>

          <g className="lp-drop" style={{ animationDelay: "0.36s" }}>
            {/* Fins over dark glass, with a coral band at the base */}
            <path d="M1170 340 l18 -8 V468 l-18 4 Z" fill="#a8936c" />
            <rect x="1010" y="340" width="160" height="132" fill="url(#gs-glass)" />
            {Array.from({ length: 8 }, (_, i) => (
              <rect
                key={`w${i}`}
                className="lp-glow"
                style={{ ["--lp-delay" as string]: `${i * -0.9}s` } as React.CSSProperties}
                x={1022 + i * 19}
                y={360 + (i % 3) * 22}
                width="9"
                height="16"
                fill="#ffd84d"
              />
            ))}
            {Array.from({ length: 12 }, (_, i) => (
              <rect
                key={i}
                x={1010 + i * 13.6}
                y="340"
                width="7"
                height="110"
                fill="url(#gs-fin)"
              />
            ))}
            <rect x="1010" y="448" width="160" height="22" fill="#ff6a4d" />
            <rect x="1010" y="448" width="160" height="5" fill="#ff9a84" />
            {/* The inverted pyramid: two overhanging tiers, wider at the top */}
            <path d="M1022 322 H1178 L1166 342 H1012 Z" fill="url(#gs-roof)" />
            <path d="M1178 322 l14 -6 L1182 336 l-16 6 Z" fill="#9c8762" />
            <path d="M962 282 L992 266 H1252 L1222 282 Z" fill="#fbf4e4" />
            <path d="M962 282 H1222 L1190 324 H1004 Z" fill="url(#gs-roof)" />
            <path d="M1222 282 L1252 266 L1218 312 L1190 324 Z" fill="#9c8762" />
            <path d="M962 282 H1222" stroke="#ffffff" strokeWidth="2" opacity="0.8" />
          </g>

          <path
            d="M-80 500 C 160 500 300 470 480 468 S 900 460 1100 470 S 1380 460 1520 470 V520 H-80 Z"
            fill="url(#gs-midhill)"
          />
        </g>

        {/* Near: the front lawn, the walk up to the gate, shrubs and palms */}
        <g data-depth="near" className="lp-layer">
          <path d="M-80 520 V500 Q 360 478 720 488 T 1520 494 V520 Z" fill="#3ddc97" />
          <path d="M694 474 H746 Q 784 500 836 520 H604 Q 656 500 694 474 Z" fill="url(#gs-path)" />
          {[
            [350, 500, 0.9, "#1fbf7a", "#ff6a4d", 0.3],
            [560, 498, 0.75, "#b9a6ff", "#ffd84d", 0.45],
            [880, 498, 0.8, "#1fbf7a", "#b9a6ff", 0.55],
            [1230, 500, 0.95, "#7d93ff", "#ffd84d", 0.65],
          ].map(([x, y, s, color, flower, d], i) => (
            <g key={i} className="lp-grow" style={{ animationDelay: `${d}s` }}>
              <Bush
                x={x as number}
                y={y as number}
                s={s as number}
                color={color as string}
                flower={flower as string}
              />
            </g>
          ))}
          {[
            [30, 1.2, 0.4, 0],
            [300, 1.0, 0.5, -0.6],
            [1300, 1.15, 0.6, -1.2],
            [1425, 1.05, 0.7, -0.3],
          ].map(([x, s, d, sd], i) => (
            <g key={i} className="lp-grow" style={{ animationDelay: `${d}s` }}>
              <Palm x={x!} y={502} s={s!} delay={sd!} />
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
}

/** The campus road along the bottom of the hero, with a keke and a danfo driving past. */
export function RoadStrip() {
  return (
    <svg
      viewBox="0 0 1440 90"
      preserveAspectRatio="xMidYMax slice"
      className="block h-[70px] w-full md:h-[90px]"
      aria-hidden
    >
      <rect x="0" y="0" width="1440" height="90" fill="#3ddc97" />
      <path d="M0 20 Q 720 8 1440 20 V90 H0 Z" fill="#2a2d3e" />
      <path d="M0 22 Q 720 10 1440 22" stroke="#4a4e66" strokeWidth="4" fill="none" />
      <path
        d="M0 56 Q 720 48 1440 56"
        stroke="#f6f6f4"
        strokeWidth="4"
        strokeDasharray="34 26"
        fill="none"
      />
      <g transform="translate(0 20)">
        <g className="lp-drive">
          <rect x="0" y="0" width="110" height="34" rx="12" fill="#ffd23f" />
          <rect x="0" y="0" width="110" height="10" rx="5" fill="#ffe680" />
          <rect x="14" y="6" width="40" height="14" rx="3" fill="#9fd8ff" />
          <rect x="66" y="6" width="22" height="14" rx="3" fill="#9fd8ff" />
          <circle className="lp-wheel" cx="22" cy="38" r="10" fill="#111" />
          <circle className="lp-wheel" cx="92" cy="38" r="10" fill="#111" />
        </g>
      </g>
      <g transform="translate(0 12)">
        <g className="lp-drive-slow">
          <rect x="0" y="0" width="170" height="44" rx="10" fill="#ff6a4d" />
          <rect x="0" y="0" width="170" height="10" rx="5" fill="#ff9a84" />
          {[0, 1, 2, 3].map((i) => (
            <rect key={i} x={12 + i * 36} y="10" width="28" height="16" rx="3" fill="#9fd8ff" />
          ))}
          <circle className="lp-wheel" cx="30" cy="48" r="11" fill="#111" />
          <circle className="lp-wheel" cx="138" cy="48" r="11" fill="#111" />
        </g>
      </g>
    </svg>
  );
}
