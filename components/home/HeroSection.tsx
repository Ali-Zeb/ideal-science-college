"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Award, BookOpenCheck, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TextReveal } from "@/components/animations/TextReveal";
import { MagneticButton } from "@/components/animations/MagneticButton";

/** Full-screen homepage hero with parallax campus photo, animated headline and primary CTAs. */
export function HeroSection({ admissionsOpen }: { admissionsOpen: boolean }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);
  const fade = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <section ref={ref} className="relative isolate flex min-h-[100svh] items-center overflow-hidden bg-brand-950">
      <motion.div style={{ y: bgY }} className="absolute inset-0 -z-20">
        <Image src="/images/campus-building.jpg" alt="Ideal Science College campus" fill priority sizes="100vw" className="scale-110 object-cover" />
      </motion.div>
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-brand-950/95 via-brand-900/80 to-brand-800/40" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_80%_20%,rgba(245,200,76,0.18),transparent_45%)]" />
      <div className="animate-float-slow absolute top-1/4 right-[8%] -z-10 hidden size-72 rounded-full border border-gold-400/20 lg:block" aria-hidden />
      <div className="animate-float-slow absolute right-[14%] bottom-1/4 -z-10 hidden size-40 rounded-full bg-leaf-500/10 blur-2xl lg:block" aria-hidden />

      <motion.div style={{ y: contentY, opacity: fade }} className="container-page pt-32 pb-24">
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-gold-400/30 bg-white/5 px-4 py-1.5 text-xs font-medium tracking-wide text-gold-300 backdrop-blur"
        >
          <Award className="size-4" aria-hidden />
          School & College · Class 1 to 12 · Serai Naurang
        </motion.p>

        <TextReveal
          as="h1"
          immediate
          delay={0.2}
          text="Shaping Future Doctors, Engineers & Innovators"
          highlight={["Doctors,", "Engineers", "Innovators"]}
          className="max-w-4xl text-4xl leading-[1.08] font-bold text-white sm:text-6xl lg:text-7xl"
        />

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.6 }}
          className="mt-6 max-w-2xl text-base leading-relaxed text-white/80 sm:text-lg"
        >
          From Class 1 to FSc — Pre-Medical, Pre-Engineering and ICS — with professional teachers, regular testing, science labs
          and separate boys and girls wings, right here in District Lakki Marwat.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.6 }}
          className="mt-10 flex flex-wrap items-center gap-4"
        >
          {admissionsOpen ? (
            <MagneticButton>
              <Button asChild size="lg" className="h-13 bg-gold-400 px-7 text-base font-semibold text-brand-950 shadow-xl shadow-gold-500/30 hover:bg-gold-300">
                <Link href="/admissions/apply">
                  Apply Now <ArrowRight className="size-5" />
                </Link>
              </Button>
            </MagneticButton>
          ) : null}
          <Button asChild size="lg" variant="outline" className="h-13 border-white/30 bg-white/5 px-7 text-base text-white backdrop-blur hover:bg-white/15 hover:text-white">
            <Link href="/academics">
              <BookOpenCheck className="size-5" /> Explore Programs
            </Link>
          </Button>
          <Link href="/gallery" className="flex items-center gap-2 text-sm font-medium text-white/80 hover:text-gold-300">
            <PlayCircle className="size-9 text-gold-400" aria-hidden /> Campus gallery
          </Link>
        </motion.div>
      </motion.div>

      <a href="#stats" className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-xs tracking-widest text-white/60 uppercase sm:flex" aria-label="Scroll down">
        <span className="flex h-10 w-6 justify-center rounded-full border-2 border-white/40 pt-2">
          <span className="animate-scroll-dot size-1.5 rounded-full bg-gold-400" />
        </span>
        Scroll
      </a>
    </section>
  );
}
