import { PageHeader, Panel } from "@/components/admin/AdminUI";
import { ChangePasswordForm } from "@/components/forms/AuthForms";
import { requireStudent } from "@/lib/auth/guards";
import { connectDB } from "@/lib/db/connect";
import { Student } from "@/lib/db/models";
import { formatDate } from "@/lib/utils/formatDate";

export const metadata = { title: "Account" };

export default async function PortalAccountPage() {
  const session = await requireStudent();
  await connectDB();
  const me = await Student.findById(session.user.id).select("name email phone createdAt emailVerified").lean();
  return (
    <>
      <PageHeader title="My account" />
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Profile">
          <dl className="space-y-3 text-sm">
            {[
              ["Name", me?.name],
              ["Email", `${me?.email ?? ""}${me?.emailVerified ? " (verified)" : ""}`],
              ["Mobile", me?.phone],
              ["Member since", me?.createdAt ? formatDate(me.createdAt) : "—"],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 border-b pb-2">
                <dt className="text-muted-foreground">{k}</dt>
                <dd className="font-medium">{v}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-4 text-xs text-muted-foreground">To change your email or mobile number, please contact the college office.</p>
        </Panel>
        <Panel title="Change password">
          <ChangePasswordForm />
        </Panel>
      </div>
    </>
  );
}
