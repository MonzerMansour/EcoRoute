import type { TripDraft, TripType, VehicleType } from "@/lib/types";
import { ALL_VEHICLE_TYPES } from "@/core/emissions";
import { MAX_ROSTER_SIZE } from "@/core/optimizer";

const TRIP_TYPES: TripType[] = ["away_game", "field_trip", "club", "scrimmage"];

/** Generous upper bound on one-way distance (miles) for a single trip. */
export const MAX_DISTANCE_MILES = 5000;
/** Max length for free-text fields, to bound storage and AI prompt size. */
const MAX_TEXT_LEN = 200;
const MAX_NOTES_LEN = 1000;

export interface ValidationResult {
  ok: boolean;
  draft?: TripDraft;
  errors: string[];
}

/** Trim, collapse control chars, and cap length of untrusted text. */
function sanitizeText(v: unknown, maxLen: number): string {
  if (typeof v !== "string") return "";
  // eslint-disable-next-line no-control-regex
  return v.replace(/[\u0000-\u001f\u007f]/g, " ").trim().slice(0, maxLen);
}

function asString(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

function asNumber(v: unknown): number {
  if (typeof v === "number") return v;
  if (typeof v === "string" && v.trim() !== "") return Number(v);
  return NaN;
}

/** True for a real calendar date in yyyy-mm-dd form. */
function isValidIsoDate(v: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return false;
  const d = new Date(`${v}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === v;
}

/** Parse + validate a trip draft from an untrusted request body. */
export function parseTripDraft(body: unknown): ValidationResult {
  const errors: string[] = [];
  const b = (body ?? {}) as Record<string, unknown>;

  const name = sanitizeText(b.name, MAX_TEXT_LEN);
  const opponent = sanitizeText(b.opponent, MAX_TEXT_LEN);
  const date = asString(b.date);
  const distanceMiles = asNumber(b.distanceMiles);
  const rosterSizeRaw = asNumber(b.rosterSize);
  const rosterSize = Number.isFinite(rosterSizeRaw)
    ? Math.round(rosterSizeRaw)
    : NaN;
  const tripTypeRaw = asString(b.tripType) as TripType;
  const departureTime = sanitizeText(b.departureTime, 20);
  const notes = sanitizeText(b.notes, MAX_NOTES_LEN);

  if (!name) errors.push("Trip name is required.");
  if (!opponent) errors.push("Opponent is required.");
  if (!date) errors.push("Date is required.");
  else if (!isValidIsoDate(date))
    errors.push("Date must be a valid calendar date (yyyy-mm-dd).");
  if (!Number.isFinite(distanceMiles) || distanceMiles <= 0)
    errors.push("Distance must be a positive number.");
  else if (distanceMiles > MAX_DISTANCE_MILES)
    errors.push(`Distance must be ${MAX_DISTANCE_MILES} miles or less.`);
  if (!Number.isFinite(rosterSize) || rosterSize <= 0)
    errors.push("Roster size must be a positive whole number.");
  else if (rosterSize > MAX_ROSTER_SIZE)
    errors.push(`Roster size must be ${MAX_ROSTER_SIZE} or fewer.`);
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
