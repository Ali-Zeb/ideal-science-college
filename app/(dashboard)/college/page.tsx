import Link from "next/link";
import { ArrowRight, CalendarPlus, FileText, Mail, Newspaper, PlusCircle, UserPlus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader, Panel, StatCard, StatusBadge } from "@/components/admin/AdminUI";
import { BreakdownDonut, WeeklyApplicationsChart } from "@/components/admin/Charts";
import { getCollegeOverview } from "@/lib/data/dashboard";
import { applicationScope, requireStaff } from "@/lib/auth/guards";
import { STAFF_WING_LABELS } from "@/lib/constants";
import { formatDateTime } from "@/lib/utils/formatDate";
import { APPLICATION_STATUS_LABELS } from "@/lib/constants";

export const metadata = { title: "Dashboard" };

export default async function CollegeHome({ searchParams }: { searchParams: Promise<{ denied?: string }> }) {
  const session = await requireStaff();
  const [data, { denied }] = await Promise.all([getCollegeOverview(applicationScope(session)), searchParams]);
  const wing = session.user.wing ?? "all";
  const s = data.applications.byStatus;

  return (
    <>
      {denied ? (
        <p className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          The Admin dashboard is available to administrators only.
        </p>
      ) : null}
      <PageHeader
        title="College Dashboard"
        description={`Admissions, messages and content at a glance.${wing === "all" ? "" : ` Showing applications for: ${STAFF_WING_LABELS[wing]}.`}`}
        action={
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline">
              <Link href="/college/news/new">
                <PlusCircle className="size-4" /> News post
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/college/events/new">
                <CalendarPlus className="size-4" /> Event
              </Link>
            </Button>
            <Button asChild>
              <Link href="/college/applications?status=pending">
                <FileText className="size-4" /> Review applications
              </Link>
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total applications" value={data.applications.total} hint={`${data.applications.thisWeek} this week`} icon={FileText} href="/college/applications" />
        <StatCard label="Pending review" value={s.pending ?? 0} hint={`${s.under_review ?? 0} under review`} icon={UserPlus} tone="gold" href="/college/applications?status=pending" />
        <StatCard label="Unread messages" value={data.unreadMessages} icon={Mail} tone="rose" href="/college/messages?filter=unread" />
        <StatCard label="News posts" value={data.newsCount} hint={`${data.upcomingEvents} upcoming events`} icon={Newspaper} tone="leaf" href="/college/news" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <Panel title="Applications — last 8 weeks">
          <WeeklyApplicationsChart data={data.weekly} />
        </Panel>
        <Panel title="Status breakdown">
          <BreakdownDonut
            data={[
              { name: APPLICATION_STATUS_LABELS.pending, value: s.pending ?? 0, color: "#e8b020" },
              { name: APPLICATION_STATUS_LABELS.under_review, value: s.under_review ?? 0, color: "#5267cb" },
              { name: APPLICATION_STATUS_LABELS.approved, value: s.approved ?? 0, color: "#3a9d4a" },
              { name: APPLICATION_STATUS_LABELS.enrolled, value: s.enrolled ?? 0, color: "#1e2a78" },
              { name: APPLICATION_STATUS_LABELS.rejected, value: s.rejected ?? 0, color: "#c2410c" },
            ]}
          />
          <div className="mt-5 grid grid-cols-2 gap-3 border-t pt-4 text-center text-sm">
            <div>
              <p className="text-2xl font-bold text-brand-800 tabular-nums">{data.applications.boys}</p>
              <p className="text-muted-foreground">Boys wing</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-brand-800 tabular-nums">{data.applications.girls}</p>
              <p className="text-muted-foreground">Girls wing</p>
            </div>
          </div>
        </Panel>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <Panel
          title="Recent applications"
          action={
            <Link href="/college/applications" className="flex items-center gap-1 text-sm font-medium text-brand-600">
              View all <ArrowRight className="size-4" />
            </Link>
          }
        >
          {data.recentApplications.length ? (
            <ul className="divide-y">
              {data.recentApplications.map((a) => (
                <li key={a.id}>
                  <Link href={`/college/applications/${a.id}`} className="flex flex-wrap items-center justify-between gap-3 py-3 hover:bg-muted/40">
                    <div className="min-w-0">
                      <p className="font-medium">{a.student.fullName}</p>
                      <p className="text-xs text-muted-foreground">
                        {a.applicationNumber} · {a.program?.name ?? "—"} · {a.wing === "girls" ? "Girls" : "Boys"} wing
                      </p>
                    </div>
                    <StatusBadge status={a.status} label={APPLICATION_STATUS_LABELS[a.status]} />
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="py-8 text-center text-sm text-muted-foreground">No applications yet.</p>
          )}
        </Panel>
        <Panel
          title="Recent messages"
          action={
            <Link href="/college/messages" className="flex items-center gap-1 text-sm font-medium text-brand-600">
              Inbox <ArrowRight className="size-4" />
            </Link>
          }
        >
          {data.recentMessages.length ? (
            <ul className="divide-y">
              {data.recentMessages.map((m) => (
                <li key={m.id} className="py-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate font-medium">{m.name}</p>
                    {!m.isRead ? <StatusBadge status="unread" label="New" /> : null}
                  </div>
                  <p className="truncate text-sm text-muted-foreground">{m.subject}</p>
                  <p className="text-xs text-muted-foreground">{formatDateTime(m.createdAt)}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="py-8 text-center text-sm text-muted-foreground">No messages yet.</p>
          )}
          {data.newJobApplicants ? (
            <Link href="/college/careers" className="mt-4 flex items-center gap-2 rounded-lg bg-brand-50 p-3 text-sm font-medium text-brand-700">
              <Users className="size-4" /> {data.newJobApplicants} new job applicant(s)
            </Link>
          ) : null}
        </Panel>
      </div>
    </>
  );
}
