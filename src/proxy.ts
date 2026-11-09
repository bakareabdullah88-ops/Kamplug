import { NextResponse, type NextRequest } from "next/server";
import { features } from "@/config/features";

/** Pages that stay reachable while Kamplug is on its waitlist. */
const OPEN_PAGES = new Set(["/", "/offline"]);

/**
 * Before launch only the landing page is open: every app, sign-in and sign-up
 * page sends you to the waitlist form, and the sign-in endpoints refuse.
 * (The data API checks the same switch itself.)
 */
export function proxy(request: NextRequest) {
  if (!features.waitlist) return NextResponse.next();
  const { pathname } = request.nextUrl;
  if (OPEN_PAGES.has(pathname)) return NextResponse.next();
  if (pathname.startsWith("/api/auth"))
    return NextResponse.json(
      { error: { code: "FORBIDDEN", message: "Kamplug isn't open yet. Join the waitlist." } },
      { status: 403 },
    );
  return NextResponse.redirect(new URL("/#waitlist", request.url));
}

export const config = {
  // Everything but build files, the data/media/sync APIs and site files (icons, robots, images).
  matcher: [
    "/((?!_next/|api/rpc|api/media|api/sync|favicon|icon|apple-icon|manifest|opengraph-image|robots|sitemap|.*\\.[a-zA-Z0-9]+$).*)",
  ],
};
