import type { TripRepository } from "@/lib/data/repository";
import { MemoryTripRepository } from "@/lib/data/memory-repository";
import { SupabaseTripRepository } from "@/lib/data/supabase-repository";
import { isSupabaseConfigured } from "@/lib/data/supabase-client";

let repo: TripRepository | null = null;

/**
 * Returns the active TripRepository.
 *
 * If Supabase env vars (SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY) are present,
 * trips persist in Postgres. Otherwise we fall back to an in-memory store so
 * local development works with zero config.
 *
 * To use a different database later, implement TripRepository and return it
 * here — nothing else in the app needs to change.
 */
export function getTripRepository(): TripRepository {
  if (!repo) {
    repo = isSupabaseConfigured()
      ? new SupabaseTripRepository()
      : new MemoryTripRepository();
  }
  return repo;
}

export type { TripRepository } from "@/lib/data/repository";
