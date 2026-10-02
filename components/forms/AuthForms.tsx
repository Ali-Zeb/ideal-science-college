"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, CheckCircle2, Loader2, LogIn, MailCheck, ShieldCheck, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, PasswordInput, TextInput, applyServerErrors } from "./Field";
import {
  changePassword,
  registerStudent,
  requestPasswordReset,
  resendVerificationCode,
  resetPassword,
  verifyStudentEmail,
} from "@/actions/auth.actions";
import {
  changePasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  verifyEmailSchema,
  type ChangePasswordInput,
  type LoginInput,
  type RegisterInput,
  type ResetPasswordInput,
  type VerifyEmailInput,
} from "@/lib/validators/auth.schema";
import { z } from "zod";
import { homeFor } from "@/lib/auth/config";

type Kind = "staff" | "student";

/** Only allow same-site relative callback URLs (prevents open redirects). */
function safeCallback(raw: string | null, fallback: string): string {
  return raw && raw.startsWith("/") && !raw.startsWith("//") ? raw : fallback;
}

function Alert({ tone, children }: { tone: "error" | "success" | "info"; children: React.ReactNode }) {
  const styles = {
    error: "border-destructive/30 bg-destructive/10 text-destructive",
    success: "border-leaf-500/30 bg-leaf-500/10 text-leaf-600",
    info: "border-brand-200 bg-brand-50 text-brand-800",
  }[tone];
  const Icon = tone === "error" ? AlertCircle : tone === "success" ? CheckCircle2 : MailCheck;
  return (
    <div role={tone === "error" ? "alert" : "status"} className={`flex items-start gap-2.5 rounded-lg border p-3 text-sm ${styles}`}>
      <Icon className="mt-0.5 size-4 shrink-0" aria-hidden />
      <div>{children}</div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Login                                                               */
/* ------------------------------------------------------------------ */

/** Email + password sign-in for staff (/login) or students (/portal/login). */
export function LoginForm({ kind }: { kind: Kind }) {
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema), defaultValues: { email: "", password: "" } });

  const onSubmit = handleSubmit((values) =>
    startTransition(async () => {
      setError(null);
      setUnverifiedEmail(null);
      const res = await signIn(kind, { ...values, redirect: false });
      if (!res || res.error) {
        if (res?.error === "RateLimited") setError("Too many failed attempts. Please wait 15 minutes and try again.");
        else if (res?.error === "EmailNotVerified") {
          setUnverifiedEmail(values.email.trim().toLowerCase());
          setError("Your email is not verified yet.");
        } else setError("Incorrect email or password.");
        return;
      }
      const sessionRes = await fetch("/api/auth/session").then((r) => r.json() as Promise<{ user?: { kind: Kind; role: string } }>);
      const home = sessionRes.user ? homeFor(sessionRes.user.kind, sessionRes.user.role) : kind === "staff" ? "/college" : "/portal";
      router.replace(safeCallback(params.get("callbackUrl"), home));
      router.refresh();
    }),
  );

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      {params.get("verified") ? <Alert tone="success">Email verified. Please sign in.</Alert> : null}
      {params.get("reset") ? <Alert tone="success">Password updated. Please sign in with your new password.</Alert> : null}
      {error ? (
        <Alert tone="error">
          {error}
          {unverifiedEmail ? (
            <>
              {" "}
              <Link href={`/portal/register?verify=${encodeURIComponent(unverifiedEmail)}`} className="font-semibold underline">
                Verify now
              </Link>
            </>
          ) : null}
        </Alert>
      ) : null}
      <Field label="Email" htmlFor="login-email" error={errors.email?.message}>
        <TextInput id="login-email" type="email" autoComplete="email" autoFocus invalid={!!errors.email} {...register("email")} />
      </Field>
      <Field label="Password" htmlFor="login-password" error={errors.password?.message}>
        <PasswordInput id="login-password" autoComplete="current-password" invalid={!!errors.password} {...register("password")} />
      </Field>
      <div className="flex justify-end">
        <Link href={`/forgot-password?type=${kind}`} className="text-sm font-medium text-brand-600 hover:underline">
          Forgot password?
        </Link>
      </div>
      <Button type="submit" size="lg" disabled={pending} className="h-12 w-full">
        {pending ? <Loader2 className="size-4 animate-spin" /> : <LogIn className="size-4" />}
        {pending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}

/* ------------------------------------------------------------------ */
/* Register + verify                                                   */
/* ------------------------------------------------------------------ */

