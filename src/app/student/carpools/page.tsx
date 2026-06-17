import { buildCarpoolClusters } from "@/student/lib/carpools";
import type { NeighborhoodEntry } from "@/student/types";

export const metadata = {
  title: "Carpool Clusters",
};

const sampleEntries: NeighborhoodEntry[] = [
  {
    id: "1",
    studentName: "Alex",
    neighborhood: "Oak St",
    lat: 42.35,
    lng: -71.08,
    commuteMode: "solo_car",
  },
  {
    id: "2",
    studentName: "Jordan",
    neighborhood: "Oak St North",
    lat: 42.351,
    lng: -71.081,
    commuteMode: "solo_car",
  },
  {
    id: "3",
    studentName: "Sam",
    neighborhood: "Maple Ave",
    lat: 42.36,
    lng: -71.09,
    commuteMode: "carpool",
  },
];

export default function StudentCarpoolsPage() {
  const clusters = buildCarpoolClusters(sampleEntries);

  return (
    <>
      <h1 className="text-3xl font-bold text-earth-900">Carpool Clusters</h1>
      <p className="mt-2 text-earth-600">
        Sample clusters from{" "}
        <code className="rounded bg-earth-100 px-1.5 py-0.5 text-sm">@/core/clustering</code>.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {clusters.map((cluster) => (
          <div
            key={cluster.clusterId}
            className="rounded-2xl border border-earth-200 bg-white p-5"
          >
            <h2 className="font-semibold text-earth-900">{cluster.clusterId}</h2>
            <p className="mt-1 text-sm text-earth-600">{cluster.memberCount} members</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {cluster.neighborhoods.map((n) => (
                <span
                  key={n}
                  className="rounded-full bg-teal-50 px-3 py-1 text-xs font-medium text-teal-700"
                >
                  {n}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
