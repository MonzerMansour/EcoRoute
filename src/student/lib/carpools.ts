export type CommuteMode = "solo_car" | "carpool" | "bus";

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
}

function distance(a: NeighborhoodEntry, b: NeighborhoodEntry) {
  const dlat = a.lat - b.lat;
  const dlng = a.lng - b.lng;
  return Math.sqrt(dlat * dlat + dlng * dlng);
}

export function buildCarpoolClusters(entries: NeighborhoodEntry[]): CarpoolCluster[] {
  const clusters: CarpoolCluster[] = [];
  const used = new Set<string>();

  for (const entry of entries) {
    if (used.has(entry.id)) continue;

    const members = entries.filter(
      (e) => !used.has(e.id) && distance(entry, e) < 0.02,
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
