import { Users } from "lucide-react";
import { PageHero } from "@/components/common/PageHero";
import { EmptyState } from "@/components/common/EmptyState";
import { FacultyDirectory } from "@/components/academics/FacultyDirectory";
import { getFaculty } from "@/lib/data/public";
import { buildMetadata } from "@/lib/utils/seo";

export const revalidate = 300; // seconds — must be a literal for Next.js segment config

export const metadata = buildMetadata({
  title: "Faculty",
  description: "Meet the professional teachers of Ideal Science College, Serai Naurang — boys and girls wings, school and college sections.",
  path: "/academics/faculty",
});

export default async function FacultyPage() {
  const faculty = await getFaculty();
  return (
    <>
      <PageHero
        title="Our Faculty"
        description="Qualified, experienced and caring teachers. The girls wing is taught entirely by female teachers."
        image="/images/gallery-88.jpg"
        breadcrumbs={[
          { name: "Academics", path: "/academics" },
          { name: "Faculty", path: "/academics/faculty" },
        ]}
      />
      <section className="section">
        <div className="container-page">
          {faculty.length ? (
            <FacultyDirectory faculty={faculty} />
          ) : (
            <EmptyState icon={Users} title="Faculty profiles coming soon" description="Teacher profiles are being added." />
          )}
        </div>
      </section>
    </>
  );
}
