"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Expand } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/common/SectionHeading";
import { Lightbox, type LightboxImage } from "@/components/common/Lightbox";
import { StaggerChildren, StaggerItem } from "@/components/animations/StaggerChildren";
import { cn } from "@/lib/utils";

const layout = ["sm:col-span-2 sm:row-span-2", "", "", "sm:row-span-2", "", ""];

/** Masonry-style photo grid with hover zoom and a lightbox. */
export function CampusShowcase({ images }: { images: LightboxImage[] }) {
  const [index, setIndex] = useState<number | null>(null);
  const shown = images.slice(0, 6);
  if (shown.length === 0) return null;

  return (
    <section className="section bg-muted/50">
      <div className="container-page">
        <SectionHeading
          eyebrow="Campus life"
          title="Moments from our campus"
          description="Examinations, award ceremonies, study tours and everyday learning at Ideal Science College."
        />
        <StaggerChildren className="grid auto-rows-[180px] grid-cols-1 gap-4 sm:auto-rows-[200px] sm:grid-cols-4">
          {shown.map((img, i) => (
            <StaggerItem key={img.url} className={cn("h-full", layout[i])}>
              <button
                type="button"
                onClick={() => setIndex(i)}
                className="group relative block h-full w-full overflow-hidden rounded-2xl"
                aria-label={`Open image: ${img.caption ?? "campus photo"}`}
              >
                <Image src={img.url} alt={img.caption ?? ""} fill sizes="(min-width: 640px) 50vw, 100vw" className="object-cover transition-transform duration-700 group-hover:scale-110" />
                <span className="absolute inset-0 flex items-end bg-gradient-to-t from-brand-950/80 via-brand-950/10 to-transparent p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <span className="flex w-full items-center justify-between text-left text-sm font-medium text-white">
                    {img.caption}
                    <Expand className="size-5 shrink-0 text-gold-400" aria-hidden />
                  </span>
                </span>
              </button>
            </StaggerItem>
          ))}
        </StaggerChildren>
        <div className="mt-10 text-center">
          <Button asChild size="lg" variant="outline" className="h-12 border-brand-200 px-6 text-brand-700">
            <Link href="/gallery">
              Open full gallery <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </div>
      <Lightbox images={shown} index={index} onClose={() => setIndex(null)} onChange={setIndex} />
    </section>
  );
}
