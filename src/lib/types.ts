// Shared domain types for EcoRoute.
// These are intentionally framework-agnostic so they can back either an
// in-memory store today or a real database later.

export type VehicleType =
  | "school_bus"
  | "minibus"
  | "van"
  | "carpool"
  | "solo_car";

export type TripType =
  | "away_game"
  | "field_trip"
  | "club"
  | "scrimmage"
  | "community_service"
  | "conference"
  | "tournament"
  | "other";

/** A vehicle the school has access to, with how many are available. */
export interface FleetVehicle {
  type: VehicleType;
  /** How many of this vehicle type the school can deploy. 0 = unavailable. */
  available: number;
}

/** A single planned trip (one away game / event leg). */
export interface Trip {
  id: string;
  /** Owning user (email) — makes multi-tenant DB integration trivial later. */
  ownerId: string;
  name: string;
  opponent: string;
  /** ISO date string (yyyy-mm-dd). */
  date: string;
  /** One-way distance in miles. Round trips are modelled as 2x. */
  distanceMiles: number;
  rosterSize: number;
  tripType: TripType;
  departureTime?: string;
  /** Vehicle types the coach is willing to use for this trip. */
  allowedVehicles: VehicleType[];
  /** The plan the coach has chosen (optional until decided). */
  chosenVehicleType?: VehicleType;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

/** Payload used to create/update a trip (no server-managed fields). */
export interface TripDraft {
  name: string;
  opponent: string;
  date: string;
  distanceMiles: number;
  rosterSize: number;
  tripType: TripType;
  departureTime?: string;
  allowedVehicles: VehicleType[];
  chosenVehicleType?: VehicleType;
  notes?: string;
}

/** A specific allocation of vehicles for a trip. */
export interface VehiclePlan {
  /** Counts per vehicle type used. */
  vehicles: { type: VehicleType; count: number }[];
  totalSeats: number;
  /** Round-trip CO2 in kg. */
  co2Kg: number;
  label: string;
  rationale: string;
}

export interface RankedVehiclePlan extends VehiclePlan {
  rank: number;
  /** % more CO2 than the best option (0 for the best). */
  pctWorseThanBest: number;
}

export type RecommendationSeverity = "high" | "medium" | "low";

export interface Recommendation {
  id: string;
  tripId?: string;
  title: string;
  detail: string;
  /** Estimated kg CO2 saved if applied. */
  co2SavingsKg: number;
  severity: RecommendationSeverity;
}

export interface TripEmissionSummary {
  trip: Trip;
  /** CO2 of the chosen plan (or optimal if none chosen), round trip. */
  co2Kg: number;
  /** CO2 of the optimal plan, round trip. */
  optimalCo2Kg: number;
  /** CO2 of an all-bus baseline, round trip. */
  baselineCo2Kg: number;
  optimalPlan: VehiclePlan;
}

export interface SeasonSummary {
  totalCo2Kg: number;
  optimalTotalCo2Kg: number;
  baselineTotalCo2Kg: number;
  /** Potential savings if every trip used its optimal plan. */
  potentialSavingsKg: number;
  tripCount: number;
  perTrip: TripEmissionSummary[];
  /** Trips ranked highest-emission first. */
  rankedTrips: TripEmissionSummary[];
  recommendations: Recommendation[];
}
