import Link from "next/link";
import { ArrowRight, CalendarClock, Clock, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/common/SectionHeading";
import { EmptyState } from "@/components/common/EmptyState";
import { FadeIn } from "@/components/animations/FadeIn";
import { dateParts, formatTime } from "@/lib/utils/formatDate";
import type { EventItem } from "@/types";

/** Vertical timeline of the next upcoming events. */
export function EventsPreview({ events }: { events: EventItem[] }) {
  return (
    <section className="section">
      <div className="container-page grid gap-12 lg:grid-cols-[1fr_1.4fr]">
        <div>
          <SectionHeading
            align="left"
            eyebrow="Upcoming events"
            title="Mark your calendar"
            description="Information days, mock tests, ceremonies and trips — join us on campus."
            className="mb-8"
          />
          <Button asChild size="lg" className="h-12 px-6">
            <Link href="/events">
              View events calendar <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>

        {events.length ? (
          <ol className="relative space-y-6 border-l-2 border-brand-100 pl-8">
            {events.map((event, i) => {
              const { day, month } = dateParts(event.startDate);
              return (
                <li key={event.id} className="group relative">
                  <FadeIn delay={i * 0.1} direction="left">
                    <span className="absolute top-6 -left-[41px] size-4 rounded-full border-4 border-white bg-gold-500 shadow ring-2 ring-gold-300" aria-hidden />
                    <Link href={`/events#${event.slug}`} className="flex gap-5 rounded-2xl border bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg">
                      <div className="flex w-16 shrink-0 flex-col items-center justify-center rounded-xl bg-brand-700 py-3 text-white">
                        <span className="font-heading text-2xl leading-none font-bold">{day}</span>
                        <span className="mt-1 text-xs tracking-wider text-gold-300 uppercase">{month}</span>
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-semibold text-gold-600 uppercase">{event.category}</span>
                        <h3 className="mt-1 font-sans text-lg font-bold text-brand-800 group-hover:text-brand-600">{event.title}</h3>
                        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="size-3.5" aria-hidden /> {formatTime(event.startDate)}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="size-3.5" aria-hidden /> {event.location}
                          </span>
                        </div>
                      </div>
                    </Link>
                  </FadeIn>
                </li>
              );
            })}
          </ol>
        ) : (
          <EmptyState icon={CalendarClock} title="No upcoming events" description="New events will be announced soon." />
        )}
      </div>
    </section>
  );
}
