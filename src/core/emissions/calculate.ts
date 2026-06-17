import { CO2_GRAMS_PER_MILE, DEFAULT_OCCUPANCY } from "@/core/emissions/constants";
import type { EmissionsResult, VehicleType } from "@/core/types";

export interface TripEmissionsInput {
  distanceMiles: number;
  vehicleType: VehicleType;
  passengerCount?: number;
}

/** Calculate trip CO₂ in kilograms for a given vehicle configuration. */
export function calculateTripEmissions(input: TripEmissionsInput): EmissionsResult {
  const { distanceMiles, vehicleType } = input;
  const passengerCount = input.passengerCount ?? DEFAULT_OCCUPANCY[vehicleType];
  const gramsPerMile = CO2_GRAMS_PER_MILE[vehicleType];
  const co2Kg = (gramsPerMile * distanceMiles) / 1000;

  return {
    vehicleType,
    distanceMiles,
    passengerCount,
    co2Kg: Math.round(co2Kg * 100) / 100,
  };
}

/** Compare multiple vehicle options and return them sorted by lowest emissions. */
export function compareVehicleOptions(
  distanceMiles: number,
  options: VehicleType[],
): EmissionsResult[] {
  return options
    .map((vehicleType) => calculateTripEmissions({ distanceMiles, vehicleType }))
    .sort((a, b) => a.co2Kg - b.co2Kg);
}

/** Estimate CO₂ savings when switching from baseline to optimized vehicle. */
export function estimateSavings(
  distanceMiles: number,
  baseline: VehicleType,
  optimized: VehicleType,
): number {
  const baselineCo2 = calculateTripEmissions({ distanceMiles, vehicleType: baseline }).co2Kg;
  const optimizedCo2 = calculateTripEmissions({ distanceMiles, vehicleType: optimized }).co2Kg;
  return Math.max(0, Math.round((baselineCo2 - optimizedCo2) * 100) / 100);
}
