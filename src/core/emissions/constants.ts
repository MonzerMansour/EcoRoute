/** EPA-style average CO₂ grams per mile by vehicle type (placeholder values). */

import type { VehicleType } from "@/core/types";

export const CO2_GRAMS_PER_MILE: Record<VehicleType, number> = {
  bus: 890,
  van: 520,
  carpool: 280,
  solo_car: 404,
};

export const DEFAULT_OCCUPANCY: Record<VehicleType, number> = {
  bus: 40,
  van: 8,
  carpool: 3,
  solo_car: 1,
};
