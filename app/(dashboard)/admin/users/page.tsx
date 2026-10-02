import { PageHeader } from "@/components/admin/AdminUI";
import { UserManager } from "@/components/admin/UserManager";
import { requireStaff } from "@/lib/auth/guards";
import { ADMIN_ROLES } from "@/lib/auth/config";
import { listStaffUsers } from "@/lib/data/dashboard";
import type { UserRole } from "@/types";

export const metadata = { title: "Staff users" };

export default async function UsersPage() {
  const session = await requireStaff(ADMIN_ROLES);
  const users = await listStaffUsers();
  return (
    <>
      <PageHeader
        title="Staff users"
        description="Owners manage every account. Administrators can manage College Staff accounts only. Staff cannot sign up publicly."
      />
      <UserManager users={users} actorRole={session.user.role as UserRole} actorId={session.user.id} />
    </>
  );
}
