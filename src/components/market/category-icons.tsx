import type { JSX } from "react";
import type { CategoryId } from "@/services/types";

/*
 * Kamplug's category icons: flat, warm, no outlines, a few shapes each, with a
 * darker shade for depth and a soft highlight. Drawn on a 64×64 grid. Each
 * category leads with its own warm colour (see docs/DESIGN_GUIDE.md).
 */

const INK = "#1F1A17";

/** Food & groceries: an enamel bowl heaped with jollof and fried plantain. */
function Food() {
  return (
    <>
      <ellipse cx="32" cy="57" rx="18" ry="2.5" fill={INK} opacity="0.08" />
      {/* back rim */}
      <path
        d="M8 31 Q32 20 56 31"
        stroke="#C9302A"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
      />
      {/* jollof heap */}
      <path d="M11 31 Q14 15 32 14 Q50 15 53 31 Q32 37 11 31 Z" fill="#EE6A2E" />
      <path
        d="M18 23 Q24 17.5 31 17"
        stroke="#FF9A5C"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="40" cy="22" r="1" fill="#FFB07A" />
      <circle cx="44" cy="26" r="1" fill="#FFB07A" />
      <circle cx="21" cy="28" r="1" fill="#FFB07A" />
      {/* plantain */}
      <ellipse cx="27" cy="25" rx="6" ry="3.4" transform="rotate(-20 27 25)" fill="#FFC93C" />
      <ellipse cx="27" cy="25" rx="3" ry="1.5" transform="rotate(-20 27 25)" fill="#E89A14" />
      <ellipse cx="37" cy="28.5" rx="6" ry="3.4" transform="rotate(12 37 28.5)" fill="#FFC93C" />
      <ellipse cx="37" cy="28.5" rx="3" ry="1.5" transform="rotate(12 37 28.5)" fill="#E89A14" />
      <path d="M43 16.5 Q49 13 51.5 17 Q46.5 20.5 43 16.5 Z" fill="#22A060" />
      {/* bowl */}
      <path d="M8 31 Q9 52 32 54 Q55 52 56 31 Q32 40 8 31 Z" fill="#FFFFFF" />
      <path d="M44 38 Q52 36 54.5 33 Q53 47 42 51.5 Q47 44 44 38 Z" fill="#EFE9E3" />
      <path
        d="M12.5 44 Q32 50 51.5 44"
        stroke="#E8452F"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />
      {/* front rim */}
      <path
        d="M8 31 Q32 40 56 31"
        stroke="#E8452F"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
      />
    </>
  );
}

/** Fashion: a sneaker. */
function Fashion() {
  return (
    <>
      <ellipse cx="33" cy="55" rx="24" ry="2.5" fill={INK} opacity="0.08" />
      {/* sole */}
      <path d="M6 43 H55 Q60 43 60 47.5 Q60 52 55 52 H10 Q6 52 6 48 Z" fill="#FFFFFF" />
      <path d="M6.5 47.5 H59.5" stroke="#E8E4DF" strokeWidth="2" />
      {/* upper */}
      <path
        d="M9 43 V22 Q9 17 14 17 H21 Q25 17 27 21 L32 31 Q42 31.5 50 35 Q58 38.5 58 43 Z"
        fill="#8B5CF6"
      />
      {/* tongue and collar */}
      <path d="M21.5 18 L25.5 13.5 Q28 12.5 28.8 15 L30.5 27 Z" fill="#B79CFB" />
      <path d="M9 22 Q9 17 14 17 H17 V43 H9 Z" fill="#6B3FC4" />
      {/* toe cap */}
      <path d="M42 33.2 Q51 34.5 55.5 38 Q58 40 58 43 H46 Q42 40.5 42 33.2 Z" fill="#B79CFB" />
      {/* stripe */}
      <path
        d="M19 39.5 Q29.5 35 40 38.5"
        stroke="#FFFFFF"
        strokeWidth="3.2"
        strokeLinecap="round"
        fill="none"
      />
      {/* laces */}
      <path
        d="M22.5 23.5 L28 22.2 M24.2 27.2 L29.8 25.9 M26.4 30.8 L32 29.6"
        stroke={INK}
        strokeWidth="2.1"
        strokeLinecap="round"
      />
    </>
  );
}

