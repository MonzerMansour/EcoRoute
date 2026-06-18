import { getSupabase, isSupabaseConfigured } from "@/lib/data/supabase-client";
import { hashPassword } from "@/lib/auth/password";
import type { UserRole } from "@/lib/auth";

const TABLE = "users";

export interface PersistUserInput {
  email: string;
  name?: string | null;
  image?: string | null;
  provider?: string | null;
  role?: UserRole;
}

export interface StoredUser {
  email: string;
  name: string | null;
  image: string | null;
  provider: string | null;
  role: UserRole;
  passwordHash: string | null;
}

export interface CreateUserInput {
  email: string;
  password: string;
  name?: string | null;
  role: UserRole;
}

// In-memory user store used when Supabase isn't configured (local dev / demo).
const memoryUsers = new Map<string, StoredUser>();
let seeded = false;

/** Demo accounts so the app is usable immediately without a database. */
export const DEMO_ACCOUNTS = [
  { email: "teacher@ecoroute.app", password: "ecoroute123", role: "teacher" as UserRole },
  { email: "student@ecoroute.app", password: "ecoroute123", role: "student" as UserRole },
];

async function ensureSeeded(): Promise<void> {
  if (seeded || isSupabaseConfigured()) return;
  seeded = true;
  for (const acct of DEMO_ACCOUNTS) {
    if (!memoryUsers.has(acct.email)) {
      memoryUsers.set(acct.email, {
        email: acct.email,
        name: acct.email.split("@")[0],
        image: null,
        provider: "credentials",
        role: acct.role,
        passwordHash: await hashPassword(acct.password),
      });
    }
  }
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/** Look up a user by email (across Supabase or the in-memory store). */
export async function findUserByEmail(
  email: string,
): Promise<StoredUser | null> {
  const key = normalizeEmail(email);

  if (isSupabaseConfigured()) {
    const supabase = getSupabase();
    if (!supabase) return null;
    const { data, error } = await supabase
      .from(TABLE)
      .select("email,name,image,provider,role,password_hash")
      .eq("email", key)
      .maybeSingle();
    if (error || !data) return null;
    return {
      email: data.email,
      name: data.name ?? null,
      image: data.image ?? null,
      provider: data.provider ?? null,
      role: (data.role as UserRole) ?? "teacher",
      passwordHash: data.password_hash ?? null,
    };
  }

  await ensureSeeded();
  return memoryUsers.get(key) ?? null;
}

/**
 * Create a credentials user with a hashed password.
 * Returns an error string if the email is already registered.
 */
export async function createUser(
  input: CreateUserInput,
): Promise<{ ok: boolean; error?: string }> {
  const email = normalizeEmail(input.email);
  const passwordHash = await hashPassword(input.password);
  const name = input.name?.trim() || email.split("@")[0];
  const now = new Date().toISOString();

  if (isSupabaseConfigured()) {
    const supabase = getSupabase();
    if (!supabase) return { ok: false, error: "Database unavailable." };
    const existing = await findUserByEmail(email);
    if (existing) return { ok: false, error: "An account with this email already exists." };
    const { error } = await supabase.from(TABLE).insert({
      email,
      name,
      role: input.role,
      provider: "credentials",
      password_hash: passwordHash,
      last_login_at: now,
      updated_at: now,
    });
    if (error) {
      console.error("[EcoRoute] createUser failed:", error);
      return { ok: false, error: "Could not create account." };
    }
    return { ok: true };
  }

  await ensureSeeded();
  if (memoryUsers.has(email)) {
    return { ok: false, error: "An account with this email already exists." };
  }
  memoryUsers.set(email, {
    email,
    name,
    image: null,
    provider: "credentials",
    role: input.role,
    passwordHash,
  });
  return { ok: true };
}

/**
 * Upsert a signed-in user (e.g. from Google OAuth) into the user store.
 * Never throws — a logging failure must not block sign-in.
 */
export async function persistUser(input: PersistUserInput): Promise<void> {
  const email = normalizeEmail(input.email);

  if (!isSupabaseConfigured()) {
    await ensureSeeded();
    const existing = memoryUsers.get(email);
    memoryUsers.set(email, {
      email,
      name: input.name ?? existing?.name ?? email.split("@")[0],
      image: input.image ?? existing?.image ?? null,
      provider: input.provider ?? existing?.provider ?? null,
      role: input.role ?? existing?.role ?? "teacher",
      passwordHash: existing?.passwordHash ?? null,
    });
    return;
  }

  const supabase = getSupabase();
  if (!supabase) return;
  const now = new Date().toISOString();
  try {
    await supabase.from(TABLE).upsert(
      {
        email,
        name: input.name ?? null,
        image: input.image ?? null,
        provider: input.provider ?? null,
        role: input.role ?? "teacher",
        last_login_at: now,
        updated_at: now,
      },
      { onConflict: "email" },
    );
  } catch (err) {
    console.error("[EcoRoute] persistUser failed:", err);
  }
}
