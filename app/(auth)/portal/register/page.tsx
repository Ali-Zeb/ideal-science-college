import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { UserPlus } from "lucide-react";
import { AuthCard } from "@/components/forms/AuthCard";
import { RegisterForm } from "@/components/forms/AuthForms";

export const metadata: Metadata = { title: "Create Student Portal Account", robots: { index: false, follow: true } };

export default function RegisterPage() {
  return (
    <AuthCard
      icon={UserPlus}
      title="Create your account"
      description="Students and parents can register. Your email will be verified with a one-time code."
      footer={
        <>
          Already registered?{" "}
          <Link href="/portal/login" className="font-semibold text-brand-600 hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <Suspense>
        <RegisterForm />
      </Suspense>
    </AuthCard>
  );
}
