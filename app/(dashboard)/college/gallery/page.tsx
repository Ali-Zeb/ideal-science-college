import Image from "next/image";
import Link from "next/link";
import { Images, Pencil, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmAction, PageHeader, StatusBadge } from "@/components/admin/AdminUI";
import { EmptyState } from "@/components/common/EmptyState";
import { deleteGalleryAlbum } from "@/actions/content.actions";
import { listGalleryAdmin } from "@/lib/data/dashboard";

export const metadata = { title: "Gallery" };

export default async function GalleryAdminPage() {
  const albums = await listGalleryAdmin();
  return (
    <>
      <PageHeader
        title="Gallery"
        description="Photo albums shown on the website gallery."
        action={
          <Button asChild>
            <Link href="/college/gallery/new">
              <Plus className="size-4" /> New album
            </Link>
          </Button>
        }
      />
      {albums.length ? (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {albums.map((a) => (
            <article key={a.id} className="overflow-hidden rounded-2xl border bg-card shadow-sm">
              <div className="relative aspect-[16/10] bg-muted">
                {a.coverImage ? <Image src={a.coverImage} alt="" fill sizes="400px" className="object-cover" /> : null}
              </div>
              <div className="flex items-start justify-between gap-3 p-4">
                <div>
                  <h2 className="font-semibold">{a.albumName}</h2>
                  <p className="text-xs text-muted-foreground">
                    {a.category} · {a.images.length} photos
                  </p>
                  <div className="mt-2">
                    <StatusBadge status={a.published ? "published" : "draft"} />
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button asChild variant="ghost" size="icon-sm" aria-label="Edit">
                    <Link href={`/college/gallery/${a.id}`}>
                      <Pencil className="size-4" />
                    </Link>
                  </Button>
                  <ConfirmAction action={deleteGalleryAlbum.bind(null, a.id)} title="Delete this album?" description={a.albumName} />
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState icon={Images} title="No albums yet" description="Create your first album and upload photos." action={{ label: "New album", href: "/college/gallery/new" }} />
      )}
    </>
  );
}
