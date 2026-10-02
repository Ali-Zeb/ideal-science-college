"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { FileText } from "lucide-react";
import { toast } from "sonner";
import { setJobApplicationStatus } from "@/actions/career.actions";
import { formatDate } from "@/lib/utils/formatDate";
import { DataTable, TableEmpty } from "./AdminUI";
import type { JobApplicationItem } from "@/types";

const STATUSES = ["new", "shortlisted", "rejected", "hired"] as const;

function StatusSelect({ item }: { item: JobApplicationItem }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return (
    <select
      value={item.status}
      disabled={pending}
      aria-label={`Status for ${item.fullName}`}
      onChange={(e) =>
        startTransition(async () => {
          const res = await setJobApplicationStatus(item.id, e.target.value);
          if (res.success) {
            toast.success(res.message);
            router.refresh();
          } else toast.error(res.error);
        })
      }
      className="h-8 rounded-md border bg-white px-2 text-sm capitalize"
    >
      {STATUSES.map((s) => (
        <option key={s} value={s}>
          {s}
        </option>
      ))}
    </select>
  );
}

/** Table of job applicants with CV links and inline status updates. */
export function JobApplicants({ items }: { items: JobApplicationItem[] }) {
  return (
    <DataTable head={["Applicant", "Position", "Qualification", "Experience", "Applied", "CV", "Status"]} empty={items.length ? null : <TableEmpty message="No applicants yet." />}>
      {items.map((a) => (
        <tr key={a.id} className="align-top hover:bg-muted/40">
          <td className="px-4 py-3">
            <p className="font-medium">{a.fullName}</p>
            <p className="text-xs text-muted-foreground">
              {a.email} · {a.phone}
            </p>
            {a.coverLetter ? (
              <details className="mt-1 text-xs">
                <summary className="cursor-pointer text-brand-600">Cover letter</summary>
                <p className="mt-1 max-w-sm whitespace-pre-line text-muted-foreground">{a.coverLetter}</p>
              </details>
            ) : null}
          </td>
          <td className="px-4 py-3">{a.job?.title ?? "—"}</td>
          <td className="px-4 py-3">{a.qualification}</td>
          <td className="px-4 py-3">{a.experience}</td>
          <td className="px-4 py-3 text-muted-foreground">{formatDate(a.createdAt)}</td>
          <td className="px-4 py-3">
            <a href={a.resume} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-medium text-brand-600 hover:underline">
              <FileText className="size-4" /> Open
            </a>
          </td>
          <td className="px-4 py-3 text-right">
            <StatusSelect item={a} />
          </td>
        </tr>
      ))}
    </DataTable>
  );
}
