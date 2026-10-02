import { z } from "zod";
import { assetUrl, emailAddress, optionalUrl, pkMobile, plainText, stringList } from "./fields";

const landlineOrMobile = z
  .string()
  .trim()
  .refine((v) => /^\+?[\d\s-]{10,16}$/.test(v), "Enter a valid phone number");

export const settingsSchema = z.object({
  siteName: plainText("Site name", 3, 80),
  tagline: plainText("Tagline", 3, 120),
  logo: assetUrl(),
  contact: z.object({
    phone: z.union([pkMobile(), landlineOrMobile]),
    email: emailAddress(),
    address: plainText("Address", 10, 250),
    officeHours: plainText("Office hours", 5, 120),
    mapEmbedUrl: optionalUrl("Map embed URL").refine(
      (v) => v === "" || v.startsWith("https://www.google.com/maps"),
      "Paste a Google Maps embed link",
    ),
  }),
  social: z.object({
    facebook: optionalUrl("Facebook"),
    instagram: optionalUrl("Instagram"),
    youtube: optionalUrl("YouTube"),
    twitter: optionalUrl("Twitter"),
    linkedin: optionalUrl("LinkedIn"),
  }),
  seo: z.object({
    metaTitle: z.string().trim().max(70, "Meta title should be at most 70 characters").default(""),
    metaDescription: z.string().trim().max(170, "Meta description should be at most 170 characters").default(""),
    keywords: stringList(25, 50),
  }),
  admissionsOpen: z.boolean(),
  announcement: z.string().trim().max(200, "Announcement must be at most 200 characters").default(""),
});
export type SettingsInput = z.input<typeof settingsSchema>;
export type SettingsData = z.output<typeof settingsSchema>;
