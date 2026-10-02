import { Atom, BookOpen, Calculator, Cpu, FlaskConical, GraduationCap, Pencil, School, Stethoscope, type LucideIcon } from "lucide-react";

/** Icons selectable for a program in the College dashboard. */
export const PROGRAM_ICONS: Record<string, LucideIcon> = {
  Stethoscope,
  Cpu,
  Calculator,
  FlaskConical,
  Atom,
  GraduationCap,
  BookOpen,
  School,
  Pencil,
};

/** Resolves a stored icon name, falling back to a flask. */
export function programIcon(name: string): LucideIcon {
  return PROGRAM_ICONS[name] ?? FlaskConical;
}

export const LEVEL_LABELS: Record<string, string> = {
  primary: "Primary · Class 1–5",
  middle: "Middle · Class 6–8",
  secondary: "Matric · Class 9–10",
  intermediate: "College · Class 11–12",
  preparatory: "Entry Test Prep",
};
