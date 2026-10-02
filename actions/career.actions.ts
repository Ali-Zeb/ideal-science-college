"use server";

import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/db/connect";
import { Job, JobApplication, JOB_APPLICATION_STATUSES } from "@/lib/db/models";
import { jobApplicationSchema, jobSchema } from "@/lib/validators/career.schema";
import { requireStaff, toErrorMessage } from "@/lib/auth/guards";
import { emailDomainAcceptsMail } from "@/lib/email/verify-domain";
import { adminInbox, sendEmail } from "@/lib/email/send";
import { jobApplicationAdminEmail, jobApplicationReceivedEmail } from "@/lib/email/templates";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { getSiteSettings } from "@/lib/data/settings";
import { slugify } from "@/lib/utils/slugify";
import { uniqueSlug } from "@/lib/data/slug";
import { fail, ok, validationError } from "@/lib/actions";
import type { ActionResult } from "@/types";

const isId = (id: string) => /^[a-f\d]{24}$/i.test(id);

function refresh() {
  revalidatePath("/careers", "layout");
  revalidatePath("/college/careers");
}

/** Public: applies for an open position with a CV upload. */
export async function submitJobApplication(input: unknown): Promise<ActionResult<null>> {
  const parsed = jobApplicationSchema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error);
  const data = parsed.data;
  if (data.website) return ok(null, "Application received.");

  try {
    await connectDB();
    const ip = await getClientIp();
    const limit = await rateLimit(`job-apply:${ip}`, 5, 60 * 60);
    if (!limit.allowed) return fail("Too many applications from your network. Please try again later.");

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const job = await Job.findOne({ _id: data.jobId, published: true, deadline: { $gte: startOfToday } }).lean();
    if (!job) return fail("This position is no longer accepting applications.");

    if (!(await emailDomainAcceptsMail(data.email))) {
      return { success: false, error: "This email domain cannot receive mail.", fieldErrors: { email: ["Enter a real, working email address"] } };
    }
    if (await JobApplication.exists({ job: job._id, email: data.email })) {
      return fail("You have already applied for this position.");
    }

    await JobApplication.create({
      job: job._id,
      fullName: data.fullName,
      email: data.email,
      phone: data.phone,
      qualification: data.qualification,
      experience: data.experience,
      coverLetter: data.coverLetter,
      resume: data.resume,
    });

    const settings = await getSiteSettings();
    await Promise.all([
      sendEmail({ to: data.email, ...jobApplicationReceivedEmail(data.fullName, job.title) }),
      sendEmail({ to: adminInbox(settings.contact.email), replyTo: data.email, ...jobApplicationAdminEmail(data.fullName, job.title, data.email, data.phone) }),
    ]);
    revalidatePath("/college/careers");
    return ok(null, "Your application has been submitted. Shortlisted candidates will be contacted.");
  } catch (error) {
    return fail(toErrorMessage(error));
  }
}

/** Creates or updates a job opening (college staff). */
export async function saveJob(id: string | null, input: unknown): Promise<ActionResult<{ id: string }>> {
  const parsed = jobSchema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error);
  try {
    await requireStaff();
    await connectDB();
    const data = { ...parsed.data, deadline: new Date(`${parsed.data.deadline}T23:59:59+05:00`) };
    if (id) {
      if (!isId(id)) return fail("Invalid job.");
      const doc = await Job.findByIdAndUpdate(id, { $set: data }, { new: true });
      if (!doc) return fail("Job not found.");
      refresh();
      return ok({ id }, "Job updated.");
    }
    const slug = await uniqueSlug(Job, slugify(parsed.data.title));
    const doc = await Job.create({ ...data, slug });
    refresh();
    return ok({ id: String(doc._id) }, "Job published.");
  } catch (error) {
    return fail(toErrorMessage(error));
  }
}

/** Deletes a job opening and its applications (college staff). */
export async function deleteJob(id: string): Promise<ActionResult<null>> {
  if (!isId(id)) return fail("Invalid job.");
  try {
    await requireStaff();
    await connectDB();
    await Promise.all([Job.deleteOne({ _id: id }), JobApplication.deleteMany({ job: id })]);
    refresh();
    return ok(null, "Job deleted.");
  } catch (error) {
    return fail(toErrorMessage(error));
  }
}

/** Updates a job applicant's status (college staff). */
export async function setJobApplicationStatus(id: string, status: string): Promise<ActionResult<null>> {
  if (!isId(id) || !(JOB_APPLICATION_STATUSES as readonly string[]).includes(status)) return fail("Invalid request.");
  try {
    await requireStaff();
    await connectDB();
    await JobApplication.updateOne({ _id: id }, { $set: { status } });
    revalidatePath("/college/careers");
    return ok(null, "Status updated.");
  } catch (error) {
    return fail(toErrorMessage(error));
  }
}
