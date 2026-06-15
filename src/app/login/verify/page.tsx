import Link from "next/link";
import { Mail, ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Check Your Email",
};

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
          <Mail className="h-8 w-8" />
        </div>
        <h1 className="mt-6 text-2xl font-bold text-earth-900">
          Check your email
        </h1>
        <p className="mt-3 text-earth-600">
          We sent a magic link to{" "}
          {email ? (
            <span className="font-semibold text-earth-900">{email}</span>
          ) : (
            "your email address"
          )}
          . Click the link to sign in.
        </p>
        <p className="mt-2 text-sm text-earth-500">
          The link expires in 24 hours. Check your spam folder if you don&apos;t
          see it.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-brand-600 hover:text-brand-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>
      </div>
    </div>
  );
}
