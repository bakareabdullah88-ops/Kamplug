/**
 * Shareable product posters, drawn on a canvas in the browser: 1080×1350, the
 * size WhatsApp status and Instagram show best. The look is the retro food
 * poster: one flat colour, huge two-tone type used as the layout, and the
 * product photo on top as a tilted sticker, so the type sits behind and the
 * product in front. Three layouts: Stack, Arc and Menu.
 */
import type { CategoryId } from "@/services/types";

export const POSTER_W = 1080;
export const POSTER_H = 1350;

export type PosterStyle = "stack" | "arc" | "menu";

export type PosterPalette = {
  id: string;
  name: string;
  /** The flat background. */
  bg: string;
  /** Type and badges. */
  ink: string;
  /** A shade of the background, for the wave pattern. */
  soft: string;
};

export const posterPalettes: PosterPalette[] = [
  { id: "tomato", name: "Tomato", bg: "#c81e16", ink: "#ffe3b3", soft: "#d4352a" },
  { id: "butter", name: "Butter", bg: "#ffd35c", ink: "#8c1d18", soft: "#ffe08a" },
  { id: "cobalt", name: "Cobalt", bg: "#3a5bff", ink: "#fff1c9", soft: "#4d6bff" },
  { id: "night", name: "Night", bg: "#1b1f3b", ink: "#ffd23f", soft: "#252a4d" },
  { id: "mint", name: "Mint", bg: "#17754c", ink: "#fff1c9", soft: "#1f8458" },
  { id: "blush", name: "Blush", bg: "#ff7aa8", ink: "#5a0f2e", soft: "#ff8fb6" },
];

/** A sensible starting colour for each kind of shop: appetite red for food, and so on. */
export const categoryPalette: Record<CategoryId, PosterPalette["id"]> = {
  food: "tomato",
  thrift: "butter",
  fashion: "night",
  beauty: "blush",
  accessories: "cobalt",
  print: "butter",
  tech: "cobalt",
  books: "mint",
};

/** One loud word per category, for poster type. */
export const categoryWord: Record<CategoryId, string> = {
  food: "FOOD",
  thrift: "THRIFT",
  fashion: "FASHION",
  beauty: "BEAUTY",
  accessories: "EXTRAS",
  print: "PRINT",
  tech: "TECH",
  books: "BOOKS",
};

export function paletteFor(category: CategoryId): PosterPalette {
  return posterPalettes.find((p) => p.id === categoryPalette[category]) ?? posterPalettes[0]!;
}

export type PosterItem = {
  name: string;
  description: string;
  priceText: string;
  /** The product photo, or null to draw its initial instead. */
  image: CanvasImageSource | null;
  imageW: number;
  imageH: number;
};

export type PosterInput = {
  style: PosterStyle;
  palette: PosterPalette;
  /** One item for Stack and Arc; one to three for Menu. */
  items: PosterItem[];
  shopName: string;
  handle: string;
  /** The big word for Stack and Arc. Defaults from the product name. */
  headline?: string;
  /** CSS font families, as the page has them loaded. */
  display: string;
  body: string;
};

type Ctx = CanvasRenderingContext2D;

const font = (weight: number, size: number, family: string) => `${weight} ${size}px ${family}`;

/** The largest size (up to `max`) at which `text` fits in `width`. */
function fit(ctx: Ctx, text: string, width: number, max: number, weight: number, family: string) {
  let size = max;
  ctx.font = font(weight, size, family);
  while (size > 12 && ctx.measureText(text).width > width) {
    size -= 2;
    ctx.font = font(weight, size, family);
  }
  return size;
}

