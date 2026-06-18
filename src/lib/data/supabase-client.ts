import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Server-side Supabase client using the service-role key.
 *
 * All EcoRoute database access happens on the server (API routes, server
 * components, and auth callbacks), so we use the service-role key and rely on
 * the app's own auth + owner scoping for security. Never expose this key to
 * the browser.
 */

let cached: SupabaseClient | null = null;

/**
 * Normalize a pasted Supabase URL to the bare project origin.
 *
 * supabase-js expects `https://<ref>.supabase.co` and appends `/rest/v1/`
 * itself. Users frequently paste the full Data API URL (…/rest/v1/) from the
 * dashboard, which would otherwise produce a doubled, broken path. We strip any
 * `/rest/v1` suffix and trailing slashes so either form works.
 */
export function normalizeSupabaseUrl(raw: string): string {
  let url = raw.trim().replace(/\/+$/, "");
  url = url.replace(/\/rest\/v1$/i, "");
  return url.replace(/\/+$/, "");
}

export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.SUPABASE_URL?.trim() &&
      process.env.SUPABASE_SERVICE_ROLE_KEY?.trim(),
  );
}

export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null;
  if (!cached) {
    cached = createClient(
      normalizeSupabaseUrl(process.env.SUPABASE_URL!),
      process.env.SUPABASE_SERVICE_ROLE_KEY!.trim(),
      {
        auth: { persistSession: false, autoRefreshToken: false },
      },
    );
  }
  return cached;
}
