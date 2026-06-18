import { auth } from "@/lib/auth";

/** Demo owner used when no authenticated session is present (e.g. local dev). */
export const DEMO_OWNER_ID = "demo@ecoroute.app";

/**
 * Resolve the current data owner id (the coach's email).
 * Falls back to a shared demo owner so the dashboard is always populated.
 */
export async function getOwnerId(): Promise<string> {
  try {
    const session = await auth();
    return session?.user?.email ?? DEMO_OWNER_ID;
  } catch {
    return DEMO_OWNER_ID;
  }
}
