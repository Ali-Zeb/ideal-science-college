import { BookOpen } from "lucide-react";
import { PageHero } from "@/components/common/PageHero";
import { SectionHeading } from "@/components/common/SectionHeading";
import { EmptyState } from "@/components/common/EmptyState";
import { ProgramCard } from "@/components/academics/ProgramCard";
import { StaggerChildren, StaggerItem } from "@/components/animations/StaggerChildren";
import { CTASection } from "@/components/home/CTASection";
import { getPrograms } from "@/lib/data/public";
import { getSiteSettings } from "@/lib/data/settings";
import { buildMetadata } from "@/lib/utils/seo";
import { LEVEL_GROUPS } from "@/lib/constants";
import type { ProgramItem } from "@/types";

export const revalidate = 300; // seconds — must be a literal for Next.js segment config

export const metadata = buildMetadata({
  title: "Programs — School & College",
  description:
    "Primary, Middle and Matric Science school classes, and FSc Pre-Medical, FSc Pre-Engineering and ICS college programs at Ideal Science College, Serai Naurang.",
  path: "/academics",
});

const groups = [
  { key: "school", eyebrow: "School · Class 1–10", title: "School Section", description: "A strong foundation from the first day of Class 1 to the Matric Science board examination." },
  { key: "college", eyebrow: "College · Class 11–12", title: "College Section", description: "FSc Pre-Medical, FSc Pre-Engineering and ICS under BISE Bannu, with full laboratory practicals." },
  { key: "preparation", eyebrow: "Preparation", title: "Additional Programs", description: "Short courses offered by the college." },
] as const;

export default async function AcademicsPage() {
  const [programs, settings] = await Promise.all([getPrograms(), getSiteSettings()]);
  const byGroup = (key: keyof typeof LEVEL_GROUPS): ProgramItem[] =>
    programs.filter((p) => (LEVEL_GROUPS[key] as readonly string[]).includes(p.level));

  return (
    <>
      <PageHero
        title="Programs from Class 1 to FSc"
        description="One institution for your child's whole journey — with separate classes for boys and girls and professional teachers at every level."
        image="/images/students-lab.jpeg"
        breadcrumbs={[{ name: "Academics", path: "/academics" }]}
      />
      {programs.length === 0 ? (
        <section className="section">
          <div className="container-page">
            <EmptyState icon={BookOpen} title="Programs are being updated" description="Please contact the admissions office for current classes and fees." action={{ label: "Contact us", href: "/contact" }} />
          </div>
        </section>
      ) : (
        groups.map((group, i) => {
          const items = byGroup(group.key);
          if (items.length === 0) return null;
          return (
            <section key={group.key} className={i % 2 ? "section bg-brand-50/50" : "section"}>
              <div className="container-page">
                <SectionHeading eyebrow={group.eyebrow} title={group.title} description={group.description} />
                <StaggerChildren className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((p) => (
                    <StaggerItem key={p.id}>
                      <ProgramCard program={p} />
                    </StaggerItem>
                  ))}
                </StaggerChildren>
              </div>
            </section>
          );
        })
      )}
      <CTASection phone={settings.contact.phone} admissionsOpen={settings.admissionsOpen} />
    </>
  );
}
