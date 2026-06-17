import { clusterByProximity, estimateSavings } from "@/core";
import type { CarpoolClusterView, NeighborhoodEntry } from "@/student/types";

const SAMPLE_DISTANCE_MILES = 5;

/** Build carpool cluster views from neighborhood entries using shared clustering. */
export function buildCarpoolClusters(entries: NeighborhoodEntry[]): CarpoolClusterView[] {
  const points = entries.map((e) => ({
    label: e.neighborhood,
    lat: e.lat,
    lng: e.lng,
  }));

  return clusterByProximity(points).map((cluster) => ({
    clusterId: cluster.id,
    memberCount: cluster.members.length,
    neighborhoods: cluster.members.map((m) => m.label),
    estimatedCo2SavingsKg: estimateSavings(
      SAMPLE_DISTANCE_MILES,
      "solo_car",
      "carpool",
    ),
  }));
}
