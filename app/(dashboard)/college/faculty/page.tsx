import Link from "next/link";
import { Pencil, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmAction, DataTable, PageHeader, StatusBadge, TableEmpty } from "@/components/admin/AdminUI";
import { deleteFaculty } from "@/actions/content.actions";
import { listFacultyAdmin } from "@/lib/data/dashboard";
import { WING_LABELS } from "@/lib/constants";

export const metadata = { title: "Faculty" };

export default async function FacultyAdminPage() {
  const faculty = await listFacultyAdmin();
  return (
    <>
      <PageHeader
        title="Faculty"
        description="Teacher profiles shown on the website."
        action={
          <Button asChild>
            <Link href="/college/faculty/new">
              <Plus className="size-4" /> Add teacher
            </Link>
          </Button>
        }
      />
      <DataTable head={["#", "Name", "Designation", "Department", "Wing", "Status", ""]} empty={faculty.length ? null : <TableEmpty message="No faculty profiles yet." />}>
        {faculty.map((f) => (
          <tr key={f.id} className="hover:bg-muted/40">
            <td className="px-4 py-3 text-muted-foreground tabular-nums">{f.order}</td>
            <td className="px-4 py-3">
              <p className="font-medium">{f.name}</p>
              <p className="text-xs text-muted-foreground">{f.qualification}</p>
            </td>
            <td className="px-4 py-3">{f.designation}</td>
            <td className="px-4 py-3">{f.department}</td>
            <td className="px-4 py-3">{WING_LABELS[f.wing]}</td>
            <td className="px-4 py-3">
              <StatusBadge status={f.isActive ? "active" : "inactive"} label={f.isActive ? "Visible" : "Hidden"} />
            </td>
            <td className="px-4 py-3">
              <div className="flex justify-end gap-1">
                <Button asChild variant="ghost" size="icon-sm" aria-label="Edit">
                  <Link href={`/college/faculty/${f.id}`}>
                    <Pencil className="size-4" />
                  </Link>
                </Button>
                <ConfirmAction action={deleteFaculty.bind(null, f.id)} title="Remove this teacher?" description={f.name} />
              </div>
            </td>
          </tr>
        ))}
      </DataTable>
    </>
  );
}
