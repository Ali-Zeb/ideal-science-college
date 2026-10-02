import type { Metadata } from "next";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { guardPage } from "@/lib/auth/guards";
import { ADMIN_ROLES } from "@/lib/auth/config";
import { getCollegeBadges } from "@/lib/data/dashboard";
import { USER_ROLE_LABELS } from "@/lib/constants";
import type { UserRole } from "@/types";

export const metadata: Metadata = { title: { default: "College Dashboard", template: "%s | College Dashboard" }, robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function CollegeLayout({ children }: { children: React.ReactNode }) {
  const session = await guardPage("college");
  const badges = await getCollegeBadges();
  const role = session.user.role as UserRole;
  return (
    <DashboardShell
      area="college"
      user={{ name: session.user.name ?? "Staff", email: session.user.email ?? "", roleLabel: USER_ROLE_LABELS[role] }}
      badges={badges}
      showAdminLink={ADMIN_ROLES.includes(role)}
    >
      {children}
    </DashboardShell>
  );
}