function VerifyStep({ email, onBack }: { email: string; onBack: () => void }) {
  const router = useRouter();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [cooldown, setCooldown] = useState(60);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<VerifyEmailInput>({ resolver: zodResolver(verifyEmailSchema), defaultValues: { email, code: "" } });

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const onSubmit = handleSubmit((values) =>
    startTransition(async () => {
      const res = await verifyStudentEmail(values);
      if (res.success) {
        toast.success(res.message);
        const cb = params.get("callbackUrl");
        router.replace(`/portal/login?verified=1${cb ? `&callbackUrl=${encodeURIComponent(cb)}` : ""}`);
      } else {
        applyServerErrors(res.fieldErrors, setError as never);
        if (!res.fieldErrors) toast.error(res.error);
      }
    }),
  );

  const resend = () =>
    startTransition(async () => {
      const res = await resendVerificationCode(email);
      if (res.success) {
        toast.success(res.message);
        setCooldown(60);
      } else toast.error(res.error);
    });

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      <Alert tone="info">
        We sent a 6-digit code to <strong>{email}</strong>. Enter it below to activate your account. Check your spam folder if you don&apos;t see it.
      </Alert>
      <Field label="Verification code" htmlFor="otp" error={errors.code?.message}>
        <TextInput
          id="otp"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          autoFocus
          placeholder="••••••"
          className="text-center font-mono text-2xl tracking-[0.5em]"
          invalid={!!errors.code}
          {...register("code")}
        />
      </Field>
      <Button type="submit" size="lg" disabled={pending} className="h-12 w-full">
        {pending ? <Loader2 className="size-4 animate-spin" /> : <ShieldCheck className="size-4" />}
        Verify email
      </Button>
      <div className="flex items-center justify-between text-sm">
        <button type="button" onClick={onBack} className="text-muted-foreground hover:text-foreground">
          Use a different email
        </button>
        <button type="button" onClick={resend} disabled={cooldown > 0 || pending} className="font-medium text-brand-600 disabled:text-muted-foreground">
          {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
        </button>
      </div>
    </form>
  );
}

/** Student-portal sign-up with strict validation, then email OTP verification. */
export function RegisterForm() {
  const params = useSearchParams();
  const [verifyEmail, setVerifyEmail] = useState<string | null>(params.get("verify"));
  const [pending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    mode: "onTouched",
    defaultValues: { name: "", email: "", phone: "", password: "", confirmPassword: "", acceptTerms: undefined },
  });

  if (verifyEmail) return <VerifyStep email={verifyEmail} onBack={() => setVerifyEmail(null)} />;

  const onSubmit = handleSubmit((values) =>
    startTransition(async () => {
      const res = await registerStudent(values);
      if (res.success) {
        toast.success(res.message);
        setVerifyEmail(res.data.email);
      } else {
        applyServerErrors(res.fieldErrors, setError as never);
        toast.error(res.error);
      }
    }),
  );

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      <Field label="Full name" htmlFor="r-name" hint="Student's or parent's name" error={errors.name?.message}>
        <TextInput id="r-name" autoComplete="name" invalid={!!errors.name} {...register("name")} />
      </Field>
      <Field label="Email" htmlFor="r-email" hint="A code will be sent to verify this email" error={errors.email?.message}>
        <TextInput id="r-email" type="email" autoComplete="email" invalid={!!errors.email} {...register("email")} />
      </Field>
      <Field label="Mobile number" htmlFor="r-phone" hint="Pakistani mobile, e.g. 0308-5744005" error={errors.phone?.message}>
        <TextInput id="r-phone" type="tel" autoComplete="tel" invalid={!!errors.phone} {...register("phone")} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Password" htmlFor="r-password" error={errors.password?.message}>
          <PasswordInput id="r-password" autoComplete="new-password" invalid={!!errors.password} {...register("password")} />
        </Field>
        <Field label="Confirm password" htmlFor="r-confirm" error={errors.confirmPassword?.message}>
          <PasswordInput id="r-confirm" autoComplete="new-password" invalid={!!errors.confirmPassword} {...register("confirmPassword")} />
        </Field>
      </div>
      <p className="text-xs text-muted-foreground">At least 8 characters with uppercase, lowercase, a number and a symbol.</p>
      <label className="flex items-start gap-2.5 text-sm">
        <input type="checkbox" className="mt-0.5 size-4 accent-brand-700" {...register("acceptTerms")} />
        <span>
          I agree to the{" "}
          <Link href="/terms" target="_blank" className="font-medium text-brand-600 underline">
            Terms
          </Link>{" "}
          and{" "}
          <Link href="/privacy-policy" target="_blank" className="font-medium text-brand-600 underline">
            Privacy Policy
          </Link>
          .
        </span>
      </label>
      {errors.acceptTerms ? (
        <p className="text-xs text-destructive" role="alert">
          {errors.acceptTerms.message}
        </p>
      ) : null}
      <Button type="submit" size="lg" disabled={pending} className="h-12 w-full">
        {pending ? <Loader2 className="size-4 animate-spin" /> : <UserPlus className="size-4" />}
        {pending ? "Creating account…" : "Create account"}
      </Button>
    </form>
  );
}

/* ------------------------------------------------------------------ */
/* Change password (signed in)                                         */
/* ------------------------------------------------------------------ */

