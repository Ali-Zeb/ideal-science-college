import Link from "next/link";
import { Pencil, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmAction, DataTable, PageHeader, StatusBadge, TableEmpty } from "@/components/admin/AdminUI";
import { JobApplicants } from "@/components/admin/JobApplicants";
import { deleteJob } from "@/actions/career.actions";
import { listJobApplications, listJobsAdmin } from "@/lib/data/dashboard";
import { formatDate } from "@/lib/utils/formatDate";

export const metadata = { title: "Careers" };

export default async function CareersAdminPage({ searchParams }: { searchParams: Promise<{ job?: string }> }) {
  const { job } = await searchParams;
  const [jobs, applicants] = await Promise.all([listJobsAdmin(), listJobApplications(job)]);
  const now = Date.now();
  return (
    <>
      <PageHeader
        title="Careers"
        description="Job openings and applicants."
        action={
          <Button asChild>
            <Link href="/college/careers/new">
              <Plus className="size-4" /> New job
            </Link>
          </Button>
        }
      />
      <DataTable head={["Position", "Department", "Deadline", "Applicants", "Status", ""]} empty={jobs.length ? null : <TableEmpty message="No job openings yet." />}>
        {jobs.map((j) => {
          const closed = new Date(j.deadline).getTime() < now;
          return (
            <tr key={j.id} className="hover:bg-muted/40">
              <td className="px-4 py-3 font-medium">{j.title}</td>
              <td className="px-4 py-3">{j.department}</td>
              <td className="px-4 py-3 text-muted-foreground">{formatDate(j.deadline)}</td>
              <td className="px-4 py-3">
                <Link href={`/college/careers?job=${j.id}`} className="font-medium text-brand-600 hover:underline">
                  {j.applicantCount}
                </Link>
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={!j.published ? "draft" : closed ? "inactive" : "published"} label={!j.published ? "Draft" : closed ? "Closed" : "Open"} />
              </td>
              <td className="px-4 py-3">
                <div className="flex justify-end gap-1">
                  <Button asChild variant="ghost" size="icon-sm" aria-label="Edit">
                    <Link href={`/college/careers/${j.id}`}>
                      <Pencil className="size-4" />
                    </Link>
                  </Button>
                  <ConfirmAction action={deleteJob.bind(null, j.id)} title="Delete this job?" description="All applications for this job will also be deleted." />
                </div>
              </td>
            </tr>
          );
        })}
      </DataTable>

      <div className="mt-10 mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-brand-900">{job ? "Applicants for selected job" : "All applicants"}</h2>
        {job ? (
          <Link href="/college/careers" className="text-sm font-medium text-brand-600">
            Show all
          </Link>
        ) : null}
      </div>
      <JobApplicants items={applicants} />
    </>
  );
}
