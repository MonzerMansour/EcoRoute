import { NextResponse } from "next/server";
import { createUser } from "@/lib/data/users";
import type { UserRole } from "@/lib/auth";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD = 8;

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const b = (body ?? {}) as Record<string, unknown>;
  const email = typeof b.email === "string" ? b.email.trim().toLowerCase() : "";
  const password = typeof b.password === "string" ? b.password : "";
  const name = typeof b.name === "string" ? b.name.trim() : "";
  const role: UserRole = b.role === "student" ? "student" : "teacher";

  const errors: string[] = [];
  if (!EMAIL_RE.test(email)) errors.push("Enter a valid email address.");
  if (password.length < MIN_PASSWORD)
    errors.push(`Password must be at least ${MIN_PASSWORD} characters.`);
  if (errors.length > 0) {
    return NextResponse.json({ errors }, { status: 422 });
  }

  const result = await createUser({ email, password, name, role });
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 409 });
  }

  return NextResponse.json({ ok: true, role }, { status: 201 });
}
