import { SITE } from "@/lib/constants";

/** Escapes user-supplied text before inserting it into email HTML. */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Converts plain text with newlines into escaped HTML paragraphs. */
export function textToHtml(value: string): string {
  return escapeHtml(value).replace(/\n/g, "<br />");
}

/**
 * Wraps email body HTML in the branded, table-based layout used by every
 * outgoing message (inline styles for email-client compatibility).
 * @param title - Heading shown at the top of the card.
 * @param body - Inner HTML (already escaped where needed).
 */
export function emailLayout(title: string, body: string): string {
  const year = new Date().getFullYear();
  return `<!doctype html>
<html lang="en">
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width,initial-scale=1" /><title>${escapeHtml(title)}</title></head>
<body style="margin:0;padding:0;background:#f1f4fb;font-family:Segoe UI,Arial,sans-serif;color:#1f2937;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1f4fb;padding:24px 12px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:12px;overflow:hidden;">
        <tr><td style="background:#1e2a78;padding:20px 28px;">
          <span style="color:#ffffff;font-size:20px;font-weight:700;">${escapeHtml(SITE.name)}</span><br />
          <span style="color:#f5c84c;font-size:13px;">Serai Naurang, District Lakki Marwat</span>
        </td></tr>
        <tr><td style="padding:28px;">
          <h1 style="margin:0 0 16px;font-size:20px;color:#1e2a78;">${escapeHtml(title)}</h1>
          ${body}
        </td></tr>
        <tr><td style="background:#f8fafc;padding:16px 28px;font-size:12px;color:#6b7280;">
          © ${year} ${escapeHtml(SITE.name)}. ${escapeHtml(SITE.affiliation)}.<br />
          This is an automated message. Please do not share verification codes with anyone.
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

/** Renders a bold call-to-action button. */
export function emailButton(label: string, href: string): string {
  return `<p style="margin:24px 0;"><a href="${escapeHtml(href)}" style="background:#1e2a78;color:#ffffff;text-decoration:none;padding:12px 22px;border-radius:8px;font-weight:600;display:inline-block;">${escapeHtml(label)}</a></p>`;
}

/** Renders a two-column details table from label/value pairs. */
export function detailsTable(rows: [string, string][]): string {
  const tr = rows
    .map(
      ([k, v]) =>
        `<tr><td style="padding:8px 12px;background:#f8fafc;font-weight:600;width:38%;border-bottom:1px solid #e5e7eb;">${escapeHtml(k)}</td><td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;">${escapeHtml(v)}</td></tr>`,
    )
    .join("");
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:8px;border-collapse:separate;font-size:14px;">${tr}</table>`;
}
