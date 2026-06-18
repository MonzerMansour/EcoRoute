import { buildCarpoolClusters } from "@/student/lib/carpools";
import type { NeighborhoodEntry } from "@/student/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = {
  title: "Carpool Clusters",
};

const sampleEntries: NeighborhoodEntry[] = [
  { id: "1", studentName: "Alex", neighborhood: "Oak St", lat: 42.35, lng: -71.08, commuteMode: "solo_car" },
  { id: "2", studentName: "Jordan", neighborhood: "Oak St North", lat: 42.351, lng: -71.081, commuteMode: "solo_car" },
  { id: "3", studentName: "Sam", neighborhood: "Maple Ave", lat: 42.36, lng: -71.09, commuteMode: "carpool" },
];

export default function StudentCarpoolsPage() {
  const clusters = buildCarpoolClusters(sampleEntries);

  return (
    <>
      <h1 className="text-3xl font-bold">Carpool Clusters</h1>
      <p className="mt-2 text-muted-foreground">
        Sample clusters from{" "}
        <code className="rounded bg-muted px-1.5 py-0.5 text-sm">@/student/lib/carpools</code>.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {clusters.map((cluster) => (
          <Card key={cluster.clusterId}>
            <CardHeader>
              <CardTitle>{cluster.clusterId}</CardTitle>
              <p className="text-sm text-muted-foreground">{cluster.memberCount} members</p>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {cluster.neighborhoods.map((n) => (
                <Badge key={n} variant="secondary">{n}</Badge>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
