import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft, CalendarClock, CheckCircle2, MapPin, Wallet } from "lucide-react";
import { PageHero } from "@/components/common/PageHero";
import { JsonLd } from "@/components/common/SEO";
import { JobApplicationForm } from "@/components/forms/JobApplicationForm";
import { getJobBySlug } from "@/lib/data/public";
import { buildMetadata } from "@/lib/utils/seo";
import { formatDate } from "@/lib/utils/formatDate";
import { CONTACT_DEFAULTS, REVALIDATE_SECONDS, SITE } from "@/lib/constants";

export const revalidate = REVALIDATE_SECONDS;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const job = await getJobBySlug(slug);
  if (!job) return { title: "Position not found" };
  return buildMetadata({ title: job.title, description: job.description.slice(0, 160), path: `/careers/${job.slug}` });
}

export default async function JobPage({ params }: Props) {
  const { slug } = await params;
  const job = await getJobBySlug(slug);
  if (!job) notFound();
  const open = new Date(job.deadline).getTime() >= Date.now();

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "JobPosting",
          title: job.title,
          description: job.description,
          datePosted: job.createdAt,
          validThrough: job.deadline,
          employmentType: job.type === "full-time" ? "FULL_TIME" : job.type === "part-time" ? "PART_TIME" : "CONTRACTOR",
          hiringOrganization: { "@type": "Organization", name: SITE.name, sameAs: SITE.url },
          jobLocation: {
            "@type": "Place",
            address: { "@type": "PostalAddress", addressLocality: CONTACT_DEFAULTS.city, addressRegion: CONTACT_DEFAULTS.region, addressCountry: "PK" },
          },
        }}
      />
      <PageHero
        title={job.title}
        description={`${job.department} · ${job.location}`}
        image="/images/gallery-88.jpg"
        breadcrumbs={[
          { name: "Careers", path: "/careers" },
          { name: job.title, path: `/careers/${job.slug}` },
        ]}
      />
      <section className="section">
        <div className="container-page grid gap-12 lg:grid-cols-[1.3fr_1fr]">
          <div className="space-y-10">
            <div className="flex flex-wrap gap-3 text-sm">
              <span className="flex items-center gap-2 rounded-full bg-brand-50 px-4 py-2 text-brand-700">
                <MapPin className="size-4" aria-hidden /> {job.location}
              </span>
              <span className="flex items-center gap-2 rounded-full bg-brand-50 px-4 py-2 text-brand-700">
                <CalendarClock className="size-4" aria-hidden /> Deadline {formatDate(job.deadline)}
              </span>
              {job.salaryRange ? (
                <span className="flex items-center gap-2 rounded-full bg-brand-50 px-4 py-2 text-brand-700">
                  <Wallet className="size-4" aria-hidden /> {job.salaryRange}
                </span>
              ) : null}
            </div>
            <p className="leading-relaxed whitespace-pre-line text-muted-foreground">{job.description}</p>
            {[
              ["Requirements", job.requirements],
              ["Responsibilities", job.responsibilities],
            ].map(([title, items]) =>
              (items as string[]).length ? (
                <div key={title as string}>
                  <h2 className="mb-4 text-2xl font-bold text-brand-800">{title as string}</h2>
                  <ul className="space-y-3">
                    {(items as string[]).map((r) => (
                      <li key={r} className="flex gap-3">
                        <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-leaf-500" aria-hidden /> {r}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null,
            )}
            <Link href="/careers" className="inline-flex items-center gap-2 font-semibold text-brand-600">
              <ArrowLeft className="size-4" /> All positions
            </Link>
          </div>
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <div className="rounded-3xl border bg-card p-6 shadow-xl sm:p-8">
              <h2 className="mb-6 text-2xl font-bold text-brand-800">Apply for this position</h2>
              {open ? (
                <JobApplicationForm jobId={job.id} jobTitle={job.title} />
              ) : (
                <p className="text-muted-foreground">The deadline for this position has passed.</p>
              )}
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
