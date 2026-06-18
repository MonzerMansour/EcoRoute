import type {
  Trip,
  VehicleType,
  Recommendation,
  TripEmissionSummary,
  SeasonSummary,
  VehiclePlan,
} from "@/lib/types";
import { ALL_VEHICLE_TYPES, VEHICLE_SPECS, roundKg } from "@/core/emissions";
import { optimizeVehicleLoad, optimalPlan } from "@/core/optimizer";

function allowedOrAll(trip: Trip): VehicleType[] {
  return trip.allowedVehicles.length > 0
    ? trip.allowedVehicles
    : ALL_VEHICLE_TYPES;
}

/** Single-type plan for a chosen vehicle (round trip). */
function chosenPlan(trip: Trip): VehiclePlan | null {
  if (!trip.chosenVehicleType) return null;
  const single = optimizeVehicleLoad({
    rosterSize: trip.rosterSize,
    distanceMiles: trip.distanceMiles,
    allowedVehicles: [trip.chosenVehicleType],
    maxResults: 1,
  })[0];
  return single ?? null;
}

export function summarizeTrip(trip: Trip): TripEmissionSummary {
  const optimal =
    optimalPlan({
      rosterSize: trip.rosterSize,
      distanceMiles: trip.distanceMiles,
      allowedVehicles: allowedOrAll(trip),
    }) ??
    ({
      vehicles: [],
      totalSeats: 0,
      co2Kg: 0,
      label: "—",
      rationale: "",
    } as VehiclePlan);

  const baseline =
    optimizeVehicleLoad({
      rosterSize: trip.rosterSize,
      distanceMiles: trip.distanceMiles,
      allowedVehicles: ["school_bus"],
      maxResults: 1,
    })[0]?.co2Kg ?? optimal.co2Kg;

  const chosen = chosenPlan(trip);
  const co2Kg = chosen ? chosen.co2Kg : optimal.co2Kg;

  return {
    trip,
    co2Kg,
    optimalCo2Kg: optimal.co2Kg,
    baselineCo2Kg: baseline,
    optimalPlan: optimal,
  };
}

/** Per-trip smart recommendations (distance + load + chosen-plan gaps). */
export function generateTripRecommendations(trip: Trip): Recommendation[] {
  const recs: Recommendation[] = [];
  const { distanceMiles, rosterSize } = trip;
  const allowed = allowedOrAll(trip);
  const summary = summarizeTrip(trip);

  // 1. Chosen plan is worse than optimal.
  if (trip.chosenVehicleType) {
    const gap = roundKg(summary.co2Kg - summary.optimalCo2Kg);
    if (gap > 1) {
      const pct = Math.round((gap / summary.co2Kg) * 100);
      recs.push({
        id: `${trip.id}-switch`,
        tripId: trip.id,
        title: `Switch to ${summary.optimalPlan.label} for ${trip.name}`,
        detail: `The chosen ${VEHICLE_SPECS[trip.chosenVehicleType].label.toLowerCase()} setup emits ${gap} kg more CO₂ than ${summary.optimalPlan.label}. That's about ${pct}% of this trip's footprint.`,
        co2SavingsKg: gap,
        severity: gap > 50 ? "high" : gap > 15 ? "medium" : "low",
      });
    }
  }

  // 2. Distance-based guidance.
  if (distanceMiles < 15 && allowed.includes("carpool")) {
    const carpool = optimizeVehicleLoad({
      rosterSize,
      distanceMiles,
      allowedVehicles: ["carpool"],
      maxResults: 1,
    })[0];
    const bus = optimizeVehicleLoad({
      rosterSize,
      distanceMiles,
      allowedVehicles: ["school_bus"],
      maxResults: 1,
    })[0];
    if (carpool && bus) {
      const save = roundKg(bus.co2Kg - carpool.co2Kg);
      recs.push({
        id: `${trip.id}-short-carpool`,
        tripId: trip.id,
        title: `Under 15 miles → carpool ${trip.name}`,
        detail: `At ${distanceMiles} mi each way, ${carpool.label} carries ${rosterSize} players and saves ~${save} kg vs a school bus.`,
        co2SavingsKg: Math.max(0, save),
        severity: "medium",
      });
    }
  } else if (distanceMiles >= 15 && distanceMiles <= 40 && allowed.includes("van")) {
    const vans = optimizeVehicleLoad({
      rosterSize,
      distanceMiles,
      allowedVehicles: ["van"],
      maxResults: 1,
    })[0];
    const bus = optimizeVehicleLoad({
      rosterSize,
      distanceMiles,
      allowedVehicles: ["school_bus"],
      maxResults: 1,
    })[0];
    if (vans && bus && vans.co2Kg < bus.co2Kg) {
      const save = roundKg(bus.co2Kg - vans.co2Kg);
      const pct = Math.round((save / bus.co2Kg) * 100);
      recs.push({
        id: `${trip.id}-medium-vans`,
        tripId: trip.id,
        title: `Roster of ${rosterSize} → ${vans.label} for ${trip.name}`,
        detail: `${vans.label} produces ${pct}% less CO₂ than a bus over ${distanceMiles} mi (saves ~${save} kg).`,
        co2SavingsKg: save,
        severity: save > 30 ? "high" : "medium",
      });
    }
  } else if (distanceMiles > 40 && allowed.includes("school_bus")) {
    recs.push({
      id: `${trip.id}-long-bus`,
      tripId: trip.id,
      title: `Long haul → consolidate ${trip.name} onto one bus`,
      detail: `At ${distanceMiles} mi each way, a single consolidated school bus is usually the lowest-emission and simplest option for ${rosterSize} players.`,
      co2SavingsKg: 0,
      severity: "low",
    });
  }

  return recs;
}

