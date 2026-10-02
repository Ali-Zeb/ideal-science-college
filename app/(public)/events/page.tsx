import { PageHero } from "@/components/common/PageHero";
import { JsonLd } from "@/components/common/SEO";
import { EventsBrowser } from "@/components/common/EventsBrowser";
import { getAllEvents } from "@/lib/data/public";
import { absoluteUrl, buildMetadata } from "@/lib/utils/seo";
import { REVALIDATE_SECONDS, SITE } from "@/lib/constants";

export const revalidate = REVALIDATE_SECONDS;

export const metadata = buildMetadata({
  title: "Events Calendar",
  description: "Upcoming and past events at Ideal Science College — information days, ceremonies, sports, trips and examinations.",
  path: "/events",
});

export default async function EventsPage() {
  const events = await getAllEvents();
  const now = Date.now();
  const upcoming = events.filter((e) => new Date(e.endDate).getTime() >= now);

  return (
    <>
      <JsonLd
        data={upcoming.slice(0, 10).map((e) => ({
          "@context": "https://schema.org",
          "@type": "Event",
          name: e.title,
          description: e.description,
          startDate: e.startDate,
          endDate: e.endDate,
          eventStatus: "https://schema.org/EventScheduled",
          eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
          location: { "@type": "Place", name: e.location, address: "Serai Naurang, Lakki Marwat, Pakistan" },
          image: e.featuredImage ? [absoluteUrl(e.featuredImage)] : undefined,
          organizer: { "@type": "Organization", name: SITE.name, url: SITE.url },
        }))}
      />
      <PageHero title="Events Calendar" description="Information days, ceremonies, sports, study tours and examinations." image="/images/gallery-11.jpg" breadcrumbs={[{ name: "Events", path: "/events" }]} />
      <section className="section">
        <div className="container-page">
          <EventsBrowser events={events} />
        </div>
      </section>
    </>
  );
}
