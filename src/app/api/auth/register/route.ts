import { NextResponse } from "next/server";
import { createUser } from "@/lib/data/users";
import { createActivity } from "@/lib/data/events-store";
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
  const parentEmail =
    typeof b.parentEmail === "string" ? b.parentEmail.trim() : undefined;
  const activities = Array.isArray(b.activities)
    ? (b.activities as unknown[]).filter((a): a is string => typeof a === "string")
    : [];
  const school = typeof b.school === "string" ? b.school.trim() : "";

  const errors: string[] = [];
  if (!EMAIL_RE.test(email)) errors.push("Enter a valid email address.");
  if (password.length < MIN_PASSWORD)
    errors.push(`Password must be at least ${MIN_PASSWORD} characters.`);
  if (parentEmail && !EMAIL_RE.test(parentEmail))
    errors.push("Parent email address is not valid.");
  if (!school || school.length < 2) errors.push("School name is required.");
  if (errors.length > 0) {
    return NextResponse.json({ errors }, { status: 422 });
  }

  void parentEmail;

  const result = await createUser({ email, password, name, role });
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 409 });
  }

  // Auto-create activities for coordinators who listed what they coach
  if (role === "teacher" && activities.length > 0) {
    await Promise.all(
      activities.map((actName) =>
        createActivity({ name: actName, coordinatorId: email, school })
      )
    );
  }

  return NextResponse.json({ ok: true, role }, { status: 201 });
}
