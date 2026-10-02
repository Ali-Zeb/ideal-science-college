import type { Metadata } from "next";
import { KeyRound } from "lucide-react";
import { AuthCard } from "@/components/forms/AuthCard";
import { ForgotPasswordForm } from "@/components/forms/AuthForms";

export const metadata: Metadata = { title: "Reset Password", robots: { index: false, follow: false } };

type Props = { searchParams: Promise<{ type?: string }> };

export default async function ForgotPasswordPage({ searchParams }: Props) {
  const { type } = await searchParams;
  const kind = type === "staff" ? "staff" : "student";
  return (
    <AuthCard icon={KeyRound} title="Reset password" description={kind === "staff" ? "Staff account password reset." : "Student Portal password reset."}>
      <ForgotPasswordForm kind={kind} />
    </AuthCard>
  );
}
