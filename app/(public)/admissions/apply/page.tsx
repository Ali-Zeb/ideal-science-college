import Link from "next/link";
import { Lock, LogIn, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHero } from "@/components/common/PageHero";
import { EmptyState } from "@/components/common/EmptyState";
import { ApplicationForm } from "@/components/forms/ApplicationForm";
import { getSession } from "@/lib/auth/guards";
import { getPrograms } from "@/lib/data/public";
import { getSiteSettings } from "@/lib/data/settings";
import { connectDB, isDbConfigured } from "@/lib/db/connect";
import { Student } from "@/lib/db/models";
import { buildMetadata } from "@/lib/utils/seo";

export const dynamic = "force-dynamic";

export const metadata = buildMetadata({
  title: "Apply Online",
  description: "Apply online for admission to Ideal Science College, Serai Naurang — Class 1 to FSc, boys and girls wings.",
  path: "/admissions/apply",
});

type Props = { searchParams: Promise<{ program?: string }> };

export default async function ApplyPage({ searchParams }: Props) {
  const [{ program }, session, settings, programs] = await Promise.all([searchParams, getSession(), getSiteSettings(), getPrograms()]);
  const isStudent = session?.user.kind === "student";

  let account = { name: "", email: "", phone: "" };
  if (isStudent && isDbConfigured()) {
    await connectDB();
    const doc = await Student.findById(session.user.id).select("name email phone").lean();
    if (doc) account = { name: doc.name, email: doc.email, phone: doc.phone };
  }

  const callback = encodeURIComponent(`/admissions/apply${program ? `?program=${program}` : ""}`);

  return (
    <>
      <PageHero
        title="Online Admission Form"
        description="Complete the form in four short steps. Keep the B-Form / CNIC, last result card and a passport-size photo ready."
        image="/images/campus-gate.jpeg"
        breadcrumbs={[
          { name: "Admissions", path: "/admissions" },
          { name: "Apply", path: "/admissions/apply" },
        ]}
      />
      <section className="section bg-muted/40">
        <div className="container-page max-w-4xl">
          {!settings.admissionsOpen ? (
            <EmptyState icon={Lock} title="Admissions are currently closed" description="Please check back later or contact the admissions office." action={{ label: "Contact us", href: "/contact" }} />
          ) : !isStudent ? (
            <div className="rounded-3xl border bg-card p-8 text-center shadow-xl sm:p-12">
              <Lock className="mx-auto size-12 text-brand-600" aria-hidden />
              <h2 className="mt-5 text-2xl font-bold text-brand-800 sm:text-3xl">Sign in to apply</h2>
              <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
                Applications are submitted from your Student Portal account so you can track the status and receive updates. Parents can
                create one account and apply for each child.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Button asChild size="lg" className="h-12 px-6">
                  <Link href={`/portal/register?callbackUrl=${callback}`}>
                    <UserPlus className="size-4" /> Create account
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="h-12 px-6">
                  <Link href={`/portal/login?callbackUrl=${callback}`}>
                    <LogIn className="size-4" /> I already have an account
                  </Link>
                </Button>
              </div>
            </div>
          ) : (
            <ApplicationForm
              programs={programs.map((p) => ({ id: p.id, name: p.name, slug: p.slug, level: p.level }))}
              defaultProgramSlug={program}
              account={account}
            />
          )}
        </div>
      </section>
    </>
  );
}
