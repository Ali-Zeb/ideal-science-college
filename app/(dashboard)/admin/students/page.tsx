import { Ban, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmAction, DataTable, PageHeader, SearchBox, StatusBadge, TableEmpty, TablePagination } from "@/components/admin/AdminUI";
import { deleteStudentAccount, setStudentActive } from "@/actions/admin.actions";
import { listStudentAccounts } from "@/lib/data/dashboard";
import { formatDate, formatDateTime } from "@/lib/utils/formatDate";

export const metadata = { title: "Student accounts" };

export default async function StudentsPage({ searchParams }: { searchParams: Promise<{ q?: string; page?: string }> }) {
  const sp = await searchParams;
  const data = await listStudentAccounts(sp.q, sp.page);
  return (
    <>
      <PageHeader title="Student portal accounts" description="Registered students and parents. Block an account to stop it signing in." />
      <div className="mb-5">
        <SearchBox placeholder="Search name, email or mobile" />
      </div>
      <DataTable head={["Name", "Email", "Mobile", "Email verified", "Applications", "Joined", "Last sign-in", ""]} empty={data.items.length ? null : <TableEmpty message="No accounts found." />}>
        {data.items.map((s) => (
          <tr key={s.id} className="hover:bg-muted/40">
            <td className="px-4 py-3 font-medium">
              {s.name}
              {!s.isActive ? (
                <span className="ml-2">
                  <StatusBadge status="rejected" label="Blocked" />
                </span>
              ) : null}
            </td>
            <td className="px-4 py-3">{s.email}</td>
            <td className="px-4 py-3">{s.phone}</td>
            <td className="px-4 py-3">
              <StatusBadge status={s.verified ? "active" : "pending"} label={s.verified ? "Verified" : "Pending"} />
            </td>
            <td className="px-4 py-3 tabular-nums">{s.applicationCount}</td>
            <td className="px-4 py-3 text-muted-foreground">{formatDate(s.createdAt)}</td>
            <td className="px-4 py-3 text-muted-foreground">{s.lastLogin ? formatDateTime(s.lastLogin) : "Never"}</td>
            <td className="px-4 py-3">
              <div className="flex justify-end gap-1">
                <ConfirmAction
                  action={setStudentActive.bind(null, s.id, !s.isActive)}
                  title={s.isActive ? `Block ${s.name}?` : `Unblock ${s.name}?`}
                  description={s.isActive ? "They will not be able to sign in until unblocked." : "They will be able to sign in again."}
                  confirmLabel={s.isActive ? "Block" : "Unblock"}
                  trigger={
                    <Button variant="ghost" size="icon-sm" aria-label={s.isActive ? "Block" : "Unblock"}>
                      {s.isActive ? <Ban className="size-4" /> : <CheckCircle2 className="size-4" />}
                    </Button>
                  }
                />
                {s.applicationCount === 0 ? <ConfirmAction action={deleteStudentAccount.bind(null, s.id)} title={`Delete ${s.name}'s account?`} /> : null}
              </div>
            </td>
          </tr>
        ))}
      </DataTable>
      <TablePagination page={data.page} totalPages={data.totalPages} total={data.total} />
    </>
  );
}
