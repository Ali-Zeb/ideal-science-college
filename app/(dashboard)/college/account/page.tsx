import { PageHeader, Panel } from "@/components/admin/AdminUI";
import { ChangePasswordForm } from "@/components/forms/AuthForms";

export const metadata = { title: "Account" };

export default function StaffAccountPage() {
  return (
    <>
      <PageHeader title="Account security" description="Change the password you use to sign in." />
      <Panel title="Change password">
        <ChangePasswordForm />
      </Panel>
    </>
  );
}
