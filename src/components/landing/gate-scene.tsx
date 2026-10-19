"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";
import { cn } from "@/lib/cn";

/**
 * Landing scenery: the curved campus hero, clouds and the shared helpers the
 * other scenes use. Shapes are flat 2D with a lit top and a shaded side, so
 * they read as 3D.
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
 * The whole campus stands on one curved ground: the bottom of a huge circle
 * centred far above the page, so the ground rises at both ends of the screen
 * and everything on it leans in towards the gate in the middle.
 */
const CX = 720;
const R = 2400;
const CY = 430 - R;

/** Height of a circle of radius r (around the scene's centre) at x. */
function arcY(x: number, r: number) {
  return CY + Math.sqrt(r * r - (x - CX) ** 2);
}

/** Stand something on the curve at x: move it there and tilt it to face the centre. */
function onArc(x: number, r = R) {
  const deg = (Math.asin((CX - x) / r) * 180) / Math.PI;
  return `translate(${x.toFixed(1)} ${arcY(x, r).toFixed(1)}) rotate(${deg.toFixed(2)})`;
}

/** The curve between two x positions, left to right. */
function arc(r: number, x0: number, x1: number) {
  return `M${x0} ${arcY(x0, r).toFixed(1)} A${r} ${r} 0 0 0 ${x1} ${arcY(x1, r).toFixed(1)}`;
}

/** A band between two circles, from one end of the scene to the other. */
function band(inner: number, outer: number) {
  return `${arc(inner, -160, 1600)} L1600 ${arcY(1600, outer).toFixed(1)} A${outer} ${outer} 0 0 1 -160 ${arcY(-160, outer).toFixed(1)} Z`;
}

/**
 * A building in perspective, standing on (0, 0). Its side and roof turn
 * towards the middle of the scene (dir 1 = towards the right), and the farther
 * out it stands the more of them you see, as if you're standing at the gate.
 */
function Box({
  w,
  h,
  d,
  dir,
  front,
  side,
  top,
  children,
  sideRows = 0,
  sideWindow,
}: {
  w: number;
  h: number;
  d: number;
  dir: 1 | -1;
  front: string;
  side: string;
  top: string;
  children?: React.ReactNode;
  sideRows?: number;
  sideWindow?: string;
}) {
  const x0 = -w / 2;
  const x1 = w / 2;
  const dx = dir * d;
  const dy = -0.6 * d;
  const edge = dir === 1 ? x1 : x0;
  const base = 16;
  return (
    <g>
      <path d={`M${edge} ${-h} l${dx} ${dy} V${base + dy} L${edge} ${base} Z`} fill={side} />
      {sideWindow &&
        Array.from({ length: sideRows }, (_, r) => {
          const y = -h + 22 + r * ((h - 30) / sideRows);
          return (
            <path
              key={r}
              d={`M${edge + dx * 0.2} ${y + dy * 0.2} l${dx * 0.6} ${dy * 0.6} v14 l${-dx * 0.6} ${-dy * 0.6} Z`}
              fill={sideWindow}
              opacity="0.55"
            />
          );
        })}
      <path d={`M${x0} ${-h} H${x1} l${dx} ${dy} H${x0 + dx} Z`} fill={top} />
      <rect x={x0} y={-h} width={w} height={h + base} fill={front} />
      {children}
    </g>
  );
}

/** A grid of windows on a front face, some lit and glowing on and off. */
function Windows({
  x,
  y,
  cols,
  rows,
  w,
  h,
  gapX,
  gapY,
  color,
  rx = 2,
}: {
  x: number;
  y: number;
  cols: number;
  rows: number;
  w: number;
  h: number;
  gapX: number;
  gapY: number;
  color: string;
  rx?: number;
}) {
  return (
    <>
      {Array.from({ length: rows }, (_, r) =>
        Array.from({ length: cols }, (_, c) => {
          const lit = (r * cols + c) % 7 === 3;
          return (
            <g key={`${r}-${c}`}>
              <rect
                x={x + c * gapX}
                y={y + r * gapY}
                width={w}
                height={h}
                rx={rx}
                fill={color}
                opacity={(r + c) % 4 === 0 ? 0.9 : 0.4}
              />
              {lit && (
                <rect
                  className="lp-glow"
                  style={{ ["--lp-delay" as string]: `${-(r + c) * 0.9}s` } as React.CSSProperties}
                  x={x + c * gapX}
                  y={y + r * gapY}
                  width={w}
                  height={h}
                  rx={rx}
                  fill="#ffd23f"
                />
              )}
            </g>
          );
        }),
      )}
    </>
  );
}

