import type { Metadata } from "next";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { guardPage } from "@/lib/auth/guards";

export const metadata: Metadata = { title: { default: "Student Portal", template: "%s | Student Portal" }, robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const session = await guardPage("portal");
  return (
    <DashboardShell area="portal" user={{ name: session.user.name ?? "Student", email: session.user.email ?? "", roleLabel: "Student / Parent" }}>
      {children}
    </DashboardShell>
  );
}
