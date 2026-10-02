import { notFound } from "next/navigation";
import { PageHeader } from "@/components/admin/AdminUI";
import { JobEditor } from "@/components/admin/Editors";
import { getJobById } from "@/lib/data/dashboard";

export const metadata = { title: "Edit job" };

export default async function JobEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = id === "new" ? undefined : await getJobById(id);
  if (id !== "new" && !item) notFound();
  return (
    <>
      <PageHeader title={item ? `Edit: ${item.title}` : "New job opening"} />
      <JobEditor item={item ?? undefined} />
    </>
  );
}
