import type { TripDraft, TripType, VehicleType } from "@/lib/types";
import { ALL_VEHICLE_TYPES } from "@/core/emissions";

const TRIP_TYPES: TripType[] = ["away_game", "field_trip", "club", "scrimmage"];

export interface ValidationResult {
  ok: boolean;
  draft?: TripDraft;
  errors: string[];
}

function asString(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

function asNumber(v: unknown): number {
  if (typeof v === "number") return v;
  if (typeof v === "string" && v.trim() !== "") return Number(v);
  return NaN;
}

/** Parse + validate a trip draft from an untrusted request body. */
export function parseTripDraft(body: unknown): ValidationResult {
  const errors: string[] = [];
  const b = (body ?? {}) as Record<string, unknown>;

  const name = asString(b.name);
  const opponent = asString(b.opponent);
  const date = asString(b.date);
  const distanceMiles = asNumber(b.distanceMiles);
  const rosterSize = asNumber(b.rosterSize);
  const tripTypeRaw = asString(b.tripType) as TripType;
  const departureTime = asString(b.departureTime);
  const notes = asString(b.notes);

  if (!name) errors.push("Trip name is required.");
  if (!opponent) errors.push("Opponent is required.");
  if (!date) errors.push("Date is required.");
  if (!Number.isFinite(distanceMiles) || distanceMiles <= 0)
    errors.push("Distance must be a positive number.");
  if (!Number.isFinite(rosterSize) || rosterSize <= 0)
    errors.push("Roster size must be a positive number.");
  const tripType = TRIP_TYPES.includes(tripTypeRaw) ? tripTypeRaw : "away_game";

  let allowedVehicles: VehicleType[] = [];
  if (Array.isArray(b.allowedVehicles)) {
    allowedVehicles = (b.allowedVehicles as unknown[])
      .map((v) => asString(v) as VehicleType)
      .filter((v) => ALL_VEHICLE_TYPES.includes(v));
  }
  if (allowedVehicles.length === 0) {
    allowedVehicles = ["school_bus", "minibus", "van", "carpool"];
  }

  let chosenVehicleType: VehicleType | undefined;
  const chosenRaw = asString(b.chosenVehicleType) as VehicleType;
  if (chosenRaw && ALL_VEHICLE_TYPES.includes(chosenRaw)) {
    chosenVehicleType = chosenRaw;
  }

  if (errors.length > 0) return { ok: false, errors };

  return {
    ok: true,
    errors: [],
    draft: {
      name,
      opponent,
      date,
      distanceMiles,
      rosterSize,
      tripType,
      departureTime: departureTime || undefined,
      allowedVehicles,
      chosenVehicleType,
      notes: notes || undefined,
    },
  };
}
