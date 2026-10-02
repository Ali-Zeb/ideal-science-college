"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Quote, Star } from "lucide-react";
import { SectionHeading } from "@/components/common/SectionHeading";

const testimonials = [
  {
    quote:
      "The weekly tests and the teachers' attention made all the difference. I was fully prepared for my board exams.",
    name: "FSc Pre-Medical graduate",
    role: "Now studying MBBS",
  },
  {
    quote:
      "My daughter studies in the girls wing with female teachers. As a family, that gives us complete peace of mind.",
    name: "Parent of a girls wing student",
    role: "Serai Naurang",
  },
  {
    quote:
      "I studied here from Class 6 to FSc. The teachers know every student by name and push you to do your best.",
    name: "FSc Pre-Engineering graduate",
    role: "Now studying Engineering",
  },
  {
    quote: "Discipline, respect and hard work — that is what I learned here, along with Computer Science and Mathematics.",
    name: "ICS graduate",
    role: "Now studying BS Computer Science",
  },
];

const marquee = [
  "BISE Bannu affiliated",
  "Class 1 to 12",
  "Separate girls wing",
  "Science laboratories",
  "Computer lab",
  "Weekly testing",
  "Merit scholarships",
  "Study tours",
  "Parent–teacher meetings",
];

/** Auto-rotating testimonial carousel followed by a scrolling highlights marquee. */
export function TestimonialsSection() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => setActive((i) => (i + 1) % testimonials.length), 6000);
    return () => clearInterval(id);
  }, [paused]);

  const t = testimonials[active];

  return (
    <section className="section overflow-hidden">
      <div className="container-page">
        <SectionHeading eyebrow="Testimonials" title="What students & parents say" />
        <div
          className="relative mx-auto max-w-3xl rounded-3xl bg-gradient-to-br from-brand-700 to-brand-900 px-6 py-12 text-center text-white shadow-2xl sm:px-14"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocus={() => setPaused(true)}
          onBlur={() => setPaused(false)}
        >
          <Quote className="absolute top-6 left-6 size-12 text-gold-400/30" aria-hidden />
          <div className="mb-5 flex justify-center gap-1 text-gold-400" aria-label="5 out of 5 stars">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="size-5 fill-current" aria-hidden />
            ))}
          </div>
          <div className="min-h-44 sm:min-h-36" aria-live="polite">
            <AnimatePresence mode="wait">
              <motion.blockquote
                key={active}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.4 }}
              >
                <p className="font-heading text-xl leading-relaxed sm:text-2xl">“{t.quote}”</p>
                <footer className="mt-6">
                  <p className="font-semibold text-gold-300">{t.name}</p>
                  <p className="text-sm text-white/65">{t.role}</p>
                </footer>
              </motion.blockquote>
            </AnimatePresence>
          </div>
          <div className="mt-8 flex justify-center gap-2" role="tablist" aria-label="Choose testimonial">
            {testimonials.map((_, i) => (
              <button
                key={i}
                type="button"
                role="tab"
                aria-selected={i === active}
                aria-label={`Testimonial ${i + 1}`}
                onClick={() => setActive(i)}
                className={`h-2 rounded-full transition-all ${i === active ? "w-8 bg-gold-400" : "w-2 bg-white/40 hover:bg-white/70"}`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="mt-16 border-y bg-brand-50/60 py-5" aria-hidden>
        <div className="animate-marquee flex w-max gap-10 whitespace-nowrap">
          {[...marquee, ...marquee].map((item, i) => (
            <span key={i} className="flex items-center gap-10 font-heading text-xl font-semibold text-brand-700/80 sm:text-2xl">
              {item}
              <span className="size-2 rounded-full bg-gold-500" />
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
