import Link from "next/link";
import { ArrowRight, CalendarDays, CheckCircle2, ClipboardList, FileCheck2, School, UserPlus, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHero } from "@/components/common/PageHero";
import { SectionHeading } from "@/components/common/SectionHeading";
import { FadeIn } from "@/components/animations/FadeIn";
import { StaggerChildren, StaggerItem } from "@/components/animations/StaggerChildren";
import { CTASection } from "@/components/home/CTASection";
import { LEVEL_LABELS } from "@/components/academics/programIcons";
import { getPrograms } from "@/lib/data/public";
import { getSiteSettings } from "@/lib/data/settings";
import { buildMetadata } from "@/lib/utils/seo";
import { formatCurrency } from "@/lib/utils/formatDate";

export const revalidate = 300; // seconds — must be a literal for Next.js segment config

export const metadata = buildMetadata({
  title: "Admissions",
  description: "Admission process, eligibility, documents and fee structure for Class 1 to FSc at Ideal Science College, Serai Naurang.",
  path: "/admissions",
});

const process = [
  { icon: UserPlus, title: "Create account", text: "Register on the Student Portal and verify your email with the 6-digit code." },
  { icon: ClipboardList, title: "Fill the form", text: "Enter the student's details, previous class and choose the program." },
  { icon: FileCheck2, title: "Upload documents", text: "B-Form / CNIC, last result card and a passport-size photo." },
  { icon: School, title: "Confirm admission", text: "After approval, visit the office with originals and pay the admission fee." },
];

const schedule = [
  { label: "Admissions open", value: "June – September" },
  { label: "Classes begin (new session)", value: "1st week of April (school) · September (FSc Part-I)" },
  { label: "Office hours for admissions", value: "Monday – Saturday, 8:00 AM – 2:00 PM" },
];

export default async function AdmissionsPage() {
  const [programs, settings] = await Promise.all([getPrograms(), getSiteSettings()]);
  return (
    <>
      <PageHero
        title="Admissions"
        description="Admission is open to boys and girls from Class 1 to FSc. Girls are admitted to the separate girls wing taught by female teachers."
        image="/images/campus-building.jpg"
        breadcrumbs={[{ name: "Admissions", path: "/admissions" }]}
      >
        {settings.admissionsOpen ? (
          <Button asChild size="lg" className="h-12 bg-gold-400 px-6 font-semibold text-brand-950 hover:bg-gold-300">
            <Link href="/admissions/apply">
              Apply online <ArrowRight className="size-4" />
            </Link>
          </Button>
        ) : null}
      </PageHero>

      <section className="section">
        <div className="container-page">
          <SectionHeading eyebrow="How to apply" title="Four simple steps" />
          <StaggerChildren className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {process.map(({ icon: Icon, title, text }, i) => (
              <StaggerItem key={title}>
                <div className="relative h-full rounded-2xl border bg-card p-7 shadow-sm">
                  <span className="absolute top-5 right-6 font-heading text-5xl font-bold text-brand-100">{i + 1}</span>
                  <Icon className="mb-5 size-10 text-gold-500" aria-hidden />
                  <h3 className="font-sans text-lg font-bold text-brand-800">{title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{text}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerChildren>
        </div>
      </section>

      <section className="section bg-brand-50/60">
        <div className="container-page grid gap-10 lg:grid-cols-2">
          <FadeIn>
            <h2 className="mb-6 flex items-center gap-3 text-2xl font-bold text-brand-800 sm:text-3xl">
              <CheckCircle2 className="size-7 text-leaf-500" aria-hidden /> Eligibility
            </h2>
            <ul className="space-y-4 rounded-2xl bg-white p-6 shadow-sm">
              {[
                ["Class 1", "Child should be at least 5 years old; Nursery/Prep certificate if available."],
                ["Class 2 – 9", "Pass result of the previous class and school leaving certificate."],
                ["FSc Pre-Medical / Pre-Engineering", "Matric Science with at least 60% marks in the relevant group."],
                ["ICS (Computer Science)", "Matric Science or Computer Science with at least 50% marks."],
              ].map(([k, val]) => (
                <li key={k} className="border-b pb-4 last:border-0 last:pb-0">
                  <p className="font-semibold text-brand-800">{k}</p>
                  <p className="text-sm text-muted-foreground">{val}</p>
                </li>
              ))}
            </ul>
          </FadeIn>
          <FadeIn delay={0.1}>
            <h2 className="mb-6 flex items-center gap-3 text-2xl font-bold text-brand-800 sm:text-3xl">
              <CalendarDays className="size-7 text-gold-500" aria-hidden /> Important dates
            </h2>
            <dl className="space-y-4 rounded-2xl bg-white p-6 shadow-sm">
              {schedule.map((s) => (
                <div key={s.label} className="border-b pb-4 last:border-0 last:pb-0">
                  <dt className="font-semibold text-brand-800">{s.label}</dt>
                  <dd className="text-sm text-muted-foreground">{s.value}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 text-sm text-muted-foreground">Exact dates are announced every year on the News page.</p>
          </FadeIn>
        </div>
      </section>

      {programs.length ? (
        <section className="section">
          <div className="container-page">
            <SectionHeading eyebrow="Fee structure" title="Fees by program" description="Merit scholarships and concessions for siblings and deserving students are available." />
            <FadeIn>
              <div className="overflow-x-auto rounded-2xl border shadow-sm">
                <table className="w-full min-w-[640px] text-left text-sm">
                  <thead className="bg-brand-700 text-white">
                    <tr>
                      <th className="px-5 py-4 font-semibold">Program</th>
                      <th className="px-5 py-4 font-semibold">Level</th>
                      <th className="px-5 py-4 font-semibold">Admission fee</th>
                      <th className="px-5 py-4 font-semibold">Monthly fee</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y bg-card">
                    {programs.map((p) => (
                      <tr key={p.id} className="hover:bg-brand-50/50">
                        <td className="px-5 py-4 font-medium">
                          <Link href={`/academics/${p.slug}`} className="text-brand-700 hover:underline">
                            {p.name}
                          </Link>
                        </td>
                        <td className="px-5 py-4 text-muted-foreground">{LEVEL_LABELS[p.level]}</td>
                        <td className="px-5 py-4">{p.fees.admission ? formatCurrency(p.fees.admission) : "—"}</td>
                        <td className="px-5 py-4">{p.fees.monthly ? formatCurrency(p.fees.monthly) : p.fees.total ? `${formatCurrency(p.fees.total)} total` : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                <Wallet className="size-4" aria-hidden /> Fees are payable at the college office or by bank deposit. Receipts are issued for every payment.
              </p>
            </FadeIn>
          </div>
        </section>
      ) : null}

      <CTASection phone={settings.contact.phone} admissionsOpen={settings.admissionsOpen} />
    </>
  );
}
