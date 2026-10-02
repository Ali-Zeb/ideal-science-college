import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowRight, Briefcase, CheckCircle2, Clock, Users, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHero } from "@/components/common/PageHero";
import { JsonLd, collegeJsonLd } from "@/components/common/SEO";
import { FadeIn } from "@/components/animations/FadeIn";
import { CurriculumAccordion } from "@/components/academics/CurriculumAccordion";
import { FacultyCard } from "@/components/academics/FacultyCard";
import { LEVEL_LABELS } from "@/components/academics/programIcons";
import { getFacultyByIds, getProgramBySlug, getPrograms } from "@/lib/data/public";
import { getSiteSettings } from "@/lib/data/settings";
import { absoluteUrl, buildMetadata } from "@/lib/utils/seo";
import { formatCurrency } from "@/lib/utils/formatDate";
import { REVALIDATE_SECONDS, WING_LABELS } from "@/lib/constants";

export const revalidate = REVALIDATE_SECONDS;

type Props = { params: Promise<{ program: string }> };

export async function generateStaticParams() {
  const programs = await getPrograms();
  return programs.map((p) => ({ program: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { program: slug } = await params;
  const program = await getProgramBySlug(slug);
  if (!program) return { title: "Program not found" };
  return buildMetadata({
    title: program.name,
    description: program.shortDescription,
    path: `/academics/${program.slug}`,
    image: program.image || undefined,
  });
}

export default async function ProgramPage({ params }: Props) {
  const { program: slug } = await params;
  const [program, settings] = await Promise.all([getProgramBySlug(slug), getSiteSettings()]);
  if (!program) notFound();
  const faculty = await getFacultyByIds(program.faculty);

  const feeRows = [
    { label: "Admission fee (one-time)", value: program.fees.admission },
    { label: "Monthly tuition fee", value: program.fees.monthly },
    { label: "Total program fee", value: program.fees.total },
  ].filter((r) => r.value > 0);

  const courseJsonLd = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: program.name,
    description: program.shortDescription,
    url: absoluteUrl(`/academics/${program.slug}`),
    provider: collegeJsonLd(settings),
    timeRequired: program.duration,
    educationalLevel: LEVEL_LABELS[program.level],
  };

  return (
    <>
      <JsonLd data={courseJsonLd} />
      <PageHero
        title={program.name}
        description={program.shortDescription}
        image={program.image || undefined}
        breadcrumbs={[
          { name: "Academics", path: "/academics" },
          { name: program.name, path: `/academics/${program.slug}` },
        ]}
      >
        <div className="flex flex-wrap gap-3 text-sm text-white">
          {[
            { icon: Clock, text: program.duration },
            { icon: Users, text: WING_LABELS[program.wings] },
            { icon: Briefcase, text: LEVEL_LABELS[program.level] },
          ].map(({ icon: Icon, text }) => (
            <span key={text} className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 backdrop-blur">
              <Icon className="size-4 text-gold-400" aria-hidden /> {text}
            </span>
          ))}
        </div>
      </PageHero>

      <section className="section">
        <div className="container-page grid gap-12 lg:grid-cols-[1.6fr_1fr]">
          <div className="space-y-12">
            <FadeIn>
              <h2 className="mb-4 text-2xl font-bold text-brand-800 sm:text-3xl">Program overview</h2>
              <p className="leading-relaxed whitespace-pre-line text-muted-foreground">{program.description}</p>
            </FadeIn>

            {program.curriculum.length ? (
              <FadeIn>
                <h2 className="mb-5 text-2xl font-bold text-brand-800 sm:text-3xl">Curriculum</h2>
                <CurriculumAccordion curriculum={program.curriculum} />
              </FadeIn>
            ) : null}

            {program.requirements.length ? (
              <FadeIn>
                <h2 className="mb-5 text-2xl font-bold text-brand-800 sm:text-3xl">Eligibility & documents</h2>
                <ul className="space-y-3">
                  {program.requirements.map((r) => (
                    <li key={r} className="flex items-start gap-3">
                      <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-leaf-500" aria-hidden />
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </FadeIn>
            ) : null}

            {program.careers.length ? (
              <FadeIn>
                <h2 className="mb-5 text-2xl font-bold text-brand-800 sm:text-3xl">Where it leads</h2>
                <div className="flex flex-wrap gap-2">
                  {program.careers.map((c) => (
                    <span key={c} className="rounded-full border border-brand-200 bg-brand-50 px-4 py-2 text-sm font-medium text-brand-700">
                      {c}
                    </span>
                  ))}
                </div>
              </FadeIn>
            ) : null}

            {faculty.length ? (
              <FadeIn>
                <h2 className="mb-5 text-2xl font-bold text-brand-800 sm:text-3xl">Teachers</h2>
                <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {faculty.map((m) => (
                    <FacultyCard key={m.id} member={m} />
                  ))}
                </div>
              </FadeIn>
            ) : null}
          </div>

          <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
            {program.image ? (
              <div className="relative hidden aspect-[4/3] overflow-hidden rounded-2xl lg:block">
                <Image src={program.image} alt="" fill sizes="33vw" className="object-cover" />
              </div>
            ) : null}
            <div className="rounded-2xl border bg-card p-6 shadow-sm">
              <h2 className="mb-4 flex items-center gap-2 font-sans text-lg font-bold text-brand-800">
                <Wallet className="size-5 text-gold-500" aria-hidden /> Fee structure
              </h2>
              {feeRows.length ? (
                <dl className="divide-y">
                  {feeRows.map((r) => (
                    <div key={r.label} className="flex justify-between gap-4 py-3 text-sm">
                      <dt className="text-muted-foreground">{r.label}</dt>
                      <dd className="font-semibold text-brand-800">{formatCurrency(r.value)}</dd>
                    </div>
                  ))}
                </dl>
              ) : (
                <p className="text-sm text-muted-foreground">Please contact the office for current fees.</p>
              )}
              <p className="mt-3 text-xs text-muted-foreground">Fees are subject to change. Merit and need-based concessions are available.</p>
            </div>
            <div className="rounded-2xl bg-gradient-to-br from-brand-700 to-brand-900 p-6 text-white">
              <h2 className="font-sans text-lg font-bold">Ready to apply?</h2>
              <p className="mt-2 text-sm text-white/75">
                {program.seats ? `${program.seats} seats available. ` : ""}Admission is on merit — apply early.
              </p>
              {settings.admissionsOpen ? (
                <Button asChild className="mt-5 h-11 w-full bg-gold-400 font-semibold text-brand-950 hover:bg-gold-300">
                  <Link href={`/admissions/apply?program=${program.slug}`}>
                    Apply for this program <ArrowRight className="size-4" />
                  </Link>
                </Button>
              ) : (
                <p className="mt-4 rounded-lg bg-white/10 p-3 text-sm">Admissions are currently closed.</p>
              )}
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
