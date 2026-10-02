import { NextResponse } from "next/server";
import { getNews } from "@/lib/data/public";
import { NEWS_CATEGORIES } from "@/lib/constants";

export const revalidate = 300;

/**
 * GET /api/news?page=1&limit=9&category=Results — published news as JSON
 * (for integrations such as a mobile app or notice board screen).
 */
export async function GET(req: Request) {
  const sp = new URL(req.url).searchParams;
  const page = Math.max(1, Number(sp.get("page")) || 1);
  const limit = Math.min(50, Math.max(1, Number(sp.get("limit")) || 9));
  const category = sp.get("category") ?? undefined;
  if (category && !(NEWS_CATEGORIES as readonly string[]).includes(category)) {
    return NextResponse.json({ error: "Unknown category." }, { status: 400 });
  }
  const data = await getNews(page, limit, category);
  return NextResponse.json({ ...data, items: data.items.map(({ content: _content, ...rest }) => rest) });
}
