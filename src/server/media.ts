import "server-only";
import { newId } from "@/lib/ids";
import { deleteMedia, readMedia, saveMedia } from "./media-store";
import { errorResponse, limited, sameOrigin } from "./rpc";
import { sessionUser } from "./session";

/** Under Vercel's 4.5MB request limit; the browser shrinks bigger photos first. */
export const MAX_UPLOAD = 4 * 1024 * 1024;
const ACCEPTED = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];
/** Photos a minute, and a day, per account. */
const PER_MINUTE = 20;
const PER_DAY = 300;

/**
 * What the file really is, from its first bytes. The browser's label can say
 * anything, so a page or a script dressed up as a photo is turned away here.
 */
export function sniffImage(b: Uint8Array): string | null {
  const at = (i: number, ...xs: number[]) => xs.every((x, k) => b[i + k] === x);
  const ascii = (i: number, t: string) => at(i, ...[...t].map((c) => c.charCodeAt(0)));
  if (at(0, 0xff, 0xd8, 0xff)) return "image/jpeg";
  if (at(0, 0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a)) return "image/png";
  if (ascii(0, "GIF87a") || ascii(0, "GIF89a")) return "image/gif";
  if (ascii(0, "RIFF") && ascii(8, "WEBP")) return "image/webp";
  if (ascii(4, "ftypavif") || ascii(4, "ftypavis")) return "image/avif";
  return null;
}

/** POST /api/media  (raw image body) → { id, ref } */
export async function handleUpload(req: Request): Promise<Response> {
  if (!sameOrigin(req)) return errorResponse("FORBIDDEN", "Cross-site requests aren't allowed.");
  const type = req.headers.get("content-type")?.split(";")[0]?.trim() ?? "";
  if (!ACCEPTED.includes(type))
    return errorResponse("VALIDATION", "Use a JPG, PNG, WebP or GIF image.");
  const session = await sessionUser(req);
  if (!session) return errorResponse("UNAUTHORIZED", "Please sign in to continue.");
  const declared = Number(req.headers.get("content-length") ?? 0);
  if (declared > MAX_UPLOAD) return errorResponse("VALIDATION", "Images must be under 4MB.");
  if (
    limited(`upload:${session.userId}`, PER_MINUTE) ||
    limited(`upload-day:${session.userId}`, PER_DAY, 24 * 60 * 60_000)
  )
    return errorResponse("UNAVAILABLE", "That's a lot of photos. Wait a little and try again.");
  const bytes = Buffer.from(await req.arrayBuffer());
  if (!bytes.length) return errorResponse("VALIDATION", "That file is empty.");
  if (bytes.length > MAX_UPLOAD) return errorResponse("VALIDATION", "Images must be under 4MB.");
  if (sniffImage(bytes) !== type)
    return errorResponse("VALIDATION", "That file isn't a real image. Try another photo.");
  const id = newId("img");
  try {
    await saveMedia(id, session.userId, type, bytes);
  } catch (e) {
    console.error("[media] upload failed", e);
    return errorResponse("UNAVAILABLE", "We couldn't save that photo. Please try again.");
  }
  return Response.json({ data: { id, ref: { kind: "blob", id } } });
}

/**
 * GET /api/media/:id → the image: a redirect to Cloudflare R2, or the bytes
 * from the database. Ids are random and never reused, so it caches forever.
 * `?inline` sends the bytes from here even when they live on R2, so the page
 * can draw them on a canvas (the poster maker) without a cross-site request.
 */
export async function handleGet(id: string, inline = false): Promise<Response> {
  if (!/^[A-Za-z0-9_-]{1,80}$/.test(id)) return new Response(null, { status: 404 });
  const found = await readMedia(id);
  if (!found) return new Response(null, { status: 404, headers: { "cache-control": "no-store" } });
  const forever = "public, max-age=31536000, immutable";
  if (found.kind === "url" && inline) {
    const res = await fetch(found.url);
    const type = res.headers.get("content-type") ?? "";
    if (!res.ok || !type.startsWith("image/"))
      return new Response(null, { status: 404, headers: { "cache-control": "no-store" } });
    return new Response(res.body, {
      headers: {
        "content-type": type,
        "cache-control": forever,
        "x-content-type-options": "nosniff",
      },
    });
  }
  if (found.kind === "url")
    return new Response(null, {
      status: 302,
      headers: { location: found.url, "cache-control": forever },
    });
  return new Response(new Uint8Array(found.bytes), {
    headers: {
      "content-type": found.contentType,
      "cache-control": forever,
      "x-content-type-options": "nosniff",
    },
  });
}

/** DELETE /api/media/:id: only by whoever uploaded it. */
export async function handleDelete(req: Request, id: string): Promise<Response> {
  if (!sameOrigin(req)) return errorResponse("FORBIDDEN", "Cross-site requests aren't allowed.");
  const session = await sessionUser(req);
  if (!session) return errorResponse("UNAUTHORIZED", "Please sign in to continue.");
  await deleteMedia([id], session.userId);
  return new Response(null, { status: 204 });
}
