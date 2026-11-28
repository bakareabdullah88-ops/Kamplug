/**
 * Usernames: what shops see instead of a buyer's real name. Everyone has one;
 * until they pick their own it's made from their first name and their account
 * id, so it never changes on its own and never shows their full name.
 */
export const USERNAME_RE = /^[a-z0-9_]{3,20}$/;

export function defaultUsername(u: { id: string; name: string }): string {
  const first = (u.name.trim().split(/\s+/)[0] ?? "")
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .slice(0, 12);
  const tail = u.id
    .replace(/[^a-z0-9]/gi, "")
    .slice(-4)
    .toLowerCase();
  return `${first.length >= 2 ? first : "student"}_${tail}`;
}

export function usernameOf(u: { id: string; name: string; username?: string | undefined }): string {
  return u.username ?? defaultUsername(u);
}

/** "@bisi_x7k2", for showing a buyer to a shop. */
export function atName(u: { id: string; name: string; username?: string | undefined }): string {
  return `@${usernameOf(u)}`;
}
