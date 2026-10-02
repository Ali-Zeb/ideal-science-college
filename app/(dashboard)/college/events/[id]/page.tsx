import { notFound } from "next/navigation";
import { PageHeader } from "@/components/admin/AdminUI";
import { EventEditor } from "@/components/admin/Editors";
import { getEventById } from "@/lib/data/dashboard";

export const metadata = { title: "Edit event" };

export default async function EventEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = id === "new" ? undefined : await getEventById(id);
  if (id !== "new" && !item) notFound();
  return (
    <>
      <PageHeader title={item ? "Edit event" : "New event"} />
      <EventEditor item={item ?? undefined} />
    </>
  );
}
