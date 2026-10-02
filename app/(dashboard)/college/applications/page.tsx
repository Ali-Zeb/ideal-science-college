import Link from "next/link";
import { Download, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable, FilterTabs, PageHeader, SearchBox, StatusBadge, TableEmpty, TablePagination } from "@/components/admin/AdminUI";
import { listApplications } from "@/lib/data/dashboard";
import { formatDate } from "@/lib/utils/formatDate";
import { APPLICATION_STATUSES, APPLICATION_STATUS_LABELS } from "@/lib/constants";

export const metadata = { title: "Applications" };

type Props = { searchParams: Promise<{ q?: string; status?: string; wing?: string; page?: string }> };

export default async function ApplicationsPage({ searchParams }: Props) {
  const sp = await searchParams;
  const data = await listApplications(sp);
  const total = Object.values(data.counts).reduce((n, c) => n + c, 0);
  const exportQuery = new URLSearchParams(Object.entries(sp).filter(([k, v]) => v && k !== "page") as [string, string][]).toString();

  return (
    <>
      <PageHeader
        title="Admission applications"
        description="Review, filter and update applications. Applicants are emailed when you change the status."
        action={
          <Button asChild variant="outline">
            <a href={`/api/applications?${exportQuery}`} download>
              <Download className="size-4" /> Export CSV
            </a>
          </Button>
        }
      />
      <div className="mb-5 flex flex-col gap-4">
        <FilterTabs
          param="status"
          options={[{ value: "", label: "All", count: total }, ...APPLICATION_STATUSES.map((s) => ({ value: s, label: APPLICATION_STATUS_LABELS[s], count: data.counts[s] ?? 0 }))]}
        />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <SearchBox placeholder="Search name, CNIC, phone or number" />
          <FilterTabs
            param="wing"
            options={[
              { value: "", label: "Both wings" },
              { value: "boys", label: "Boys wing" },
              { value: "girls", label: "Girls wing" },
            ]}
          />
        </div>
      </div>
      <DataTable
        head={["Application", "Student", "Program", "Wing", "Result", "Submitted", "Status", ""]}
        empty={data.items.length ? null : <TableEmpty message="No applications match these filters." />}
      >
        {data.items.map((a) => (
          <tr key={a.id} className="hover:bg-muted/40">
            <td className="px-4 py-3 font-mono text-xs">{a.applicationNumber}</td>
            <td className="px-4 py-3">
              <p className="font-medium">{a.student.fullName}</p>
              <p className="text-xs text-muted-foreground">s/o, d/o {a.student.fatherName}</p>
            </td>
            <td className="px-4 py-3">{a.program?.name ?? "—"}</td>
            <td className="px-4 py-3 capitalize">{a.wing}</td>
            <td className="px-4 py-3 tabular-nums">{a.academic.percentage !== null ? `${a.academic.percentage.toFixed(1)}%` : "—"}</td>
            <td className="px-4 py-3 text-muted-foreground">{formatDate(a.createdAt)}</td>
            <td className="px-4 py-3">
              <StatusBadge status={a.status} label={APPLICATION_STATUS_LABELS[a.status]} />
            </td>
            <td className="px-4 py-3 text-right">
              <Button asChild variant="ghost" size="sm">
                <Link href={`/college/applications/${a.id}`}>
                  <Eye className="size-4" /> Review
                </Link>
              </Button>
            </td>
          </tr>
        ))}
      </DataTable>
      <TablePagination page={data.page} totalPages={data.totalPages} total={data.total} />
    </>
  );
}
