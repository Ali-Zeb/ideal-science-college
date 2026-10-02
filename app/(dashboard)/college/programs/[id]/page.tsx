import { notFound } from "next/navigation";
import { PageHeader } from "@/components/admin/AdminUI";
import { ProgramEditor } from "@/components/admin/ProgramEditor";
import { getProgramById, listFacultyAdmin } from "@/lib/data/dashboard";

export const metadata = { title: "Edit program" };

export default async function ProgramEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [item, faculty] = await Promise.all([id === "new" ? Promise.resolve(null) : getProgramById(id), listFacultyAdmin()]);
  if (id !== "new" && !item) notFound();
  return (
    <>
      <PageHeader title={item ? `Edit: ${item.name}` : "New program"} />
      <ProgramEditor item={item ?? undefined} faculty={faculty} />
    </>
  );
}
