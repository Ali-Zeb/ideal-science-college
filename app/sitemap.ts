import type { MetadataRoute } from "next";
import { getNews, getOpenJobs, getPrograms } from "@/lib/data/public";
import { absoluteUrl } from "@/lib/utils/seo";

export const revalidate = 3600;

const STATIC_ROUTES: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
  { path: "/", priority: 1, changeFrequency: "daily" },
  { path: "/about", priority: 0.8, changeFrequency: "monthly" },
  { path: "/academics", priority: 0.9, changeFrequency: "monthly" },
  { path: "/academics/faculty", priority: 0.7, changeFrequency: "monthly" },
  { path: "/admissions", priority: 0.9, changeFrequency: "weekly" },
  { path: "/admissions/apply", priority: 0.8, changeFrequency: "monthly" },
  { path: "/campus-life", priority: 0.6, changeFrequency: "monthly" },
  { path: "/news", priority: 0.8, changeFrequency: "daily" },
  { path: "/events", priority: 0.7, changeFrequency: "weekly" },
  { path: "/gallery", priority: 0.6, changeFrequency: "weekly" },
  { path: "/careers", priority: 0.5, changeFrequency: "weekly" },
  { path: "/faq", priority: 0.5, changeFrequency: "monthly" },
  { path: "/contact", priority: 0.7, changeFrequency: "yearly" },
  { path: "/privacy-policy", priority: 0.2, changeFrequency: "yearly" },
  { path: "/terms", priority: 0.2, changeFrequency: "yearly" },
];

/** Dynamic sitemap built from static pages plus programs, news, events and jobs in the database. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [programs, news, jobs] = await Promise.all([getPrograms(), getNews(1, 500), getOpenJobs()]);
  const now = new Date();

  return [
    ...STATIC_ROUTES.map((r) => ({ url: absoluteUrl(r.path), lastModified: now, changeFrequency: r.changeFrequency, priority: r.priority })),
    ...programs.map((p) => ({ url: absoluteUrl(`/academics/${p.slug}`), lastModified: new Date(p.updatedAt), changeFrequency: "monthly" as const, priority: 0.8 })),
    ...news.items.map((n) => ({ url: absoluteUrl(`/news/${n.slug}`), lastModified: new Date(n.updatedAt), changeFrequency: "monthly" as const, priority: 0.6 })),
    ...jobs.map((j) => ({ url: absoluteUrl(`/careers/${j.slug}`), lastModified: new Date(j.createdAt), changeFrequency: "weekly" as const, priority: 0.4 })),
  ];
}
