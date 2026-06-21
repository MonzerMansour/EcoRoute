import { VEHICLE_SPECS, roundKg } from "@/core/emissions";

export type CommuteMode = "solo_car" | "carpool" | "bus";

/** A selectable neighborhood with fixed coordinates (no GPS/geocoding needed). */
export interface NeighborhoodOption {
  id: string;
  label: string;
  lat: number;
  lng: number;
  /** Typical one-way distance to school (miles). */
  distanceMiles: number;
}

export const NEIGHBORHOODS: NeighborhoodOption[] = [
  { id: "oak", label: "Oak St", lat: 42.35, lng: -71.08, distanceMiles: 3.2 },
  { id: "oak_n", label: "Oak St North", lat: 42.351, lng: -71.081, distanceMiles: 3.5 },
  { id: "maple", label: "Maple Ave", lat: 42.36, lng: -71.09, distanceMiles: 4.1 },
  { id: "maple_e", label: "Maple East", lat: 42.361, lng: -71.089, distanceMiles: 4.3 },
  { id: "river", label: "Riverside", lat: 42.34, lng: -71.10, distanceMiles: 5.6 },
  { id: "hill", label: "Hillcrest", lat: 42.37, lng: -71.07, distanceMiles: 6.2 },
  { id: "downtown", label: "Downtown", lat: 42.355, lng: -71.06, distanceMiles: 2.4 },
  { id: "lakeside", label: "Lakeside", lat: 42.33, lng: -71.11, distanceMiles: 7.8 },
];

export function neighborhoodById(id: string): NeighborhoodOption | undefined {
  return NEIGHBORHOODS.find((n) => n.id === id);
}

/** A person's commute entry (student or parent). */
export interface CommuteEntry {
  id: string;
  studentName: string;
  neighborhoodId: string;
  /** Optional display label override (e.g. from manual zip/neighborhood entry). */
  customNeighborhoodLabel?: string;
  commuteMode: CommuteMode;
  /** Seats they could offer if driving. */
  seatsAvailable: number;
  /** Preferred departure time (HH:MM), optional. */
  departureTime?: string;
  /** Preferred return time (HH:MM), optional. */
  returnTime?: string;
}

/** Back-compat shape used by older sample data. */
export interface NeighborhoodEntry {
  id: string;
  studentName: string;
  neighborhood: string;
  lat: number;
  lng: number;
  commuteMode: CommuteMode;
}

export interface CarpoolCluster {
  clusterId: string;
  memberCount: number;
  neighborhoods: string[];
  members: CommuteEntry[];
  /** Suggested pickup order (farthest from school first). */
  pickupOrder: string[];
  totalSeats: number;
  /** kg CO2 saved per round-trip day if this cluster carpools vs current modes. */
  dailySavingsKg: number;
}

const CLUSTER_RADIUS = 0.02; // ~1.5 km in lat/lng degrees
const SCHOOL_DAYS = 180;

function coordsFor(entry: CommuteEntry): NeighborhoodOption | undefined {
  return neighborhoodById(entry.neighborhoodId);
}

function geoDistance(a: NeighborhoodOption, b: NeighborhoodOption): number {
  const dlat = a.lat - b.lat;
  const dlng = a.lng - b.lng;
  return Math.sqrt(dlat * dlat + dlng * dlng);
}

/** Round-trip solo-car CO2 for one person commuting from a neighborhood. */
function soloDailyKg(opt: NeighborhoodOption): number {
  return roundKg(opt.distanceMiles * 0.411 * 2);
}

/**
 * Group entries into carpool clusters by proximity, capped at 4 per car.
 * Returns clusters with pickup order and estimated daily CO2 savings.
 */
