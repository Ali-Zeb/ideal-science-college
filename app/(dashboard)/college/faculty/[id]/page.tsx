import { notFound } from "next/navigation";
import { PageHeader } from "@/components/admin/AdminUI";
import { FacultyEditor } from "@/components/admin/Editors";
import { getFacultyById } from "@/lib/data/dashboard";

export const metadata = { title: "Edit teacher" };

export default async function FacultyEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = id === "new" ? undefined : await getFacultyById(id);
  if (id !== "new" && !item) notFound();
  return (
    <>
      <PageHeader title={item ? `Edit: ${item.name}` : "Add teacher"} />
      <FacultyEditor item={item ?? undefined} />
    </>
  );
}
