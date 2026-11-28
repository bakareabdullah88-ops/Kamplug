import { ImageResponse } from "next/og";
import { BrandMarkSvg } from "@/lib/brand-mark";

export function generateImageMetadata() {
  return [
    { id: "32", size: { width: 32, height: 32 }, contentType: "image/png" },
    { id: "192", size: { width: 192, height: 192 }, contentType: "image/png" },
    { id: "512", size: { width: 512, height: 512 }, contentType: "image/png" },
    // Full-bleed with the slots pulled in, for Android's round crop.
    { id: "maskable", size: { width: 512, height: 512 }, contentType: "image/png" },
  ];
}

export default async function Icon({ id }: { id: Promise<string> }) {
  const which = await id;
  const maskable = which === "maskable";
  const size = maskable ? 512 : Number(which);
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex" }}>
      {maskable ? (
        <BrandMarkSvg size={size} radius={0} scale={0.72} />
      ) : (
        <BrandMarkSvg size={size} />
      )}
    </div>,
    { width: size, height: size },
  );
}
