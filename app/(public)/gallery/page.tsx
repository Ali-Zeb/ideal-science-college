import { Images } from "lucide-react";
import { PageHero } from "@/components/common/PageHero";
import { EmptyState } from "@/components/common/EmptyState";
import { GalleryBrowser } from "@/components/common/GalleryBrowser";
import { getGalleryAlbums } from "@/lib/data/public";
import { buildMetadata } from "@/lib/utils/seo";
import { REVALIDATE_SECONDS } from "@/lib/constants";

export const revalidate = REVALIDATE_SECONDS;

export const metadata = buildMetadata({
  title: "Photo Gallery",
  description: "Photos of campus life, ceremonies, study tours and examinations at Ideal Science College, Serai Naurang.",
  path: "/gallery",
});

export default async function GalleryPage() {
  const albums = await getGalleryAlbums();
  return (
    <>
      <PageHero title="Photo Gallery" description="Campus life, ceremonies, study tours and examinations." image="/images/gallery-555.jpg" breadcrumbs={[{ name: "Gallery", path: "/gallery" }]} />
      <section className="section">
        <div className="container-page">
          {albums.length ? <GalleryBrowser albums={albums} /> : <EmptyState icon={Images} title="No albums yet" description="Photos will be added soon." />}
        </div>
      </section>
    </>
  );
}
