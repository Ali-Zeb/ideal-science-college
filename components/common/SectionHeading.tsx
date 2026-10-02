import { FadeIn } from "@/components/animations/FadeIn";
import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  tone?: "default" | "light";
  className?: string;
}

/**
 * Consistent section title block: small eyebrow label, serif heading and optional intro.
 */
export function SectionHeading({ eyebrow, title, description, align = "center", tone = "default", className }: SectionHeadingProps) {
  const light = tone === "light";
  return (
    <FadeIn className={cn("mb-12 max-w-3xl", align === "center" && "mx-auto text-center", className)}>
      {eyebrow ? (
        <p
          className={cn(
            "mb-3 inline-flex items-center gap-2 text-xs font-semibold tracking-[0.2em] uppercase",
            light ? "text-gold-400" : "text-brand-600",
          )}
        >
          <span className={cn("h-px w-8", light ? "bg-gold-400" : "bg-gold-500")} aria-hidden />
          {eyebrow}
        </p>
      ) : null}
      <h2 className={cn("text-3xl leading-tight font-bold sm:text-4xl lg:text-[2.75rem]", light ? "text-white" : "text-brand-800")}>
        {title}
      </h2>
      {description ? (
        <p className={cn("mt-4 text-base leading-relaxed sm:text-lg", light ? "text-white/75" : "text-muted-foreground")}>
          {description}
        </p>
      ) : null}
    </FadeIn>
  );
}
