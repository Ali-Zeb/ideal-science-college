import Link from "next/link";
import { Eye, Pencil, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmAction, DataTable, PageHeader, StatusBadge, TableEmpty } from "@/components/admin/AdminUI";
import { LEVEL_LABELS } from "@/components/academics/programIcons";
import { deleteProgram } from "@/actions/content.actions";
import { listProgramsAdmin } from "@/lib/data/dashboard";
import { formatCurrency } from "@/lib/utils/formatDate";
import { WING_LABELS } from "@/lib/constants";

export const metadata = { title: "Programs" };

export default async function ProgramsAdminPage() {
  const programs = await listProgramsAdmin();
  return (
    <>
      <PageHeader
        title="Programs & classes"
        description="School and college programs, curriculum, fees and assigned faculty."
        action={
          <Button asChild>
            <Link href="/college/programs/new">
              <Plus className="size-4" /> New program
            </Link>
          </Button>
        }
      />
      <DataTable head={["#", "Program", "Level", "Wings", "Monthly fee", "Seats", "Status", ""]} empty={programs.length ? null : <TableEmpty message="No programs yet." />}>
        {programs.map((p) => (
          <tr key={p.id} className="hover:bg-muted/40">
            <td className="px-4 py-3 text-muted-foreground tabular-nums">{p.order}</td>
            <td className="px-4 py-3 font-medium">{p.name}</td>
            <td className="px-4 py-3">{LEVEL_LABELS[p.level]}</td>
            <td className="px-4 py-3">{WING_LABELS[p.wings]}</td>
            <td className="px-4 py-3 tabular-nums">{p.fees.monthly ? formatCurrency(p.fees.monthly) : "—"}</td>
            <td className="px-4 py-3 tabular-nums">{p.seats || "—"}</td>
            <td className="px-4 py-3">
              <StatusBadge status={p.published ? "published" : "draft"} />
            </td>
            <td className="px-4 py-3">
              <div className="flex justify-end gap-1">
                <Button asChild variant="ghost" size="icon-sm" aria-label="View">
                  <Link href={`/academics/${p.slug}`} target="_blank">
                    <Eye className="size-4" />
                  </Link>
                </Button>
                <Button asChild variant="ghost" size="icon-sm" aria-label="Edit">
                  <Link href={`/college/programs/${p.id}`}>
                    <Pencil className="size-4" />
                  </Link>
                </Button>
                <ConfirmAction action={deleteProgram.bind(null, p.id)} title="Delete this program?" description="Existing applications keep their record, but the program will disappear from the website." />
              </div>
            </td>
          </tr>
        ))}
      </DataTable>
    </>
  );
}
