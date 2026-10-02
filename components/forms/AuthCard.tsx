import type { LucideIcon } from "lucide-react";

interface AuthCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

/** White card used by every auth page. */
export function AuthCard({ icon: Icon, title, description, children, footer }: AuthCardProps) {
  return (
    <div className="rounded-3xl border bg-card p-7 shadow-xl sm:p-9">
      <span className="mb-5 flex size-12 items-center justify-center rounded-2xl bg-brand-700 text-gold-400">
        <Icon className="size-6" aria-hidden />
      </span>
      <h1 className="font-heading text-3xl font-bold text-brand-800">{title}</h1>
      <p className="mt-2 mb-7 text-sm text-muted-foreground">{description}</p>
      {children}
      {footer ? <div className="mt-7 border-t pt-5 text-center text-sm text-muted-foreground">{footer}</div> : null}
    </div>
  );
}
