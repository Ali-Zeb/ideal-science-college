import { NextResponse } from "next/server";
import { getAllEvents, getUpcomingEvents } from "@/lib/data/public";

export const revalidate = 300;

/** GET /api/events?upcoming=1&limit=5 — published events as JSON. */
export async function GET(req: Request) {
  const sp = new URL(req.url).searchParams;
  const limit = Math.min(100, Math.max(1, Number(sp.get("limit")) || 20));
  const items = sp.get("upcoming") ? await getUpcomingEvents(limit) : (await getAllEvents()).slice(0, limit);
  return NextResponse.json({ items });
}
