import { z } from "zod";
import { APPLICATION_STATUSES, LEVELS_REQUIRING_SSC, PROGRAM_LEVELS } from "@/lib/constants";
import { cnic, emailAddress, objectId, personName, pkMobile, plainText, requiredAssetUrl, assetUrl } from "./fields";

export const BOARDS = [
  "BISE Bannu",
  "BISE Kohat",
  "BISE Peshawar",
  "BISE Mardan",
  "BISE D.I. Khan",
  "BISE Abbottabad",
  "BISE Swat",
  "BISE Malakand",
  "Federal Board (FBISE)",
  "Other",
] as const;

export const LAST_CLASSES = [
  "New admission (no previous class)",
  "Nursery / Prep",
  "Class 1",
  "Class 2",
  "Class 3",
  "Class 4",
  "Class 5",
  "Class 6",
  "Class 7",
  "Class 8",
  "Class 9",
  "Class 10 (Matric)",
] as const;

export const GRADES = ["A+", "A", "B", "C", "D", "E"] as const;

const currentYear = new Date().getFullYear();

const dateOfBirth = z
  .string({ error: "Date of birth is required" })
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Enter a valid date")
  .refine((v) => !Number.isNaN(Date.parse(v)), "Enter a valid date")
  .refine((v) => {
    const age = (Date.now() - Date.parse(v)) / (365.25 * 24 * 3600 * 1000);
    return age >= 4 && age <= 30;
  }, "Student's age must be between 4 and 30 years");

export const personalStepSchema = z.object({
  fullName: personName("Student's full name"),
  fatherName: personName("Father's name"),
  cnic: cnic("Student's B-Form / CNIC number"),
  dateOfBirth,
  gender: z.enum(["male", "female"], { error: "Select gender" }),
  phone: pkMobile("Parent / guardian mobile"),
  email: emailAddress(),
  address: plainText("Home address", 10, 250),
});

const optionalNumber = z.preprocess(
  (v) => (v === "" || v === null || v === undefined ? undefined : v),
  z.coerce.number({ error: "Must be a number" }).int("Must be a whole number").optional(),
);

/**
 * Academic details. SSC (Matric) result fields are required only for
 * programs at intermediate/preparatory level; school classes need just the
 * previous school and last class passed.
 */
export const academicStepSchema = z
  .object({
    program: objectId("Program"),
    programLevel: z.enum(PROGRAM_LEVELS),
    lastClass: z.enum(LAST_CLASSES, { error: "Select the last class passed" }),
    previousSchool: z.string().trim().max(120, "School name is too long").default(""),
    board: z.union([z.literal(""), z.enum(BOARDS)]).default(""),
    passingYear: optionalNumber,
    previousGrade: z.union([z.literal(""), z.enum(GRADES)]).default(""),
    marksObtained: optionalNumber,
    totalMarks: optionalNumber,
  })
  .superRefine((d, ctx) => {
    const issue = (path: string, message: string) => ctx.addIssue({ code: "custom", path: [path], message });
    const isNew = d.lastClass === LAST_CLASSES[0];

    if (!isNew) {
      if (d.previousSchool.length < 3) issue("previousSchool", "Enter the previous school name");
      else if (!/\p{L}/u.test(d.previousSchool)) issue("previousSchool", "School name must contain words");
    }

    if ((LEVELS_REQUIRING_SSC as readonly string[]).includes(d.programLevel)) {
      if (d.lastClass !== "Class 10 (Matric)") issue("lastClass", "FSc / ICS requires Matric (Class 10) to be passed");
      if (!d.board) issue("board", "Select your board");
      if (!d.previousGrade) issue("previousGrade", "Select your grade");
      if (d.passingYear === undefined) issue("passingYear", "Passing year is required");
      else if (d.passingYear < currentYear - 5 || d.passingYear > currentYear)
        issue("passingYear", `Passing year must be between ${currentYear - 5} and ${currentYear}`);
      if (d.totalMarks === undefined) issue("totalMarks", "Total marks are required");
      else if (d.totalMarks < 100 || d.totalMarks > 1500) issue("totalMarks", "Total marks look invalid");
      if (d.marksObtained === undefined) issue("marksObtained", "Obtained marks are required");
      else if (d.marksObtained < 0) issue("marksObtained", "Marks cannot be negative");
      else if (d.totalMarks !== undefined && d.marksObtained > d.totalMarks)
        issue("marksObtained", "Obtained marks cannot exceed total marks");
    } else if (d.marksObtained !== undefined && d.totalMarks !== undefined && d.marksObtained > d.totalMarks) {
      issue("marksObtained", "Obtained marks cannot exceed total marks");
    }
  });

export const documentsStepSchema = z.object({
  cnicDoc: requiredAssetUrl("B-Form / CNIC copy"),
  marksheet: assetUrl(),
  photo: requiredAssetUrl("Passport-size photo"),
  declaration: z.literal(true, { error: "You must confirm the declaration" }),
});

export const applicationSchema = z
  .object({
    personal: personalStepSchema,
    academic: academicStepSchema,
    documents: documentsStepSchema,
  })
  .superRefine((d, ctx) => {
    if (d.academic.lastClass !== LAST_CLASSES[0] && !d.documents.marksheet) {
      ctx.addIssue({ code: "custom", path: ["documents", "marksheet"], message: "Upload the last result card / marksheet" });
    }
  });

export type ApplicationInput = z.input<typeof applicationSchema>;
export type ApplicationData = z.output<typeof applicationSchema>;

export const applicationStatusSchema = z.object({
  id: objectId("Application"),
  status: z.enum(APPLICATION_STATUSES),
  reviewNote: z.string().trim().max(1000, "Note must be at most 1000 characters").default(""),
  notify: z.boolean().default(true),
});
export type ApplicationStatusInput = z.input<typeof applicationStatusSchema>;
