import type { NextRequest } from "next/server";
import { handleDelete, handleGet } from "@/server/media";

export async function GET(req: NextRequest, ctx: RouteContext<"/api/media/[id]">) {
  return handleGet((await ctx.params).id, req.nextUrl.searchParams.has("inline"));
}

export async function DELETE(req: NextRequest, ctx: RouteContext<"/api/media/[id]">) {
  return handleDelete(req, (await ctx.params).id);
}
