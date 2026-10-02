"use server";

import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/db/connect";
import { Contact } from "@/lib/db/models";
import { contactSchema, replySchema } from "@/lib/validators/contact.schema";
import { requireStaff, toErrorMessage } from "@/lib/auth/guards";
import { emailDomainAcceptsMail } from "@/lib/email/verify-domain";
import { adminInbox, sendEmail } from "@/lib/email/send";
import { contactAdminEmail, contactConfirmationEmail, contactReplyEmail } from "@/lib/email/templates";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { getSiteSettings } from "@/lib/data/settings";
import { fail, ok, validationError } from "@/lib/actions";
import type { ActionResult } from "@/types";

/**
 * Stores a contact-form message and emails the office and the sender.
 * Bots are filtered by a honeypot field and per-IP rate limiting.
 */
export async function submitContact(input: unknown): Promise<ActionResult<null>> {
  const parsed = contactSchema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error);
  const data = parsed.data;
  if (data.website) return ok(null, "Thank you! Your message has been sent.");

  try {
    await connectDB();
    const ip = await getClientIp();
    const limit = await rateLimit(`contact:${ip}`, 5, 60 * 60);
    if (!limit.allowed) return fail("You have sent several messages recently. Please try again later or call us.");

    if (!(await emailDomainAcceptsMail(data.email))) {
      return { success: false, error: "This email domain cannot receive mail.", fieldErrors: { email: ["Enter a real, working email address"] } };
    }

    await Contact.create({ name: data.name, email: data.email, phone: data.phone, subject: data.subject, message: data.message });

    const settings = await getSiteSettings();
    await Promise.all([
      sendEmail({ to: adminInbox(settings.contact.email), replyTo: data.email, ...contactAdminEmail(data) }),
      sendEmail({ to: data.email, ...contactConfirmationEmail(data.name, data.subject, data.message) }),
    ]);

    revalidatePath("/college/messages");
    return ok(null, "Thank you! Your message has been sent. We will reply within 1–2 working days.");
  } catch (error) {
    return fail(toErrorMessage(error));
  }
}

/** Marks a message read/unread (college staff). */
export async function setMessageRead(id: string, isRead: boolean): Promise<ActionResult<null>> {
  if (!/^[a-f\d]{24}$/i.test(id)) return fail("Invalid message.");
  try {
    await requireStaff();
    await connectDB();
    await Contact.updateOne({ _id: id }, { $set: { isRead } });
    revalidatePath("/college/messages");
    return ok(null);
  } catch (error) {
    return fail(toErrorMessage(error));
  }
}

/** Emails a reply to the sender and records it on the message. */
export async function replyToMessage(input: unknown): Promise<ActionResult<null>> {
  const parsed = replySchema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error);
  try {
    await requireStaff();
    await connectDB();
    const msg = await Contact.findById(parsed.data.id);
    if (!msg) return fail("Message not found.");

    const sent = await sendEmail({ to: msg.email, ...contactReplyEmail(msg.name, msg.subject, parsed.data.reply) });
    if (!sent) return fail("The email could not be sent. Check the email settings and try again.");

    msg.isRead = true;
    msg.repliedAt = new Date();
    msg.replyNote = parsed.data.reply;
    await msg.save();
    revalidatePath("/college/messages");
    return ok(null, "Reply sent.");
  } catch (error) {
    return fail(toErrorMessage(error));
  }
}

/** Deletes a message (college staff). */
export async function deleteMessage(id: string): Promise<ActionResult<null>> {
  if (!/^[a-f\d]{24}$/i.test(id)) return fail("Invalid message.");
  try {
    await requireStaff();
    await connectDB();
    await Contact.deleteOne({ _id: id });
    revalidatePath("/college/messages");
    return ok(null, "Message deleted.");
  } catch (error) {
    return fail(toErrorMessage(error));
  }
}
