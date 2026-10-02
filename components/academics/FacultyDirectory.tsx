"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Search, SearchX } from "lucide-react";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/common/EmptyState";
import { FacultyCard } from "./FacultyCard";
import { useDebounce } from "@/hooks/useDebounce";
import { WING_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { FacultyItem } from "@/types";

/** Faculty grid with search and department / wing filters. */
export function FacultyDirectory({ faculty }: { faculty: FacultyItem[] }) {
  const [query, setQuery] = useState("");
  const [department, setDepartment] = useState("All");
  const [wing, setWing] = useState<"all" | "boys" | "girls">("all");
  const q = useDebounce(query.trim().toLowerCase(), 200);

  const departments = useMemo(() => ["All", ...Array.from(new Set(faculty.map((f) => f.department))).sort()], [faculty]);

  const filtered = faculty.filter(
    (f) =>
      (department === "All" || f.department === department) &&
      (wing === "all" || f.wing === wing || f.wing === "both") &&
      (!q || `${f.name} ${f.designation} ${f.qualification} ${f.department}`.toLowerCase().includes(q)),
  );

  const chip = (active: boolean) =>
    cn(
      "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
      active ? "border-brand-700 bg-brand-700 text-white" : "bg-white hover:border-brand-300 hover:text-brand-700",
    );

  return (
    <>
      <div className="mb-10 space-y-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-sm">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or subject"
              className="h-11 pl-10"
              aria-label="Search faculty"
            />
          </div>
          <div className="flex gap-2" role="group" aria-label="Filter by wing">
            {(["all", "boys", "girls"] as const).map((w) => (
              <button key={w} type="button" onClick={() => setWing(w)} className={chip(wing === w)} aria-pressed={wing === w}>
                {w === "all" ? "All wings" : WING_LABELS[w]}
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by department">
          {departments.map((d) => (
            <button key={d} type="button" onClick={() => setDepartment(d)} className={chip(department === d)} aria-pressed={department === d}>
              {d}
            </button>
          ))}
        </div>
      </div>

      {filtered.length ? (
        <motion.div layout className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <AnimatePresence mode="popLayout">
            {filtered.map((m) => (
              <motion.div key={m.id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
                <FacultyCard member={m} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <EmptyState icon={SearchX} title="No teachers match your filters" description="Try another department or clear the search." />
      )}
    </>
  );
}
