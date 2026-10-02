"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/db/connect";
import { Application, Settings, Student, User } from "@/lib/db/models";
import { staffUserSchema } from "@/lib/validators/auth.schema";
import { settingsSchema } from "@/lib/validators/settings.schema";
import { ADMIN_ROLES } from "@/lib/auth/config";
import { requireStaff, toErrorMessage } from "@/lib/auth/guards";
import { sendEmail } from "@/lib/email/send";
import { staffWelcomeEmail } from "@/lib/email/templates";
import { fail, ok, validationError } from "@/lib/actions";
import { USER_ROLE_LABELS } from "@/lib/constants";
import type { ActionResult, UserRole } from "@/types";

const isId = (id: string) => /^[a-f\d]{24}$/i.test(id);

/** Owners manage every role; admins may only manage college staff. */
function canManage(actor: UserRole, target: UserRole): boolean {
  return actor === "owner" || (actor === "admin" && target === "staff");
}

/* Staff users -------------------------------------------------------- */

/** Creates (id = null) or updates a staff account. Password is required only when creating. */
export async function saveStaffUser(id: string | null, input: unknown): Promise<ActionResult<{ id: string }>> {
  const parsed = staffUserSchema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error);
  const { name, email, role, password, isActive } = parsed.data;

  try {
    const session = await requireStaff(ADMIN_ROLES);
    const actor = session.user.role as UserRole;
    if (!canManage(actor, role)) return fail("Only the owner can create or change administrator accounts.");
    await connectDB();

    if (id) {
      if (!isId(id)) return fail("Invalid user.");
      const user = await User.findById(id);
      if (!user) return fail("User not found.");
      if (!canManage(actor, user.role as UserRole)) return fail("You cannot edit this account.");
      if (id === session.user.id && (role !== user.role || !isActive)) return fail("You cannot change your own role or deactivate yourself.");
      if (user.role === "owner" && (role !== "owner" || !isActive) && (await User.countDocuments({ role: "owner", isActive: true })) <= 1) {
        return fail("There must always be at least one active owner.");
      }
      const clash = await User.exists({ email, _id: { $ne: id } });
      if (clash) return { success: false, error: "Email already in use.", fieldErrors: { email: ["Another account uses this email"] } };

      user.name = name;
      user.email = email;
      user.role = role;
      user.isActive = isActive;
      if (password) user.password = await bcrypt.hash(password, 12);
      await user.save();
      revalidatePath("/admin/users");
      return ok({ id }, "User updated.");
    }

    if (!password) return { success: false, error: "Set an initial password.", fieldErrors: { password: ["Password is required for new users"] } };
    if (await User.exists({ email })) return { success: false, error: "Email already in use.", fieldErrors: { email: ["Another account uses this email"] } };
    const doc = await User.create({ name, email, role, isActive, password: await bcrypt.hash(password, 12) });
    await sendEmail({ to: email, ...staffWelcomeEmail(name, email, USER_ROLE_LABELS[role]) });
    revalidatePath("/admin/users");
    return ok({ id: String(doc._id) }, "User created. Share the password with them in person.");
  } catch (error) {
    return fail(toErrorMessage(error));
  }
}

/** Deletes a staff account (cannot delete yourself or the last owner). */
export async function deleteStaffUser(id: string): Promise<ActionResult<null>> {
  if (!isId(id)) return fail("Invalid user.");
  try {
    const session = await requireStaff(ADMIN_ROLES);
    if (id === session.user.id) return fail("You cannot delete your own account.");
    await connectDB();
    const user = await User.findById(id).select("role");
    if (!user) return fail("User not found.");
    if (!canManage(session.user.role as UserRole, user.role as UserRole)) return fail("You cannot delete this account.");
    if (user.role === "owner" && (await User.countDocuments({ role: "owner" })) <= 1) return fail("The last owner cannot be deleted.");
    await User.deleteOne({ _id: id });
    revalidatePath("/admin/users");
    return ok(null, "User deleted.");
  } catch (error) {
    return fail(toErrorMessage(error));
  }
}

/* Student accounts --------------------------------------------------- */

/** Blocks or unblocks a student-portal account. */
export async function setStudentActive(id: string, isActive: boolean): Promise<ActionResult<null>> {
  if (!isId(id)) return fail("Invalid account.");
  try {
    await requireStaff(ADMIN_ROLES);
    await connectDB();
    await Student.updateOne({ _id: id }, { $set: { isActive } });
    revalidatePath("/admin/students");
    return ok(null, isActive ? "Account activated." : "Account blocked.");
  } catch (error) {
    return fail(toErrorMessage(error));
  }
}

/** Deletes a student-portal account that has no applications. */
export async function deleteStudentAccount(id: string): Promise<ActionResult<null>> {
  if (!isId(id)) return fail("Invalid account.");
  try {
    await requireStaff(ADMIN_ROLES);
    await connectDB();
    if (await Application.exists({ account: id })) return fail("This account has applications. Block it instead of deleting.");
    await Student.deleteOne({ _id: id });
    revalidatePath("/admin/students");
    return ok(null, "Account deleted.");
  } catch (error) {
    return fail(toErrorMessage(error));
  }
}

/* Settings ----------------------------------------------------------- */

/** Saves site-wide settings and refreshes every public page. */
export async function saveSettings(input: unknown): Promise<ActionResult<null>> {
  const parsed = settingsSchema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error);
  try {
    await requireStaff(ADMIN_ROLES);
    await connectDB();
    await Settings.updateOne({ key: "site" }, { $set: { ...parsed.data, key: "site" } }, { upsert: true });
    revalidatePath("/", "layout");
    return ok(null, "Settings saved.");
  } catch (error) {
    return fail(toErrorMessage(error));
  }
}
