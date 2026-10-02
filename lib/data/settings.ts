import "server-only";
import { cache } from "react";
import { Settings } from "@/lib/db/models";
import { CONTACT_DEFAULTS, SITE, SOCIAL_DEFAULTS } from "@/lib/constants";
import { safeQuery } from "./safe";
import type { SiteSettings } from "@/types";

export const DEFAULT_SETTINGS: SiteSettings = {
  siteName: SITE.name,
  tagline: SITE.tagline,
  logo: SITE.logo,
  contact: {
    phone: CONTACT_DEFAULTS.phone,
    email: CONTACT_DEFAULTS.email,
    address: CONTACT_DEFAULTS.address,
    officeHours: CONTACT_DEFAULTS.officeHours,
    mapEmbedUrl: CONTACT_DEFAULTS.mapEmbedUrl,
  },
  social: { ...SOCIAL_DEFAULTS },
  seo: { metaTitle: "", metaDescription: SITE.description, keywords: [] },
  admissionsOpen: true,
  announcement: "Admissions open for FSc Part-I session 2026–27. Apply online today.",
};

const pick = (value: string | undefined | null, fallback: string) => (value && value.trim() ? value : fallback);

/**
 * Returns admin-editable site settings merged over built-in defaults.
 * Cached per request.
 */
export const getSiteSettings = cache(async (): Promise<SiteSettings> => {
  return safeQuery("settings", DEFAULT_SETTINGS, async () => {
    const doc = await Settings.findOne({ key: "site" }).lean();
    if (!doc) return DEFAULT_SETTINGS;
    const d = DEFAULT_SETTINGS;
    return {
      siteName: pick(doc.siteName, d.siteName),
      tagline: pick(doc.tagline, d.tagline),
      logo: pick(doc.logo, d.logo),
      contact: {
        phone: pick(doc.contact?.phone, d.contact.phone),
        email: pick(doc.contact?.email, d.contact.email),
        address: pick(doc.contact?.address, d.contact.address),
        officeHours: pick(doc.contact?.officeHours, d.contact.officeHours),
        mapEmbedUrl: pick(doc.contact?.mapEmbedUrl, d.contact.mapEmbedUrl),
      },
      social: {
        facebook: doc.social?.facebook ?? d.social.facebook,
        instagram: doc.social?.instagram ?? d.social.instagram,
        youtube: doc.social?.youtube ?? d.social.youtube,
        twitter: doc.social?.twitter ?? d.social.twitter,
        linkedin: doc.social?.linkedin ?? d.social.linkedin,
      },
      seo: {
        metaTitle: doc.seo?.metaTitle ?? "",
        metaDescription: pick(doc.seo?.metaDescription, d.seo.metaDescription),
        keywords: doc.seo?.keywords ?? [],
      },
      admissionsOpen: doc.admissionsOpen ?? true,
      announcement: doc.announcement ?? "",
    };
  });
});
