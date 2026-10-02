"use server";

import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/db/connect";
import { Application, Program, nextSequence } from "@/lib/db/models";
import { applicationSchema, applicationStatusSchema } from "@/lib/validators/application.schema";
import { ADMIN_ROLES } from "@/lib/auth/config";
import { requireStaff, requireStudent, toErrorMessage } from "@/lib/auth/guards";
import { emailDomainAcceptsMail } from "@/lib/email/verify-domain";
import { adminInbox, sendEmail } from "@/lib/email/send";
import { applicationAdminEmail, applicationReceivedEmail, applicationStatusEmail } from "@/lib/email/templates";
import { getSiteSettings } from "@/lib/data/settings";
import { fail, ok, validationError } from "@/lib/actions";
import { WING_LABELS } from "@/lib/constants";
import type { ActionResult, ApplicationStatus } from "@/types";

/**
 * Submits an admission application for the signed-in student-portal account.
 * The program level is re-read from the database so SSC requirements cannot
 * be bypassed by tampering with the client payload.
 */
export async function submitApplication(input: unknown): Promise<ActionResult<{ applicationNumber: string; id: string }>> {
  try {
    const session = await requireStudent();
    await connectDB();

    const settings = await getSiteSettings();
    if (!settings.admissionsOpen) return fail("Admissions are currently closed.");

    const raw = input as { academic?: { program?: string } } | null;
    const program = raw?.academic?.program
      ? await Program.findOne({ _id: raw.academic.program, published: true }).select("name level").lean()
      : null;
    if (!program) return { success: false, error: "Please select a valid program.", fieldErrors: { "academic.program": ["Select a program"] } };

    const parsed = applicationSchema.safeParse({
      ...(input as object),
      academic: { ...(raw?.academic ?? {}), programLevel: program.level },
    });
    if (!parsed.success) return validationError(parsed.error);
    const { personal, academic, documents } = parsed.data;

    if (!(await emailDomainAcceptsMail(personal.email))) {
      return { success: false, error: "This email domain cannot receive mail.", fieldErrors: { "personal.email": ["Enter a real, working email address"] } };
    }

    const duplicate = await Application.exists({
      "student.cnic": personal.cnic,
      program: program._id,
      status: { $in: ["pending", "under_review", "approved"] },
    });
    if (duplicate) return fail("An application for this student and program is already in process.");

    const year = new Date().getFullYear();
    const seq = await nextSequence(`application-${year}`);
    const applicationNumber = `ISC-${year}-${String(seq).padStart(4, "0")}`;
    const percentage =
      academic.marksObtained !== undefined && academic.totalMarks
        ? Math.round((academic.marksObtained / academic.totalMarks) * 10000) / 100
        : null;
    const wing = personal.gender === "female" ? "girls" : "boys";

    const doc = await Application.create({
      applicationNumber,
      student: { ...personal, dateOfBirth: new Date(personal.dateOfBirth) },
      academic: {
        lastClass: academic.lastClass,
        previousSchool: academic.previousSchool,
        board: academic.board,
        passingYear: academic.passingYear ?? null,
        previousGrade: academic.previousGrade,
        marksObtained: academic.marksObtained ?? null,
        totalMarks: academic.totalMarks ?? null,
        percentage,
      },
      wing,
      program: program._id,
      account: session.user.id,
      documents: { cnic: documents.cnicDoc, marksheet: documents.marksheet, photo: documents.photo },
    });

    const toStudent = applicationReceivedEmail(personal.fullName, applicationNumber, program.name);
    const toAdmin = applicationAdminEmail(applicationNumber, personal.fullName, program.name, percentage, WING_LABELS[wing]);
    await Promise.all([
      sendEmail({ to: personal.email, ...toStudent }),
      sendEmail({ to: adminInbox(settings.contact.email), ...toAdmin }),
    ]);

    revalidatePath("/portal");
    revalidatePath("/college/applications");
    return ok({ applicationNumber, id: String(doc._id) }, "Application submitted successfully.");
  } catch (error) {
    return fail(toErrorMessage(error));
  }
}

/** Updates an application's status (college staff) and optionally emails the applicant. */
export async function updateApplicationStatus(input: unknown): Promise<ActionResult<{ status: ApplicationStatus }>> {
  const parsed = applicationStatusSchema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error);
  try {
    const session = await requireStaff();
    await connectDB();
    const { id, status, reviewNote, notify } = parsed.data;

    const doc = await Application.findByIdAndUpdate(
      id,
      { $set: { status, reviewNote, reviewedBy: session.user.id, reviewedAt: new Date() } },
      { new: true },
    ).lean();
    if (!doc) return fail("Application not found.");

    if (notify) {
      const student = doc.student as NonNullable<typeof doc.student>;
      const mail = applicationStatusEmail(student.fullName, doc.applicationNumber, status, reviewNote);
      await sendEmail({ to: student.email, ...mail });
    }

    revalidatePath("/college/applications");
    revalidatePath(`/college/applications/${id}`);
    revalidatePath("/portal");
    return ok({ status }, notify ? "Status updated and applicant notified." : "Status updated.");
  } catch (error) {
    return fail(toErrorMessage(error));
  }
}

/** Permanently deletes an application (administrators only). */
export async function deleteApplication(id: string): Promise<ActionResult<null>> {
  if (!/^[a-f\d]{24}$/i.test(id)) return fail("Invalid application.");
  try {
    await requireStaff(ADMIN_ROLES);
    await connectDB();
    await Application.deleteOne({ _id: id });
    revalidatePath("/college/applications");
    return ok(null, "Application deleted.");
  } catch (error) {
    return fail(toErrorMessage(error));
  }
}