export function buildClusters(entries: CommuteEntry[]): CarpoolCluster[] {
  const clusters: CarpoolCluster[] = [];
  const used = new Set<string>();

  for (const entry of entries) {
    if (used.has(entry.id)) continue;
    const base = coordsFor(entry);
    if (!base) continue;

    const nearby = entries.filter((e) => {
      if (used.has(e.id) || e.id === entry.id) return false;
      const c = coordsFor(e);
      return c ? geoDistance(base, c) < CLUSTER_RADIUS : false;
    });

    // Cap at 4 people per carpool (one car).
    const members = [entry, ...nearby].slice(0, 4);
    members.forEach((m) => used.add(m.id));

    const memberOpts = members
      .map((m) => ({ m, opt: coordsFor(m)! }))
      .filter((x) => x.opt);

    // CO2 before: each member by their current mode (bus riders already low).
    const before = memberOpts.reduce((sum, { m, opt }) => {
      if (m.commuteMode === "bus") return sum; // assume bus is shared/baseline
      const cars = m.commuteMode === "carpool" ? 0.5 : 1; // rough current sharing
      return sum + soloDailyKg(opt) * cars;
    }, 0);
    // CO2 after: one shared car covering the farthest distance in the cluster.
    const farthest = Math.max(...memberOpts.map((x) => x.opt.distanceMiles));
    const after = roundKg(farthest * (0.411 / Math.max(1, members.length)) * 2);
    const dailySavingsKg = roundKg(Math.max(0, before - after));

    const pickupOrder = [...memberOpts]
      .sort((a, b) => b.opt.distanceMiles - a.opt.distanceMiles)
      .map((x) => x.m.studentName);

    clusters.push({
      clusterId: `Cluster ${clusters.length + 1}`,
      memberCount: members.length,
      neighborhoods: [
        ...new Set(memberOpts.map((x) => x.opt.label)),
      ],
      members,
      pickupOrder,
      totalSeats: members.reduce((s, m) => s + (m.seatsAvailable || 0), 0),
      dailySavingsKg,
    });
  }

  return clusters;
}

export interface SavingsScenario {
  /** Fraction of eligible solo drivers who carpool (0–1). */
  participation: number;
  dailyKg: number;
  yearlyKg: number;
}

export interface SavingsSummary {
  soloDrivers: number;
  potentialDailyKg: number;
  scenarios: SavingsScenario[];
}

/**
 * Estimate CO2 savings if a fraction of solo drivers joined carpools.
 * Scenarios mirror the spec: 30%, 50%, 70% participation.
 */
export function estimateSavings(
  entries: CommuteEntry[],
  participations: number[] = [0.3, 0.5, 0.7],
): SavingsSummary {
  const clusters = buildClusters(entries);
  const potentialDailyKg = roundKg(
    clusters.reduce((s, c) => s + c.dailySavingsKg, 0),
  );
  const soloDrivers = entries.filter((e) => e.commuteMode === "solo_car").length;

  const scenarios = participations.map((participation) => {
    const dailyKg = roundKg(potentialDailyKg * participation);
    return {
      participation,
      dailyKg,
      yearlyKg: roundKg(dailyKg * SCHOOL_DAYS),
    };
  });

  return { soloDrivers, potentialDailyKg, scenarios };
}

// ---------------------------------------------------------------------------
// Back-compat helper (older sample-data shape). Prefer buildClusters above.
// ---------------------------------------------------------------------------
export function buildCarpoolClusters(
  entries: NeighborhoodEntry[],
): { clusterId: string; memberCount: number; neighborhoods: string[] }[] {
  const clusters: { clusterId: string; memberCount: number; neighborhoods: string[] }[] = [];
  const used = new Set<string>();
  const dist = (a: NeighborhoodEntry, b: NeighborhoodEntry) => {
    const dlat = a.lat - b.lat;
    const dlng = a.lng - b.lng;
    return Math.sqrt(dlat * dlat + dlng * dlng);
  };

  for (const entry of entries) {
    if (used.has(entry.id)) continue;
    const members = entries.filter(
      (e) => !used.has(e.id) && dist(entry, e) < CLUSTER_RADIUS,
    );
    members.forEach((m) => used.add(m.id));
    clusters.push({
      clusterId: `Cluster ${clusters.length + 1}`,
      memberCount: members.length,
      neighborhoods: [...new Set(members.map((m) => m.neighborhood))],
    });
  }
  return clusters;
}
