import { cn } from "@/lib/cn";

/**
 * A word stacked in rows as poster type: the first rows solid, the rest only
 * outlined, so it reads as a pattern behind whatever sits in front. Takes its
 * colour from the text colour. Decorative: always hidden from screen readers,
 * so say the same thing in a real heading.
 */
export function PosterWords({
  word,
  rows = 4,
  solid = 2,
  stroke = 2,
  repeat = 1,
  className,
}: {
  word: string;
  rows?: number;
  /** How many rows are filled before the outlined ones start. */
  solid?: number;
  /** Outline width in px. */
  stroke?: number;
  /** Times the word repeats along each row, to fill a wide band. */
  repeat?: number;
  className?: string;
}) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none font-display font-extrabold tracking-[-0.03em] whitespace-nowrap uppercase select-none",
        className,
      )}
      // Inline, so a text-size class passed in can't reset the tight leading.
      style={{ lineHeight: 0.82 }}
    >
      {Array.from({ length: rows }, (_, i) => (
        <p
          key={i}
          // The word is drawn by CSS, not written in the page, so screen readers,
          // search engines and link previews don't read it out four times.
          data-word={Array.from({ length: repeat }, () => word).join(" ")}
          className={cn("before:content-[attr(data-word)]", i < solid && i > 0 && "opacity-75")}
          // Outlined rows keep the text colour for the stroke and only drop the fill.
          style={
            i < solid
              ? undefined
              : { WebkitTextStroke: `${stroke}px currentColor`, WebkitTextFillColor: "transparent" }
          }
        />
      ))}
    </div>
  );
}
