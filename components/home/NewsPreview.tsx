import Link from "next/link";
import { ArrowRight, Newspaper } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/common/SectionHeading";
import { EmptyState } from "@/components/common/EmptyState";
import { NewsCard } from "@/components/common/NewsCard";
import { StaggerChildren, StaggerItem } from "@/components/animations/StaggerChildren";
import type { NewsItem } from "@/types";

/** Latest three news posts. */
export function NewsPreview({ news }: { news: NewsItem[] }) {
  return (
    <section className="section bg-muted/50">
      <div className="container-page">
        <SectionHeading eyebrow="Latest news" title="News & announcements" description="Results, admissions updates and achievements from the college." />
        {news.length ? (
          <StaggerChildren className="grid gap-8 md:grid-cols-3">
            {news.map((item) => (
              <StaggerItem key={item.id}>
                <NewsCard item={item} />
              </StaggerItem>
            ))}
          </StaggerChildren>
        ) : (
          <EmptyState icon={Newspaper} title="No news yet" description="Announcements will appear here soon." />
        )}
        <div className="mt-12 text-center">
          <Button asChild variant="outline" size="lg" className="h-12 border-brand-200 px-6 text-brand-700">
            <Link href="/news">
              All news <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
