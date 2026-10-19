"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import {
  Bike,
  CircleCheck,
  CookingPot,
  House,
  MessageCircle,
  ReceiptText,
  Store,
  ThumbsUp,
  type LucideIcon,
} from "lucide-react";
import { useMemo } from "react";
import { AppImage } from "@/components/ui/app-image";
import { zonePoints, type LatLng } from "@/config/campus-map";
import { shopZoneId } from "@/domain/distance";
import { stepsFor } from "@/domain/orders";
import { formatTime } from "@/lib/format";
import { cn } from "@/lib/cn";
import type { Brand, Campus, Order, OrderStatus } from "@/services/types";

const stepIcon: Record<OrderStatus, LucideIcon> = {
  placed: ReceiptText,
  confirmed: ThumbsUp,
  preparing: CookingPot,
  ready: Store,
  out_for_delivery: Bike,
  delivered: CircleCheck,
  cancelled: CircleCheck,
  declined: CircleCheck,
};

const W = 640;
const H = 360;
const PAD = 36;
/** Room kept on the right for the lagoon. */
const EAST = 70;

type Pt = { id: string; x: number; y: number };

/**
 * Campus spots placed on a flat map, with each one joined to its nearest
 * neighbours so the paths between them read as campus roads. The far-off
 * sports centre is left out unless the order needs it, so the rest fit.
 */
function layout(ids: string[], must: string[]): Pt[] {
  const keep = ids.filter((id) => must.includes(id) || zonePoints[id]!.lat > 6.505);
  const pts = keep.map((id) => ({ id, p: zonePoints[id]! }));
  const k = Math.cos((6.517 * Math.PI) / 180);
  const xs = pts.map(({ p }) => p.lng * k);
  const ys = pts.map(({ p }) => p.lat);
  const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  const s = Math.min((W - PAD * 2 - EAST) / (x1 - x0 || 1), (H - PAD * 2) / (y1 - y0 || 1));
  const ox = (W - EAST - (x1 - x0) * s) / 2;
  const oy = (H - (y1 - y0) * s) / 2;
  return pts.map(({ id, p }: { id: string; p: LatLng }) => ({
    id,
    x: ox + (p.lng * k - x0) * s,
    y: oy + (y1 - p.lat) * s,
  }));
}

/**
 * Roads: a tree joining every spot by the shortest links (so nothing floats on
 * its own), plus each spot's nearest neighbour for the odd loop, like real paths.
 */
function roads(pts: Pt[]): [number, number][] {
  const d = (a: Pt, b: Pt) => Math.hypot(a.x - b.x, a.y - b.y);
  const edges = new Set<string>();
  const key = (a: number, b: number) => (a < b ? `${a}-${b}` : `${b}-${a}`);
  const inTree = new Set([0]);
  while (inTree.size < pts.length) {
    let [ba, bb, bw] = [-1, -1, Infinity];
    for (const a of inTree)
      for (let b = 0; b < pts.length; b++) {
        if (inTree.has(b)) continue;
        const w = d(pts[a]!, pts[b]!);
        if (w < bw) [ba, bb, bw] = [a, b, w];
      }
    if (bb < 0) break;
    edges.add(key(ba, bb));
    inTree.add(bb);
  }
  pts.forEach((a, i) => {
    let near = -1;
    pts.forEach((b, j) => {
      if (j !== i && (near < 0 || d(a, b) < d(a, pts[near]!))) near = j;
    });
    if (near >= 0) edges.add(key(i, near));
  });
  return [...edges].map((e) => e.split("-").map(Number) as [number, number]);
}

/** Shortest way along the campus roads from one spot to another. */
function route(pts: Pt[], edges: [number, number][], from: number, to: number): number[] {
  const n = pts.length;
  const dist = Array<number>(n).fill(Infinity);
  const prev = Array<number>(n).fill(-1);
  const done = Array<boolean>(n).fill(false);
  dist[from] = 0;
  for (let step = 0; step < n; step++) {
    let u = -1;
    for (let i = 0; i < n; i++) if (!done[i] && (u === -1 || dist[i]! < dist[u]!)) u = i;
    if (u === -1 || dist[u] === Infinity) break;
    done[u] = true;
    if (u === to) break;
    for (const [a, b] of edges) {
      const v = a === u ? b : b === u ? a : -1;
      if (v < 0) continue;
      const w = Math.hypot(pts[u]!.x - pts[v]!.x, pts[u]!.y - pts[v]!.y);
      if (dist[u]! + w < dist[v]!) {
        dist[v] = dist[u]! + w;
        prev[v] = u;
      }
    }
  }
  const path: number[] = [];
  for (let v = to; v !== -1; v = prev[v]!) path.unshift(v);
  return path[0] === from ? path : [];
}