/** Splits text into lines no wider than `width`, at most `max` of them. */
function wrap(ctx: Ctx, text: string, width: number, max: number): string[] {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const next = line ? `${line} ${w}` : w;
    if (ctx.measureText(next).width <= width) line = next;
    else {
      if (line) lines.push(line);
      line = w;
    }
    if (lines.length === max) break;
  }
  if (line && lines.length < max) lines.push(line);
  if (lines.length === max && words.join(" ") !== lines.join(" ")) {
    let last = lines[max - 1]!;
    while (last && ctx.measureText(`${last}…`).width > width) last = last.slice(0, -1);
    lines[max - 1] = `${last.trimEnd()}…`;
  }
  return lines;
}

function roundRect(ctx: Ctx, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

/** Soft wavy bands across the background, like melted cheese. */
function waves(ctx: Ctx, p: PosterPalette) {
  ctx.save();
  ctx.strokeStyle = p.soft;
  ctx.lineWidth = 70;
  ctx.lineCap = "round";
  for (let i = -1; i < 8; i++) {
    const y = i * 190 + 40;
    ctx.beginPath();
    ctx.moveTo(-100, y);
    for (let x = -100; x <= POSTER_W + 200; x += 300) {
      const up = (x / 300 + i) % 2 === 0 ? -90 : 90;
      ctx.quadraticCurveTo(x + 150, y + up, x + 300, y);
    }
    ctx.stroke();
  }
  ctx.restore();
}

/** The product photo as a tilted sticker: white border, rounded, a soft shadow. */
function sticker(
  ctx: Ctx,
  item: PosterItem,
  cx: number,
  cy: number,
  size: number,
  deg: number,
  p: PosterPalette,
  display: string,
  round = false,
) {
  const border = Math.round(size * 0.035);
  const r = round ? size / 2 : size * 0.09;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate((deg * Math.PI) / 180);
  ctx.shadowColor = "rgba(0,0,0,0.28)";
  ctx.shadowBlur = 50;
  ctx.shadowOffsetY = 24;
  ctx.fillStyle = "#ffffff";
  roundRect(ctx, -size / 2, -size / 2, size, size, r);
  ctx.fill();
  ctx.shadowColor = "transparent";
  const inner = size - border * 2;
  roundRect(ctx, -inner / 2, -inner / 2, inner, inner, Math.max(0, r - border));
  ctx.clip();
  if (item.image) {
    // Cover: crop the middle square of the photo.
    const s = Math.min(item.imageW, item.imageH);
    ctx.drawImage(
      item.image,
      (item.imageW - s) / 2,
      (item.imageH - s) / 2,
      s,
      s,
      -inner / 2,
      -inner / 2,
      inner,
      inner,
    );
  } else {
    ctx.fillStyle = p.soft;
    ctx.fillRect(-inner / 2, -inner / 2, inner, inner);
    ctx.fillStyle = p.ink;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = font(800, inner * 0.55, display);
    ctx.fillText((item.name.trim()[0] ?? "K").toUpperCase(), 0, inner * 0.04);
  }
  ctx.restore();
}

/** A round price badge, tilted. */
function priceBadge(
  ctx: Ctx,
  text: string,
  cx: number,
  cy: number,
  r: number,
  p: PosterPalette,
  display: string,
) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate((10 * Math.PI) / 180);
  ctx.fillStyle = p.ink;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = p.bg;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  fit(ctx, text, r * 1.6, r * 0.62, 800, display);
  ctx.fillText(text, 0, r * 0.04);
  ctx.restore();
}

/** The Kamplug socket mark on its tile. */
function mark(ctx: Ctx, x: number, y: number, s: number) {
  const k = s / 64;
  ctx.fillStyle = "#3a5bff";
  roundRect(ctx, x, y, s, s, 16 * k);
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  for (const [rx, ry, rw, rh] of [
    [27.5, 15, 9, 19],
    [12, 40, 17, 9],
    [35, 40, 17, 9],
  ] as const) {
    roundRect(ctx, x + rx * k, y + ry * k, rw * k, rh * k, 4.5 * k);
    ctx.fill();
  }
}

