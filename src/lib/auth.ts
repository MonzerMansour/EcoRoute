import NextAuth, { type DefaultSession } from "next-auth";
import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";

export type UserRole = "teacher" | "student";

declare module "next-auth" {
  interface Session {
    user: {
      role?: UserRole;
    } & DefaultSession["user"];
  }
}

function envIsSet(value: string | undefined): value is string {
  return Boolean(value && !value.startsWith("your-"));
}

const providers: NextAuthConfig["providers"] = [
  Credentials({
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
      role: { label: "Role", type: "text" },
    },
    async authorize(credentials) {
      const email = credentials?.email as string | undefined;
      const password = credentials?.password as string | undefined;
      const role = credentials?.role as UserRole | undefined;

      if (!email || !password) return null;

      return {
        id: email,
        email,
        name: email.split("@")[0],
        role: role === "student" ? "student" : "teacher",
      };
    },
  }),
];

if (envIsSet(process.env.AUTH_GOOGLE_ID) && envIsSet(process.env.AUTH_GOOGLE_SECRET)) {
  providers.push(
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  );
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET,
  trustHost: true,
  providers,
  pages: {
    signIn: "/login/teacher",
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.role = (user as { role?: UserRole }).role;
      }
      if (account?.provider === "google" && !token.role) {
        token.role = "teacher";
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
});
