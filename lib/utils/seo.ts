import type { Metadata } from "next";
import { SITE } from "@/lib/constants";

interface BuildMetadataInput {
  title?: string;
  description?: string;
  path?: string;
  image?: string;
  keywords?: string[];
  type?: "website" | "article";
  noIndex?: boolean;
}

/**
 * Returns the absolute URL for a site-relative path.
 * @param path - Path beginning with "/".
 */
export function absoluteUrl(path = "/"): string {
  return new URL(path, SITE.url).toString();
}

/**
 * Builds consistent page metadata (title, description, canonical, Open Graph, Twitter).
 * @param input - Page-specific overrides.
 */
export function buildMetadata({
  title,
  description = SITE.description,
  path = "/",
  image,
  keywords = [],
  type = "website",
  noIndex = false,
}: BuildMetadataInput = {}): Metadata {
  const fullTitle = title ? `${title} | ${SITE.name}` : `${SITE.name} | ${SITE.tagline}`;
  const url = absoluteUrl(path);
  const images = image ? [{ url: image, width: 1200, height: 630, alt: title ?? SITE.name }] : undefined;

  return {
    title: title ? { absolute: fullTitle } : { absolute: fullTitle },
    description,
    keywords: [...SITE.keywords, ...keywords],
    alternates: { canonical: url },
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: SITE.name,
      type,
      locale: "en_PK",
      ...(images ? { images } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      ...(image ? { images: [image] } : {}),
    },
    robots: noIndex ? { index: false, follow: false } : { index: true, follow: true },
  };
}
