"use client";

import { useEffect, useState } from "react";
import { ArrowRight, Loader2, Sparkles } from "lucide-react";
import { formatCo2 } from "@/core/emissions";
import { useCommuteStore } from "@/student/lib/useCommuteStore";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { GeminiCluster } from "@/app/api/student/carpool-clusters/route";

export function CarpoolClusters() {
  const { entries, hydrated } = useCommuteStore();
  const [clusters, setClusters] = useState<GeminiCluster[]>([]);
  const [source, setSource] = useState<"ai" | "fallback" | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function fetchClusters() {
    if (entries.length === 0) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/student/carpool-clusters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entries }),
      });
      const data = await res.json() as { clusters: GeminiCluster[]; source: "ai" | "fallback" };
      setClusters(data.clusters ?? []);
      setSource(data.source ?? "fallback");
    } catch {
      setError("Could not load carpool suggestions. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // Auto-fetch when entries change and we haven't loaded yet
  useEffect(() => {
    if (hydrated && entries.length > 0 && clusters.length === 0 && !loading) {
      void fetchClusters();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, entries.length]);

  if (hydrated && entries.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
          <p className="text-sm text-muted-foreground">No commuters logged yet.</p>
          <ButtonLink href="/student/commute">Add commuters</ButtonLink>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {source === "ai" && (
            <Badge variant="secondary" className="gap-1">
              <Sparkles className="h-3 w-3" />
              AI-grouped
            </Badge>
          )}
          {source === "fallback" && (
            <Badge variant="outline" className="text-muted-foreground">
              Basic grouping
            </Badge>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchClusters}
          disabled={loading || entries.length === 0}
        >
          {loading ? (
            <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Grouping…</>
          ) : (
            "Re-group with AI"
          )}
        </Button>
      </div>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      {loading && clusters.length === 0 && (
        <div className="flex items-center justify-center gap-2 py-12 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Gemini is grouping commuters by location…
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {clusters.map((cluster) => {
          const memberLabels = cluster.members.map(
            (m) => m.customNeighborhoodLabel?.trim() || m.neighborhoodId
          );
          const uniqueLabels = [...new Set(memberLabels)];

          const times = cluster.members
            .map((m) => m.departureTime)
            .filter((t): t is string => Boolean(t));

          let displayTime: string | null = null;
          if (times.length > 0) {
            const sorted = [...times].sort();
            const mid = sorted[Math.floor(sorted.length / 2)];
            const [hh, mm] = mid.split(":");
            const h = parseInt(hh);
            const ampm = h >= 12 ? "PM" : "AM";
            const h12 = h % 12 === 0 ? 12 : h % 12;
            displayTime = `~${h12}:${mm} ${ampm}`;
          }

          return (
            <Card key={cluster.clusterId}>
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base leading-snug">
                    {cluster.clusterName}
                  </CardTitle>
                  {cluster.dailySavingsKg > 0 && (
                    <Badge variant="secondary" className="shrink-0">
                      −{formatCo2(cluster.dailySavingsKg)}/day
                    </Badge>
                  )}
                </div>
                <CardDescription>
                  {cluster.members.length} member{cluster.members.length === 1 ? "" : "s"}
                  {displayTime && ` · Departs ${displayTime}`}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* AI reason */}
                <p className="text-xs text-muted-foreground italic">{cluster.reason}</p>

                {/* Area badges */}
                <div className="flex flex-wrap gap-1.5">
                  {uniqueLabels.map((label) => (
                    <Badge key={label} variant="outline">
                      {label}
                    </Badge>
                  ))}
                </div>

                {/* Pickup order */}
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">
                    Suggested pickup order
                  </p>
                  <div className="flex flex-wrap items-center gap-1 text-sm">
                    {(cluster.pickupOrder.length > 0
                      ? cluster.pickupOrder
                      : cluster.members.map((m) => m.studentName)
                    ).map((name, i, arr) => {
                      const member = cluster.members.find((m) => m.studentName === name);
                      const label = member?.customNeighborhoodLabel?.trim() || member?.neighborhoodId || "";
                      return (
                        <span key={name} className="flex items-center gap-1">
                          <span>
                            {name}
                            {label ? (
                              <span className="text-muted-foreground"> — {label}</span>
                            ) : null}
                          </span>
                          {i < arr.length - 1 && (
                            <ArrowRight className="h-3 w-3 text-muted-foreground" />
                          )}
                        </span>
                      );
                    })}
                    <ArrowRight className="h-3 w-3 text-muted-foreground" />
                    <span className="font-medium text-secondary">School</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
