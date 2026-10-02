import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  label?: string;
  className?: string;
  fullPage?: boolean;
}

/** Accessible loading indicator. */
export function LoadingSpinner({ label = "Loading…", className, fullPage = false }: LoadingSpinnerProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "flex items-center justify-center gap-3 text-muted-foreground",
        fullPage && "min-h-[60vh]",
        className,
      )}
    >
      <Loader2 className="size-6 animate-spin text-brand-600" aria-hidden />
      <span className="text-sm">{label}</span>
    </div>
  );
}
