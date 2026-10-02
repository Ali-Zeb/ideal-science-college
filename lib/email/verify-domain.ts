import "server-only";
import { promises as dns } from "node:dns";

/**
 * Checks that an email's domain can actually receive mail (has MX records,
 * or at least an A record as RFC 5321 fallback). Rejects made-up domains like
 * `abc@nodomain123.xyz`. DNS outages fail open so real users are never blocked.
 * @param email - Address to check.
 */
export async function emailDomainAcceptsMail(email: string): Promise<boolean> {
  const domain = email.split("@")[1]?.toLowerCase();
  if (!domain) return false;
  try {
    const mx = await dns.resolveMx(domain);
    if (mx.some((r) => r.exchange && r.exchange !== ".")) return true;
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code !== "ENOTFOUND" && code !== "ENODATA") return true;
  }
  try {
    const a = await dns.resolve4(domain);
    return a.length > 0;
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    return code !== "ENOTFOUND" && code !== "ENODATA";
  }
}
