import { z } from "zod";
import { DEPARTMENTS, GALLERY_CATEGORIES, PROGRAM_LEVELS, WINGS } from "@/lib/constants";
import {
  assetUrl,
  emailAddress,
  intField,
  objectId,
  optionalUrl,
  personName,
  plainText,
  requiredAssetUrl,
  stringList,
} from "./fields";

export const programSchema = z.object({
  name: plainText("Program name", 3, 120),
  level: z.enum(PROGRAM_LEVELS, { error: "Select a level" }),
  duration: plainText("Duration", 3, 40),
  shortDescription: plainText("Short description", 20, 220),
  description: plainText("Description", 50, 4000),
  curriculum: z
    .array(
      z.object({
        semester: intField("Term", 1, 12),
        title: z.string().trim().max(60).default(""),
        subjects: stringList(15, 80),
      }),
    )
    .max(12),
  fees: z.object({
    admission: intField("Admission fee", 0, 1_000_000),
    monthly: intField("Monthly fee", 0, 1_000_000),
    total: intField("Total fee", 0, 10_000_000),
  }),
  requirements: stringList(15, 200),
  careers: stringList(15, 80),
  seats: intField("Seats", 0, 2000),
  wings: z.enum(WINGS, { error: "Select wings" }),
  faculty: z.array(objectId("Faculty")).max(30).default([]),
  image: assetUrl(),
  icon: z.enum(["Stethoscope", "Cpu", "Calculator", "FlaskConical", "Atom", "GraduationCap", "BookOpen", "School", "Pencil"]),
  order: intField("Display order", 0, 999),
  published: z.boolean().default(true),
});
export type ProgramInput = z.input<typeof programSchema>;
export type ProgramData = z.output<typeof programSchema>;

export const facultySchema = z.object({
  name: personName("Name"),
  designation: plainText("Designation", 3, 80),
  department: z.enum(DEPARTMENTS, { error: "Select a department" }),
  wing: z.enum(WINGS, { error: "Select a wing" }),
  qualification: plainText("Qualification", 2, 120),
  experience: z.string().trim().max(60).default(""),
  bio: z.string().trim().max(1500, "Bio must be at most 1500 characters").default(""),
  photo: assetUrl(),
  email: z.union([z.literal(""), emailAddress()]).default(""),
  social: z.object({
    linkedin: optionalUrl("LinkedIn"),
    twitter: optionalUrl("Twitter"),
    facebook: optionalUrl("Facebook"),
  }),
  order: intField("Display order", 0, 999),
  isActive: z.boolean().default(true),
});
export type FacultyInput = z.input<typeof facultySchema>;
export type FacultyData = z.output<typeof facultySchema>;

export const galleryAlbumSchema = z.object({
  albumName: plainText("Album name", 3, 120),
  description: z.string().trim().max(500).default(""),
  category: z.enum(GALLERY_CATEGORIES, { error: "Select a category" }),
  coverImage: assetUrl(),
  images: z
    .array(
      z.object({
        url: requiredAssetUrl("Image"),
        caption: z.string().trim().max(160).default(""),
      }),
    )
    .max(200),
  published: z.boolean().default(true),
});
export type GalleryAlbumInput = z.input<typeof galleryAlbumSchema>;
export type GalleryAlbumData = z.output<typeof galleryAlbumSchema>;
