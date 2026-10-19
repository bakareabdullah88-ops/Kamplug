"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/cn";

/**
 * Landing scenery: UNILAG landmarks and clouds. Shapes are flat 2D with lit
 * tops and shaded sides, so they read as 3D.
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

/*
 * Flat colour, one light: lit fronts, ink shaded sides, no gradients. Everything
 * stands on one ground line at y=334 and mirrors around the gate at x=720.
 */
const GROUND = 334;
const GRASS = "#1f6f55";
const CREAM = "#fff3d6";
const COBALT = "#3a5bff";
const CORAL = "#ff6a4d";
const SUN = "#ffd84d";

/** A round, lumpy tree like a cut-out, with blossom on some. */
function Tree({
  x,
  s = 1,
  tone,
  bloom,
  delay = 0,
}: {
  x: number;
  s?: number;
  tone: string;
  bloom?: string;
  delay?: number;
}) {
  const lumps: [number, number, number][] = [
    [0, -74, 42],
    [-38, -54, 32],
    [38, -52, 34],
    [-16, -104, 32],
    [22, -100, 30],
  ];
  return (
    <g transform={`translate(${x} ${GROUND + 24}) scale(${s})`}>
      <path d="M-5 0 V-50 M-5 -30 l-12 -12 M-5 -36 l14 -14" stroke="#5a3a22" strokeWidth="8" />
      <g className="lp-sway" style={{ animationDelay: `${delay}s`, animationDuration: "5s" }}>
        {lumps.map(([cx, cy, r], i) => (
          <circle key={i} cx={cx} cy={cy} r={r} fill={tone} />
        ))}
        <circle cx="-18" cy="-98" r="14" fill="#ffffff" opacity="0.18" />
        {bloom &&
          [
            [-30, -62],
            [8, -112],
            [30, -70],
            [-6, -82],
            [-24, -100],
          ].map(([bx, by], i) => (
            <circle
              key={i}
              className="lp-twinkle"
              style={{ ["--lp-delay" as string]: `${i * -0.5}s` } as React.CSSProperties}
              cx={bx}
              cy={by}
              r="5"
              fill={bloom}
            />
          ))}
      </g>
    </g>
  );
}

