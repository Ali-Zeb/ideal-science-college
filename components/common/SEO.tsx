import { CONTACT_DEFAULTS, SITE } from "@/lib/constants";
import { absoluteUrl } from "@/lib/utils/seo";
import type { SiteSettings } from "@/types";

/**
 * Renders a JSON-LD `<script>` for structured data. Content is serialized
 * with `<` escaped so user text cannot break out of the script tag.
 */
export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}

/** schema.org CollegeOrUniversity description of the institution. */
export function collegeJsonLd(settings?: SiteSettings): Record<string, unknown> {
  const social = settings ? Object.values(settings.social).filter(Boolean) : [];
  return {
    "@context": "https://schema.org",
    "@type": "CollegeOrUniversity",
    "@id": `${SITE.url}#organization`,
    name: SITE.name,
    alternateName: "Ideal Science College Serai Naurang",
    url: SITE.url,
    logo: absoluteUrl(SITE.logo),
    image: absoluteUrl("/images/campus-building.jpg"),
    description: SITE.description,
    foundingDate: String(SITE.established),
    parentOrganization: { "@type": "Organization", name: "Chokara Science Group of Colleges" },
    address: {
      "@type": "PostalAddress",
      streetAddress: settings?.contact.address ?? CONTACT_DEFAULTS.address,
      addressLocality: CONTACT_DEFAULTS.city,
      addressRegion: CONTACT_DEFAULTS.region,
      addressCountry: "PK",
    },
    telephone: settings?.contact.phone ?? CONTACT_DEFAULTS.phone,
    email: settings?.contact.email ?? CONTACT_DEFAULTS.email,
    sameAs: social,
  };
}

/** schema.org BreadcrumbList for a page trail. */
export function breadcrumbJsonLd(items: { name: string; path: string }[]): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}
