import NextAuth, { type DefaultSession } from "next-auth";
import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig, type UserRole } from "@/lib/auth.config";

export type { UserRole };

// Imported lazily inside the event so the auth module stays edge-safe.

declare module "next-auth" {
  interface Session {
    user: {
      role?: UserRole;
    } & DefaultSession["user"];
  }
}

const providers: NextAuthConfig["providers"] = [
  Credentials({
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      const email = (credentials?.email as string | undefined)
        ?.trim()
        .toLowerCase();
      const password = credentials?.password as string | undefined;
      if (!email || !password) return null;

      // Verify against the user store. Role comes from the stored account,
      // never from client input. Lazily imported so this module stays edge-safe.
      const { findUserByEmail } = await import("@/lib/data/users");
      const { verifyPassword } = await import("@/lib/auth/password");
      const user = await findUserByEmail(email);
      if (!user || !user.passwordHash) return null;
      const ok = await verifyPassword(password, user.passwordHash);
      if (!ok) return null;

      return {
        id: user.email,
        email: user.email,
        name: user.name ?? user.email.split("@")[0],
        image: user.image ?? undefined,
        role: user.role,
      };
    },
  }),
];

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers,
  events: {
    async signIn({ user, account }) {
      if (!user?.email) return;
      const { persistUser } = await import("@/lib/data/users");
      await persistUser({
        email: user.email,
        name: user.name,
        image: user.image,
        provider: account?.provider ?? null,
        role: (user as { role?: UserRole }).role,
      });
    },
  },
});
