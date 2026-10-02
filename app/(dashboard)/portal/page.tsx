import Link from "next/link";
import { CalendarDays, CheckCircle2, Circle, FilePlus2, FileText, Megaphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader, Panel, StatusBadge } from "@/components/admin/AdminUI";
import { EmptyState } from "@/components/common/EmptyState";
import { requireStudent } from "@/lib/auth/guards";
import { getApplicationsForAccount } from "@/lib/data/dashboard";
import { getLatestNews, getUpcomingEvents } from "@/lib/data/public";
import { getSiteSettings } from "@/lib/data/settings";
import { formatDate, formatDateTime } from "@/lib/utils/formatDate";
import { APPLICATION_STATUS_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { ApplicationItem } from "@/types";

export const metadata = { title: "My Dashboard" };

const TRACK = ["pending", "under_review", "approved", "enrolled"] as const;

function Tracker({ app }: { app: ApplicationItem }) {
  if (app.status === "rejected") {
    return <p className="rounded-lg bg-rose-50 p-3 text-sm text-rose-800">This application was not accepted. {app.reviewNote}</p>;
  }
  const current = TRACK.indexOf(app.status as (typeof TRACK)[number]);
  return (
    <ol className="grid grid-cols-4 gap-2" aria-label="Application progress">
      {TRACK.map((s, i) => {
        const done = i <= current;
        return (
          <li key={s} className="flex flex-col items-center gap-1.5 text-center">
            {done ? <CheckCircle2 className="size-6 text-leaf-500" aria-hidden /> : <Circle className="size-6 text-muted-foreground/40" aria-hidden />}
            <span className={cn("text-xs", done ? "font-semibold text-foreground" : "text-muted-foreground")}>{APPLICATION_STATUS_LABELS[s]}</span>
          </li>
        );
      })}
    </ol>
  );
}

export default async function PortalHome() {
  const session = await requireStudent();
  const [apps, news, events, settings] = await Promise.all([
    getApplicationsForAccount(session.user.id),
    getLatestNews(4),
    getUpcomingEvents(3),
    getSiteSettings(),
  ]);

  return (
    <>
      <PageHeader
        title={`Assalam-o-Alaikum, ${session.user.name?.split(" ")[0] ?? ""}`}
        description="Track your applications and stay updated with college notices."
        action={
          settings.admissionsOpen ? (
            <Button asChild>
              <Link href="/admissions/apply">
                <FilePlus2 className="size-4" /> New application
              </Link>
            </Button>
          ) : null
        }
      />

      {settings.announcement ? (
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-gold-400/40 bg-gold-400/10 p-4 text-sm">
          <Megaphone className="mt-0.5 size-5 shrink-0 text-gold-600" aria-hidden />
          {settings.announcement}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <div className="space-y-6">
          <h2 className="text-lg font-bold text-brand-900">My applications</h2>
          {apps.length ? (
            apps.map((a) => (
              <Panel key={a.id}>
                <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-mono text-xs text-muted-foreground">{a.applicationNumber}</p>
                    <h3 className="text-lg font-bold text-brand-800">{a.student.fullName}</h3>
                    <p className="text-sm text-muted-foreground">
                      {a.program?.name ?? "—"} · {a.wing === "girls" ? "Girls" : "Boys"} wing · Submitted {formatDate(a.createdAt)}
                    </p>
                  </div>
                  <StatusBadge status={a.status} label={APPLICATION_STATUS_LABELS[a.status]} />
                </div>
                <Tracker app={a} />
                {a.reviewNote && a.status !== "rejected" ? (
                  <p className="mt-5 rounded-lg bg-brand-50 p-3 text-sm">
                    <strong>Message from admissions:</strong> {a.reviewNote}
                  </p>
                ) : null}
                {a.reviewedAt ? <p className="mt-3 text-xs text-muted-foreground">Updated {formatDateTime(a.reviewedAt)}</p> : null}
              </Panel>
            ))
          ) : (
            <EmptyState
              icon={FileText}
              title="No applications yet"
              description="Start your online application — it takes about ten minutes."
              action={settings.admissionsOpen ? { label: "Apply now", href: "/admissions/apply" } : undefined}
            />
          )}
        </div>
        <div className="space-y-6">
          <Panel title="Notices">
            {news.length ? (
              <ul className="divide-y">
                {news.map((n) => (
                  <li key={n.id} className="py-3">
                    <Link href={`/news/${n.slug}`} className="font-medium hover:text-brand-600">
                      {n.title}
                    </Link>
                    <p className="text-xs text-muted-foreground">{n.publishedAt ? formatDate(n.publishedAt) : ""}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No notices right now.</p>
            )}
          </Panel>
          <Panel title="Upcoming events">
            {events.length ? (
              <ul className="space-y-3">
                {events.map((e) => (
                  <li key={e.id} className="flex gap-3 text-sm">
                    <CalendarDays className="mt-0.5 size-4 shrink-0 text-brand-500" aria-hidden />
                    <span>
                      <span className="block font-medium">{e.title}</span>
                      <span className="text-xs text-muted-foreground">{formatDateTime(e.startDate)}</span>
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No upcoming events.</p>
            )}
          </Panel>
          <Panel title="Need help?">
            <p className="text-sm text-muted-foreground">
              Call the admissions office at <a href={`tel:${settings.contact.phone.replace(/[^\d+]/g, "")}`} className="font-medium text-brand-700">{settings.contact.phone}</a> during{" "}
              {settings.contact.officeHours}.
            </p>
          </Panel>
        </div>
      </div>
    </>
  );
}
