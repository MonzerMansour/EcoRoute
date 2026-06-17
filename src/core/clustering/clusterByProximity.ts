import type { Cluster, GeoPoint } from "@/core/types";

function haversineMiles(a: GeoPoint, b: GeoPoint): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const R = 3958.8;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

function centroid(points: GeoPoint[]): GeoPoint {
  const lat = points.reduce((sum, p) => sum + p.lat, 0) / points.length;
  const lng = points.reduce((sum, p) => sum + p.lng, 0) / points.length;
  return { label: "Centroid", lat, lng };
}

/**
 * Simple greedy proximity clustering for neighborhood carpool groups.
 * Replace with k-means or map API distance matrix as the project matures.
 */
export function clusterByProximity(
  points: GeoPoint[],
  maxRadiusMiles = 2,
): Cluster[] {
  const remaining = [...points];
  const clusters: Cluster[] = [];

  while (remaining.length > 0) {
    const seed = remaining.shift()!;
    const members = [seed];

    for (let i = remaining.length - 1; i >= 0; i--) {
      if (haversineMiles(seed, remaining[i]) <= maxRadiusMiles) {
        members.push(remaining[i]);
        remaining.splice(i, 1);
      }
    }

    clusters.push({
      id: `cluster-${clusters.length + 1}`,
      members,
      centroid: centroid(members),
    });
  }

  return clusters;
}
