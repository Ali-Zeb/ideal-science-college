"use client";

import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Images } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Lightbox } from "./Lightbox";
import { cn } from "@/lib/utils";
import type { GalleryAlbum } from "@/types";

/** Album grid with category filter; opening an album shows its photos with a lightbox. */
export function GalleryBrowser({ albums }: { albums: GalleryAlbum[] }) {
  const [category, setCategory] = useState("All");
  const [openAlbum, setOpenAlbum] = useState<GalleryAlbum | null>(null);
  const [index, setIndex] = useState<number | null>(null);

  const categories = ["All", ...Array.from(new Set(albums.map((a) => a.category)))];
  const visible = albums.filter((a) => category === "All" || a.category === category);

  if (openAlbum) {
    return (
      <div>
        <Button variant="ghost" onClick={() => setOpenAlbum(null)} className="mb-6 -ml-2">
          <ArrowLeft className="size-4" /> All albums
        </Button>
        <h2 className="text-3xl font-bold text-brand-800">{openAlbum.albumName}</h2>
        {openAlbum.description ? <p className="mt-2 text-muted-foreground">{openAlbum.description}</p> : null}
        <div className="mt-8 columns-1 gap-4 sm:columns-2 lg:columns-3">
          {openAlbum.images.map((img, i) => (
            <motion.button
              key={img.id}
              type="button"
              onClick={() => setIndex(i)}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.04, 0.4) }}
              className="group relative mb-4 block w-full overflow-hidden rounded-2xl break-inside-avoid"
              aria-label={`Open ${img.caption || "photo"}`}
            >
              <Image src={img.url} alt={img.caption} width={800} height={600} sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="h-auto w-full transition-transform duration-700 group-hover:scale-105" />
              {img.caption ? (
                <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 p-3 text-left text-sm text-white opacity-0 transition-opacity group-hover:opacity-100">
                  {img.caption}
                </span>
              ) : null}
            </motion.button>
          ))}
        </div>
        <Lightbox images={openAlbum.images} index={index} onClose={() => setIndex(null)} onChange={setIndex} />
      </div>
    );
  }

  return (
    <>
      <div className="mb-10 flex flex-wrap gap-2" role="group" aria-label="Filter albums">
        {categories.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCategory(c)}
            aria-pressed={category === c}
            className={cn(
              "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
              category === c ? "border-brand-700 bg-brand-700 text-white" : "hover:border-brand-300 hover:text-brand-700",
            )}
          >
            {c}
          </button>
        ))}
      </div>
      <motion.div layout className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {visible.map((album) => (
            <motion.button
              layout
              key={album.id}
              type="button"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={() => setOpenAlbum(album)}
              className="group overflow-hidden rounded-2xl border bg-card text-left shadow-sm transition-shadow hover:shadow-xl"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-brand-100">
                {album.coverImage ? (
                  <Image src={album.coverImage} alt="" fill sizes="(min-width: 1024px) 33vw, 50vw" className="object-cover transition-transform duration-700 group-hover:scale-110" />
                ) : null}
                <span className="absolute top-4 right-4 flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-white backdrop-blur">
                  <Images className="size-3.5" aria-hidden /> {album.images.length}
                </span>
              </div>
              <div className="p-5">
                <span className="text-xs font-semibold tracking-wider text-gold-600 uppercase">{album.category}</span>
                <h3 className="mt-1 font-sans text-lg font-bold text-brand-800">{album.albumName}</h3>
                {album.description ? <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{album.description}</p> : null}
              </div>
            </motion.button>
          ))}
        </AnimatePresence>
      </motion.div>
    </>
  );
}
