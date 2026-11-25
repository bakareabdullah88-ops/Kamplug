import {
  AccessoriesIcon,
  BeautyIcon,
  BooksIcon,
  FashionIcon,
  FoodIcon,
  TechIcon,
} from "@/components/icons/kamplug-icons";
import type { AppIcon } from "@/components/icons/kamplug-icons";
import type { ArtMotif, CategoryId } from "@/services/types";
import type { ArtPalette } from "@/design/tokens";
import { type LucideIcon } from "lucide-react";

export type Category = {
  id: CategoryId;
  name: string;
  /** Short line for rails and empty states */
  blurb: string;
  motif: ArtMotif;
  palette: ArtPalette;
  icon: LucideIcon | AppIcon;
};

/**
 * Phase 1: physical products only, in the order shoppers see them.
 * BACKEND-SEAM: could be served by the API later.
 */
export const categories: readonly Category[] = [
  {
    id: "food",
    icon: FoodIcon,
    name: "Food & groceries",
    blurb: "Meals, snacks, drinks, groceries",
    motif: "bowl",
    palette: "ochre",
  },
  {
    id: "fashion",
    icon: FashionIcon,
    name: "Fashion",
    blurb: "Thrift, clothes, shoes, bags",
    motif: "tee",
    palette: "clay",
  },
  {
    id: "beauty",
    icon: BeautyIcon,
    name: "Beauty",
    blurb: "Skincare, haircare, makeup",
    motif: "dropper",
    palette: "rose",
  },
  {
    id: "tech",
    icon: TechIcon,
    name: "Technology",
    blurb: "Chargers, gadgets, accessories",
    motif: "earbuds",
    palette: "ink",
  },
  {
    id: "academics",
    icon: BooksIcon,
    name: "Academics",
    blurb: "Textbooks, past questions, stationery",
    motif: "book",
    palette: "sage",
  },
  {
    id: "lifestyle",
    icon: AccessoriesIcon,
    name: "Lifestyle",
    blurb: "Accessories, gifts, room essentials",
    motif: "bracelet",
    palette: "plum",
  },
] as const;

/** Categories from before Phase 1, and where their shops and products live now. */
export const legacyCategory: Record<string, CategoryId> = {
  thrift: "fashion",
  books: "academics",
  accessories: "lifestyle",
  print: "lifestyle",
};

/** A category id from a link or old data, as a current one (or null if unknown). */
export function toCategoryId(id: string | null | undefined): CategoryId | null {
  if (!id) return null;
  if (categories.some((c) => c.id === id)) return id as CategoryId;
  return legacyCategory[id] ?? null;
}

export function categoryById(id: CategoryId): Category {
  const c = categories.find((x) => x.id === id);
  if (!c) throw new Error(`Unknown category ${id}`);
  return c;
}

export function categoryName(id: CategoryId) {
  return categoryById(id).name;
}
