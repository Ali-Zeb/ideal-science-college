import { z } from "zod";

/**
 * Reusable, strict field validators shared by client forms and server actions.
 * Each field accepts only the kind of data it is meant for.
 */

const collapseSpaces = (v: string) => v.replace(/\s+/g, " ").trim();

/** Person names: letters (incl. accented), spaces, dots, apostrophes and hyphens only. */
export const personName = (label = "Name") =>
  z
    .string({ error: `${label} is required` })
    .transform(collapseSpaces)
    .pipe(
      z
        .string()
        .min(3, `${label} must be at least 3 characters`)
        .max(60, `${label} must be at most 60 characters`)
        .regex(/^[\p{L}][\p{L}\s.'-]*$/u, `${label} may contain letters, spaces, dots and hyphens only`)
        .refine((v) => (v.match(/\p{L}/gu)?.length ?? 0) >= 2, `${label} must contain real letters`)
        .refine((v) => !/(.)\1{3,}/u.test(v), `${label} looks invalid`),
    );

/** Common throwaway / disposable email domains that are never accepted. */
export const DISPOSABLE_DOMAINS = new Set([
  "mailinator.com",
  "guerrillamail.com",
  "10minutemail.com",
  "tempmail.com",
  "temp-mail.org",
  "yopmail.com",
  "trashmail.com",
  "getnada.com",
  "sharklasers.com",
  "dispostable.com",
  "maildrop.cc",
  "fakeinbox.com",
  "throwawaymail.com",
  "mintemail.com",
  "mohmal.com",
  "emailondeck.com",
  "tempail.com",
  "moakt.com",
  "example.com",
  "test.com",
]);

/** Email address: valid format, lowercase, and not from a disposable provider. */
export const emailAddress = () =>
  z
    .string({ error: "Email is required" })
    .trim()
    .toLowerCase()
    .max(120, "Email is too long")
    .pipe(z.email("Enter a valid email address"))
    .refine((v) => !DISPOSABLE_DOMAINS.has(v.split("@")[1] ?? ""), "Temporary or fake email addresses are not accepted");

/** Pakistani mobile number. Accepts 03XXXXXXXXX / +923XXXXXXXXX (spaces/dashes ignored); returns +923XXXXXXXXX. */
export const pkMobile = (label = "Phone number") =>
  z
    .string({ error: `${label} is required` })
    .transform((v) => v.replace(/[\s-]/g, ""))
    .pipe(
      z
        .string()
        .regex(/^(\+92|0092|92|0)3\d{9}$/, `Enter a valid Pakistani mobile number, e.g. 0308-5744005`),
    )
    .transform((v) => `+92${v.slice(-10)}`);

/** Optional Pakistani mobile (empty string allowed). */
export const optionalPkMobile = () =>
  z.union([z.literal(""), pkMobile()]).default("");

/** CNIC / B-Form number: 13 digits, stored as XXXXX-XXXXXXX-X. */
export const cnic = (label = "CNIC / B-Form number") =>
  z
    .string({ error: `${label} is required` })
    .transform((v) => v.replace(/[\s-]/g, ""))
    .pipe(z.string().regex(/^\d{13}$/, `${label} must be 13 digits (XXXXX-XXXXXXX-X)`))
    .refine((v) => !/^(\d)\1{12}$/.test(v), `${label} looks invalid`)
    .transform((v) => `${v.slice(0, 5)}-${v.slice(5, 12)}-${v.slice(12)}`);

/** Strong password: 8–64 chars with upper, lower, digit and symbol. */
export const strongPassword = () =>
  z
    .string({ error: "Password is required" })
    .min(8, "Password must be at least 8 characters")
    .max(64, "Password must be at most 64 characters")
    .regex(/[a-z]/, "Add at least one lowercase letter")
    .regex(/[A-Z]/, "Add at least one uppercase letter")
    .regex(/\d/, "Add at least one number")
    .regex(/[^A-Za-z0-9]/, "Add at least one symbol (e.g. @ # $ !)");

/** 6-digit one-time code. */
export const otpCode = () =>
  z.string({ error: "Code is required" }).trim().regex(/^\d{6}$/, "Enter the 6-digit code from your email");

/** Free text with sensible limits; rejects strings that are only symbols/digits. */
export const plainText = (label: string, min: number, max: number) =>
  z
    .string({ error: `${label} is required` })
    .trim()
    .min(min, `${label} must be at least ${min} characters`)
    .max(max, `${label} must be at most ${max} characters`)
    .refine((v) => /\p{L}/u.test(v), `${label} must contain words`);

/** Optional http(s) URL or empty string. */
export const optionalUrl = (label = "Link") =>
  z.union([z.literal(""), z.url({ protocol: /^https?$/, error: `${label} must be a valid http(s) URL` })]).default("");

/** Optional uploaded-file URL (Cloudinary or site-relative image path) or empty string. */
export const assetUrl = () =>
  z
    .string()
    .trim()
    .refine(
      (v) => v === "" || v.startsWith("/images/") || /^https:\/\/res\.cloudinary\.com\//.test(v),
      "File must be uploaded through the uploader",
    )
    .default("");

/** Required uploaded-file URL. */
export const requiredAssetUrl = (label: string) =>
  assetUrl().refine((v) => v !== "", `${label} is required`);

/** Slug: lowercase letters, numbers and hyphens. */
export const slug = () =>
  z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and hyphens only")
    .max(120);

/** MongoDB ObjectId string. */
export const objectId = (label = "Selection") => z.string().regex(/^[a-f\d]{24}$/i, `${label} is invalid`);

/** Whole number from form input (string or number). */
export const intField = (label: string, min: number, max: number) =>
  z.coerce
    .number({ error: `${label} must be a number` })
    .int(`${label} must be a whole number`)
    .min(min, `${label} must be at least ${min}`)
    .max(max, `${label} must be at most ${max}`);

/** Comma/newline separated list → trimmed, de-duplicated string array. */
export const stringList = (maxItems = 30, maxLen = 120) =>
  z
    .union([z.string(), z.array(z.string())])
    .transform((v) => (Array.isArray(v) ? v : v.split(/[\n,]/)))
    .transform((arr) => Array.from(new Set(arr.map((s) => s.trim()).filter(Boolean))))
    .pipe(z.array(z.string().max(maxLen, `Each item must be at most ${maxLen} characters`)).max(maxItems));
