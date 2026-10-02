"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Pencil, Plus, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Field, PasswordInput, SelectInput, TextInput, applyServerErrors } from "@/components/forms/Field";
import { ConfirmAction, DataTable, StatusBadge, TableEmpty } from "./AdminUI";
import { deleteStaffUser, saveStaffUser } from "@/actions/admin.actions";
import { staffUserSchema, type StaffUserInput } from "@/lib/validators/auth.schema";
import { USER_ROLE_LABELS } from "@/lib/constants";
import { formatDateTime } from "@/lib/utils/formatDate";
import type { AdminUser, UserRole } from "@/types";

function UserDialog({ user, actorRole, open, onClose }: { user: AdminUser | null; actorRole: UserRole; open: boolean; onClose: () => void }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const roles: UserRole[] = actorRole === "owner" ? ["owner", "admin", "staff"] : ["staff"];
  const { register, control, handleSubmit, setError, formState: { errors } } = useForm<StaffUserInput>({
    resolver: zodResolver(staffUserSchema),
    values: { name: user?.name ?? "", email: user?.email ?? "", role: user?.role ?? "staff", password: "", isActive: user?.isActive ?? true },
  });

  const onSubmit = handleSubmit((d) =>
    startTransition(async () => {
      const res = await saveStaffUser(user?.id ?? null, d);
      if (res.success) {
        toast.success(res.message);
        onClose();
        router.refresh();
      } else {
        applyServerErrors(res.fieldErrors, setError as never);
        toast.error(res.error);
      }
    }),
  );

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{user ? "Edit staff account" : "New staff account"}</DialogTitle>
          <DialogDescription>Staff sign in at /login. Share the password with them in person.</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} noValidate className="space-y-4">
          <Field label="Full name" htmlFor="u-name" error={errors.name?.message}>
            <TextInput id="u-name" invalid={!!errors.name} {...register("name")} />
          </Field>
          <Field label="Email" htmlFor="u-email" error={errors.email?.message}>
            <TextInput id="u-email" type="email" invalid={!!errors.email} {...register("email")} />
          </Field>
          <Field label="Role" htmlFor="u-role" hint="Owner/Admin: full access. College Staff: College dashboard only.">
            <SelectInput id="u-role" {...register("role")}>
              {roles.map((r) => (
                <option key={r} value={r}>
                  {USER_ROLE_LABELS[r]}
                </option>
              ))}
            </SelectInput>
          </Field>
          <Field label={user ? "New password (leave empty to keep)" : "Initial password"} htmlFor="u-pass" error={errors.password?.message}>
            <PasswordInput id="u-pass" autoComplete="new-password" invalid={!!errors.password} {...register("password")} />
          </Field>
          <Controller
            control={control}
            name="isActive"
            render={({ field }) => (
              <label className="flex items-center justify-between rounded-xl border p-3 text-sm font-medium">
                Account active
                <Switch checked={!!field.value} onCheckedChange={field.onChange} />
              </label>
            )}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />} Save
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/** Staff account list with create / edit / delete (role-restricted). */
export function UserManager({ users, actorRole, actorId }: { users: AdminUser[]; actorRole: UserRole; actorId: string }) {
  const [editing, setEditing] = useState<AdminUser | null>(null);
  const [open, setOpen] = useState(false);
  const canEdit = (u: AdminUser) => actorRole === "owner" || u.role === "staff";

  return (
    <>
      <div className="mb-5 flex justify-end">
        <Button
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
        >
          <Plus className="size-4" /> New staff account
        </Button>
      </div>
      <DataTable head={["Name", "Email", "Role", "Status", "Last sign-in", ""]} empty={users.length ? null : <TableEmpty message="No staff accounts." />}>
        {users.map((u) => (
          <tr key={u.id} className="hover:bg-muted/40">
            <td className="px-4 py-3 font-medium">
              {u.name}
              {u.id === actorId ? <span className="ml-2 text-xs text-muted-foreground">(you)</span> : null}
            </td>
            <td className="px-4 py-3">{u.email}</td>
            <td className="px-4 py-3">{USER_ROLE_LABELS[u.role]}</td>
            <td className="px-4 py-3">
              <StatusBadge status={u.isActive ? "active" : "inactive"} />
            </td>
            <td className="px-4 py-3 text-muted-foreground">{u.lastLogin ? formatDateTime(u.lastLogin) : "Never"}</td>
            <td className="px-4 py-3">
              {canEdit(u) ? (
                <div className="flex justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Edit ${u.name}`}
                    onClick={() => {
                      setEditing(u);
                      setOpen(true);
                    }}
                  >
                    <Pencil className="size-4" />
                  </Button>
                  {u.id !== actorId ? <ConfirmAction action={deleteStaffUser.bind(null, u.id)} title={`Delete ${u.name}?`} description="They will no longer be able to sign in." /> : null}
                </div>
              ) : null}
            </td>
          </tr>
        ))}
      </DataTable>
      <UserDialog user={editing} actorRole={actorRole} open={open} onClose={() => setOpen(false)} />
    </>
  );
}
