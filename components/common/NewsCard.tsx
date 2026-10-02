import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarDays } from "lucide-react";
import { formatDate } from "@/lib/utils/formatDate";
import type { NewsItem } from "@/types";

/** News teaser card with image, category, date, title and excerpt. */
export function NewsCard({ item }: { item: NewsItem }) {
  return (
    <Link
      href={`/news/${item.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-brand-100">
        <Image
          src={item.featuredImage || "/images/campus-building.jpg"}
          alt=""
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <span className="absolute top-4 left-4 rounded-full bg-gold-400 px-3 py-1 text-xs font-semibold text-brand-900">{item.category}</span>
      </div>
      <div className="flex flex-1 flex-col p-6">
        {item.publishedAt ? (
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <CalendarDays className="size-3.5" aria-hidden />
            <time dateTime={item.publishedAt}>{formatDate(item.publishedAt)}</time>
          </p>
        ) : null}
        <h3 className="mt-3 line-clamp-2 font-sans text-lg leading-snug font-bold text-brand-800 group-hover:text-brand-600">{item.title}</h3>
        <p className="mt-2 line-clamp-3 flex-1 text-sm text-muted-foreground">{item.excerpt}</p>
        <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600">
          Read more <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}
