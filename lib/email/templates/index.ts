import { APPLICATION_STATUS_LABELS, SITE } from "@/lib/constants";
import { absoluteUrl } from "@/lib/utils/seo";
import { detailsTable, emailButton, emailLayout, escapeHtml, textToHtml } from "./layout";
import type { ApplicationStatus } from "@/types";

interface Rendered {
  subject: string;
  html: string;
}

/** One-time code email for verifying a new student account or resetting a password. */
export function verificationCodeEmail(name: string, code: string, purpose: "verify-email" | "reset-password"): Rendered {
  const isVerify = purpose === "verify-email";
  const title = isVerify ? "Verify your email address" : "Reset your password";
  return {
    subject: `${code} is your ${SITE.shortName} ${isVerify ? "verification" : "password reset"} code`,
    html: emailLayout(
      title,
      `<p>Assalam-o-Alaikum ${escapeHtml(name)},</p>
       <p>${isVerify ? "Use this code to verify your email and activate your student portal account:" : "Use this code to reset your password:"}</p>
       <p style="font-size:32px;letter-spacing:8px;font-weight:700;color:#1e2a78;margin:20px 0;">${escapeHtml(code)}</p>
       <p>The code expires in <strong>15 minutes</strong>. If you did not request this, you can safely ignore this email.</p>`,
    ),
  };
}

/** Confirmation sent to someone who submitted the contact form. */
export function contactConfirmationEmail(name: string, subject: string, message: string): Rendered {
  return {
    subject: "We received your message",
    html: emailLayout(
      "Thank you for contacting us",
      `<p>Dear ${escapeHtml(name)},</p>
       <p>We have received your message regarding <strong>${escapeHtml(subject)}</strong>. Our office will reply within 1–2 working days.</p>
       <p style="background:#f8fafc;border-left:4px solid #f5c84c;padding:12px 16px;color:#374151;">${textToHtml(message)}</p>
       <p>Regards,<br />Admissions & Information Office<br />${escapeHtml(SITE.name)}</p>`,
    ),
  };
}

/** Staff notification for a new contact message. */
export function contactAdminEmail(data: { name: string; email: string; phone: string; subject: string; message: string }): Rendered {
  return {
    subject: `New Contact Message: ${data.subject}`,
    html: emailLayout(
      "New contact message",
      `${detailsTable([
        ["Name", data.name],
        ["Email", data.email],
        ["Phone", data.phone || "—"],
        ["Subject", data.subject],
      ])}
       <p style="margin-top:16px;">${textToHtml(data.message)}</p>
       ${emailButton("Open in College Dashboard", absoluteUrl("/college/messages"))}`,
    ),
  };
}

/** Reply from staff to a contact message. */
export function contactReplyEmail(name: string, originalSubject: string, reply: string): Rendered {
  return {
    subject: `Re: ${originalSubject}`,
    html: emailLayout(
      `Re: ${originalSubject}`,
      `<p>Dear ${escapeHtml(name)},</p><p>${textToHtml(reply)}</p><p>Regards,<br />${escapeHtml(SITE.name)}</p>`,
    ),
  };
}

/** Confirmation to the student after submitting an admission application. */
export function applicationReceivedEmail(name: string, applicationNumber: string, programName: string): Rendered {
  return {
    subject: `Application Received — ${applicationNumber}`,
    html: emailLayout(
      "Application received",
      `<p>Dear ${escapeHtml(name)},</p>
       <p>Thank you for applying to <strong>${escapeHtml(programName)}</strong> at ${escapeHtml(SITE.name)}.</p>
       ${detailsTable([
         ["Application No.", applicationNumber],
         ["Program", programName],
         ["Status", "Pending review"],
       ])}
       <p style="margin-top:16px;">Our admissions committee reviews applications within 3–5 working days. You can track your status anytime from your student portal.</p>
       ${emailButton("Track Application", absoluteUrl("/portal"))}`,
    ),
  };
}

/** Staff notification for a new admission application. */
export function applicationAdminEmail(
  applicationNumber: string,
  name: string,
  programName: string,
  percentage: number | null,
  wing: string,
): Rendered {
  return {
    subject: `New Application: #${applicationNumber}`,
    html: emailLayout(
      "New admission application",
      `${detailsTable([
        ["Application No.", applicationNumber],
        ["Applicant", name],
        ["Program", programName],
        ["Wing", wing],
        ["Previous result", percentage === null ? "—" : `${percentage.toFixed(2)}%`],
      ])}
       ${emailButton("Review Application", absoluteUrl("/college/applications"))}`,
    ),
  };
}

/** Status update sent to the applicant when staff change the application status. */
export function applicationStatusEmail(
  name: string,
  applicationNumber: string,
  status: ApplicationStatus,
  note: string,
): Rendered {
  const messages: Record<ApplicationStatus, string> = {
    pending: "Your application is pending review.",
    under_review: "Your application is now being reviewed by the admissions committee.",
    approved: "Congratulations! Your application has been approved. Please visit the college office with original documents to complete enrollment.",
    rejected: "We regret to inform you that your application could not be accepted this time.",
    enrolled: "Welcome to Ideal Science College! Your enrollment is complete.",
  };
  return {
    subject: `Application Update — ${applicationNumber}`,
    html: emailLayout(
      "Application update",
      `<p>Dear ${escapeHtml(name)},</p>
       <p>${messages[status]}</p>
       ${detailsTable([
         ["Application No.", applicationNumber],
         ["Status", APPLICATION_STATUS_LABELS[status]],
       ])}
       ${note ? `<p style="margin-top:16px;"><strong>Note from admissions:</strong><br />${textToHtml(note)}</p>` : ""}
       ${emailButton("View in Student Portal", absoluteUrl("/portal"))}`,
    ),
  };
}

/** Confirmation to a job applicant. */
export function jobApplicationReceivedEmail(name: string, jobTitle: string): Rendered {
  return {
    subject: `Application received — ${jobTitle}`,
    html: emailLayout(
      "Thank you for applying",
      `<p>Dear ${escapeHtml(name)},</p>
       <p>We have received your application for <strong>${escapeHtml(jobTitle)}</strong>. Shortlisted candidates will be contacted by phone or email for a demo lecture and interview.</p>
       <p>Regards,<br />Human Resources<br />${escapeHtml(SITE.name)}</p>`,
    ),
  };
}

/** Staff notification for a new job application. */
export function jobApplicationAdminEmail(name: string, jobTitle: string, email: string, phone: string): Rendered {
  return {
    subject: `New Job Application: ${jobTitle}`,
    html: emailLayout(
      "New job application",
      `${detailsTable([
        ["Position", jobTitle],
        ["Applicant", name],
        ["Email", email],
        ["Phone", phone],
      ])}
       ${emailButton("Open Careers Dashboard", absoluteUrl("/college/careers"))}`,
    ),
  };
}

/** Welcome email for a staff account created by an administrator. */
export function staffWelcomeEmail(name: string, email: string, role: string): Rendered {
  return {
    subject: `Your ${SITE.shortName} staff account`,
    html: emailLayout(
      "Your staff account is ready",
      `<p>Dear ${escapeHtml(name)},</p>
       <p>An administrator has created a <strong>${escapeHtml(role)}</strong> account for you (${escapeHtml(email)}). Your password will be shared with you in person. Please change it after your first sign-in.</p>
       ${emailButton("Sign in", absoluteUrl("/login"))}`,
    ),
  };
}
