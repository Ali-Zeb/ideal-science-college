import { z } from "zod";
import { emailAddress, optionalPkMobile, personName, plainText } from "./fields";

export const CONTACT_SUBJECTS = [
  "Admissions",
  "Fee & Scholarships",
  "Examinations & Results",
  "Careers",
  "General Inquiry",
] as const;

export const contactSchema = z.object({
  name: personName("Name"),
  email: emailAddress(),
  phone: optionalPkMobile(),
  subject: z.enum(CONTACT_SUBJECTS, { error: "Please choose a subject" }),
  message: plainText("Message", 20, 2000),
  /** Honeypot field — must stay empty (bots fill it). */
  website: z.string().max(0).optional().default(""),
});

export type ContactInput = z.input<typeof contactSchema>;
export type ContactData = z.output<typeof contactSchema>;

export const replySchema = z.object({
  id: z.string().regex(/^[a-f\d]{24}$/i),
  reply: plainText("Reply", 10, 5000),
});
export type ReplyInput = z.input<typeof replySchema>;
