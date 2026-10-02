import { BookOpen, GraduationCap, Trophy, Users } from "lucide-react";
import { CountUp } from "@/components/animations/CountUp";
import { StaggerChildren, StaggerItem } from "@/components/animations/StaggerChildren";
import { STATS } from "@/lib/constants";

const icons = [Users, GraduationCap, BookOpen, Trophy];

/** Animated counters band overlapping the hero. */
export function StatsSection() {
  return (
    <section id="stats" className="relative z-10 -mt-16 pb-8">
      <div className="container-page">
        <StaggerChildren className="grid grid-cols-2 gap-px overflow-hidden rounded-3xl bg-border shadow-[0_30px_80px_-30px_rgba(16,22,63,0.45)] lg:grid-cols-4">
          {STATS.map((stat, i) => {
            const Icon = icons[i];
            return (
              <StaggerItem key={stat.label} className="group bg-white p-6 text-center transition-colors hover:bg-brand-50 sm:p-8">
                <Icon className="mx-auto mb-3 size-8 text-gold-500 transition-transform duration-500 group-hover:scale-110" aria-hidden />
                <CountUp value={stat.value} suffix={stat.suffix} className="block font-heading text-4xl font-bold text-brand-800 sm:text-5xl" />
                <p className="mt-2 text-sm font-medium text-muted-foreground">{stat.label}</p>
              </StaggerItem>
            );
          })}
        </StaggerChildren>
      </div>
    </section>
  );
}
