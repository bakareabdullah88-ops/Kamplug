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

export type Subcategory = { id: string; name: string };

/**
 * What exactly a product is, inside its category (Phase 1). Sellers pick one
 * when they list a product; shoppers filter by it on Discover.
 */
export const subcategories: Record<CategoryId, readonly Subcategory[]> = {
  food: [
    { id: "meals", name: "Meals" },
    { id: "snacks", name: "Snacks" },
    { id: "drinks", name: "Drinks" },
    { id: "groceries", name: "Groceries" },
  ],
  fashion: [
    { id: "thrift", name: "Thrift" },
    { id: "clothes", name: "Clothes" },
    { id: "shoes", name: "Shoes" },
    { id: "bags", name: "Bags" },
  ],
  beauty: [
    { id: "skincare", name: "Skincare" },
    { id: "haircare", name: "Haircare" },
    { id: "makeup", name: "Makeup" },
  ],
  tech: [
    { id: "chargers", name: "Chargers" },
    { id: "gadgets", name: "Gadgets" },
    { id: "tech-accessories", name: "Accessories" },
  ],
  academics: [
    { id: "textbooks", name: "Textbooks" },
    { id: "past-questions", name: "Past questions" },
    { id: "stationery", name: "Stationery" },
  ],
  lifestyle: [
    { id: "accessories", name: "Accessories" },
    { id: "gifts", name: "Gifts" },
    { id: "room-essentials", name: "Room essentials" },
  ],
};

/** True when this sub-category belongs to this category. */
export function isSubcategoryOf(category: CategoryId, sub: string | null | undefined) {
  return !!sub && subcategories[category].some((s) => s.id === sub);
}

/** Soft tints of each category's colour, behind its icon when a shop has no cover photo. */
export const categoryTint: Record<CategoryId, string> = {
  food: "#FFE8D6",
  fashion: "#EEE5FF",
  beauty: "#FFE1E6",
  tech: "#DDF1FB",
  academics: "#DDF3E6",
  lifestyle: "#EEF7D6",
};

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
