"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, Loader2, Search, Trash2, type LucideIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/useDebounce";
import { cn } from "@/lib/utils";
import type { ActionResult } from "@/types";

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

/* Search & filters (URL-driven) -------------------------------------- */

/** Search box that writes `?q=` to the URL (debounced) so lists stay server-rendered. */
export function SearchBox({ placeholder = "Search…" }: { placeholder?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [value, setValue] = useState(params.get("q") ?? "");
  const debounced = useDebounce(value, 400);

  useEffect(() => {
    const next = new URLSearchParams(params.toString());
    if (debounced) next.set("q", debounced);
    else next.delete("q");
    next.delete("page");
    if (next.toString() !== params.toString()) router.replace(`${pathname}?${next.toString()}`);
  }, [debounced, params, pathname, router]);

  return (
    <div className="relative w-full sm:max-w-xs">
      <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
      <Input value={value} onChange={(e) => setValue(e.target.value)} placeholder={placeholder} className="h-10 bg-white pl-9" aria-label={placeholder} />
    </div>
  );
}

/** Pill filter links that set a query parameter. */
export function FilterTabs({ param, options }: { param: string; options: { value: string; label: string; count?: number }[] }) {
  const pathname = usePathname();
  const params = useSearchParams();
  const current = params.get(param) ?? "";
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => {
        const next = new URLSearchParams(params.toString());
        if (o.value) next.set(param, o.value);
        else next.delete(param);
        next.delete("page");
        const active = current === o.value;
        return (
          <Link
            key={o.value || "all"}
            href={`${pathname}?${next.toString()}`}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
              active ? "border-brand-700 bg-brand-700 text-white" : "bg-white hover:border-brand-300",
            )}
          >
            {o.label}
            {o.count !== undefined ? <span className={cn("ml-1.5 text-xs", active ? "text-white/70" : "text-muted-foreground")}>{o.count}</span> : null}
          </Link>
        );
      })}
    </div>
  );
}

/** Previous / next pagination that preserves current filters. */
export function TablePagination({ page, totalPages, total }: { page: number; totalPages: number; total: number }) {
  const pathname = usePathname();
  const params = useSearchParams();
  if (totalPages <= 1) return <p className="mt-4 text-sm text-muted-foreground">{total} record(s)</p>;
  const href = (p: number) => {
    const next = new URLSearchParams(params.toString());
    next.set("page", String(p));
    return `${pathname}?${next.toString()}`;
  };
  return (
    <div className="mt-4 flex items-center justify-between text-sm">
      <p className="text-muted-foreground">
        Page {page} of {totalPages} · {total} record(s)
      </p>
      <div className="flex gap-2">
        <Button asChild variant="outline" size="sm" className={cn(page <= 1 && "pointer-events-none opacity-40")}>
          <Link href={href(page - 1)} aria-disabled={page <= 1}>
            <ChevronLeft className="size-4" /> Prev
          </Link>
        </Button>
        <Button asChild variant="outline" size="sm" className={cn(page >= totalPages && "pointer-events-none opacity-40")}>
          <Link href={href(page + 1)} aria-disabled={page >= totalPages}>
            Next <ChevronRight className="size-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}

/* Confirm + run action ---------------------------------------------- */

/** Button that asks for confirmation, then runs a server action and refreshes. */
export function ConfirmAction({
  action,
  title = "Are you sure?",
  description = "This cannot be undone.",
  confirmLabel = "Delete",
  trigger,
  onDone,
}: {
  action: () => Promise<ActionResult<unknown>>;
  title?: string;
  description?: string;
  confirmLabel?: string;
  trigger?: React.ReactNode;
  onDone?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="ghost" size="icon-sm" aria-label={confirmLabel} className="text-destructive hover:bg-destructive/10">
            <Trash2 className="size-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={pending}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                const res = await action();
                if (res.success) {
                  toast.success(res.message ?? "Done");
                  setOpen(false);
                  onDone?.();
                  router.refresh();
                } else toast.error(res.error);
              })
            }
          >
            {pending ? <Loader2 className="size-4 animate-spin" /> : null}
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
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
