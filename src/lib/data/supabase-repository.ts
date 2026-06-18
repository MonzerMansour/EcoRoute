import type { Trip, TripDraft, VehicleType } from "@/lib/types";
import type { TripRepository } from "@/lib/data/repository";
import { getSupabase } from "@/lib/data/supabase-client";

const TABLE = "trips";

const DEFAULT_ALLOWED: VehicleType[] = [
  "school_bus",
  "minibus",
  "van",
  "carpool",
];

/** Shape of a row in the Supabase `trips` table (snake_case columns). */
interface TripRow {
  id: string;
  owner_id: string;
  name: string;
  opponent: string;
  date: string;
  distance_miles: number;
  roster_size: number;
  trip_type: Trip["tripType"];
  departure_time: string | null;
  allowed_vehicles: VehicleType[] | null;
  chosen_vehicle_type: VehicleType | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

function rowToTrip(row: TripRow): Trip {
  return {
    id: row.id,
    ownerId: row.owner_id,
    name: row.name,
    opponent: row.opponent,
    date: row.date,
    distanceMiles: Number(row.distance_miles),
    rosterSize: Number(row.roster_size),
    tripType: row.trip_type,
    departureTime: row.departure_time ?? undefined,
    allowedVehicles: row.allowed_vehicles ?? DEFAULT_ALLOWED,
    chosenVehicleType: row.chosen_vehicle_type ?? undefined,
    notes: row.notes ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function draftToRow(ownerId: string, draft: Partial<TripDraft>) {
  const row: Record<string, unknown> = {};
  if (draft.name !== undefined) row.name = draft.name;
  if (draft.opponent !== undefined) row.opponent = draft.opponent;
  if (draft.date !== undefined) row.date = draft.date;
  if (draft.distanceMiles !== undefined) row.distance_miles = draft.distanceMiles;
  if (draft.rosterSize !== undefined) row.roster_size = draft.rosterSize;
  if (draft.tripType !== undefined) row.trip_type = draft.tripType;
  if (draft.departureTime !== undefined)
    row.departure_time = draft.departureTime || null;
  if (draft.allowedVehicles !== undefined)
    row.allowed_vehicles = draft.allowedVehicles;
  if (draft.chosenVehicleType !== undefined)
    row.chosen_vehicle_type = draft.chosenVehicleType || null;
  if (draft.notes !== undefined) row.notes = draft.notes || null;
  row.owner_id = ownerId;
  return row;
}

const SEED: TripDraft[] = [
  {
    name: "Varsity Basketball @ Riverside",
    opponent: "Riverside High",
    date: "2026-01-14",
    distanceMiles: 8,
    rosterSize: 14,
    tripType: "away_game",
    departureTime: "16:00",
    allowedVehicles: DEFAULT_ALLOWED,
    chosenVehicleType: "school_bus",
  },
  {
    name: "Soccer @ Lakeside",
    opponent: "Lakeside Prep",
    date: "2026-01-22",
    distanceMiles: 28,
    rosterSize: 22,
    tripType: "away_game",
    departureTime: "15:30",
    allowedVehicles: DEFAULT_ALLOWED,
    chosenVehicleType: "school_bus",
  },
  {
    name: "Track Meet @ Mountain View",
    opponent: "Mountain View HS",
    date: "2026-02-03",
    distanceMiles: 64,
    rosterSize: 30,
    tripType: "away_game",
    departureTime: "07:00",
    allowedVehicles: DEFAULT_ALLOWED,
    chosenVehicleType: "school_bus",
  },
  {
    name: "Swim @ Northgate",
    opponent: "Northgate Academy",
    date: "2026-02-11",
    distanceMiles: 12,
    rosterSize: 10,
    tripType: "away_game",
    departureTime: "16:15",
    allowedVehicles: DEFAULT_ALLOWED,
  },
  {
    name: "District Finals @ Central",
    opponent: "Central High",
    date: "2026-02-25",
    distanceMiles: 41,
    rosterSize: 18,
    tripType: "away_game",
    departureTime: "14:00",
    allowedVehicles: DEFAULT_ALLOWED,
    chosenVehicleType: "van",
  },
];

/**
 * Supabase-backed implementation of TripRepository.
 *
 * Mirrors MemoryTripRepository behaviour, including seeding a sample season
 * the first time a brand-new owner has zero trips so the dashboard is never
 * empty. Disable seeding with SUPABASE_SEED=false.
 */
export class SupabaseTripRepository implements TripRepository {
  private client() {
    const c = getSupabase();
    if (!c) throw new Error("Supabase is not configured.");
    return c;
  }

  async listTrips(ownerId: string): Promise<Trip[]> {
    const { data, error } = await this.client()
      .from(TABLE)
      .select("*")
      .eq("owner_id", ownerId)
      .order("date", { ascending: true });

    if (error) throw new Error(`Supabase listTrips failed: ${error.message}`);

    if ((data?.length ?? 0) === 0 && process.env.SUPABASE_SEED !== "false") {
      return this.seed(ownerId);
    }
    return (data as TripRow[]).map(rowToTrip);
  }

  private async seed(ownerId: string): Promise<Trip[]> {
    const rows = SEED.map((d) => draftToRow(ownerId, d));
    const { data, error } = await this.client()
      .from(TABLE)
      .insert(rows)
      .select("*");
    if (error) {
      // Seeding is best-effort; never block the dashboard on it.
      console.error("[EcoRoute] Supabase seed failed:", error.message);
      return [];
    }
    return (data as TripRow[]).map(rowToTrip).sort((a, b) =>
      a.date.localeCompare(b.date),
    );
  }

  async getTrip(ownerId: string, id: string): Promise<Trip | null> {
    const { data, error } = await this.client()
      .from(TABLE)
      .select("*")
      .eq("owner_id", ownerId)
      .eq("id", id)
      .maybeSingle();
    if (error) throw new Error(`Supabase getTrip failed: ${error.message}`);
    return data ? rowToTrip(data as TripRow) : null;
  }

  async createTrip(ownerId: string, draft: TripDraft): Promise<Trip> {
    const { data, error } = await this.client()
      .from(TABLE)
      .insert(draftToRow(ownerId, draft))
      .select("*")
      .single();
    if (error) throw new Error(`Supabase createTrip failed: ${error.message}`);
    return rowToTrip(data as TripRow);
  }

  async updateTrip(
    ownerId: string,
    id: string,
    draft: Partial<TripDraft>,
  ): Promise<Trip | null> {
    const { data, error } = await this.client()
      .from(TABLE)
      .update({ ...draftToRow(ownerId, draft), updated_at: new Date().toISOString() })
      .eq("owner_id", ownerId)
      .eq("id", id)
      .select("*")
      .maybeSingle();
    if (error) throw new Error(`Supabase updateTrip failed: ${error.message}`);
    return data ? rowToTrip(data as TripRow) : null;
  }

  async deleteTrip(ownerId: string, id: string): Promise<boolean> {
    const { data, error } = await this.client()
      .from(TABLE)
      .delete()
      .eq("owner_id", ownerId)
      .eq("id", id)
      .select("id");
    if (error) throw new Error(`Supabase deleteTrip failed: ${error.message}`);
    return (data?.length ?? 0) > 0;
  }
}
