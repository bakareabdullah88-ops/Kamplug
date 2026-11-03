import { PosterWords } from "@/components/brand/poster-words";
import { categoryWord, paletteFor } from "@/lib/poster";
import type { CategoryId } from "@/services/types";
import { CategoryArt } from "./category-art";

/**
 * The top of a category page as a food-poster band: the category's word in
 * huge type, stacked solid then outlined, with its drawing in front, in that
 * category's colours (tomato and cream for food). Decorative: the page title
 * says the same thing for screen readers.
 */
export function CategoryPoster({ category, blurb }: { category: CategoryId; blurb: string }) {
  const p = paletteFor(category);
  const word = categoryWord[category];
  return (
    <div
      aria-hidden
      className="relative mb-5 h-[168px] overflow-hidden rounded-2xl md:h-[200px]"
      style={{ background: p.bg, color: p.ink }}
    >
      <PosterWords
        word={word}
        rows={3}
        repeat={4}
        className="absolute inset-x-5 top-4 text-[64px] md:text-[84px]"
      />
      <CategoryArt
        id={category}
        className="absolute -right-4 -bottom-3 h-[118%] w-[62%] drop-shadow-[0_14px_18px_rgba(0,0,0,0.28)] md:w-[46%]"
      />
      <p
        className="absolute bottom-3 left-5 max-w-[55%] rounded-full px-3 py-1 text-[13px] font-semibold"
        style={{ background: p.ink, color: p.bg }}
      >
        {blurb}
      </p>
    </div>
  );
}
