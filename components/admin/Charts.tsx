"use client";

import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

/** Weekly applications bar chart (last 8 weeks). */
export function WeeklyApplicationsChart({ data }: { data: { week: string; applications: number }[] }) {
  return (
    <div className="h-64 w-full" role="img" aria-label={`Applications per week: ${data.map((d) => `${d.week} ${d.applications}`).join(", ")}`}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="var(--border)" />
          <XAxis dataKey="week" tickLine={false} axisLine={false} fontSize={12} stroke="var(--muted-foreground)" />
          <YAxis allowDecimals={false} tickLine={false} axisLine={false} fontSize={12} stroke="var(--muted-foreground)" />
          <Tooltip cursor={{ fill: "rgba(30,42,120,0.06)" }} contentStyle={{ borderRadius: 10, border: "1px solid var(--border)", fontSize: 13 }} />
          <Bar dataKey="applications" name="Applications" fill="var(--chart-1)" radius={[6, 6, 0, 0]} maxBarSize={36} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/** Donut chart for a small categorical breakdown (e.g. application statuses). */
export function BreakdownDonut({ data }: { data: { name: string; value: number; color: string }[] }) {
  const total = data.reduce((n, d) => n + d.value, 0);
  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row">
      <div className="relative size-40 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={total ? data : [{ name: "None", value: 1, color: "var(--muted)" }]} dataKey="value" innerRadius={48} outerRadius={70} paddingAngle={total ? 2 : 0} stroke="none">
              {(total ? data : [{ color: "var(--muted)" }]).map((d, i) => (
                <Cell key={i} fill={d.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-brand-900 tabular-nums">{total}</span>
          <span className="text-xs text-muted-foreground">total</span>
        </div>
      </div>
      <ul className="w-full space-y-2 text-sm">
        {data.map((d) => (
          <li key={d.name} className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2">
              <span className="size-2.5 rounded-full" style={{ background: d.color }} aria-hidden />
              {d.name}
            </span>
            <span className="font-semibold tabular-nums">{d.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