/** A round bush of overlapping circles. */
function Bush({ color, s = 1 }: { color: string; s?: number }) {
  return (
    <g transform={`scale(${s})`}>
      <circle cx="-20" cy="-12" r="18" fill={color} />
      <circle cx="18" cy="-12" r="20" fill={color} />
      <circle cx="0" cy="-24" r="22" fill={color} />
      <circle cx="-6" cy="-32" r="8" fill="#ffffff" opacity="0.25" />
    </g>
  );
}

/** The keke, drawn standing on (0, 0) facing right. */
function Keke() {
  return (
    <g transform="translate(-55 -46)">
      <rect width="110" height="34" rx="12" fill="#ffd23f" />
      <rect width="110" height="10" rx="5" fill="#ffe680" />
      <rect x="14" y="6" width="40" height="14" rx="3" fill="#9fd8ff" />
      <rect x="66" y="6" width="22" height="14" rx="3" fill="#9fd8ff" />
      <circle className="lp-wheel" cx="22" cy="38" r="9" fill="#111" />
      <circle className="lp-wheel" cx="92" cy="38" r="9" fill="#111" />
    </g>
  );
}

/** The danfo, drawn standing on (0, 0) facing right. */
function Danfo() {
  return (
    <g transform="translate(-85 -57)">
      <rect width="170" height="44" rx="10" fill="#ff6a4d" />
      <rect width="170" height="10" rx="5" fill="#ff9a84" />
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x={12 + i * 36} y="10" width="28" height="16" rx="3" fill="#9fd8ff" />
      ))}
      <circle className="lp-wheel" cx="30" cy="47" r="10" fill="#111" />
      <circle className="lp-wheel" cx="138" cy="47" r="10" fill="#111" />
    </g>
  );
}

/** A vehicle driving along a lane of the curved road, tilting with it. */
function Drive({
  lane,
  dur,
  begin,
  park,
  reduce,
  children,
}: {
  lane: number;
  dur: string;
  begin: string;
  /** Where it waits when motion is reduced. */
  park: number;
  reduce: boolean;
  children: React.ReactNode;
}) {
  if (reduce) return <g transform={onArc(park, lane)}>{children}</g>;
  return (
    <g>
      {children}
      <animateMotion
        path={arc(lane, -260, 1700)}
        dur={dur}
        begin={begin}
        repeatCount="indefinite"
        rotate="auto"
      />
    </g>
  );
}

// Trees on the far rim of the bowl, a soft curving skyline behind everything.
const rim = Array.from({ length: 24 }, (_, i) => ({
  x: -120 + i * 72,
  r: 34 + ((i * 37) % 30),
}));

/**
 * The hero scene: the main gate in the middle of a curved campus. Senate House
 * and the library rise on the left, the hostels on the right, all leaning in
 * along the curve with their sides turned to the gate. Hills, the lagoon and
 * the road bend with the ground; the keke and danfo ride the curve. Layers drop
 * in on load and drift with the pointer.
 */
