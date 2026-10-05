import type { DefaultSession } from "next-auth";
import type { StaffWing, UserRole } from "@/types";

type AccountKind = "staff" | "student";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      kind: AccountKind;
      role: UserRole | "student";
      /** Set by server guards from the database (staff only). */
      wing?: StaffWing;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    kind: AccountKind;
    role: UserRole | "student";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    kind: AccountKind;
    role: UserRole | "student";
  }
}
