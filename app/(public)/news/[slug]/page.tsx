import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft, CalendarDays, Eye, Tag, UserRound } from "lucide-react";
import { PageHero } from "@/components/common/PageHero";
import { NewsCard } from "@/components/common/NewsCard";
import { JsonLd } from "@/components/common/SEO";
import { FadeIn } from "@/components/animations/FadeIn";
import { getNewsBySlug, getRelatedNews, incrementNewsViews } from "@/lib/data/public";
import { sanitizeHtml } from "@/lib/sanitize";
import { absoluteUrl, buildMetadata } from "@/lib/utils/seo";
import { formatDate } from "@/lib/utils/formatDate";
import { REVALIDATE_SECONDS, SITE } from "@/lib/constants";

export const revalidate = REVALIDATE_SECONDS;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const item = await getNewsBySlug(slug);
  if (!item) return { title: "News not found" };
  return buildMetadata({ title: item.title, description: item.excerpt, path: `/news/${item.slug}`, image: item.featuredImage || undefined, type: "article" });
}

export default async function NewsDetailPage({ params }: Props) {
  const { slug } = await params;
  const item = await getNewsBySlug(slug);
  if (!item) notFound();
  const related = await getRelatedNews(item.category, item.id);
  void incrementNewsViews(item.id);

  const articleLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: item.title,
    description: item.excerpt,
    image: item.featuredImage ? [absoluteUrl(item.featuredImage)] : undefined,
    datePublished: item.publishedAt,
    dateModified: item.updatedAt,
    author: { "@type": "Organization", name: SITE.name },
    publisher: { "@type": "Organization", name: SITE.name, logo: { "@type": "ImageObject", url: absoluteUrl(SITE.logo) } },
    mainEntityOfPage: absoluteUrl(`/news/${item.slug}`),
  };

  return (
    <>
      <JsonLd data={articleLd} />
      <PageHero
        title={item.title}
        image={item.featuredImage || undefined}
        breadcrumbs={[
          { name: "News", path: "/news" },
          { name: item.category, path: `/news?category=${encodeURIComponent(item.category)}` },
        ]}
      >
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/80">
          {item.publishedAt ? (
            <span className="flex items-center gap-2">
              <CalendarDays className="size-4 text-gold-400" aria-hidden />
              <time dateTime={item.publishedAt}>{formatDate(item.publishedAt)}</time>
            </span>
          ) : null}
          {item.author ? (
            <span className="flex items-center gap-2">
              <UserRound className="size-4 text-gold-400" aria-hidden /> {item.author.name}
            </span>
          ) : null}
          <span className="flex items-center gap-2">
            <Eye className="size-4 text-gold-400" aria-hidden /> {item.views.toLocaleString()} views
          </span>
        </div>
      </PageHero>

      <article className="section">
        <div className="container-page max-w-3xl">
          {item.featuredImage ? (
            <FadeIn className="relative -mt-28 mb-10 aspect-[16/9] overflow-hidden rounded-3xl shadow-2xl sm:-mt-36">
              <Image src={item.featuredImage} alt="" fill priority sizes="(min-width: 768px) 768px, 100vw" className="object-cover" />
            </FadeIn>
          ) : null}
          <p className="mb-8 text-lg leading-relaxed font-medium text-brand-800">{item.excerpt}</p>
          <div className="prose-content" dangerouslySetInnerHTML={{ __html: sanitizeHtml(item.content) }} />
          {item.tags.length ? (
            <div className="mt-10 flex flex-wrap items-center gap-2 border-t pt-6">
              <Tag className="size-4 text-muted-foreground" aria-hidden />
              {item.tags.map((t) => (
                <span key={t} className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                  #{t}
                </span>
              ))}
            </div>
          ) : null}
          <Link href="/news" className="mt-10 inline-flex items-center gap-2 font-semibold text-brand-600 hover:text-brand-800">
            <ArrowLeft className="size-4" /> Back to all news
          </Link>
        </div>
      </article>

      {related.length ? (
        <section className="section bg-muted/50">
          <div className="container-page">
            <h2 className="mb-8 text-2xl font-bold text-brand-800 sm:text-3xl">Related news</h2>
            <div className="grid gap-8 md:grid-cols-3">
              {related.map((r) => (
                <NewsCard key={r.id} item={r} />
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}
