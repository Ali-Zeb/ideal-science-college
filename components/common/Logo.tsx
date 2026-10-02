import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  tone?: "light" | "dark";
  className?: string;
  compact?: boolean;
  href?: string;
}

/** College crest with wordmark. */
export function Logo({ tone = "dark", className, compact = false, href = "/" }: LogoProps) {
  return (
    <Link href={href} className={cn("group flex items-center gap-3", className)} aria-label="Ideal Science College — Home">
      <span className="relative size-12 shrink-0 overflow-hidden rounded-full bg-white ring-2 ring-gold-400/70 transition-transform duration-500 group-hover:rotate-[8deg] sm:size-14">
        <Image src="/images/logo.jpg" alt="" fill sizes="56px" className="object-contain p-0.5" priority />
      </span>
      {!compact ? (
        <span className="flex flex-col leading-tight">
          <span className={cn("font-heading text-lg font-bold sm:text-xl", tone === "light" ? "text-white" : "text-brand-800")}>
            Ideal Science College
          </span>
          <span className={cn("text-[11px] font-medium tracking-wider uppercase", tone === "light" ? "text-gold-300" : "text-gold-600")}>
            Serai Naurang · Lakki Marwat
          </span>
        </span>
      ) : null}
    </Link>
  );
}
