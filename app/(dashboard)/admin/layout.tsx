import type { Metadata } from "next";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { guardPage } from "@/lib/auth/guards";
import { USER_ROLE_LABELS } from "@/lib/constants";
import type { UserRole } from "@/types";

export const metadata: Metadata = { title: { default: "Admin Dashboard", template: "%s | Admin Dashboard" }, robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await guardPage("admin");
  return (
    <DashboardShell
      area="admin"
      user={{ name: session.user.name ?? "Admin", email: session.user.email ?? "", roleLabel: USER_ROLE_LABELS[session.user.role as UserRole] }}
    >
      {children}
    </DashboardShell>
  );
}
