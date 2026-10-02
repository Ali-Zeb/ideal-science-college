import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/common/SectionHeading";
import { EmptyState } from "@/components/common/EmptyState";
import { ProgramCard } from "@/components/academics/ProgramCard";
import { StaggerChildren, StaggerItem } from "@/components/animations/StaggerChildren";
import type { ProgramItem } from "@/types";

/** Grid of up to six programs with staggered entrance. */
export function ProgramsPreview({ programs }: { programs: ProgramItem[] }) {
  return (
    <section className="section bg-gradient-to-b from-brand-50/70 to-white">
      <div className="container-page">
        <SectionHeading
          eyebrow="Our programs"
          title="School & college programs"
          description="School from Class 1 to Matric Science, and college classes in FSc Pre-Medical, Pre-Engineering and ICS — for boys and girls in separate wings."
        />
        {programs.length ? (
          <StaggerChildren className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {programs.slice(0, 6).map((p) => (
              <StaggerItem key={p.id}>
                <ProgramCard program={p} />
              </StaggerItem>
            ))}
          </StaggerChildren>
        ) : (
          <EmptyState icon={BookOpen} title="Programs coming soon" description="Program details are being updated. Please contact the admissions office." />
        )}
        <div className="mt-12 text-center">
          <Button asChild variant="outline" size="lg" className="h-12 border-brand-200 px-6 text-brand-700">
            <Link href="/academics">
              View all programs <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
