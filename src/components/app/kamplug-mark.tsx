import { SocketSlots } from "@/lib/brand-mark";
import { cn } from "@/lib/cn";

/** The socket mark in the current text colour, without its tile. */
export function KamplugMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={cn("size-6", className)} aria-hidden>
      <SocketSlots color="currentColor" />
    </svg>
  );
}

/** The mark on its cobalt tile, as on the app icon. */
export function KamplugTile({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={cn("size-8 shrink-0", className)} aria-hidden>
      <rect width="64" height="64" rx="16" className="fill-brand" />
      <SocketSlots color="#ffffff" />
    </svg>
  );
}

/** "kamplug" in the heading font: lowercase, tight, one colour. */
export function KamplugWordmark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "font-display leading-none font-extrabold tracking-[-0.05em] text-ink lowercase",
        className,
      )}
    >
      kamplug
    </span>
  );
}

/**
 * The full logo: the tile and the wordmark side by side. The tile scales with
 * the text (1.15em), so one font size sets the whole thing.
 */
export function KamplugLogo({
  className,
  wordClassName,
}: {
  className?: string;
  wordClassName?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-[0.32em]", className)}>
      <KamplugTile className="size-[1.15em]" />
      <KamplugWordmark className={cn("text-[1em]", wordClassName)} />
    </span>
  );
}
