import type { TripRepository } from "@/lib/data/repository";
import { MemoryTripRepository } from "@/lib/data/memory-repository";

let repo: TripRepository | null = null;

/**
 * Returns the active TripRepository.
 *
 * To switch to a real database later, implement TripRepository (e.g.
 * `PrismaTripRepository`) and return it here — nothing else in the app
 * needs to change. You can branch on an env var such as DATABASE_URL:
 *
 *   if (process.env.DATABASE_URL) return new PrismaTripRepository();
 */
export function getTripRepository(): TripRepository {
  if (!repo) {
    repo = new MemoryTripRepository();
  }
  return repo;
}

export type { TripRepository } from "@/lib/data/repository";
