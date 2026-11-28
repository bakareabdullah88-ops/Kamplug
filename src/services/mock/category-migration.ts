import { legacyCategory } from "@/config/categories";
import type { DbSnapshot } from "./seed";

const isLegacy = (c: string) => Object.hasOwn(legacyCategory, c);

/** True while any shop or product still has a category from before Phase 1. */
export function hasLegacyCategories(db: DbSnapshot) {
  return (
    db.brands.some((b) => isLegacy(b.category)) || db.products.some((p) => isLegacy(p.category))
  );
}

/**
 * Phase 1 has six categories: thrift moves into fashion, books into academics,
 * and accessories and print into lifestyle. Nothing is deleted.
 */
export function remapCategories(db: DbSnapshot) {
  for (const b of db.brands) if (isLegacy(b.category)) b.category = legacyCategory[b.category]!;
  for (const p of db.products) if (isLegacy(p.category)) p.category = legacyCategory[p.category]!;
}
