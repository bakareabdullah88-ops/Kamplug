import { ServiceError } from "../errors";
import { atName } from "@/domain/username";
import type { Brand, UserRecord, User } from "../types";
import { getDb, getSessionUserId } from "./db";
import type { DbSnapshot } from "./seed";

export async function currentUser(db?: DbSnapshot): Promise<UserRecord | null> {
  const d = db ?? (await getDb());
  const id = await getSessionUserId();
  if (!id) return null;
  return d.users.find((u) => u.id === id) ?? null;
}

export async function requireUser(db?: DbSnapshot): Promise<UserRecord> {
  const u = await currentUser(db);
  if (!u) throw new ServiceError("UNAUTHORIZED", "Please sign in to continue.");
  return u;
}

export async function requireBrand(db: DbSnapshot): Promise<{ user: UserRecord; brand: Brand }> {
  const user = await requireUser(db);
  const brand = db.brands.find((b) => user.brandIds.includes(b.id));
  if (!brand) throw new ServiceError("FORBIDDEN", "Open a shop first to use Shop Studio.");
  return { user, brand };
}

/** Strip private fields before returning a user to the UI. */
export function publicUser(u: UserRecord): User {
  const { passwordHash, passwordSalt, ...rest } = u;
  return {
    ...structuredClone(rest),
    hasPassword: !!passwordHash,
  };
}

/** Return detached copies so UI mutations never leak into the store. */
export function clone<T>(v: T): T {
  return structuredClone(v);
}

export function nowIso() {
  return new Date().toISOString();
}

export function notFound(what: string): never {
  throw new ServiceError("NOT_FOUND", `${what} not found.`);
}

/** A buyer as a shop sees them: their username, never their real name. */
export function buyerLabel(db: DbSnapshot, buyerId: string, fallback: string): string {
  const u = db.users.find((x) => x.id === buyerId);
  return u ? atName(u) : fallback.startsWith("@") ? fallback : "@buyer";
}

/** An order or thread with the buyer shown by username, for the shop's side. */
export function forShop<T extends { buyerId: string; buyerName: string }>(db: DbSnapshot, x: T): T {
  return { ...x, buyerName: buyerLabel(db, x.buyerId, x.buyerName) };
}

/** A review with its author shown by username, wherever it's read. */
export function withAuthor<T extends { userId: string; authorName: string }>(
  db: DbSnapshot,
  r: T,
): T {
  return { ...r, authorName: buyerLabel(db, r.userId, r.authorName) };
}
