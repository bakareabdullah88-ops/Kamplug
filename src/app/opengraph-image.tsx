import { ImageResponse } from "next/og";
import { brand } from "@/config/brand";
import { BrandMarkSvg, brandColors } from "@/lib/brand-mark";
import { defaultFontPreset, emphasis, getFontPreset } from "@/config/font-presets";

export const alt = `${brand.name}: buy from student brands on your campus`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Loads the display font from Google Fonts; falls back to the default face if offline at build. */
async function loadFont(
  family: string,
  weight: number,
  italic: boolean,
): Promise<ArrayBuffer | null> {
  "use cache";
  try {
    const query = `${family.replace(/ /g, "+")}:ital,wght@${italic ? 1 : 0},${weight}`;
    const css = await (await fetch(`https://fonts.googleapis.com/css2?family=${query}`)).text();
    const src = css.match(/src: url\((.+?)\) format\('(opentype|truetype)'\)/)?.[1];
    if (!src) return null;
    return await (await fetch(src)).arrayBuffer();
  } catch {
    return null;
  }
}

export default async function OpengraphImage() {
  const { family, weight } = getFontPreset(defaultFontPreset).display;
  const [regular, italic] = await Promise.all([
    loadFont(family, weight, false),
    emphasis === "italic" ? loadFont(family, weight, true) : Promise.resolve(null),
  ]);
  const serif = regular ? family : "serif";
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: brandColors.paper,
        fontFamily: serif,
        color: brandColors.ink,
      }}
    >
      {/* Just the mark, the name and one line: room to breathe at any preview size. */}
      <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
        <BrandMarkSvg size={132} />
        <div style={{ display: "flex", fontSize: 128, letterSpacing: -6, lineHeight: 1 }}>
          kamplug
        </div>
      </div>
      <div style={{ display: "flex", marginTop: 40, fontSize: 46, letterSpacing: -1.5 }}>
        Your campus plug. Buy and sell at&nbsp;
        <span style={{ color: brandColors.cobalt }}>UNILAG.</span>
      </div>
    </div>,
    {
      ...size,
      fonts: [
        ...(regular
          ? [
              {
                name: family,
                data: regular,
                style: "normal" as const,
                weight,
              },
            ]
          : []),
        ...(italic
          ? [
              {
                name: family,
                data: italic,
                style: "italic" as const,
                weight,
              },
            ]
          : []),
      ],
    },
  );
}
