import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db/connect";
import { Student, User } from "@/lib/db/models";
import { loginSchema } from "@/lib/validators/auth.schema";
import { ipFromHeaders, rateLimit, resetRateLimit } from "@/lib/rate-limit";
import { SESSION_MAX_AGE_SECONDS, STAFF_LOGIN_PATH } from "./config";
import type { UserRole } from "@/types";

const MAX_ATTEMPTS = 5;
const WINDOW_SECONDS = 15 * 60;

export const RATE_LIMITED_ERROR = "RateLimited";
export const EMAIL_NOT_VERIFIED_ERROR = "EmailNotVerified";

let dummyHash: Promise<string> | null = null;
function getDummyHash(): Promise<string> {
  dummyHash ??= bcrypt.hash("timing-safe-placeholder", 12);
  return dummyHash;
}

/**
 * Shared credential check for staff and student accounts with per-IP+email
 * rate limiting. Throws `RateLimited` when the limit is exceeded.
 */
async function verifyCredentials(
  kind: "staff" | "student",
  raw: Record<string, string> | undefined,
  reqHeaders: Record<string, string | string[] | undefined> | undefined,
) {
  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) return null;
  const { email, password } = parsed.data;

  await connectDB();
  const bucket = `login:${kind}:${ipFromHeaders(reqHeaders)}:${email}`;
  const limit = await rateLimit(bucket, MAX_ATTEMPTS, WINDOW_SECONDS);
  if (!limit.allowed) throw new Error(RATE_LIMITED_ERROR);

  const account =
    kind === "staff"
      ? await User.findOne({ email }).select("+password")
      : await Student.findOne({ email }).select("+password");

  // Compare against a dummy hash when the account does not exist to keep timing uniform.
  const valid = await bcrypt.compare(password, account?.password ?? (await getDummyHash()));
  if (!account || !valid || account.isActive === false) return null;

  if (kind === "student" && !(account as { emailVerified?: Date | null }).emailVerified) {
    throw new Error(EMAIL_NOT_VERIFIED_ERROR);
  }

  await resetRateLimit(bucket);
  account.lastLogin = new Date();
  await account.save();

  const role = kind === "staff" ? ((account as { role: UserRole }).role ?? "staff") : "student";
  return { id: String(account._id), name: account.name, email: account.email, kind, role } as const;
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt", maxAge: SESSION_MAX_AGE_SECONDS },
  pages: { signIn: STAFF_LOGIN_PATH },
  providers: [
    CredentialsProvider({
      id: "staff",
      name: "Staff",
      credentials: { email: { type: "email" }, password: { type: "password" } },
      authorize: (credentials, req) => verifyCredentials("staff", credentials, req?.headers),
    }),
    CredentialsProvider({
      id: "student",
      name: "Student",
      credentials: { email: { type: "email" }, password: { type: "password" } },
      authorize: (credentials, req) => verifyCredentials("student", credentials, req?.headers),
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.kind = user.kind;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.kind = token.kind;
      session.user.role = token.role;
      return session;
    },
  },
};