/** Lets a signed-in staff member or student change their password. */
export function ChangePasswordForm() {
  const [pending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: "", password: "", confirmPassword: "" },
  });

  const onSubmit = handleSubmit((values) =>
    startTransition(async () => {
      const res = await changePassword(values);
      if (res.success) {
        toast.success(res.message);
        reset();
      } else {
        applyServerErrors(res.fieldErrors, setError as never);
        toast.error(res.error);
      }
    }),
  );

  return (
    <form onSubmit={onSubmit} noValidate className="max-w-md space-y-4">
      <Field label="Current password" htmlFor="cp-current" error={errors.currentPassword?.message}>
        <PasswordInput id="cp-current" autoComplete="current-password" invalid={!!errors.currentPassword} {...register("currentPassword")} />
      </Field>
      <Field label="New password" htmlFor="cp-new" hint="8+ characters with upper, lower, number and symbol" error={errors.password?.message}>
        <PasswordInput id="cp-new" autoComplete="new-password" invalid={!!errors.password} {...register("password")} />
      </Field>
      <Field label="Confirm new password" htmlFor="cp-confirm" error={errors.confirmPassword?.message}>
        <PasswordInput id="cp-confirm" autoComplete="new-password" invalid={!!errors.confirmPassword} {...register("confirmPassword")} />
      </Field>
      <Button type="submit" disabled={pending}>
        {pending ? <Loader2 className="size-4 animate-spin" /> : <ShieldCheck className="size-4" />}
        Change password
      </Button>
    </form>
  );
}

/* ------------------------------------------------------------------ */
/* Forgot / reset password                                             */
/* ------------------------------------------------------------------ */

const requestSchema = z.object({ email: z.string().trim().toLowerCase().pipe(z.email("Enter a valid email address")) });

/** Two-step password reset: request a code, then set a new password. */
export function ForgotPasswordForm({ kind }: { kind: Kind }) {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const loginPath = kind === "staff" ? "/login" : "/portal/login";

  const requestForm = useForm<{ email: string }>({ resolver: zodResolver(requestSchema), defaultValues: { email: "" } });
  const resetForm = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { email: "", accountKind: kind, code: "", password: "", confirmPassword: "" },
  });

  const onRequest = requestForm.handleSubmit((values) =>
    startTransition(async () => {
      const res = await requestPasswordReset({ email: values.email, accountKind: kind });
      if (res.success) {
        toast.success(res.message);
        setEmail(values.email);
        resetForm.setValue("email", values.email);
      } else toast.error(res.error);
    }),
  );

  const onReset = resetForm.handleSubmit((values) =>
    startTransition(async () => {
      const res = await resetPassword(values);
      if (res.success) {
        toast.success(res.message);
        router.replace(`${loginPath}?reset=1`);
      } else {
        applyServerErrors(res.fieldErrors, resetForm.setError as never);
        if (!res.fieldErrors) toast.error(res.error);
      }
    }),
  );

  if (!email) {
    const e = requestForm.formState.errors;
    return (
      <form onSubmit={onRequest} noValidate className="space-y-5">
        <p className="text-sm text-muted-foreground">Enter your account email. If it is registered, we&apos;ll send you a 6-digit reset code.</p>
        <Field label="Email" htmlFor="fp-email" error={e.email?.message}>
          <TextInput id="fp-email" type="email" autoComplete="email" autoFocus invalid={!!e.email} {...requestForm.register("email")} />
        </Field>
        <Button type="submit" size="lg" disabled={pending} className="h-12 w-full">
          {pending ? <Loader2 className="size-4 animate-spin" /> : <MailCheck className="size-4" />}
          Send reset code
        </Button>
        <p className="text-center text-sm">
          <Link href={loginPath} className="font-medium text-brand-600 hover:underline">
            Back to sign in
          </Link>
        </p>
      </form>
    );
  }

  const e = resetForm.formState.errors;
  return (
    <form onSubmit={onReset} noValidate className="space-y-4">
      <Alert tone="info">
        If <strong>{email}</strong> is registered, a code has been sent. It expires in 15 minutes.
      </Alert>
      <Field label="6-digit code" htmlFor="rp-code" error={e.code?.message}>
        <TextInput id="rp-code" inputMode="numeric" autoComplete="one-time-code" maxLength={6} className="text-center font-mono text-xl tracking-[0.4em]" invalid={!!e.code} {...resetForm.register("code")} />
      </Field>
      <Field label="New password" htmlFor="rp-password" error={e.password?.message}>
        <PasswordInput id="rp-password" autoComplete="new-password" invalid={!!e.password} {...resetForm.register("password")} />
      </Field>
      <Field label="Confirm new password" htmlFor="rp-confirm" error={e.confirmPassword?.message}>
        <PasswordInput id="rp-confirm" autoComplete="new-password" invalid={!!e.confirmPassword} {...resetForm.register("confirmPassword")} />
      </Field>
      <Button type="submit" size="lg" disabled={pending} className="h-12 w-full">
        {pending ? <Loader2 className="size-4 animate-spin" /> : <ShieldCheck className="size-4" />}
        Update password
      </Button>
      <button type="button" onClick={() => setEmail(null)} className="w-full text-center text-sm text-muted-foreground hover:text-foreground">
        Use a different email
      </button>
    </form>
  );
}
