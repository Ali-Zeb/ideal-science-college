import { notFound } from "next/navigation";
import { PageHeader } from "@/components/admin/AdminUI";
import { GalleryEditor } from "@/components/admin/GalleryEditor";
import { getGalleryById } from "@/lib/data/dashboard";

export const metadata = { title: "Edit album" };

export default async function GalleryEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const album = id === "new" ? undefined : await getGalleryById(id);
  if (id !== "new" && !album) notFound();
  return (
    <>
      <PageHeader title={album ? `Edit: ${album.albumName}` : "New album"} />
      <GalleryEditor album={album ?? undefined} />
    </>
  );
}
