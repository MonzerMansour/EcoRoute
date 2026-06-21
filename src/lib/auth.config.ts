import type { NextAuthConfig } from "next-auth";

export type UserRole = "teacher" | "student";

/**
 * Edge-safe NextAuth config shared by middleware and the full server config.
 *
 * It deliberately contains NO providers that pull in Node-only modules
 * (e.g. the Credentials provider's password hashing). Those live in `auth.ts`,
 * which runs only in the Node runtime. Middleware just needs the secret +
 * callbacks to read the session JWT.
 */
export const authConfig = {
  secret: process.env.AUTH_SECRET,
  trustHost: true,
  pages: {
    signIn: "/login/teacher",
  },
  providers: [],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.role = (user as { role?: UserRole }).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as UserRole | undefined;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
