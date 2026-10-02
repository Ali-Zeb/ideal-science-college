"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, Loader2, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/useDebounce";
import { cn } from "@/lib/utils";
import type { ActionResult } from "@/types";

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
