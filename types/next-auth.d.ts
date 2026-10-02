import type { DefaultSession } from "next-auth";
import type { UserRole } from "@/types";

type AccountKind = "staff" | "student";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      kind: AccountKind;
      role: UserRole | "student";
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
