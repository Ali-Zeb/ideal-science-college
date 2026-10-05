import Link from "next/link";
import { ArrowRight, Briefcase, CalendarClock, HeartHandshake, MapPin, TrendingUp, Users } from "lucide-react";
import { PageHero } from "@/components/common/PageHero";
import { SectionHeading } from "@/components/common/SectionHeading";
import { EmptyState } from "@/components/common/EmptyState";
import { StaggerChildren, StaggerItem } from "@/components/animations/StaggerChildren";
import { getOpenJobs } from "@/lib/data/public";
import { buildMetadata } from "@/lib/utils/seo";
import { formatDate } from "@/lib/utils/formatDate";

export const revalidate = 300; // seconds — must be a literal for Next.js segment config

export const metadata = buildMetadata({
  title: "Careers — Teaching Jobs",
  description: "Teaching and staff vacancies at Ideal Science College, Serai Naurang — boys and girls wings, school and college sections.",
  path: "/careers",
});

const TYPE_LABELS = { "full-time": "Full-time", "part-time": "Part-time", visiting: "Visiting" } as const;

export default async function CareersPage() {
  const jobs = await getOpenJobs();
  return (
    <>
      <PageHero
        title="Careers at Ideal Science College"
        description="Join a team of professional teachers. Female candidates are especially welcome for the girls wing."
        image="/images/gallery-88.jpg"
        breadcrumbs={[{ name: "Careers", path: "/careers" }]}
      />
      <section className="section bg-brand-50/60">
        <div className="container-page grid gap-6 sm:grid-cols-3">
          {[
            { icon: HeartHandshake, title: "Respectful workplace", text: "Separate, purdah-observing girls wing with female staff." },
            { icon: TrendingUp, title: "Professional growth", text: "Training sessions and opportunities across the group's colleges." },
            { icon: Users, title: "Supportive team", text: "Experienced colleagues and a disciplined, student-focused culture." },
          ].map(({ icon: Icon, title, text }) => (
            <div key={title} className="rounded-2xl bg-white p-6 shadow-sm">
              <Icon className="mb-3 size-8 text-gold-500" aria-hidden />
              <h2 className="font-sans text-lg font-bold text-brand-800">{title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{text}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="section">
        <div className="container-page max-w-5xl">
          <SectionHeading eyebrow="Open positions" title="Current vacancies" />
          {jobs.length ? (
            <StaggerChildren className="space-y-5">
              {jobs.map((job) => (
                <StaggerItem key={job.id}>
                  <Link
                    href={`/careers/${job.slug}`}
                    className="group flex flex-col gap-4 rounded-2xl border bg-card p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg sm:flex-row sm:items-center"
                  >
                    <span className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-brand-700 text-gold-400">
                      <Briefcase className="size-7" aria-hidden />
                    </span>
                    <div className="flex-1">
                      <h3 className="font-sans text-xl font-bold text-brand-800 group-hover:text-brand-600">{job.title}</h3>
                      <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted-foreground">
                        <span>{job.department}</span>
                        <span>{TYPE_LABELS[job.type]}</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="size-3.5" aria-hidden /> {job.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <CalendarClock className="size-3.5" aria-hidden /> Apply by {formatDate(job.deadline)}
                        </span>
                      </div>
                    </div>
                    <ArrowRight className="size-5 text-brand-500 transition-transform group-hover:translate-x-1" aria-hidden />
                  </Link>
                </StaggerItem>
              ))}
            </StaggerChildren>
          ) : (
            <EmptyState
              icon={Briefcase}
              title="No open positions right now"
              description="We regularly hire teachers. Send your CV through the contact page and we'll keep it on file."
              action={{ label: "Contact us", href: "/contact" }}
            />
          )}
        </div>
      </section>
    </>
  );
}
