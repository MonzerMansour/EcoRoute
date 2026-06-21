"use client";

import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  commuteEmissionsKg,
  carpoolSavingsKg,
  COMMUTE_CO2_PER_MILE,
  formatCo2,
  emissionsForSingleType,
} from "@/core/emissions";
import { buildClusters } from "@/student/lib/carpools";
import { useCommuteStore } from "@/student/lib/useCommuteStore";
import { loadEvents, loadActivities } from "@/lib/store/events";
import type { SchoolEvent } from "@/lib/store/events";

const STUDENT_NAME_KEY = "ecoroute_student_name";
const SCHOOL_DAYS = 180;
const TREES_PER_KG_ANNUAL = 21.77;

type CommuteMode = "solo_car" | "carpool" | "bus" | "walk_bike";

function co2Color(mode: CommuteMode): string {
  if (mode === "solo_car") return "text-destructive";
  if (mode === "bus") return "text-amber-600";
  return "text-green-600";
}

export function EnvironmentalImpact() {
  const [distance, setDistance] = useState(5);
  const [mode, setMode] = useState<CommuteMode>("solo_car");
  const [showFactors, setShowFactors] = useState(false);
  const [subscribedEvents, setSubscribedEvents] = useState<SchoolEvent[]>([]);
  const [studentName, setStudentName] = useState("");

  const { entries } = useCommuteStore();

  useEffect(() => {
    const name = typeof window !== "undefined" ? (localStorage.getItem(STUDENT_NAME_KEY) ?? "") : "";
    setStudentName(name);
    if (name) {
      const allEvents = loadEvents();
      setSubscribedEvents(allEvents.filter((ev) => ev.subscribedStudents.includes(name)));
    }
  }, []);

  const daily = commuteEmissionsKg(distance, mode);
  const annual = Math.round(daily * SCHOOL_DAYS * 10) / 10;
  const carpoolDaily = commuteEmissionsKg(distance, "carpool");
  const savings = carpoolSavingsKg(distance);
  const annualSavings = Math.round(savings * SCHOOL_DAYS * 10) / 10;
  const treesPerYear = Math.round(annualSavings / TREES_PER_KG_ANNUAL);
  const soloCo2 = commuteEmissionsKg(distance, "solo_car");
  const reductionPct = soloCo2 > 0 ? Math.round((savings / soloCo2) * 100) : 0;

  const clusters = buildClusters(entries);
  const totalDailySavings = Math.round(clusters.reduce((s, c) => s + c.dailySavingsKg, 0) * 10) / 10;
  const schoolAnnualSavings = Math.round(totalDailySavings * SCHOOL_DAYS * 10) / 10;
  const schoolTrees = Math.round(schoolAnnualSavings / TREES_PER_KG_ANNUAL);

  const activities = loadActivities();

  return (
    <div className="space-y-6">
      {/* Section 1: Daily Commute Emissions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Your Daily Commute Emissions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="distance">One-way distance (miles)</Label>
              <Input
                id="distance"
                type="number"
                min="0.1"
                step="0.1"
                value={distance}
                onChange={(e) => setDistance(Math.max(0.1, Number(e.target.value)))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mode">Commute mode</Label>
              <Select value={mode} onValueChange={(v) => setMode(v as CommuteMode)}>
                <SelectTrigger id="mode">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="solo_car">Solo Car</SelectItem>
                  <SelectItem value="carpool">Carpool</SelectItem>
                  <SelectItem value="bus">Bus</SelectItem>
                  <SelectItem value="walk_bike">Walk or Bike</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="rounded-lg bg-muted/50 p-4 space-y-1">
            <p className="text-sm text-muted-foreground">Daily CO2 (round trip)</p>
            <p className={`text-3xl font-bold ${co2Color(mode)}`}>
              {formatCo2(daily)}
            </p>
            <p className="text-sm text-muted-foreground">
              Annual (180 school days):{" "}
              <span className={`font-semibold ${co2Color(mode)}`}>{formatCo2(annual)}</span>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Section 2: Carpool Savings */}
      {mode === "solo_car" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Carpool Savings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-2 text-sm sm:grid-cols-2">
              <div className="rounded-lg border p-3">
                <p className="text-muted-foreground">If you joined a carpool</p>
                <p className="mt-1 font-semibold text-green-600">{formatCo2(carpoolDaily)}/day</p>
              </div>
              <div className="rounded-lg border p-3">
                <p className="text-muted-foreground">You&apos;d save daily</p>
                <p className="mt-1 font-semibold text-green-600">{formatCo2(savings)}/day</p>
              </div>
              <div className="rounded-lg border p-3">
                <p className="text-muted-foreground">Annual savings</p>
                <p className="mt-1 font-semibold text-green-600">{formatCo2(annualSavings)}</p>
              </div>
              <div className="rounded-lg border p-3">
                <p className="text-muted-foreground">Equivalent trees/year</p>
                <p className="mt-1 font-semibold text-green-600">{treesPerYear} 🌳</p>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>CO2 reduction vs solo driving</span>
                <span>{reductionPct}%</span>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-green-500 transition-all"
                  style={{ width: `${reductionPct}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {mode === "carpool" && (
        <Card>
          <CardContent className="py-4">
            <p className="text-sm text-green-700">
              You are already saving{" "}
              <span className="font-semibold">{formatCo2(carpoolSavingsKg(distance))}/day</span>{" "}
              vs driving alone.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Section 3: Event Transportation */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Event Transportation</CardTitle>
        </CardHeader>
        <CardContent>
          {subscribedEvents.filter((ev) => ev.distanceMiles !== undefined && ev.rosterSize !== undefined).length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Subscribe to events on the Events page to see transportation emissions.
            </p>
          ) : (
            <div className="space-y-4">
              {subscribedEvents
                .filter((ev) => ev.distanceMiles !== undefined && ev.rosterSize !== undefined)
                .map((ev) => {
                  const dist = ev.distanceMiles!;
                  const roster = ev.rosterSize!;
                  const activity = activities.find((a) => a.id === ev.activityId);
                  const options = [
                    { label: "School Bus", ...emissionsForSingleType({ vehicleType: "school_bus", rosterSize: roster, distanceMiles: dist }) },
                    { label: "Van", ...emissionsForSingleType({ vehicleType: "van", rosterSize: roster, distanceMiles: dist }) },
                    { label: "Carpool", ...emissionsForSingleType({ vehicleType: "carpool", rosterSize: roster, distanceMiles: dist }) },
                  ] as const satisfies ReadonlyArray<{ label: string; co2Kg: number; vehicleCount: number }>;
                  const minCo2 = Math.min(...options.map((o) => o.co2Kg));
                  return (
                    <div key={ev.id} className="rounded-lg border p-3 space-y-2">
                      <div>
                        <p className="font-medium text-sm">{ev.title}</p>
                        {activity && <p className="text-xs text-muted-foreground">{activity.name}</p>}
                        <p className="text-xs text-muted-foreground">{dist} mi · {roster} students</p>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="text-left text-muted-foreground">
                              <th className="pb-1 pr-4">Vehicle</th>
                              <th className="pb-1 pr-4">Total CO2 (RT)</th>
                              <th className="pb-1">Count</th>
                            </tr>
                          </thead>
                          <tbody>
                            {options.map((opt) => (
                              <tr
                                key={opt.label}
                                className={opt.co2Kg === minCo2 ? "text-green-700 font-medium" : ""}
                              >
                                <td className="py-0.5 pr-4">{opt.label}{opt.co2Kg === minCo2 ? " ✓" : ""}</td>
                                <td className="py-0.5 pr-4">{formatCo2(opt.co2Kg)}</td>
                                <td className="py-0.5">{opt.vehicleCount}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Section 4: School-Wide Impact */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">School-Wide Impact</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg bg-green-50 border border-green-200 p-3">
              <p className="text-xs text-muted-foreground">Daily carpool CO2 saved</p>
              <p className="mt-1 text-xl font-bold text-green-700">{formatCo2(totalDailySavings)}</p>
            </div>
            <div className="rounded-lg bg-green-50 border border-green-200 p-3">
              <p className="text-xs text-muted-foreground">Annual school savings</p>
              <p className="mt-1 text-xl font-bold text-green-700">{formatCo2(schoolAnnualSavings)}</p>
            </div>
            <div className="rounded-lg bg-green-50 border border-green-200 p-3">
              <p className="text-xs text-muted-foreground">Trees equivalent/year</p>
              <p className="mt-1 text-xl font-bold text-green-700">{schoolTrees} 🌳</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Based on {entries.length} commuter{entries.length !== 1 ? "s" : ""} tracked across{" "}
            {clusters.length} carpool cluster{clusters.length !== 1 ? "s" : ""}.
          </p>
          <div>
            <Button
              variant="ghost"
              size="sm"
              className="gap-1 text-xs p-0 h-auto"
              onClick={() => setShowFactors((v) => !v)}
            >
              {showFactors ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              CO2 factors
            </Button>
            {showFactors && (
              <ul className="mt-2 space-y-1 text-xs text-muted-foreground list-disc list-inside">
                <li>Solo car: {COMMUTE_CO2_PER_MILE.solo_car} kg CO2/mile</li>
                <li>Carpool (per person): {COMMUTE_CO2_PER_MILE.carpool_per_person} kg CO2/mile</li>
                <li>Bus (per passenger): {COMMUTE_CO2_PER_MILE.bus} kg CO2/mile</li>
                <li>Walk/Bike: 0 kg CO2/mile</li>
              </ul>
            )}
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Section 5: How We Calculate This */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">How We Calculate This</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>Solo car: 0.411 kg CO2/mile (EPA average)</li>
            <li>Carpool (per person): 0.137 kg CO2/mile (0.411 ÷ 3 avg occupancy)</li>
            <li>Bus (per passenger): 0.089 kg CO2/mile (transit avg)</li>
            <li>Walking/Biking: 0 kg CO2</li>
            <li>1 tree absorbs ~21.77 kg CO2/year</li>
            <li>School year = 180 days</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