/** The steel canopy left of the gate: a dark truss sloping down and away from it. */
function Canopy() {
  // Top chord from the gate's shoulder down to its far end; the bottom chord runs 20 below.
  const [x0, y0, x1, y1] = [596, 98, 380, 146];
  const zig = Array.from({ length: 13 }, (_, i) => {
    const t = i / 12;
    const x = x0 + (x1 - x0) * t;
    const y = y0 + (y1 - y0) * t + (i % 2 ? 20 : 0);
    return `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(" ");
  return (
    <g>
      <path
        d={`M430 ${y0 + 56} V${GROUND} M530 ${y0 + 34} V${GROUND}`}
        stroke={NAVY}
        strokeWidth="6"
      />
      <path d={`M${x0} ${y0} L${x1} ${y1} l0 -7 L${x0} ${y0 - 7} Z`} fill="#c9d1ec" />
      <path
        d={`M${x0} ${y0} L${x1} ${y1} M${x0} ${y0 + 20} L${x1} ${y1 + 20} ${zig}`}
        stroke="#2e3352"
        strokeWidth="3.5"
        fill="none"
        strokeLinejoin="round"
      />
    </g>
  );
}

/** A maroon guard booth beside the gate, flat roof with a lip. */
function Booth() {
  return (
    <g>
      <rect x="552" y="268" width="130" height={GROUND - 268} fill="#8a3a2a" />
      <rect x="546" y="262" width="142" height="7" fill="#5e2219" />
      <rect x="562" y="282" width="22" height="16" fill="#9fd8ff" />
    </g>
  );
}

const trees: { x: number; s: number; tone: string; bloom?: string; d: number }[] = [
  { x: 120, s: 1.15, tone: "#2fcf86", d: 0.45 },
  { x: 300, s: 1, tone: "#1fae6e", bloom: CORAL, d: 0.55 },
  { x: 470, s: 0.95, tone: "#5be3a4", d: 0.65 },
  { x: 970, s: 0.95, tone: "#5be3a4", d: 0.65 },
  { x: 1140, s: 1, tone: "#1fae6e", bloom: SUN, d: 0.55 },
  { x: 1320, s: 1.15, tone: "#2fcf86", d: 0.45 },
];

/**
 * The hero scene, drawn from UNILAG itself in flat colour: Senate House on its
 * round drum on the left, the Main Library's overhanging roof on the right, and
 * the main gate in the middle with its seal and steel canopies, and the campus
 * road along the front. Third Mainland Bridge crosses the lagoon behind, and a row of
 * trees stands in front. Layers drop in on load and drift with the pointer.
 */
export function GateScene({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useParallax(ref);

  // Columns round the Senate drum, closer together towards its edges so it reads round.
  const drum = Array.from({ length: 13 }, (_, i) => {
    const a = ((i - 6) / 6) * 1.4;
    return { x: 190 + 150 * Math.sin(a), w: 2 + 6 * Math.cos(a) };
  });

  return (
    <div ref={ref} className={className} aria-hidden>
      <svg
        viewBox="0 0 1440 460"
        preserveAspectRatio="xMidYMax slice"
        className="block h-full w-full overflow-visible"
      >
        {/* Far: the lagoon, Third Mainland Bridge with traffic, a boat, birds */}
        <g data-depth="far" className="lp-layer">
          <rect x="-100" y="280" width="1640" height="60" fill="#9fd8ff" />
          {[
            [380, 300],
            [1000, 310],
            [880, 296],
          ].map(([wx, wy], i) => (
            <path
              key={i}
              className="lp-bob"
              style={{ animationDelay: `${i * -1.2}s` }}
              d={`M${wx} ${wy} h28`}
              stroke="#ffffff"
              strokeWidth="3"
              strokeLinecap="round"
            />
          ))}
          <g className="lp-bob" style={{ animationDuration: "4.4s" }}>
            <path d="M350 314 h46 l-9 10 h-28 Z" fill={CORAL} />
            <path d="M372 313 V284 l18 27 Z" fill="#ffffff" />
          </g>
          {Array.from({ length: 24 }, (_, i) => (
            <rect key={i} x={-60 + i * 66} y="270" width="12" height="22" fill={NAVY} />
          ))}
          <rect x="-100" y="262" width="1640" height="9" fill={NAVY} />
          <rect x="-100" y="258" width="1640" height="5" fill="#3ddc97" />
          <g transform="translate(0 246)">
            <g className="lp-drive">
              <rect width="38" height="13" rx="3" fill={SUN} />
              <rect x="6" y="2" width="12" height="5" fill="#9fd8ff" />
            </g>
          </g>
          <g transform="translate(0 244)">
            <g className="lp-drive-slow">
              <rect width="58" height="15" rx="3" fill={CORAL} />
              {[0, 1, 2].map((i) => (
                <rect key={i} x={6 + i * 17} y="3" width="11" height="5" fill="#9fd8ff" />
              ))}
            </g>
          </g>
          <g className="lp-fly">
            {[
              [0, 120, 1],
              [34, 106, 0.8],
              [60, 126, 0.7],
            ].map(([bx, by, bs], i) => (
              <path
                key={i}
                d={`M${bx} ${by} q${8 * bs!} ${-8 * bs!} ${16 * bs!} 0 q${8 * bs!} ${-8 * bs!} ${16 * bs!} 0`}
                stroke={NAVY}
                strokeWidth="2.5"
                fill="none"
                strokeLinecap="round"
              />
            ))}
          </g>
        </g>

        {/* Mid: the ground, the road, and the three landmarks */}
        <g data-depth="mid" className="lp-layer">
          <rect x="-100" y={GROUND - 4} width="1640" height="200" fill={GRASS} />
          <rect x="-100" y={GROUND - 4} width="1640" height="10" fill="#2a8a68" />
          {/* The campus road along the front, with a keke and a danfo */}
          <rect x="-100" y="396" width="1640" height="70" fill="#2e3352" />
          <rect x="-100" y="394" width="1640" height="5" fill="#9ff0cc" />
          <path
            className="lp-dash"
            d="M-100 430 H1540"
            stroke="#ffffff"
            strokeWidth="4"
            strokeDasharray="14 22"
          />
          <g transform="translate(0 404)">
            <g className="lp-drive">
              <rect width="110" height="34" rx="12" fill={SUN} />
              <rect width="110" height="10" rx="5" fill="#ffe680" />
              <rect x="14" y="6" width="40" height="14" rx="3" fill="#9fd8ff" />
              <rect x="66" y="6" width="22" height="14" rx="3" fill="#9fd8ff" />
              <circle className="lp-wheel" cx="22" cy="38" r="10" fill="#111" />
              <circle className="lp-wheel" cx="92" cy="38" r="10" fill="#111" />
            </g>
          </g>
          <g transform="translate(0 398)">
            <g className="lp-drive-slow">
              <rect width="170" height="44" rx="10" fill={CORAL} />
              <rect width="170" height="10" rx="5" fill="#ff9a84" />
              {[0, 1, 2, 3].map((i) => (
                <rect key={i} x={12 + i * 36} y="10" width="28" height="16" rx="3" fill="#9fd8ff" />
              ))}
              <circle className="lp-wheel" cx="30" cy="48" r="11" fill="#111" />
              <circle className="lp-wheel" cx="138" cy="48" r="11" fill="#111" />
            </g>
          </g>

          {/* Senate House: the grid tower on its round drum. Phones pull it in beside the gate. */}
          <g className="max-sm:[transform:translate(378px,150px)_scale(0.55)]">
            <g className="lp-drop" style={{ animationDelay: "0.05s" }}>
              <path d="M150 56 V20 M176 56 V28" stroke={NAVY} strokeWidth="4" />
              <path d="M130 58 h90 l14 -9 v-20 h-90 l-14 9 Z" fill={SUN} />
              <path d="M220 58 l14 -9 v-20 l-14 9 Z" fill="#e0b52a" />
              <path d="M70 70 l28 -18 H330 l-28 18 Z" fill={CORAL} />
              <path d={`M302 70 l28 -18 V${GROUND - 18} l-28 12 Z`} fill={NAVY} />
              <rect x="70" y="70" width="232" height={GROUND - 76} fill={CREAM} />
              {Array.from({ length: 10 }, (_, r) => (
                <g key={r}>
                  <rect x="70" y={86 + r * 23} width="232" height="11" fill={NAVY} />
                  {r % 3 === 1 && (
                    <rect
                      className="lp-glow"
                      style={{ ["--lp-delay" as string]: `${-r * 0.8}s` } as React.CSSProperties}
                      x={110 + ((r * 53) % 150)}
                      y={86 + r * 23}
                      width="34"
                      height="11"
                      fill={SUN}
                    />
                  )}
                </g>
              ))}
              {[108, 146, 186, 226, 264].map((mx) => (
                <rect key={mx} x={mx} y="76" width="5" height="236" fill={CREAM} />
              ))}
              <path d="M40 304 A150 20 0 0 0 340 304 V348 A150 20 0 0 1 40 348 Z" fill={COBALT} />
              {drum.map((d, i) => (
                <rect
                  key={i}
                  x={(d.x - d.w / 2).toFixed(1)}
                  y="318"
                  width={d.w.toFixed(1)}
                  height="38"
                  fill={CREAM}
                />
              ))}
              <ellipse cx="190" cy="304" rx="150" ry="20" fill="#7d93ff" />
            </g>
          </g>

          {/* Steel canopies either side of the gate (no room for them on phones) */}
          <g className="lp-drop max-sm:hidden" style={{ animationDelay: "0.15s" }}>
            <Canopy />
            <g transform="matrix(-1 0 0 1 1440 0)">
              <Canopy />
            </g>
          </g>

          {/*
           * The main gate: one cream slab cut into two prongs that slope down into a
           * notch, the seal hung in the notch on a bar, the sign band under it,
           * maroon wedges at the lower corners and a guard booth each side.
           */}
          <g className="lp-drop" style={{ animationDelay: "0.25s" }}>
            <Booth />
            <g transform="matrix(-1 0 0 1 1440 0)">
              <Booth />
            </g>
            <path d={`M842.5 33 l12 -6 V${GROUND - 6} l-12 6 Z`} fill="#d9c7a6" />
            <path
              d={`M597.5 ${GROUND} V33 L678 92.5 V187 H762 V92.5 L842.5 33 V${GROUND} Z`}
              fill={CREAM}
            />
            <path d="M597.5 33 L678 92.5 V99 L597.5 40 Z" fill="#ffffff" />
            <path d="M762 92.5 L842.5 33 V40 L762 99 Z" fill="#ead9b8" />
            <rect x="678" y="187" width="84" height="6" fill="#e2cfa8" />
            <path d={`M597.5 194 L678 267.5 V${GROUND} H597.5 Z`} fill="#9c3d2e" />
            <path d={`M842.5 194 L762 267.5 V${GROUND} H842.5 Z`} fill="#7e2f23" />
            <rect x="640" y="198" width="160" height="15" fill="#e8b13a" />
            <rect
              x="640"
              y="198"
              width="160"
              height="15"
              fill="none"
              stroke="#b8862a"
              strokeWidth="2"
            />
            <rect x="678" y="150" width="84" height="6" fill={NAVY} />
            <circle cx="720" cy="153" r="34" fill="#9c3d2e" />
            <circle
              className="lp-spin-slow"
              cx="720"
              cy="153"
              r="29"
              fill="none"
              stroke={SUN}
              strokeWidth="4"
              strokeDasharray="7 6"
            />
            <circle cx="720" cy="153" r="22" fill={COBALT} />
            <path d="M698 156 a22 22 0 0 0 44 0 Z" fill="#3ddc97" />
            <path
              d="M720 136 l4 9 l10 1.5 l-7 7 l1.5 10 l-8.5 -5 l-8.5 5 l1.5 -10 l-7 -7 l10 -1.5 Z"
              fill={SUN}
            />
            {/* Shrubs along the foot of the gate */}
            {[628, 660, 692, 748, 780, 812].map((bx, i) => (
              <circle
                key={bx}
                cx={bx}
                cy={GROUND + 4}
                r="15"
                fill={i % 3 === 1 ? "#2fcf86" : "#b5465a"}
              />
            ))}
          </g>

          {/* Main Library: fins over dark glass under an overhanging inverted pyramid */}
          <g className="max-sm:[transform:translate(270px,150px)_scale(0.55)]">
            <g className="lp-drop" style={{ animationDelay: "0.35s" }}>
              <path d={`M1360 170 l26 -14 V${GROUND - 14} l-26 14 Z`} fill="#12152b" />
              <rect x="1150" y="170" width="210" height={GROUND - 170} fill={NAVY} />
              {Array.from({ length: 6 }, (_, i) => (
                <rect
                  key={`w${i}`}
                  className="lp-glow"
                  style={{ ["--lp-delay" as string]: `${i * -1.1}s` } as React.CSSProperties}
                  x={1166 + i * 33}
                  y={196 + (i % 3) * 34}
                  width="10"
                  height="24"
                  fill={SUN}
                />
              ))}
              {Array.from({ length: 11 }, (_, i) => (
                <rect
                  key={i}
                  x={1153 + i * 19.6}
                  y="170"
                  width="8"
                  height={GROUND - 194}
                  fill={CREAM}
                />
              ))}
              <rect x="1150" y={GROUND - 24} width="210" height="24" fill={CORAL} />
              <rect x="1150" y={GROUND - 24} width="210" height="5" fill="#ff9fb8" />
              <path d="M1100 112 L1130 96 H1430 L1400 112 Z" fill={SUN} />
              <path d="M1100 112 H1400 L1360 172 H1150 Z" fill="#e9d3a6" />
              <path d="M1112 128 H1388 M1128 150 H1374" stroke="#d2b682" strokeWidth="4" />
              <path d="M1400 112 L1430 96 L1386 158 L1360 172 Z" fill="#b8955f" />
            </g>
          </g>
        </g>

        {/* Near: a row of trees, mirrored around the gate */}
        <g data-depth="near" className="lp-layer">
          {trees.map((t, i) => (
            <g key={i} className="lp-grow" style={{ animationDelay: `${t.d}s` }}>
              <Tree x={t.x} s={t.s} tone={t.tone} bloom={t.bloom} delay={i * -0.7} />
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
}
