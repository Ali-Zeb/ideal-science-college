import { z } from "zod";
import { emailAddress, otpCode, personName, pkMobile, strongPassword } from "./fields";

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email("Enter a valid email address")),
  password: z.string().min(1, "Password is required").max(64),
});
export type LoginInput = z.input<typeof loginSchema>;

export const registerSchema = z
  .object({
    name: personName("Full name"),
    email: emailAddress(),
    phone: pkMobile(),
    password: strongPassword(),
    confirmPassword: z.string(),
    acceptTerms: z.literal(true, { error: "You must accept the Terms and Privacy Policy" }),
  })
  .refine((d) => d.password === d.confirmPassword, { path: ["confirmPassword"], message: "Passwords do not match" });
export type RegisterInput = z.input<typeof registerSchema>;

export const verifyEmailSchema = z.object({ email: emailAddress(), code: otpCode() });
export type VerifyEmailInput = z.input<typeof verifyEmailSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email("Enter a valid email address")),
  accountKind: z.enum(["staff", "student"]),
});
export type ForgotPasswordInput = z.input<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    email: z.string().trim().toLowerCase().pipe(z.email("Enter a valid email address")),
    accountKind: z.enum(["staff", "student"]),
    code: otpCode(),
    password: strongPassword(),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, { path: ["confirmPassword"], message: "Passwords do not match" });
export type ResetPasswordInput = z.input<typeof resetPasswordSchema>;

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    password: strongPassword(),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, { path: ["confirmPassword"], message: "Passwords do not match" })
  .refine((d) => d.password !== d.currentPassword, { path: ["password"], message: "Choose a different password" });
export type ChangePasswordInput = z.input<typeof changePasswordSchema>;

export const staffUserSchema = z.object({
  name: personName(),
  email: emailAddress(),
  role: z.enum(["owner", "admin", "staff"]),
  wing: z.enum(["all", "boys", "girls"]).default("all"),
  password: z.union([z.literal(""), strongPassword()]).default(""),
  isActive: z.boolean().default(true),
});
export type StaffUserInput = z.input<typeof staffUserSchema>;
