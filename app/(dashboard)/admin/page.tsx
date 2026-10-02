import Link from "next/link";
import { BookOpen, Building2, FileText, Images, Newspaper, Settings, ShieldCheck, UserCog, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader, Panel, StatCard, StatusBadge } from "@/components/admin/AdminUI";
import { getAdminOverview } from "@/lib/data/dashboard";
import { formatDate, formatDateTime } from "@/lib/utils/formatDate";
import { USER_ROLE_LABELS } from "@/lib/constants";
import { isCloudinaryConfigured } from "@/lib/cloudinary";
import { isEmailConfigured } from "@/lib/email/send";

export const metadata = { title: "Overview" };

export default async function AdminHome() {
  const data = await getAdminOverview();
  const services = [
    { name: "Database (MongoDB)", ok: true },
    { name: "Email (Brevo)", ok: isEmailConfigured() },
    { name: "File uploads (Cloudinary)", ok: isCloudinaryConfigured() },
    { name: "AI assistant (Anthropic)", ok: Boolean(process.env.ANTHROPIC_API_KEY) },
    { name: "Google Analytics", ok: Boolean(process.env.NEXT_PUBLIC_GA_ID) },
  ];

  return (
    <>
      <PageHeader
        title="Admin overview"
        description="System health, accounts and content across the website."
        action={
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href="/admin/settings">
                <Settings className="size-4" /> Settings
              </Link>
            </Button>
            <Button asChild>
              <Link href="/college">
                <Building2 className="size-4" /> College dashboard
              </Link>
            </Button>
          </div>
        }
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Staff accounts" value={data.staff.total} hint={`${data.staff.active} active`} icon={UserCog} href="/admin/users" />
        <StatCard label="Student accounts" value={data.students.total} hint={`${data.students.verified} verified · ${data.students.newThisMonth} new this month`} icon={Users} tone="leaf" href="/admin/students" />
        <StatCard label="Applications" value={data.applications} icon={FileText} tone="gold" href="/college/applications" />
        <StatCard label="News posts" value={data.content.news} hint={`${data.content.events} events`} icon={Newspaper} tone="rose" href="/college/news" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <Panel title="Service status">
          <ul className="space-y-3 text-sm">
            {services.map((s) => (
              <li key={s.name} className="flex items-center justify-between">
                {s.name}
                <StatusBadge status={s.ok ? "active" : "pending"} label={s.ok ? "Connected" : "Not configured"} />
              </li>
            ))}
          </ul>
        </Panel>
        <Panel title="Content">
          <ul className="space-y-3 text-sm">
            {[
              [BookOpen, "Programs", data.content.programs, "/college/programs"],
              [Users, "Faculty profiles", data.content.faculty, "/college/faculty"],
              [Images, "Gallery albums", data.content.albums, "/college/gallery"],
              [FileText, "Job openings", data.content.jobs, "/college/careers"],
            ].map(([Icon, label, count, href]) => {
              const I = Icon as typeof BookOpen;
              return (
                <li key={label as string}>
                  <Link href={href as string} className="flex items-center justify-between hover:text-brand-600">
                    <span className="flex items-center gap-2">
                      <I className="size-4 text-muted-foreground" aria-hidden /> {label as string}
                    </span>
                    <span className="font-semibold tabular-nums">{count as number}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </Panel>
        <Panel title="Roles">
          <ul className="space-y-3 text-sm">
            {(["owner", "admin", "staff"] as const).map((r) => (
              <li key={r} className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <ShieldCheck className="size-4 text-muted-foreground" aria-hidden /> {USER_ROLE_LABELS[r]}
                </span>
                <span className="font-semibold tabular-nums">{data.staff.byRole[r] ?? 0}</span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Panel title="Recent staff sign-ins">
          {data.recentStaffLogins.length ? (
            <ul className="divide-y text-sm">
              {data.recentStaffLogins.map((u) => (
                <li key={u.id} className="flex justify-between gap-3 py-2.5">
                  <span>
                    <span className="block font-medium">{u.name}</span>
                    <span className="text-xs text-muted-foreground">{USER_ROLE_LABELS[u.role]}</span>
                  </span>
                  <span className="text-xs text-muted-foreground">{u.lastLogin ? formatDateTime(u.lastLogin) : ""}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">No sign-ins yet.</p>
          )}
        </Panel>
        <Panel title="Newest student accounts">
          {data.recentStudents.length ? (
            <ul className="divide-y text-sm">
              {data.recentStudents.map((s) => (
                <li key={s.id} className="flex justify-between gap-3 py-2.5">
                  <span>
                    <span className="block font-medium">{s.name}</span>
                    <span className="text-xs text-muted-foreground">{s.email}</span>
                  </span>
                  <span className="text-xs text-muted-foreground">{formatDate(s.createdAt)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">No student accounts yet.</p>
          )}
        </Panel>
      </div>
    </>
  );
}