/** The bottom line: where to order, and the shop's handle. */
function footer(ctx: Ctx, input: PosterInput) {
  const { palette: p, display, body } = input;
  const y = POSTER_H - 92;
  mark(ctx, 70, y - 28, 56);
  ctx.fillStyle = p.ink;
  ctx.textBaseline = "middle";
  ctx.textAlign = "left";
  ctx.font = font(800, 40, display);
  ctx.fillText("Order on kamplug", 142, y);
  ctx.textAlign = "right";
  ctx.font = font(600, 36, body);
  fit(ctx, `@${input.handle}`, 380, 36, 600, body);
  ctx.fillText(`@${input.handle}`, POSTER_W - 70, y);
}

/** One word from the product name, for the big type. */
export function headlineFor(name: string): string {
  const words = name
    .replace(/[^\p{L}\p{N}\s'-]/gu, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2);
  // Sizes and counts ("50cl", "12") make poor headlines; use them only if nothing else is left.
  const lettered = words.filter((w) => !/\d/.test(w));
  const pool = lettered.length ? lettered : words;
  // The longest word; on a tie the later one, which is usually the noun ("Small chops" → CHOPS).
  const pick =
    pool.reduce<string | null>((best, w) => (!best || w.length >= best.length ? w : best), null) ??
    name;
  return pick.slice(0, 10).toUpperCase();
}

/** Big word repeated down the poster, solid then outlined, the photo over it. */
function drawStack(ctx: Ctx, input: PosterInput) {
  const { palette: p, display, body } = input;
  const item = input.items[0]!;
  const word = (input.headline?.trim() || headlineFor(item.name)).toUpperCase();
  const rows = 5;
  const size = fit(ctx, word, POSTER_W - 120, 230, 800, display);
  // Five rows between the top and the name line, however tall the word is.
  const top = 70 + size * 0.74;
  const step = Math.min(size * 0.86, (960 - top) / (rows - 1));
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  for (let i = 0; i < rows; i++) {
    const y = top + i * step;
    ctx.font = font(800, size, display);
    if (i < 2) {
      ctx.globalAlpha = i === 0 ? 1 : 0.78;
      ctx.fillStyle = p.ink;
      ctx.fillText(word, POSTER_W / 2, y);
      ctx.globalAlpha = 1;
    } else {
      ctx.lineWidth = 5;
      ctx.strokeStyle = p.ink;
      ctx.strokeText(word, POSTER_W / 2, y);
    }
  }
  sticker(ctx, item, POSTER_W / 2, 590, 580, -6, p, display);
  priceBadge(ctx, item.priceText, 850, 860, 120, p, display);
  ctx.fillStyle = p.ink;
  ctx.textAlign = "center";
  fit(ctx, item.name, POSTER_W - 160, 64, 800, display);
  ctx.textBaseline = "middle";
  ctx.fillText(item.name, POSTER_W / 2, 1090);
  ctx.font = font(500, 34, body);
  ctx.globalAlpha = 0.9;
  ctx.fillText(`from ${input.shopName}`, POSTER_W / 2, 1152);
  ctx.globalAlpha = 1;
  footer(ctx, input);
}

/** Letters set along a circle: the upper arc reads clockwise, the lower one anticlockwise. */
function arcText(
  ctx: Ctx,
  text: string,
  cx: number,
  cy: number,
  r: number,
  centre: number,
  upper: boolean,
) {
  const widths = [...text].map((ch) => ctx.measureText(ch).width + 4);
  const total = widths.reduce((a, b) => a + b, 0);
  let angle = centre - ((upper ? 1 : -1) * total) / r / 2;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  [...text].forEach((ch, i) => {
    const half = widths[i]! / 2 / r;
    angle += upper ? half : -half;
    ctx.save();
    ctx.translate(cx + r * Math.cos(angle), cy + r * Math.sin(angle));
    ctx.rotate(angle + (upper ? Math.PI / 2 : -Math.PI / 2));
    ctx.fillText(ch, 0, 0);
    ctx.restore();
    angle += upper ? half : -half;
  });
}

/** Wavy background, the name curving over the photo and the price curving under it. */
function drawArc(ctx: Ctx, input: PosterInput) {
  const { palette: p, display, body } = input;
  const item = input.items[0]!;
  waves(ctx, p);
  const cx = POSTER_W / 2;
  const cy = 680;
  ctx.fillStyle = p.ink;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = font(700, 44, body);
  ctx.fillText(`Fresh from ${input.shopName}`, cx, 96);

  const word = (input.headline?.trim() || headlineFor(item.name)).toUpperCase();
  // Size the arc type so it spans about 150 degrees.
  const r = 400;
  let size = 200;
  ctx.font = font(800, size, display);
  const span = (t: string) =>
    ([...t].reduce((a, ch) => a + ctx.measureText(ch).width + 4, 0) / r) * (180 / Math.PI);
  while (size > 60 && span(word) > 150) {
    size -= 4;
    ctx.font = font(800, size, display);
  }
  arcText(ctx, word, cx, cy, r, -Math.PI / 2, true);
  ctx.font = font(800, 130, display);
  arcText(ctx, item.priceText, cx, cy, r - 10, Math.PI / 2, false);
  sticker(ctx, item, cx, cy, 500, 5, p, display);
  ctx.font = font(600, 36, body);
  fit(ctx, item.name, POSTER_W - 200, 40, 700, body);
  ctx.fillText(item.name, cx, 1170);
  footer(ctx, input);
}

/** Up to three products down the poster, photo and words swapping sides. */
function drawMenu(ctx: Ctx, input: PosterInput) {
  const { palette: p, display, body } = input;
  const items = input.items.slice(0, 3);
  ctx.fillStyle = p.ink;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const title = (input.headline?.trim() || input.shopName).toUpperCase();
  fit(ctx, title, POSTER_W - 140, 120, 800, display);
  ctx.fillText(title, POSTER_W / 2, 120);
  const top = 220;
  const bottom = POSTER_H - 170;
  const band = (bottom - top) / items.length;
  const photo = Math.min(band - 40, 360);
  items.forEach((item, i) => {
    const cy = top + band * i + band / 2;
    const left = i % 2 === 0;
    const px = left ? 80 + photo / 2 : POSTER_W - 80 - photo / 2;
    sticker(ctx, item, px, cy, photo, left ? -5 : 5, p, display, true);
    const tx = left ? 80 + photo + 50 : 80;
    const tw = POSTER_W - 160 - photo - 50;
    ctx.fillStyle = p.ink;
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    fit(ctx, item.name, tw, 64, 800, display);
    ctx.fillText(item.name, tx, cy - 40);
    ctx.font = font(500, 30, body);
    ctx.globalAlpha = 0.9;
    const lines = wrap(ctx, item.description, tw, items.length === 3 ? 2 : 3);
    lines.forEach((l, k) => ctx.fillText(l, tx, cy + 6 + k * 40));
    ctx.globalAlpha = 1;
    ctx.font = font(800, 48, display);
    ctx.fillText(item.priceText, tx, cy + 26 + lines.length * 40 + 24);
  });
  footer(ctx, input);
}

/** Draws the whole poster onto a 1080×1350 canvas. */
export function drawPoster(canvas: HTMLCanvasElement, input: PosterInput) {
  canvas.width = POSTER_W;
  canvas.height = POSTER_H;
  const ctx = canvas.getContext("2d");
  if (!ctx || !input.items.length) return;
  ctx.fillStyle = input.palette.bg;
  ctx.fillRect(0, 0, POSTER_W, POSTER_H);
  if (input.style === "stack") drawStack(ctx, input);
  else if (input.style === "arc") drawArc(ctx, input);
  else drawMenu(ctx, input);
}
