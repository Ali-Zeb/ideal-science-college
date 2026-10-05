import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmAction, Panel, StatusBadge } from "@/components/admin/AdminUI";
import { ApplicationReview } from "@/components/admin/ApplicationReview";
import { PrintButton } from "@/components/admin/PrintButton";
import { deleteApplication } from "@/actions/application.actions";
import { getApplication } from "@/lib/data/dashboard";
import { applicationScope, requireStaff } from "@/lib/auth/guards";
import { ADMIN_ROLES } from "@/lib/auth/config";
import { formatDate, formatDateTime } from "@/lib/utils/formatDate";
import { APPLICATION_STATUS_LABELS, SITE } from "@/lib/constants";
import type { UserRole } from "@/types";

export const metadata = { title: "Application" };

type Props = { params: Promise<{ id: string }> };

function Rows({ rows }: { rows: [string, string | number | null][] }) {
  return (
    <dl className="grid gap-x-8 gap-y-3 text-sm sm:grid-cols-2">
      {rows.map(([k, v]) => (
        <div key={k} className="border-b border-border/60 pb-2">
          <dt className="text-xs text-muted-foreground">{k}</dt>
          <dd className="font-medium">{v === null || v === "" ? "—" : v}</dd>
        </div>
      ))}
    </dl>
  );
}

export default async function ApplicationDetailPage({ params }: Props) {
  const { id } = await params;
  const session = await requireStaff();
  const app = await getApplication(id, applicationScope(session));
  if (!app) notFound();
  const isAdmin = ADMIN_ROLES.includes(session.user.role as UserRole);
  const docs = [
    ["B-Form / CNIC", app.documents.cnic],
    ["Result card", app.documents.marksheet],
    ["Photograph", app.documents.photo],
  ] as const;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Button asChild variant="ghost" className="-ml-2">
          <Link href="/college/applications">
            <ArrowLeft className="size-4" /> All applications
          </Link>
        </Button>
        <div className="flex gap-2">
          <PrintButton />
          {isAdmin ? (
            <ConfirmAction
              action={deleteApplication.bind(null, app.id)}
              title="Delete this application?"
              description={`${app.applicationNumber} will be permanently removed.`}
              trigger={<Button variant="destructive">Delete</Button>}
            />
          ) : null}
        </div>
      </div>

      <div className="hidden text-center print:block">
        <p className="text-xl font-bold">{SITE.name}</p>
        <p className="text-sm">Admission Application Form</p>
      </div>

      <div className="flex flex-wrap items-start justify-between gap-4 rounded-2xl border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-4">
          {app.documents.photo && !app.documents.photo.endsWith(".pdf") ? (
            <span className="relative size-20 overflow-hidden rounded-xl border bg-muted">
              <Image src={app.documents.photo} alt={`Photo of ${app.student.fullName}`} fill sizes="80px" className="object-cover" />
            </span>
          ) : null}
          <div>
            <p className="font-mono text-sm text-muted-foreground">{app.applicationNumber}</p>
            <h1 className="text-2xl font-bold text-brand-900">{app.student.fullName}</h1>
            <p className="text-sm text-muted-foreground">
              {app.program?.name ?? "—"} · {app.wing === "girls" ? "Girls" : "Boys"} wing · Submitted {formatDateTime(app.createdAt)}
            </p>
          </div>
        </div>
        <StatusBadge status={app.status} label={APPLICATION_STATUS_LABELS[app.status]} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <div className="space-y-6">
          <Panel title="Student details">
            <Rows
              rows={[
                ["Full name", app.student.fullName],
                ["Father's name", app.student.fatherName],
                ["B-Form / CNIC", app.student.cnic],
                ["Date of birth", formatDate(app.student.dateOfBirth)],
                ["Gender", app.student.gender === "female" ? "Female" : "Male"],
                ["Mobile", app.student.phone],
                ["Email", app.student.email],
                ["Address", app.student.address],
              ]}
            />
          </Panel>
          <Panel title="Academic details">
            <Rows
              rows={[
                ["Program", app.program?.name ?? "—"],
                ["Last class passed", app.academic.lastClass],
                ["Previous school", app.academic.previousSchool],
                ["Board", app.academic.board],
                ["Passing year", app.academic.passingYear],
                ["Grade", app.academic.previousGrade],
                ["Marks", app.academic.marksObtained !== null ? `${app.academic.marksObtained} / ${app.academic.totalMarks}` : null],
                ["Percentage", app.academic.percentage !== null ? `${app.academic.percentage.toFixed(2)}%` : null],
              ]}
            />
          </Panel>
          <Panel title="Documents" className="print:hidden">
            <ul className="grid gap-3 sm:grid-cols-3">
              {docs.map(([label, url]) => (
                <li key={label}>
                  {url ? (
                    <a href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-xl border p-3 text-sm font-medium hover:bg-muted">
                      <FileText className="size-5 text-brand-600" aria-hidden />
                      <span className="flex-1">{label}</span>
                      <ExternalLink className="size-4 text-muted-foreground" aria-hidden />
                    </a>
                  ) : (
                    <p className="rounded-xl border border-dashed p-3 text-sm text-muted-foreground">{label}: not provided</p>
                  )}
                </li>
              ))}
            </ul>
          </Panel>
        </div>
        <div className="space-y-6 print:hidden">
          <Panel title="Decision">
            <ApplicationReview id={app.id} status={app.status} note={app.reviewNote} />
          </Panel>
          {app.reviewedAt ? <p className="text-xs text-muted-foreground">Last reviewed {formatDateTime(app.reviewedAt)}</p> : null}
        </div>
      </div>
    </div>
  );
}
