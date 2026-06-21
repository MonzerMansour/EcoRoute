"use client";

import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import type { RankedVehiclePlan, Trip } from "@/lib/types";
import { formatCo2 } from "@/core/emissions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Insight {
  summary: string;
  recommendation: string;
  source: "ai" | "fallback";
}

const selectClass =
  "w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

export function TripInsightExplorer({ trips }: { trips: Trip[] }) {
  const [tripId, setTripId] = useState(trips[0]?.id ?? "");
  const [insight, setInsight] = useState<Insight | null>(null);
  const [plans, setPlans] = useState<RankedVehiclePlan[]>([]);
  const [loading, setLoading] = useState(false);

  async function run() {
    if (!tripId) return;
    setLoading(true);
    try {
      const res = await fetch("/api/teacher/ai/trip-insight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tripId }),
      });
      const data = await res.json();
      setInsight(data.insight);
      setPlans(data.plans ?? []);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Sparkles className="h-4 w-4" />
          </div>
          <CardTitle>Overview of Optimizers and AI Insights</CardTitle>
        </div>
        <CardDescription>
          Select any trip to see a full optimizer breakdown and AI-powered explanation of the greenest option.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1 space-y-2">
            <Label htmlFor="trip">Trip</Label>
            <select
              id="trip"
              className={selectClass}
              value={tripId}
              onChange={(e) => setTripId(e.target.value)}
            >
              {trips.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
          <Button onClick={run} disabled={loading || !tripId}>
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Get AI insight"
            )}
          </Button>
        </div>

        {insight && (
          <div className="space-y-4">
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
              <div className="mb-2 flex items-center gap-2">
                <Badge variant={insight.source === "ai" ? "default" : "secondary"}>
                  {insight.source === "ai" ? "Gemini" : "Offline mode"}
                </Badge>
              </div>
              <p className="text-sm">{insight.summary}</p>
              <p className="mt-2 text-sm font-medium text-primary">
                {insight.recommendation}
              </p>
            </div>

            {plans.length > 0 && (
              <div className="space-y-2">
                {plans.map((plan) => (
                  <div
                    key={plan.label}
                    className={cn(
                      "flex items-center justify-between rounded-lg border p-3 text-sm",
                      plan.rank === 1
                        ? "border-primary bg-primary/5"
                        : "border-border",
                    )}
                  >
                    <span className="font-medium">{plan.label}</span>
                    <span className="flex items-center gap-2">
                      {formatCo2(plan.co2Kg)}
                      {plan.rank === 1 ? (
                        <Badge>Best</Badge>
                      ) : (
                        <Badge variant="secondary">+{plan.pctWorseThanBest}%</Badge>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
