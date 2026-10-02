import { HeroSection } from "@/components/home/HeroSection";
import { StatsSection } from "@/components/home/StatsSection";
import { AboutPreview } from "@/components/home/AboutPreview";
import { ProgramsPreview } from "@/components/home/ProgramsPreview";
import { WhyChooseUs } from "@/components/home/WhyChooseUs";
import { FacultyPreview } from "@/components/home/FacultyPreview";
import { CampusShowcase } from "@/components/home/CampusShowcase";
import { TestimonialsSection } from "@/components/home/TestimonialsSection";
import { NewsPreview } from "@/components/home/NewsPreview";
import { EventsPreview } from "@/components/home/EventsPreview";
import { CTASection } from "@/components/home/CTASection";
import { JsonLd, collegeJsonLd } from "@/components/common/SEO";
import { getFaculty, getGalleryAlbums, getLatestNews, getPrograms, getUpcomingEvents } from "@/lib/data/public";
import { getSiteSettings } from "@/lib/data/settings";
import { buildMetadata } from "@/lib/utils/seo";
import { REVALIDATE_SECONDS } from "@/lib/constants";

export const revalidate = REVALIDATE_SECONDS;

export const metadata = buildMetadata({
  path: "/",
  image: "/opengraph-image",
  keywords: ["best school in Serai Naurang", "girls college Serai Naurang", "admissions 2026"],
});

export default async function HomePage() {
  const [settings, programs, faculty, news, events, albums] = await Promise.all([
    getSiteSettings(),
    getPrograms(),
    getFaculty(),
    getLatestNews(3),
    getUpcomingEvents(3),
    getGalleryAlbums(),
  ]);

  const showcase = albums.flatMap((a) => a.images.map((img) => ({ url: img.url, caption: img.caption }))).slice(0, 6);

  return (
    <>
      <JsonLd data={collegeJsonLd(settings)} />
      <HeroSection admissionsOpen={settings.admissionsOpen} />
      <StatsSection />
      <AboutPreview />
      <ProgramsPreview programs={programs} />
      <WhyChooseUs />
      <FacultyPreview faculty={faculty} />
      <CampusShowcase images={showcase} />
      <TestimonialsSection />
      <NewsPreview news={news} />
      <EventsPreview events={events} />
      <CTASection phone={settings.contact.phone} admissionsOpen={settings.admissionsOpen} />
    </>
  );
}
