"use client";

import { BookMarked } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import type { CurriculumTerm } from "@/types";

/** Expandable list of terms/years with their subjects. */
export function CurriculumAccordion({ curriculum }: { curriculum: CurriculumTerm[] }) {
  return (
    <Accordion type="single" collapsible defaultValue="term-0" className="rounded-2xl border bg-card px-5">
      {curriculum.map((term, i) => (
        <AccordionItem key={term.semester} value={`term-${i}`}>
          <AccordionTrigger className="py-5 text-base font-semibold text-brand-800 hover:no-underline">
            {term.title || `Term ${term.semester}`}
          </AccordionTrigger>
          <AccordionContent>
            <ul className="grid gap-2.5 pb-2 sm:grid-cols-2">
              {term.subjects.map((s) => (
                <li key={s} className="flex items-center gap-2.5 rounded-lg bg-brand-50/70 px-3 py-2 text-sm">
                  <BookMarked className="size-4 text-brand-500" aria-hidden /> {s}
                </li>
              ))}
            </ul>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
