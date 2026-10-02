import "server-only";

interface SendEmailInput {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
}

const BREVO_ENDPOINT = "https://api.brevo.com/v3/smtp/email";

/** True when the Brevo API key and sender address are configured. */
export function isEmailConfigured(): boolean {
  return Boolean(process.env.BREVO_API_KEY && process.env.EMAIL_FROM_ADDRESS);
}

/**
 * Sends a transactional email through Brevo's HTTP API.
 * Never throws: failures are logged and reported via the return value so a
 * failed notification never breaks the user's form submission.
 * @returns true if Brevo accepted the message.
 */
export async function sendEmail({ to, subject, html, replyTo }: SendEmailInput): Promise<boolean> {
  if (!isEmailConfigured()) {
    console.warn(`[email] Skipped "${subject}" — BREVO_API_KEY / EMAIL_FROM_ADDRESS not set.`);
    return false;
  }

  const recipients = (Array.isArray(to) ? to : [to]).filter(Boolean).map((email) => ({ email }));
  if (recipients.length === 0) return false;

  try {
    const res = await fetch(BREVO_ENDPOINT, {
      method: "POST",
      headers: {
        "api-key": process.env.BREVO_API_KEY as string,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        sender: {
          name: process.env.EMAIL_FROM_NAME ?? "Ideal Science College",
          email: process.env.EMAIL_FROM_ADDRESS,
        },
        to: recipients,
        subject,
        htmlContent: html,
        ...(replyTo ? { replyTo: { email: replyTo } } : {}),
      }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) {
      console.error(`[email] Brevo responded ${res.status}: ${await res.text()}`);
      return false;
    }
    return true;
  } catch (error) {
    console.error("[email] Failed to send", error);
    return false;
  }
}

/** Address that receives staff notifications (contact form, new applications). */
export function adminInbox(fallback: string): string {
  return process.env.ADMIN_NOTIFY_EMAIL || fallback;
}
