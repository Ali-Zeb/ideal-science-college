"use client";

import { useRef } from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FacultyCard } from "@/components/academics/FacultyCard";
import { FadeIn } from "@/components/animations/FadeIn";
import type { FacultyItem } from "@/types";

/** Horizontally scrolling faculty carousel with arrow controls and scroll-snap. */
export function FacultyPreview({ faculty }: { faculty: FacultyItem[] }) {
  const track = useRef<HTMLDivElement>(null);
  const scroll = (dir: 1 | -1) => {
    const el = track.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: "smooth" });
  };

  if (faculty.length === 0) return null;

  return (
    <section className="section">
      <div className="container-page">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
          <FadeIn className="max-w-2xl">
            <p className="mb-3 inline-flex items-center gap-2 text-xs font-semibold tracking-[0.2em] text-brand-600 uppercase">
              <span className="h-px w-8 bg-gold-500" aria-hidden /> Our faculty
            </p>
            <h2 className="text-3xl font-bold text-brand-800 sm:text-4xl">Learn from experienced teachers</h2>
          </FadeIn>
          <div className="flex gap-2">
            <Button variant="outline" size="icon-lg" onClick={() => scroll(-1)} aria-label="Previous teachers" className="rounded-full">
              <ChevronLeft className="size-5" />
            </Button>
            <Button variant="outline" size="icon-lg" onClick={() => scroll(1)} aria-label="Next teachers" className="rounded-full">
              <ChevronRight className="size-5" />
            </Button>
          </div>
        </div>
        <div
          ref={track}
          className="-mx-4 flex snap-x snap-mandatory gap-6 overflow-x-auto px-4 pb-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {faculty.map((m) => (
            <div key={m.id} className="w-[75%] shrink-0 snap-start sm:w-[45%] lg:w-[23%]">
              <FacultyCard member={m} />
            </div>
          ))}
        </div>
        <div className="mt-6 text-center">
          <Button asChild variant="link" className="text-base">
            <Link href="/academics/faculty">
              Meet the full faculty <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
