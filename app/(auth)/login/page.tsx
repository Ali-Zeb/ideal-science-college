import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { Building2 } from "lucide-react";
import { AuthCard } from "@/components/forms/AuthCard";
import { LoginForm } from "@/components/forms/AuthForms";

export const metadata: Metadata = { title: "Staff Sign In", robots: { index: false, follow: false } };

export default function StaffLoginPage() {
  return (
    <AuthCard
      icon={Building2}
      title="Staff sign in"
      description="For administrators and college staff. Accounts are created by the administrator."
      footer={
        <>
          Student or parent?{" "}
          <Link href="/portal/login" className="font-semibold text-brand-600 hover:underline">
            Go to Student Portal
          </Link>
        </>
      }
    >
      <Suspense>
        <LoginForm kind="staff" />
      </Suspense>
    </AuthCard>
  );
}
