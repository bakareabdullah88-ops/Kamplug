/**
 * The Kamplug mark: the face of a Nigerian wall socket, one tall slot over two
 * short ones, cut out of a cobalt tile. Three shapes, so it stays clear from a
 * 16px browser tab up to a share image. One geometry for the in-app mark, the
 * favicon, the app icons and the share image. Pure SVG so it also renders
 * inside ImageResponse.
 */
export const brandColors = {
  /** The brand colour on light backgrounds and on the icon tile. */
  cobalt: "#3A5BFF",
  /** The same cobalt, lifted for dark backgrounds. */
  cobaltBright: "#9FB0FF",
  ink: "#1B1F3B",
  paper: "#F4F5F8",
} as const;

/** The three socket slots on a 64×64 grid. */
export function SocketSlots({ color }: { color: string }) {
  return (
    <g fill={color}>
      <rect x="27.5" y="15" width="9" height="19" rx="4.5" />
      <rect x="12" y="40" width="17" height="9" rx="4.5" />
      <rect x="35" y="40" width="17" height="9" rx="4.5" />
    </g>
  );
}

/**
 * The app-icon tile: cobalt rounded square, white slots. `scale` shrinks the
 * slots towards the middle, for Android icons that get cropped to a circle.
 */
export function BrandMarkSvg({
  size,
  radius = 16,
  scale = 1,
}: {
  size: number;
  radius?: number;
  scale?: number;
}) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64">
      <rect width="64" height="64" rx={radius} fill={brandColors.cobalt} />
      <g transform={`translate(${32 - 32 * scale} ${32 - 32 * scale}) scale(${scale})`}>
        <SocketSlots color="#ffffff" />
      </g>
    </svg>
  );
}
