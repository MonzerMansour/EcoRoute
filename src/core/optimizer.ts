import type { VehicleType, VehiclePlan, RankedVehiclePlan } from "@/lib/types";
import { VEHICLE_SPECS, roundKg } from "@/core/emissions";

const MIXING_TYPES_ORDER: VehicleType[] = [
  "school_bus",
  "minibus",
  "van",
  "carpool",
  "solo_car",
];

function planLabel(counts: Map<VehicleType, number>): string {
  const parts: string[] = [];
  for (const type of MIXING_TYPES_ORDER) {
    const count = counts.get(type) ?? 0;
    if (count > 0) {
      const spec = VEHICLE_SPECS[type];
      parts.push(`${count}× ${spec.shortLabel}`);
    }
  }
  return parts.join(" + ") || "No vehicles";
}

function planCo2(
  counts: Map<VehicleType, number>,
  distanceMiles: number,
  roundTrip: boolean,
): { co2Kg: number; seats: number } {
  const legs = roundTrip ? 2 : 1;
  let co2 = 0;
  let seats = 0;
  for (const [type, count] of counts) {
    const spec = VEHICLE_SPECS[type];
    co2 += count * distanceMiles * spec.co2PerMile * legs;
    seats += count * spec.capacity;
  }
  return { co2Kg: roundKg(co2), seats };
}

/**
 * Enumerate feasible vehicle configurations (including mixed setups) that can
 * seat `rosterSize`, ranked from lowest to highest round-trip CO2.
 *
 * This is the heart of the Vehicle Load Optimizer — sometimes 3 carpools beat
 * a bus, sometimes a single bus wins. We brute-force a bounded search space.
 */
export function optimizeVehicleLoad({
  rosterSize,
  distanceMiles,
  allowedVehicles,
  roundTrip = true,
  maxResults = 6,
}: {
  rosterSize: number;
  distanceMiles: number;
  allowedVehicles: VehicleType[];
  roundTrip?: boolean;
  maxResults?: number;
}): RankedVehiclePlan[] {
  const types = MIXING_TYPES_ORDER.filter((t) => allowedVehicles.includes(t));
  if (types.length === 0 || rosterSize <= 0) return [];

  const smallestCapacity = Math.min(
    ...types.map((t) => VEHICLE_SPECS[t].capacity),
  );

  const feasible: VehiclePlan[] = [];
  const seen = new Set<string>();

  const recurse = (index: number, counts: Map<VehicleType, number>, seats: number) => {
    if (index === types.length) {
      if (seats < rosterSize) return;
      // Prune wildly over-provisioned plans (waste more than one small vehicle).
      if (seats - rosterSize >= smallestCapacity && seats > rosterSize) {
        // still allow if it's a single-vehicle plan (e.g. one bus for 12)
        const totalVehicles = [...counts.values()].reduce((a, b) => a + b, 0);
        if (totalVehicles > 1) return;
      }
      const key = [...counts.entries()]
        .filter(([, c]) => c > 0)
        .map(([t, c]) => `${t}:${c}`)
        .sort()
        .join("|");
      if (!key || seen.has(key)) return;
      seen.add(key);
      const { co2Kg, seats: totalSeats } = planCo2(counts, distanceMiles, roundTrip);
      feasible.push({
        vehicles: [...counts.entries()]
          .filter(([, c]) => c > 0)
          .map(([type, count]) => ({ type, count })),
        totalSeats,
        co2Kg,
        label: planLabel(counts),
        rationale: "",
      });
      return;
    }

    const type = types[index];
    const spec = VEHICLE_SPECS[type];
    const remaining = Math.max(0, rosterSize - seats);
    // Cap count: enough to cover the remaining roster with this type, +1 slack.
    const maxCount = Math.min(
      Math.ceil(rosterSize / spec.capacity) + 1,
      Math.ceil(remaining / spec.capacity) + 1,
    );

    for (let count = 0; count <= maxCount; count++) {
      counts.set(type, count);
      recurse(index + 1, counts, seats + count * spec.capacity);
    }
    counts.set(type, 0);
  };

  recurse(0, new Map(), 0);

  feasible.sort((a, b) => a.co2Kg - b.co2Kg);
  const best = feasible[0]?.co2Kg ?? 0;

  return feasible.slice(0, maxResults).map((plan, i) => {
    const pctWorseThanBest =
      best > 0 ? Math.round(((plan.co2Kg - best) / best) * 100) : 0;
    return {
      ...plan,
      rank: i + 1,
      pctWorseThanBest,
      rationale: buildRationale(plan, i, pctWorseThanBest, distanceMiles),
    };
  });
}

function buildRationale(
  plan: VehiclePlan,
  index: number,
  pctWorseThanBest: number,
  distanceMiles: number,
): string {
  if (index === 0) {
    return `Lowest-emission option for ${distanceMiles} mi each way (${plan.totalSeats} seats).`;
  }
  return `Produces ${pctWorseThanBest}% more CO₂ than the best option.`;
}

/** Convenience: the single optimal plan (or null). */
export function optimalPlan(args: {
  rosterSize: number;
  distanceMiles: number;
  allowedVehicles: VehicleType[];
  roundTrip?: boolean;
}): RankedVehiclePlan | null {
  return optimizeVehicleLoad({ ...args, maxResults: 1 })[0] ?? null;
}
