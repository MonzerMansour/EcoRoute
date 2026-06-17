"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { Leaf, Mail, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/lib/auth";

interface LoginFormProps {
  role: UserRole;
  title: string;
  subtitle: string;
  accent?: "brand" | "teal";
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

export function LoginForm({
  role,
  title,
  subtitle,
  accent = "brand",
}: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState<"email" | "google" | null>(null);
  const [error, setError] = useState("");
  const [googleEnabled, setGoogleEnabled] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/auth/providers")
      .then((response) => (response.ok ? response.json() : null))
      .then((providers) => setGoogleEnabled(Boolean(providers?.google)))
      .catch(() => setGoogleEnabled(false));
  }, []);

  const accentColors = {
    brand: {
      button: "bg-brand-600 hover:bg-brand-700 shadow-brand-600/25",
      icon: "bg-brand-600",
      link: "text-brand-600 hover:text-brand-700",
    },
    teal: {
      button: "bg-teal-600 hover:bg-teal-700 shadow-teal-600/25",
      icon: "bg-teal-600",
      link: "text-teal-600 hover:text-teal-700",
    },
  };

  const colors = accentColors[accent];
  const callbackUrl = role === "teacher" ? "/teacher" : "/student";

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;

    setLoading("email");
    setError("");

    try {
      const result = await signIn("nodemailer", {
        email,
        callbackUrl,
        redirect: false,
      });

      if (result?.error) {
        setError("Unable to send login link. Please try again.");
      } else {
        window.location.href = `/login/verify?email=${encodeURIComponent(email)}`;
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(null);
    }
  }

  async function handleGoogleLogin() {
    if (!googleEnabled) {
      setError(
        "Google sign-in is not configured yet. Add AUTH_GOOGLE_ID and AUTH_GOOGLE_SECRET to .env.local, then restart the dev server.",
      );
      return;
    }

    setLoading("google");
    setError("");

    try {
      await signIn("google", { callbackUrl });
    } catch {
      setError("Google sign-in failed. Please try again.");
      setLoading(null);
    }
  }

  const otherRole = role === "teacher" ? "student" : "teacher";
  const otherHref = `/login/${otherRole}`;

  return (
    <div className="flex min-h-screen">
      {/* Left panel */}
      <div className="hidden w-1/2 flex-col justify-between bg-gradient-to-br from-brand-700 via-brand-800 to-earth-900 p-12 text-white lg:flex">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
            <Leaf className="h-6 w-6" />
          </div>
          <span className="text-2xl font-bold">EcoRoute</span>
        </Link>

        <div>
          <h2 className="text-4xl font-bold leading-tight">
            {role === "teacher"
              ? "Optimize every away game."
              : "Carpool smarter, every day."}
          </h2>
          <p className="mt-4 text-lg text-brand-100">
            {role === "teacher"
              ? "Plan team travel, cut emissions, and get AI-powered vehicle recommendations for your entire season."
              : "Join neighborhood carpool clusters, save CO₂ on daily commutes, and coordinate home game rides."}
          </p>
        </div>

        <p className="text-sm text-brand-200">
          Smarter routes. Lower emissions. Same schedule.
        </p>
      </div>

      {/* Right panel */}
      <div className="flex w-full flex-col items-center justify-center px-4 py-12 lg:w-1/2">
        <div className="w-full max-w-md">
          <Link href="/" className="mb-8 flex items-center gap-2 lg:hidden">
            <div
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-xl text-white",
                colors.icon,
              )}
            >
              <Leaf className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold text-earth-900">EcoRoute</span>
          </Link>

          <h1 className="text-2xl font-bold text-earth-900">{title}</h1>
          <p className="mt-2 text-earth-600">{subtitle}</p>

          {error && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading !== null || googleEnabled === false}
            className="mt-8 flex w-full items-center justify-center gap-3 rounded-xl border border-earth-300 bg-white px-4 py-3 text-sm font-semibold text-earth-700 shadow-sm transition-colors hover:bg-earth-50 disabled:opacity-60"
          >
            {loading === "google" ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <GoogleIcon className="h-5 w-5" />
            )}
            Continue with Google
          </button>

          {googleEnabled === false && (
            <p className="mt-2 text-center text-xs text-earth-500">
              Google OAuth credentials are missing in <code>.env.local</code>.
            </p>
          )}

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-earth-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-earth-50 px-4 text-earth-500">
                or continue with email
              </span>
            </div>
          </div>

          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-earth-700"
              >
                Email address
              </label>
              <div className="relative mt-1.5">
                <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-earth-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@school.edu"
                  required
                  className="w-full rounded-xl border border-earth-300 bg-white py-3 pl-10 pr-4 text-sm text-earth-900 placeholder:text-earth-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading !== null}
              className={cn(
                "flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white shadow-lg transition-colors disabled:opacity-60",
                colors.button,
              )}
            >
              {loading === "email" ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                "Send magic link"
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-earth-600">
            {role === "teacher" ? "Are you a student?" : "Are you a teacher?"}{" "}
            <Link href={otherHref} className={cn("font-semibold", colors.link)}>
              Sign in as {otherRole}
            </Link>
          </p>

          <p className="mt-4 text-center text-xs text-earth-500">
            By signing in, you agree to our terms of service and privacy policy.
          </p>
        </div>
      </div>
    </div>
  );
}
