/** Shared domain types used by both teacher and student interfaces. */

export type VehicleType = "bus" | "van" | "carpool" | "solo_car";

export interface EmissionsResult {
  vehicleType: VehicleType;
  distanceMiles: number;
  passengerCount: number;
  co2Kg: number;
}

export interface GeoPoint {
  label: string;
  lat: number;
  lng: number;
}

export interface Cluster {
  id: string;
  members: GeoPoint[];
  centroid: GeoPoint;
}
