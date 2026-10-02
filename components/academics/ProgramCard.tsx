import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Clock, Users } from "lucide-react";
import { formatCurrency } from "@/lib/utils/formatDate";
import { LEVEL_LABELS, programIcon } from "./programIcons";
import type { ProgramItem } from "@/types";

/** Program summary card with image, level badge, duration, seats and fee. */
export function ProgramCard({ program }: { program: ProgramItem }) {
  const Icon = programIcon(program.icon);
  const fee = program.fees.monthly ? `${formatCurrency(program.fees.monthly)}/month` : formatCurrency(program.fees.total);

  return (
    <Link
      href={`/academics/${program.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_50px_-15px_rgba(30,42,120,0.35)]"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-brand-100">
        {program.image ? (
          <Image
            src={program.image}
            alt={program.name}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-brand-950/70 via-transparent" />
        <span className="absolute top-4 left-4 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-brand-700">
          {LEVEL_LABELS[program.level] ?? program.level}
        </span>
        <span className="absolute -bottom-6 right-5 flex size-14 items-center justify-center rounded-2xl bg-gold-400 text-brand-900 shadow-lg transition-transform duration-500 group-hover:rotate-12">
          <Icon className="size-7" aria-hidden />
        </span>
      </div>
      <div className="flex flex-1 flex-col p-6 pt-8">
        <h3 className="font-sans text-xl font-bold text-brand-800 transition-colors group-hover:text-brand-600">{program.name}</h3>
        <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-muted-foreground">{program.shortDescription}</p>
        <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 border-t pt-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Clock className="size-3.5 text-brand-500" aria-hidden /> {program.duration}
          </span>
          {program.seats ? (
            <span className="flex items-center gap-1.5">
              <Users className="size-3.5 text-brand-500" aria-hidden /> {program.seats} seats
            </span>
          ) : null}
          <span className="ml-auto font-semibold text-brand-700">{fee}</span>
        </div>
        <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-600">
          View program <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </span>
      </div>
    </Link>
  );
}
