import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/animations/FadeIn";
import { SITE } from "@/lib/constants";

const points = [
  "Affiliated with BISE Bannu",
  "Weekly tests & monthly parent reports",
  "Separate science & computer labs",
  "Separate boys & girls wings",
];

/** Two-column introduction to the college with image collage. */
export function AboutPreview() {
  const years = new Date().getFullYear() - SITE.established;
  return (
    <section className="section overflow-hidden">
      <div className="container-page grid items-center gap-14 lg:grid-cols-2">
        <FadeIn direction="right" className="relative">
          <div className="relative aspect-[4/5] w-[85%] overflow-hidden rounded-3xl shadow-2xl">
            <Image src="/images/gallery-666.jpg" alt="Students and faculty of Ideal Science College" fill sizes="(min-width: 1024px) 40vw, 85vw" className="object-cover" />
          </div>
          <div className="absolute right-0 bottom-[-6%] aspect-square w-[52%] overflow-hidden rounded-3xl border-8 border-white shadow-2xl">
            <Image src="/images/students-lab.jpeg" alt="Students in the science laboratory" fill sizes="(min-width: 1024px) 25vw, 50vw" className="object-cover" />
          </div>
          <div className="absolute top-8 -left-2 rounded-2xl bg-brand-700 px-6 py-5 text-white shadow-xl sm:-left-6">
            <p className="font-heading text-4xl font-bold text-gold-400">{years}+</p>
            <p className="text-xs font-medium tracking-wide uppercase">Years of excellence</p>
          </div>
        </FadeIn>

        <div>
          <FadeIn>
            <p className="mb-3 inline-flex items-center gap-2 text-xs font-semibold tracking-[0.2em] text-brand-600 uppercase">
              <span className="h-px w-8 bg-gold-500" aria-hidden /> About us
            </p>
            <h2 className="text-3xl leading-tight font-bold text-brand-800 sm:text-4xl lg:text-[2.75rem]">
              From Class 1 to FSc, under one roof
            </h2>
            <p className="mt-5 text-base leading-relaxed text-muted-foreground sm:text-lg">
              Ideal Science College, Serai Naurang is a branch of the Chokara Science Group of Colleges, Karak. Our school
              (Class 1–10) and college (FSc Pre-Medical, Pre-Engineering and ICS) give the children of Lakki Marwat a
              complete education close to home. Boys and girls study in separate wings, and the girls wing is run by female
              teachers in a purdah-observing environment.
            </p>
          </FadeIn>
          <FadeIn delay={0.15}>
            <ul className="mt-8 grid gap-3 sm:grid-cols-2">
              {points.map((p) => (
                <li key={p} className="flex items-start gap-2.5 text-sm font-medium text-foreground">
                  <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-leaf-500" aria-hidden />
                  {p}
                </li>
              ))}
            </ul>
            <Button asChild size="lg" className="mt-10 h-12 px-6">
              <Link href="/about">
                Learn more about us <ArrowRight className="size-4" />
              </Link>
            </Button>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
