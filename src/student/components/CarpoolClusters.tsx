"use client";

import { ArrowRight } from "lucide-react";
import { buildClusters } from "@/student/lib/carpools";
import { formatCo2 } from "@/core/emissions";
import { useCommuteStore } from "@/student/lib/useCommuteStore";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button-link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function CarpoolClusters() {
  const { entries, hydrated } = useCommuteStore();
  const clusters = buildClusters(entries);

  if (hydrated && entries.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
          <p className="text-sm text-muted-foreground">
            No commuters logged yet.
          </p>
          <ButtonLink href="/student/commute">Add commuters</ButtonLink>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {clusters.map((cluster) => (
        <Card key={cluster.clusterId}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{cluster.clusterId}</CardTitle>
              {cluster.dailySavingsKg > 0 && (
                <Badge variant="secondary">
                  −{formatCo2(cluster.dailySavingsKg)}/day
                </Badge>
              )}
            </div>
            <CardDescription>
              {cluster.memberCount} member{cluster.memberCount === 1 ? "" : "s"} ·{" "}
              {cluster.totalSeats} spare seats
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {cluster.neighborhoods.map((n) => (
                <Badge key={n} variant="outline">
                  {n}
                </Badge>
              ))}
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Suggested pickup order
              </p>
              <div className="mt-1 flex flex-wrap items-center gap-1 text-sm">
                {cluster.pickupOrder.map((name, i) => (
                  <span key={name} className="flex items-center gap-1">
                    {name}
                    {i < cluster.pickupOrder.length - 1 && (
                      <ArrowRight className="h-3 w-3 text-muted-foreground" />
                    )}
                  </span>
                ))}
                <ArrowRight className="h-3 w-3 text-muted-foreground" />
                <span className="font-medium text-secondary">School</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
