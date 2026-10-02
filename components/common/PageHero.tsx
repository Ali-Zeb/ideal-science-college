import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { TextReveal } from "@/components/animations/TextReveal";
import { FadeIn } from "@/components/animations/FadeIn";
import { JsonLd, breadcrumbJsonLd } from "./SEO";

interface PageHeroProps {
  title: string;
  description?: string;
  image?: string;
  breadcrumbs: { name: string; path: string }[];
  children?: React.ReactNode;
}

/**
 * Banner shown at the top of inner pages: background photo, animated title,
 * intro text and an accessible breadcrumb trail (with JSON-LD).
 */
export function PageHero({ title, description, image = "/images/campus-building.jpg", breadcrumbs, children }: PageHeroProps) {
  const trail = [{ name: "Home", path: "/" }, ...breadcrumbs];
  return (
    <section className="relative isolate overflow-hidden bg-brand-900 pt-36 pb-16 sm:pt-44 sm:pb-24">
      <Image src={image} alt="" fill priority sizes="100vw" className="-z-20 object-cover opacity-35" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-brand-950/95 via-brand-900/85 to-brand-700/60" />
      <div className="absolute -right-24 -bottom-24 -z-10 size-80 rounded-full bg-gold-400/15 blur-3xl" aria-hidden />
      <JsonLd data={breadcrumbJsonLd(trail)} />
      <div className="container-page">
        <FadeIn direction="none">
          <nav aria-label="Breadcrumb" className="mb-5">
            <ol className="flex flex-wrap items-center gap-1.5 text-sm text-white/70">
              {trail.map((item, i) => (
                <li key={item.path} className="flex items-center gap-1.5">
                  {i > 0 ? <ChevronRight className="size-3.5" aria-hidden /> : null}
                  {i === trail.length - 1 ? (
                    <span aria-current="page" className="font-medium text-gold-400">
                      {item.name}
                    </span>
                  ) : (
                    <Link href={item.path} className="transition-colors hover:text-white">
                      {item.name}
                    </Link>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        </FadeIn>
        <TextReveal as="h1" immediate text={title} className="max-w-4xl text-4xl leading-tight font-bold text-white sm:text-5xl lg:text-6xl" />
        {description ? (
          <FadeIn delay={0.3}>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/80 sm:text-lg">{description}</p>
          </FadeIn>
        ) : null}
        {children ? <FadeIn delay={0.45} className="mt-8">{children}</FadeIn> : null}
      </div>
    </section>
  );
}
