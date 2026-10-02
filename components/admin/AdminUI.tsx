import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Display-only dashboard building blocks. These have no client hooks so server
 * pages can pass icon components to them. Interactive controls live in
 * AdminControls.tsx (client) and are re-exported here for one import path.
 */
export { ConfirmAction, FilterTabs, SearchBox, TablePagination } from "./AdminControls";

/* Page header ------------------------------------------------------- */

/** Title row for dashboard pages with an optional primary action. */
export function PageHeader({ title, description, action }: { title: string; description?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-sans text-2xl font-bold text-brand-900 sm:text-3xl">{title}</h1>
        {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

/* Stat card --------------------------------------------------------- */

/** KPI tile used on dashboard overviews. */
export function StatCard({
  label,
  value,
  icon: Icon,
  hint,
  href,
  tone = "brand",
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  hint?: string;
  href?: string;
  tone?: "brand" | "gold" | "leaf" | "rose";
}) {
  const tones = {
    brand: "bg-brand-50 text-brand-700",
    gold: "bg-gold-400/15 text-gold-600",
    leaf: "bg-leaf-500/10 text-leaf-600",
    rose: "bg-rose-50 text-rose-600",
  };
  const body = (
    <div className="flex h-full items-start justify-between gap-4 rounded-2xl border bg-card p-5 shadow-sm transition-shadow hover:shadow-md">
      <div>
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <p className="mt-2 text-3xl font-bold text-brand-900 tabular-nums">{value}</p>
        {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
      </div>
      <span className={cn("flex size-11 items-center justify-center rounded-xl", tones[tone])}>
        <Icon className="size-5" aria-hidden />
      </span>
    </div>
  );
  return href ? (
    <Link href={href} className="block h-full">
      {body}
    </Link>
  ) : (
    body
  );
}

/* Status badge ------------------------------------------------------ */

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  under_review: "bg-sky-100 text-sky-800",
  approved: "bg-emerald-100 text-emerald-800",
  rejected: "bg-rose-100 text-rose-800",
  enrolled: "bg-brand-100 text-brand-800",
  new: "bg-amber-100 text-amber-800",
  shortlisted: "bg-sky-100 text-sky-800",
  hired: "bg-emerald-100 text-emerald-800",
  published: "bg-emerald-100 text-emerald-800",
  draft: "bg-slate-100 text-slate-700",
  active: "bg-emerald-100 text-emerald-800",
  inactive: "bg-slate-100 text-slate-700",
  unread: "bg-gold-400/25 text-gold-600",
  read: "bg-slate-100 text-slate-700",
};

/** Small coloured pill for statuses. */
export function StatusBadge({ status, label }: { status: string; label?: string }) {
  return (
    <span className={cn("inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize", STATUS_STYLES[status] ?? "bg-muted text-foreground")}>
      {label ?? status.replace(/_/g, " ")}
    </span>
  );
}

/* Card -------------------------------------------------------------- */

/** White panel used to group dashboard content. */
export function Panel({ title, action, children, className }: { title?: string; action?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section className={cn("rounded-2xl border bg-card shadow-sm", className)}>
      {title ? (
        <div className="flex items-center justify-between gap-3 border-b px-5 py-4">
          <h2 className="font-sans text-base font-semibold text-brand-900">{title}</h2>
          {action}
        </div>
      ) : null}
      <div className="p-5">{children}</div>
    </section>
  );
}

/* Table helpers ----------------------------------------------------- */

/** Simple responsive table wrapper. */
export function DataTable({ head, children, empty }: { head: string[]; children: React.ReactNode; empty?: React.ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-2xl border bg-card shadow-sm">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead className="border-b bg-muted/50 text-xs tracking-wide text-muted-foreground uppercase">
          <tr>
            {head.map((h, i) => (
              <th key={`${h}-${i}`} scope="col" className={cn("px-4 py-3 font-semibold", i === head.length - 1 && "text-right")}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y">{children}</tbody>
      </table>
      {empty}
    </div>
  );
}

/** Centered empty message inside a DataTable. */
export function TableEmpty({ message }: { message: string }) {
  return <p className="px-4 py-12 text-center text-sm text-muted-foreground">{message}</p>;
}
