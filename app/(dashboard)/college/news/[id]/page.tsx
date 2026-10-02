import { notFound } from "next/navigation";
import { PageHeader } from "@/components/admin/AdminUI";
import { NewsEditor } from "@/components/admin/Editors";
import { getNewsById } from "@/lib/data/dashboard";

export const metadata = { title: "Edit news" };

export default async function NewsEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = id === "new" ? undefined : await getNewsById(id);
  if (id !== "new" && !item) notFound();
  return (
    <>
      <PageHeader title={item ? "Edit news post" : "New news post"} />
      <NewsEditor item={item ?? undefined} />
    </>
  );
}