/** Beauty: a lipstick and a jar of cream. */
function Beauty() {
  return (
    <>
      <ellipse cx="33" cy="56" rx="22" ry="2.5" fill={INK} opacity="0.08" />
      {/* jar */}
      <rect x="31" y="37" width="23" height="18" rx="4.5" fill="#FFD3DA" />
      <rect x="31" y="43.5" width="23" height="5" fill="#FFFFFF" opacity="0.75" />
      <rect x="29.5" y="29.5" width="26" height="9" rx="3" fill="#F0445B" />
      <rect x="32" y="31.5" width="10" height="2.5" rx="1.25" fill="#FF8597" />
      {/* lipstick */}
      <path d="M16 31 V19.5 L24.5 14.5 V31 Z" fill="#F0445B" />
      <path d="M21 31 V17.4 L24.5 14.5 V31 Z" fill="#C02655" />
      <rect x="14.5" y="30.5" width="11.5" height="4.5" rx="1" fill="#FFC93C" />
      <rect x="14.5" y="34.5" width="11.5" height="20.5" rx="2" fill={INK} />
      <rect x="16.5" y="37" width="2.5" height="15" rx="1.25" fill="#FFFFFF" opacity="0.18" />
    </>
  );
}

/** Technology: headphones. */
function Tech() {
  return (
    <>
      <ellipse cx="32" cy="57" rx="20" ry="2.5" fill={INK} opacity="0.08" />
      <path
        d="M14 39 V32 Q14 13 32 13 Q50 13 50 32 V39"
        stroke="#4DB4E6"
        strokeWidth="6"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M20 21 Q25 16.5 32 16.5"
        stroke="#9AD7F2"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      {/* cups */}
      <rect x="8" y="34" width="13" height="20" rx="6.5" fill="#1F78A8" />
      <rect x="16.5" y="36.5" width="6.5" height="15" rx="3.25" fill="#4DB4E6" />
      <rect x="43" y="34" width="13" height="20" rx="6.5" fill="#1F78A8" />
      <rect x="41" y="36.5" width="6.5" height="15" rx="3.25" fill="#4DB4E6" />
      <rect x="10.5" y="38" width="2.5" height="10" rx="1.25" fill="#FFFFFF" opacity="0.25" />
    </>
  );
}

/** Academics: a stack of books. */
function Academics() {
  return (
    <>
      <ellipse cx="32" cy="57" rx="23" ry="2.5" fill={INK} opacity="0.08" />
      {/* bottom */}
      <rect x="8" y="44" width="46" height="11" rx="2.5" fill="#22A060" />
      <rect x="12" y="46.5" width="40" height="6" rx="1" fill="#FFF6E0" />
      <path d="M15 49.5 H49" stroke="#EADBB8" strokeWidth="1.2" />
      {/* middle */}
      <g transform="rotate(-4 32 38)">
        <rect x="11" y="33" width="42" height="10.5" rx="2.5" fill="#FFC93C" />
        <rect x="11" y="35.5" width="37" height="5.5" rx="1" fill="#FFF6E0" />
        <path d="M14 38.2 H45" stroke="#EADBB8" strokeWidth="1.2" />
      </g>
      {/* top */}
      <g transform="rotate(3 32 27)">
        <rect x="14" y="22" width="36" height="10" rx="2.5" fill="#FF8A3D" />
        <rect x="18" y="24.5" width="32" height="5" rx="1" fill="#FFF6E0" />
        <path d="M37 22 V16 L40 18 L43 16 V22 Z" fill="#E8452F" />
      </g>
    </>
  );
}

/** Lifestyle: a wrapped gift. */
function Lifestyle() {
  return (
    <>
      <ellipse cx="32" cy="57" rx="21" ry="2.5" fill={INK} opacity="0.08" />
      {/* box */}
      <rect x="12" y="32" width="40" height="23" rx="3" fill="#A3D63C" />
      <rect x="12" y="32" width="40" height="3.5" fill={INK} opacity="0.12" />
      <rect x="9" y="24.5" width="46" height="9.5" rx="3" fill="#C2E874" />
      {/* ribbon */}
      <rect x="28.5" y="24.5" width="7" height="30.5" fill="#8B5CF6" />
      <rect x="28.5" y="24.5" width="7" height="9.5" fill="#B79CFB" />
      {/* bow */}
      <path d="M32 25 Q21 11 16.5 18.5 Q14.5 25 32 25 Z" fill="#8B5CF6" />
      <path d="M32 25 Q43 11 47.5 18.5 Q49.5 25 32 25 Z" fill="#6B3FC4" />
      <circle cx="32" cy="24.5" r="3.2" fill="#B79CFB" />
    </>
  );
}

const ICONS: Record<CategoryId, () => JSX.Element> = {
  food: Food,
  fashion: Fashion,
  beauty: Beauty,
  tech: Tech,
  academics: Academics,
  lifestyle: Lifestyle,
};

/** A category's icon. Decorative: the category name always sits beside it. */
export function CategoryIcon({ id, className }: { id: CategoryId; className?: string }) {
  const Icon = ICONS[id];
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden focusable="false">
      <Icon />
    </svg>
  );
}