/** What's happening, in one line under the ETA. */
function statusLine(order: Order, placeName: string | undefined): string {
  const shop = order.brandName;
  switch (order.status) {
    case "placed":
      return `Waiting for ${shop} to accept your order`;
    case "confirmed":
    case "preparing":
      return `${shop} is getting your order ready`;
    case "ready":
      return `Ready to collect${placeName ? ` at ${placeName}` : ""}`;
    case "out_for_delivery":
      return "Your order is on its way to you!";
    case "delivered":
      return order.fulfilment.method === "pickup"
        ? "You picked it up. Enjoy!"
        : "Delivered. Enjoy!";
    case "cancelled":
      return "This order was cancelled";
    case "declined":
      return `${shop} couldn't take this order`;
  }
}

/**
 * Live tracking, laid out like a delivery app: a campus map with the route from
 * the shop to you, then a dark panel with when it should arrive, each step as
 * an icon, and the seller with a button to message them.
 */
export function OrderTracking({
  order,
  campus,
  brand,
  arrivesAt,
  onChat,
}: {
  order: Order;
  campus: Campus | undefined;
  brand: Brand | undefined;
  /** When it should arrive (or be ready), when the app can tell. */
  arrivesAt: string | null;
  onChat?: () => void;
}) {
  const reduce = useReducedMotion();
  const pickup = order.fulfilment.method === "pickup";
  const point = campus?.pickupPoints.find((p) => p.id === order.fulfilment.pickupPointId);
  const destZone = pickup ? point?.zoneId : order.fulfilment.zoneId;
  const shopZone = brand ? shopZoneId(brand.fulfilment, campus) : null;
  const placeName = pickup
    ? point?.name
    : campus?.zones.find((z) => z.id === order.fulfilment.zoneId)?.name;

  const map = useMemo(() => {
    const ids = (campus?.zones ?? []).map((z) => z.id).filter((id) => zonePoints[id]);
    const must = [destZone, shopZone].filter((x): x is string => !!x);
    if (!ids.length) return null;
    const pts = layout(ids, must);
    const edges = roads(pts);
    const iFrom = pts.findIndex((p) => p.id === shopZone);
    const iTo = pts.findIndex((p) => p.id === destZone);
    const path = iFrom >= 0 && iTo >= 0 && iFrom !== iTo ? route(pts, edges, iFrom, iTo) : [];
    const east = Math.max(...pts.map((p) => p.x));
    return { pts, edges, path, east, from: pts[iFrom], to: pts[iTo] };
  }, [campus, destZone, shopZone]);

  const steps = stepsFor(order.fulfilment.method);
  const stopped = order.status === "cancelled" || order.status === "declined";
  const reachedAt = (s: OrderStatus) => order.timeline.some((t) => t.status === s);

  return (
    <section aria-label="Order tracking" className="overflow-hidden rounded-2xl ring-1 ring-line">
      <div className="relative bg-[#eef0f5]">
        {map ? (
          <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full" aria-hidden>
            {/* The lagoon along the east side of campus */}
            <path
              d={`M${map.east + 34} 0 C${map.east + 10} ${H * 0.3} ${map.east + 50} ${H * 0.6} ${map.east + 24} ${H} H${W} V0 Z`}
              fill="#cfe6ff"
            />
            {map.edges.map(([a, b], i) => (
              <path
                key={i}
                d={`M${map.pts[a]!.x} ${map.pts[a]!.y} L${map.pts[b]!.x} ${map.pts[b]!.y}`}
                stroke="#dde1ea"
                strokeWidth="13"
                strokeLinecap="round"
              />
            ))}
            {map.edges.map(([a, b], i) => (
              <path
                key={i}
                d={`M${map.pts[a]!.x} ${map.pts[a]!.y} L${map.pts[b]!.x} ${map.pts[b]!.y}`}
                stroke="#ffffff"
                strokeWidth="9"
                strokeLinecap="round"
              />
            ))}
            {map.pts.map((p) => (
              <rect
                key={p.id}
                x={p.x - 9}
                y={p.y - 7}
                width="18"
                height="14"
                rx="3"
                fill="#dfe3ec"
              />
            ))}
            {map.path.length > 1 && (
              <motion.path
                d={map.path
                  .map((i, k) => `${k ? "L" : "M"}${map.pts[i]!.x} ${map.pts[i]!.y}`)
                  .join(" ")}
                stroke="#1b1f3b"
                strokeWidth="4.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
                initial={reduce ? false : { pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
              />
            )}
            {map.from && (
              <g transform={`translate(${map.from.x} ${map.from.y})`}>
                <circle r="11" fill="#ffffff" />
                <circle r="7" fill="#3a5bff" />
              </g>
            )}
            {map.to && (
              <g transform={`translate(${map.to.x} ${map.to.y})`}>
                <circle r="17" fill="#ffffff" stroke="#1b1f3b" strokeWidth="3.5" />
                <House x={-8} y={-8} width={16} height={16} color="#1b1f3b" strokeWidth={2.4} />
              </g>
            )}
          </svg>
        ) : (
          <div className="aspect-[16/9]" />
        )}
        <p className="absolute top-3 left-3 rounded-lg bg-white/90 px-2.5 py-1 text-[12px] font-medium text-ink-2 ring-1 ring-line">
          {map?.path.length
            ? `From ${order.brandName} to ${pickup ? "the pickup spot" : "you"}`
            : (placeName ?? campus?.shortName ?? "Campus")}
        </p>
      </div>

      <div className="bg-[#1b1f3b] text-white">
        <div className="px-5 pt-5 pb-4 text-center md:px-8">
          <p className="text-[16px] font-semibold" aria-live="polite">
            {arrivesAt && !stopped && order.status !== "delivered"
              ? `Estimated ${pickup ? "ready" : "delivery"} time is ${formatTime(arrivesAt)}`
              : order.status === "delivered"
                ? pickup
                  ? "Picked up"
                  : "Delivered"
                : stopped
                  ? "No longer coming"
                  : `${pickup ? "Pickup" : "Delivery"} to ${placeName ?? "you"}`}
          </p>
          <p className="mt-1 text-[14px] text-white/75">{statusLine(order, placeName)}</p>
        </div>

        <ol className="flex items-center gap-1.5 border-t border-white/10 px-5 py-5 md:px-8">
          {steps.map((s, i) => {
            const Icon = stepIcon[s];
            const on = reachedAt(s) && !stopped;
            const current = order.status === s;
            return (
              <li key={s} className={cn("flex items-center gap-1.5", i > 0 && "flex-1")}>
                {i > 0 && (
                  <span
                    aria-hidden
                    className={cn(
                      "h-0 flex-1 border-t-[3px] border-dotted",
                      on ? "border-[#ffd23f]" : "border-white/25",
                    )}
                  />
                )}
                <span
                  className={cn(
                    "grid size-9 shrink-0 place-items-center rounded-full transition-colors",
                    on ? "text-[#ffd23f]" : "text-white/40",
                    current && "bg-white/10",
                  )}
                  title={s.replaceAll("_", " ")}
                >
                  <Icon className="size-5" aria-hidden />
                  <span className="sr-only">
                    {s.replaceAll("_", " ")}: {on ? "done" : "not yet"}
                  </span>
                </span>
              </li>
            );
          })}
        </ol>

        <div className="flex items-center gap-3 border-t border-white/10 px-5 py-4 md:px-8">
          <span className="size-11 shrink-0 overflow-hidden rounded-full bg-white ring-2 ring-white/20">
            <AppImage image={order.brandLogo} alt="" variant="logo" name={order.brandName} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[15px] font-semibold">{order.brandName}</p>
            <p className="text-[13px] text-white/65">
              {pickup ? "Seller · pickup" : "Seller · delivers to you"}
            </p>
          </div>
          <Link
            href={`/brands/${order.brandHandle}`}
            aria-label={`Open ${order.brandName}`}
            className="grid size-11 place-items-center rounded-full bg-white text-[#1b1f3b] transition-colors hover:bg-[#eef1ff]"
          >
            <Store className="size-5" />
          </Link>
          {onChat && (
            <button
              type="button"
              onClick={onChat}
              aria-label={`Message ${order.brandName}`}
              className="grid size-11 place-items-center rounded-full bg-white text-[#1b1f3b] transition-colors hover:bg-[#eef1ff]"
            >
              <MessageCircle className="size-5" />
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
