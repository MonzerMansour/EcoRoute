import { compareVehicleOptions } from "@/core/emissions";
import type { SportsTrip, VehicleRecommendation } from "@/teacher/types";

/** Rank vehicle options for an away trip using shared emissions logic. */
export function recommendVehiclesForTrip(trip: SportsTrip): VehicleRecommendation[] {
  const options = compareVehicleOptions(trip.distanceMiles, ["bus", "van", "carpool"]);

  const rationales: Record<string, string> = {
    bus: "Best for long hauls with full roster capacity.",
    van: "Efficient for medium distances with smaller squads.",
    carpool: "Ideal under ~15 miles when roster can split into shared rides.",
  };

  return options.map((result, index) => ({
    rank: index + 1,
    vehicleType: result.vehicleType as VehicleRecommendation["vehicleType"],
    co2Kg: result.co2Kg,
    rationale: rationales[result.vehicleType] ?? "Review capacity and distance.",
  }));
}
