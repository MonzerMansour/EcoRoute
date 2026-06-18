import type { Trip, TripDraft } from "@/lib/types";

/**
 * Data-access contract for teacher trips.
 *
 * The rest of the app only ever talks to this interface, so swapping the
 * in-memory store for Postgres / Prisma / Supabase later is a one-file change:
 * implement TripRepository and return it from `getTripRepository()`.
 *
 * Every method is async and scoped by `ownerId` (the coach's email) so the
 * same contract works for a real multi-tenant database without changes.
 */
export interface TripRepository {
  listTrips(ownerId: string): Promise<Trip[]>;
  getTrip(ownerId: string, id: string): Promise<Trip | null>;
  createTrip(ownerId: string, draft: TripDraft): Promise<Trip>;
  updateTrip(
    ownerId: string,
    id: string,
    draft: Partial<TripDraft>,
  ): Promise<Trip | null>;
  deleteTrip(ownerId: string, id: string): Promise<boolean>;
}
