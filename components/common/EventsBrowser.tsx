"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { CalendarDays, ChevronLeft, ChevronRight, Clock, List, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "./EmptyState";
import { dateParts, formatDate, formatTime } from "@/lib/utils/formatDate";
import { cn } from "@/lib/utils";
import type { EventItem } from "@/types";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const pkDayKey = (d: Date | string) => new Date(d).toLocaleDateString("en-CA", { timeZone: "Asia/Karachi" });

function EventRow({ event }: { event: EventItem }) {
  const { day, month, year } = dateParts(event.startDate);
  return (
    <article id={event.slug} className="group flex scroll-mt-32 flex-col overflow-hidden rounded-2xl border bg-card shadow-sm transition-shadow hover:shadow-lg sm:flex-row">
      <div className="relative aspect-[16/9] shrink-0 bg-brand-100 sm:aspect-auto sm:w-64">
        {event.featuredImage ? <Image src={event.featuredImage} alt="" fill sizes="(min-width: 640px) 256px, 100vw" className="object-cover" /> : null}
        <div className="absolute top-4 left-4 flex flex-col items-center rounded-xl bg-white px-3 py-2 shadow">
          <span className="font-heading text-2xl leading-none font-bold text-brand-800">{day}</span>
          <span className="text-xs font-semibold text-gold-600 uppercase">
            {month} {year}
          </span>
        </div>
      </div>
      <div className="flex-1 p-6">
        <span className="text-xs font-semibold tracking-wider text-gold-600 uppercase">{event.category}</span>
        <h3 className="mt-1 font-sans text-xl font-bold text-brand-800">{event.title}</h3>
        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <CalendarDays className="size-4 text-brand-500" aria-hidden /> {formatDate(event.startDate)}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="size-4 text-brand-500" aria-hidden /> {formatTime(event.startDate)} – {formatTime(event.endDate)}
          </span>
          <span className="flex items-center gap-1.5">
            <MapPin className="size-4 text-brand-500" aria-hidden /> {event.location}
          </span>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{event.description}</p>
      </div>
    </article>
  );
}

/** Events page body: month calendar + upcoming/past list views. */
export function EventsBrowser({ events }: { events: EventItem[] }) {
  const [view, setView] = useState<"list" | "calendar">("list");
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");
  const [cursor, setCursor] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const now = Date.now();
  const upcoming = useMemo(
    () => events.filter((e) => new Date(e.endDate).getTime() >= now).sort((a, b) => a.startDate.localeCompare(b.startDate)),
    [events, now],
  );
  const past = useMemo(() => events.filter((e) => new Date(e.endDate).getTime() < now), [events, now]);

  const byDay = useMemo(() => {
    const map = new Map<string, EventItem[]>();
    for (const e of events) {
      const key = pkDayKey(e.startDate);
      map.set(key, [...(map.get(key) ?? []), e]);
    }
    return map;
  }, [events]);

  const daysInMonth = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
  const leading = cursor.getDay();
  const todayKey = pkDayKey(new Date());
  const monthLabel = cursor.toLocaleDateString("en-PK", { month: "long", year: "numeric" });
  const dayKey = (d: number) => `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  const list = tab === "upcoming" ? upcoming : past;
  const selectedEvents = selectedDay ? byDay.get(selectedDay) ?? [] : [];

  return (
    <>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="inline-flex rounded-xl border p-1" role="group" aria-label="View">
          {(["list", "calendar"] as const).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setView(v)}
              aria-pressed={view === v}
              className={cn("flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium", view === v ? "bg-brand-700 text-white" : "hover:bg-muted")}
            >
              {v === "list" ? <List className="size-4" /> : <CalendarDays className="size-4" />}
              {v === "list" ? "List" : "Calendar"}
            </button>
          ))}
        </div>
        {view === "list" ? (
          <div className="inline-flex rounded-xl border p-1" role="tablist">
            {(["upcoming", "past"] as const).map((t) => (
              <button
                key={t}
                type="button"
                role="tab"
                aria-selected={tab === t}
                onClick={() => setTab(t)}
                className={cn("rounded-lg px-4 py-2 text-sm font-medium capitalize", tab === t ? "bg-gold-400 text-brand-950" : "hover:bg-muted")}
              >
                {t} ({t === "upcoming" ? upcoming.length : past.length})
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {view === "list" ? (
        list.length ? (
          <div className="space-y-6">
            {list.map((e) => (
              <EventRow key={e.id} event={e} />
            ))}
          </div>
        ) : (
          <EmptyState icon={CalendarDays} title={tab === "upcoming" ? "No upcoming events" : "No past events"} description="New events will be announced soon." />
        )
      ) : (
        <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
          <div className="rounded-2xl border bg-card p-4 shadow-sm sm:p-6">
            <div className="mb-4 flex items-center justify-between">
              <Button variant="ghost" size="icon" onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))} aria-label="Previous month">
                <ChevronLeft className="size-5" />
              </Button>
              <h2 className="font-sans text-lg font-bold text-brand-800">{monthLabel}</h2>
              <Button variant="ghost" size="icon" onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))} aria-label="Next month">
                <ChevronRight className="size-5" />
              </Button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-muted-foreground">
              {WEEKDAYS.map((d) => (
                <div key={d} className="py-2">
                  {d}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: leading }).map((_, i) => (
                <div key={`e${i}`} />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const key = dayKey(i + 1);
                const has = byDay.has(key);
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSelectedDay(key)}
                    aria-label={`${i + 1} ${monthLabel}${has ? `, ${byDay.get(key)?.length} event(s)` : ""}`}
                    className={cn(
                      "relative flex aspect-square items-center justify-center rounded-lg text-sm transition-colors",
                      selectedDay === key ? "bg-brand-700 text-white" : has ? "bg-gold-400/20 font-bold text-brand-800 hover:bg-gold-400/40" : "hover:bg-muted",
                      key === todayKey && selectedDay !== key && "ring-2 ring-brand-400",
                    )}
                  >
                    {i + 1}
                    {has ? <span className="absolute bottom-1.5 size-1.5 rounded-full bg-gold-500" aria-hidden /> : null}
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <h3 className="mb-4 font-sans text-lg font-bold text-brand-800">
              {selectedDay ? formatDate(`${selectedDay}T12:00:00+05:00`) : "Select a date"}
            </h3>
            {selectedDay ? (
              selectedEvents.length ? (
                <div className="space-y-4">
                  {selectedEvents.map((e) => (
                    <EventRow key={e.id} event={e} />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No events on this day.</p>
              )
            ) : (
              <p className="text-sm text-muted-foreground">Highlighted dates have events. Tap a date to see details.</p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
