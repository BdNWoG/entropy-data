import type { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      tier?: string | null;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    tier?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    tier?: string | null;
  }
}
