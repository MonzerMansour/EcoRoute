import type { VehicleType } from "@/lib/types";

/**
 * Per-vehicle emission factors and capacities.
 * co2PerMile is kg CO2e for the whole vehicle (not per passenger),
 * based on typical US figures for school/charter fleets and light vehicles.
 */
export interface VehicleSpec {
  type: VehicleType;
  label: string;
  shortLabel: string;
  capacity: number;
  co2PerMile: number;
}

export const VEHICLE_SPECS: Record<VehicleType, VehicleSpec> = {
  school_bus: {
    type: "school_bus",
    label: "School bus",
    shortLabel: "Bus",
    capacity: 48,
    co2PerMile: 1.55,
  },
  minibus: {
    type: "minibus",
    label: "Minibus",
    shortLabel: "Minibus",
    capacity: 24,
    co2PerMile: 0.9,
  },
  van: {
    type: "van",
    label: "Passenger van",
    shortLabel: "Van",
    capacity: 12,
    co2PerMile: 0.45,
  },
  carpool: {
    type: "carpool",
    label: "Carpool (4-seat)",
    shortLabel: "Carpool",
    capacity: 4,
    co2PerMile: 0.36,
  },
  solo_car: {
    type: "solo_car",
    label: "Solo car",
    shortLabel: "Solo",
    capacity: 1,
    co2PerMile: 0.36,
  },
};

export const ALL_VEHICLE_TYPES = Object.keys(VEHICLE_SPECS) as VehicleType[];

/** Round a kg value to one decimal. */
export function roundKg(kg: number): number {
  return Math.round(kg * 10) / 10;
}

/** Format kg CO2 with sensible units (kg / tons). */
export function formatCo2(kg: number): string {
  if (Math.abs(kg) >= 1000) {
    return `${(kg / 1000).toFixed(2)} t`;
  }
  return `${roundKg(kg)} kg`;
}

/**
 * Emissions for transporting `rosterSize` people `distanceMiles` (one way)
 * using a single vehicle TYPE (filling vehicles to capacity).
 * Returns ROUND-TRIP emissions by default.
 */
export function emissionsForSingleType({
  vehicleType,
  rosterSize,
  distanceMiles,
  roundTrip = true,
}: {
  vehicleType: VehicleType;
  rosterSize: number;
  distanceMiles: number;
  roundTrip?: boolean;
}): { co2Kg: number; vehicleCount: number } {
  const spec = VEHICLE_SPECS[vehicleType];
  const vehicleCount = Math.max(1, Math.ceil(rosterSize / spec.capacity));
  const legs = roundTrip ? 2 : 1;
  const co2Kg = roundKg(vehicleCount * distanceMiles * spec.co2PerMile * legs);
  return { co2Kg, vehicleCount };
}

/**
 * Backwards-compatible helper used by the student pages: emissions for a
 * given total distance (already accounting for trips) on a vehicle type,
 * assuming the vehicle carries one "unit" of passengers.
 */
export function calculateTripEmissions({
  distanceMiles,
  vehicleType,
}: {
  distanceMiles: number;
  vehicleType: VehicleType;
}): { co2Kg: number } {
  const spec = VEHICLE_SPECS[vehicleType];
  return { co2Kg: roundKg(distanceMiles * spec.co2PerMile) };
}

/** Savings (kg) switching one unit from `from` to `to` over distance. */
export function estimateSavings(
  distanceMiles: number,
  from: VehicleType,
  to: VehicleType,
): number {
  const a = calculateTripEmissions({ distanceMiles, vehicleType: from });
  const b = calculateTripEmissions({ distanceMiles, vehicleType: to });
  return roundKg(a.co2Kg - b.co2Kg);
}
