import { z } from "zod";
import { DEPARTMENTS } from "@/lib/constants";
import { emailAddress, objectId, personName, pkMobile, plainText, requiredAssetUrl, stringList } from "./fields";

export const jobSchema = z.object({
  title: plainText("Job title", 3, 120),
  department: z.enum([...DEPARTMENTS, "Administration"] as const, { error: "Select a department" }),
  type: z.enum(["full-time", "part-time", "visiting"]),
  location: plainText("Location", 3, 120),
  description: plainText("Description", 30, 3000),
  requirements: stringList(15, 200),
  responsibilities: stringList(15, 200),
  salaryRange: z.string().trim().max(60).default(""),
  deadline: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Enter a valid deadline"),
  published: z.boolean().default(true),
});
export type JobInput = z.input<typeof jobSchema>;
export type JobData = z.output<typeof jobSchema>;

export const jobApplicationSchema = z.object({
  jobId: objectId("Job"),
  fullName: personName("Full name"),
  email: emailAddress(),
  phone: pkMobile(),
  qualification: plainText("Qualification", 2, 120),
  experience: plainText("Experience", 2, 120),
  coverLetter: z.string().trim().max(3000, "Cover letter must be at most 3000 characters").default(""),
  resume: requiredAssetUrl("CV / Resume"),
  website: z.string().max(0).optional().default(""),
});
export type JobApplicationInput = z.input<typeof jobApplicationSchema>;
export type JobApplicationData = z.output<typeof jobApplicationSchema>;
