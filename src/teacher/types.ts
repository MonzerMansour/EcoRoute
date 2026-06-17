/** Teacher/coach domain types — extend as the interface grows. */

export type TripType = "away_game" | "tournament" | "scrimmage" | "other";

export interface SportsTrip {
  id: string;
  name: string;
  opponent: string;
  date: string;
  distanceMiles: number;
  rosterSize: number;
  tripType: TripType;
}

export interface VehicleRecommendation {
  rank: number;
  vehicleType: "bus" | "van" | "carpool";
  co2Kg: number;
  rationale: string;
}

export interface SeasonEmissionsSummary {
  totalTrips: number;
  totalCo2Kg: number;
  topRecommendations: VehicleRecommendation[];
}
