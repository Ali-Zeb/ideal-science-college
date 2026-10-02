import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { GraduationCap } from "lucide-react";
import { AuthCard } from "@/components/forms/AuthCard";
import { LoginForm } from "@/components/forms/AuthForms";

export const metadata: Metadata = { title: "Student Portal Sign In", robots: { index: false, follow: true } };

export default function StudentLoginPage() {
  return (
    <AuthCard
      icon={GraduationCap}
      title="Student Portal"
      description="Sign in to apply online and track your admission status."
      footer={
        <>
          New here?{" "}
          <Link href="/portal/register" className="font-semibold text-brand-600 hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <Suspense>
        <LoginForm kind="student" />
      </Suspense>
    </AuthCard>
  );
}
