import { z } from "zod";
import { EVENT_CATEGORIES, NEWS_CATEGORIES } from "@/lib/constants";
import { assetUrl, plainText, stringList } from "./fields";

export const newsSchema = z.object({
  title: plainText("Title", 8, 160),
  excerpt: plainText("Summary", 30, 300),
  content: z
    .string()
    .trim()
    .refine((html) => html.replace(/<[^>]*>/g, "").trim().length >= 50, "Content must be at least 50 characters"),
  featuredImage: assetUrl(),
  category: z.enum(NEWS_CATEGORIES, { error: "Select a category" }),
  tags: stringList(10, 30),
  published: z.boolean().default(false),
});
export type NewsInput = z.input<typeof newsSchema>;
export type NewsData = z.output<typeof newsSchema>;

const dateTimeLocal = (label: string) =>
  z.string({ error: `${label} is required` }).regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, `${label} is invalid`);

export const eventSchema = z
  .object({
    title: plainText("Title", 5, 160),
    description: plainText("Description", 30, 3000),
    featuredImage: assetUrl(),
    startDate: dateTimeLocal("Start date"),
    endDate: dateTimeLocal("End date"),
    location: plainText("Location", 3, 160),
    category: z.enum(EVENT_CATEGORIES, { error: "Select a category" }),
    published: z.boolean().default(true),
  })
  .refine((d) => d.endDate >= d.startDate, { path: ["endDate"], message: "End must be after start" });
export type EventInput = z.input<typeof eventSchema>;
export type EventData = z.output<typeof eventSchema>;