/** Build the full Season Emissions Dashboard model from a list of trips. */
export function buildSeasonSummary(trips: Trip[]): SeasonSummary {
  const perTrip = trips.map(summarizeTrip);

  const totalCo2Kg = roundKg(perTrip.reduce((s, t) => s + t.co2Kg, 0));
  const optimalTotalCo2Kg = roundKg(
    perTrip.reduce((s, t) => s + t.optimalCo2Kg, 0),
  );
  const baselineTotalCo2Kg = roundKg(
    perTrip.reduce((s, t) => s + t.baselineCo2Kg, 0),
  );

  const rankedTrips = [...perTrip].sort((a, b) => b.co2Kg - a.co2Kg);

  // Gather all recommendations across trips.
  const allRecs = trips.flatMap(generateTripRecommendations);

  // Opponent-swap suggestion for the single highest-distance away game.
  const awayGames = perTrip.filter((t) => t.trip.tripType === "away_game");
  if (awayGames.length >= 2) {
    const sortedByDist = [...awayGames].sort(
      (a, b) => b.trip.distanceMiles - a.trip.distanceMiles,
    );
    const farthest = sortedByDist[0];
    const median =
      sortedByDist[Math.floor(sortedByDist.length / 2)].trip.distanceMiles;
    if (farthest.trip.distanceMiles > median * 1.5) {
      const ratio = median / farthest.trip.distanceMiles;
      const save = roundKg(farthest.co2Kg * (1 - ratio));
      const pct = Math.round((1 - ratio) * 100);
      allRecs.push({
        id: `${farthest.trip.id}-swap`,
        tripId: farthest.trip.id,
        title: `Consider a closer opponent than ${farthest.trip.opponent}`,
        detail: `${farthest.trip.name} (${farthest.trip.distanceMiles} mi) is your farthest away game. Swapping for an opponent near your median distance (${median} mi) could cut ~${pct}% of its emissions (~${save} kg).`,
        co2SavingsKg: save,
        severity: "high",
      });
    }
  }

  const recommendations = allRecs
    .sort((a, b) => b.co2SavingsKg - a.co2SavingsKg)
    .slice(0, 8);

  return {
    totalCo2Kg,
    optimalTotalCo2Kg,
    baselineTotalCo2Kg,
    potentialSavingsKg: roundKg(totalCo2Kg - optimalTotalCo2Kg),
    tripCount: trips.length,
    perTrip,
    rankedTrips,
    recommendations,
  };
}

/** The top 3 highest-impact changes for the season. */
export function topImpactChanges(summary: SeasonSummary): Recommendation[] {
  return summary.recommendations.filter((r) => r.co2SavingsKg > 0).slice(0, 3);
}
