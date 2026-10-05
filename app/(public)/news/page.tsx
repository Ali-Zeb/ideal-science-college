import Link from "next/link";
import { Newspaper } from "lucide-react";
import { PageHero } from "@/components/common/PageHero";
import { EmptyState } from "@/components/common/EmptyState";
import { NewsCard } from "@/components/common/NewsCard";
import { Pagination } from "@/components/common/Pagination";
import { StaggerChildren, StaggerItem } from "@/components/animations/StaggerChildren";
import { getNews } from "@/lib/data/public";
import { buildMetadata } from "@/lib/utils/seo";
import { ITEMS_PER_PAGE, NEWS_CATEGORIES } from "@/lib/constants";
import { cn } from "@/lib/utils";

export const revalidate = 300; // seconds — must be a literal for Next.js segment config

export const metadata = buildMetadata({
  title: "News & Announcements",
  description: "Latest news, results, admissions updates and achievements from Ideal Science College, Serai Naurang.",
  path: "/news",
});

type Props = { searchParams: Promise<{ page?: string; category?: string }> };

export default async function NewsPage({ searchParams }: Props) {
  const sp = await searchParams;
  const page = Math.max(1, Number.parseInt(sp.page ?? "1", 10) || 1);
  const category = (NEWS_CATEGORIES as readonly string[]).includes(sp.category ?? "") ? sp.category : undefined;
  const news = await getNews(page, ITEMS_PER_PAGE, category);

  const href = (p: number, c = category) => {
    const q = new URLSearchParams();
    if (p > 1) q.set("page", String(p));
    if (c) q.set("category", c);
    const s = q.toString();
    return `/news${s ? `?${s}` : ""}`;
  };

  return (
    <>
      <PageHero title="News & Announcements" description="Results, admissions, achievements and campus updates." image="/images/gallery-444.jpg" breadcrumbs={[{ name: "News", path: "/news" }]} />
      <section className="section">
        <div className="container-page">
          <nav aria-label="News categories" className="mb-10 flex flex-wrap gap-2">
            {[undefined, ...NEWS_CATEGORIES].map((c) => (
              <Link
                key={c ?? "all"}
                href={href(1, c)}
                aria-current={c === category ? "page" : undefined}
                className={cn(
                  "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                  c === category ? "border-brand-700 bg-brand-700 text-white" : "hover:border-brand-300 hover:text-brand-700",
                )}
              >
                {c ?? "All"}
              </Link>
            ))}
          </nav>
          {news.items.length ? (
            <StaggerChildren className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {news.items.map((item) => (
                <StaggerItem key={item.id}>
                  <NewsCard item={item} />
                </StaggerItem>
              ))}
            </StaggerChildren>
          ) : (
            <EmptyState icon={Newspaper} title="No news in this category yet" description="Check back soon for updates." />
          )}
          <Pagination page={news.page} totalPages={news.totalPages} hrefFor={(p) => href(p)} />
        </div>
      </section>
    </>
  );
}