export function GateScene({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion() ?? false;

  useParallax(ref);

  return (
    <div ref={ref} className={className} aria-hidden>
      <svg
        viewBox="0 80 1440 460"
        preserveAspectRatio="xMidYMax slice"
        className="block h-full w-full overflow-visible"
      >
        {/* Far: the tree line on the rim, and the lagoon with a boat */}
        <g data-depth="far" className="lp-layer">
          {rim.map((t, i) => (
            <circle
              key={i}
              transform={onArc(t.x, R - 70)}
              cx="0"
              cy="0"
              r={t.r}
              fill={i % 2 ? "#cfe0ff" : "#dbe6ff"}
            />
          ))}
          <path d={band(R - 74, R)} fill="#dbe6ff" />
          <path d={band(R - 40, R)} fill="#9fd8ff" />
          <g transform={onArc(1372, R - 26)}>
            <g className="lp-bob" style={{ animationDuration: "4s" }}>
              <path d="M-27 0 h54 l-10 12 h-34 Z" fill="#ff6a4d" />
              <path d="M-1 0 V-28 l18 24 Z" fill="#ffffff" />
            </g>
          </g>
        </g>

        {/* Mid: the buildings and the gate, all standing on the curve */}
        <g data-depth="mid" className="lp-layer">
          <g transform={onArc(190)}>
            <g className="lp-drop" style={{ animationDelay: "0.05s" }}>
              <Box
                w={124}
                h={300}
                d={46}
                dir={1}
                front="#c4d3ff"
                side="#8fa6f0"
                top="#e6ecff"
                sideRows={9}
                sideWindow="#3a5bff"
              >
                <rect x="-30" y="-322" width="60" height="22" fill="#e6ecff" />
                <rect x="-30" y="-322" width="60" height="6" fill="#ffffff" />
                <Windows
                  x={-48}
                  y={-282}
                  cols={3}
                  rows={9}
                  w={24}
                  h={20}
                  gapX={36}
                  gapY={30}
                  color="#3a5bff"
                />
              </Box>
            </g>
          </g>

          <g transform={onArc(420)}>
            <g className="lp-drop" style={{ animationDelay: "0.15s" }}>
              <Box w={170} h={140} d={30} dir={1} front="#d6f7e8" side="#8fd9b6" top="#effcf6">
                <path d="M-92 -140 L0 -186 L92 -140 Z" fill="#3ddc97" />
                <path d="M92 -140 L0 -186 l30 -18 L122 -158 Z" fill="#1f9d63" />
                <Windows
                  x={-68}
                  y={-110}
                  cols={4}
                  rows={2}
                  w={26}
                  h={36}
                  gapX={38}
                  gapY={50}
                  color="#1b1f3b"
                  rx={13}
                />
              </Box>
            </g>
          </g>

          <g transform={onArc(1030)}>
            <g className="lp-drop" style={{ animationDelay: "0.2s" }}>
              <Box w={200} h={170} d={30} dir={-1} front="#ffd9cf" side="#f0a896" top="#fff0eb">
                <Windows
                  x={-86}
                  y={-150}
                  cols={5}
                  rows={3}
                  w={24}
                  h={28}
                  gapX={38}
                  gapY={46}
                  color="#ff6a4d"
                  rx={3}
                />
              </Box>
            </g>
          </g>

          <g transform={onArc(1255)}>
            <g className="lp-drop" style={{ animationDelay: "0.1s" }}>
              <Box
                w={116}
                h={250}
                d={44}
                dir={-1}
                front="#e4dcff"
                side="#b9a6ff"
                top="#f3efff"
                sideRows={7}
                sideWindow="#7a5cff"
              >
                <Windows
                  x={-44}
                  y={-230}
                  cols={3}
                  rows={7}
                  w={22}
                  h={22}
                  gapX={34}
                  gapY={31}
                  color="#7a5cff"
                />
              </Box>
            </g>
          </g>

          {/* The main gate, square on to you */}
          <g transform={onArc(CX)}>
            <g className="lp-drop" style={{ animationDelay: "0.28s" }}>
              <g transform="scale(0.68) translate(-560 -560)">
                <path d="M300 300 l22 -18 h476 l22 18 Z" fill="#e4dfd2" />
                <path
                  d="M300 300 H820 V566 H790 V486 A45 45 0 0 0 700 486 V566 H670 V440 A110 110 0 0 0 450 440 V566 H420 V486 A45 45 0 0 0 330 486 V566 H300 Z"
                  fill="#f2efe8"
                />
                <path d="M300 300 H820 V372 H300 Z" fill="#ffffff" />
                <path d="M300 372 H820" stroke="#d8d2c4" strokeWidth="6" />
                <path
                  d="M450 440 A110 110 0 0 1 670 440 l-16 6 A94 94 0 0 0 466 446 Z"
                  fill="#d8d2c4"
                />
                <path
                  d="M330 486 A45 45 0 0 1 420 486 l-10 4 A35 35 0 0 0 340 490 Z"
                  fill="#d8d2c4"
                />
                <path
                  d="M700 486 A45 45 0 0 1 790 486 l-10 4 A35 35 0 0 0 710 490 Z"
                  fill="#d8d2c4"
                />
                <rect x="534" y="244" width="52" height="40" rx="6" fill="#3a5bff" />
                <path
                  d="M560 252 l5 10 l11 2 l-8 8 l2 11 l-10 -5 l-10 5 l2 -11 l-8 -8 l11 -2 Z"
                  fill="#ffd23f"
                />
                {[318, 802].map((fx, i) => (
                  <g key={fx}>
                    <path
                      d={`M${fx} 300 V236`}
                      stroke={NAVY}
                      strokeWidth="4"
                      strokeLinecap="round"
                    />
                    <g className="lp-wave" style={{ animationDelay: `${i * -0.5}s` }}>
                      <path d={`M${fx + 2} 238 h40 v24 h-40 Z`} fill="#3a5bff" />
                      <path d={`M${fx + 15} 238 h14 v24 h-14 Z`} fill="#ffffff" />
                    </g>
                  </g>
                ))}
              </g>
            </g>
          </g>

          {/* The ground, with a lit edge along the curve */}
          <path d={`${arc(R, -160, 1600)} L1600 560 L-160 560 Z`} fill="#3ddc97" />
          <path d={band(R, R + 10)} fill="#7fe8b8" />
        </g>

        {/* Near: palms and bushes on the curve, then the road bending with it */}
        <g data-depth="near" className="lp-layer">
          {[
            { x: 40, s: 1.2, d: 0.4, sway: 0 },
            { x: 300, s: 1.05, d: 0.5, sway: -0.6 },
            { x: 1140, s: 1.05, d: 0.6, sway: -1.2 },
            { x: 1410, s: 1.15, d: 0.7, sway: -0.3 },
          ].map((p, i) => (
            <g key={i} transform={onArc(p.x, R + 8)}>
              <g className="lp-grow" style={{ animationDelay: `${p.d}s` }}>
                <Palm x={0} y={0} s={p.s} delay={p.sway} />
              </g>
            </g>
          ))}
          {[
            { x: 545, c: "#1fbf7a" },
            { x: 600, c: "#b9a6ff" },
            { x: 840, c: "#b9a6ff" },
            { x: 895, c: "#1fbf7a" },
          ].map((b, i) => (
            <g key={i} transform={onArc(b.x, R + 8)}>
              <g className="lp-grow" style={{ animationDelay: `${0.5 + i * 0.08}s` }}>
                <Bush color={b.c} s={0.8} />
              </g>
            </g>
          ))}

          <path d={band(R + 34, R + 104)} fill="#2a2d3e" />
          <path d={band(R + 34, R + 40)} fill="#4a4e66" />
          <path
            className="lp-dash"
            d={arc(R + 70, -160, 1600)}
            stroke="#f6f6f4"
            strokeWidth="4"
            strokeDasharray="34 26"
            fill="none"
          />
          <Drive lane={R + 58} dur="15s" begin="-3s" park={420} reduce={reduce}>
            <Keke />
          </Drive>
          <Drive lane={R + 96} dur="24s" begin="-14s" park={1030} reduce={reduce}>
            <Danfo />
          </Drive>
          <path d={`${arc(R + 104, -160, 1600)} L1600 560 L-160 560 Z`} fill="#2bb673" />
        </g>
      </svg>
    </div>
  );
}
