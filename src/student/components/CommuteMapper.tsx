"use client";

import { useState } from "react";
import { Trash2, Users, Route, Leaf, Sparkles } from "lucide-react";
import {
  NEIGHBORHOODS,
  neighborhoodById,
  buildClusters,
  estimateSavings,
  type CommuteMode,
} from "@/student/lib/carpools";
import { formatCo2 } from "@/core/emissions";
import { useCommuteStore } from "@/student/lib/useCommuteStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const MODES: { value: CommuteMode; label: string }[] = [
  { value: "solo_car", label: "Solo car" },
  { value: "carpool", label: "Carpool" },
  { value: "bus", label: "Bus" },
];

const selectClass =
  "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function CommuteMapper() {
  const { entries, hydrated, addEntry, removeEntry, reset } = useCommuteStore();
  const [name, setName] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [manualNeighborhood, setManualNeighborhood] = useState("");
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [commuteMode, setCommuteMode] = useState<CommuteMode>("solo_car");
  const [seats, setSeats] = useState(3);
  const [departureTime, setDepartureTime] = useState("");
  const [returnTime, setReturnTime] = useState("");
  const [error, setError] = useState("");

  const clusters = buildClusters(entries);
  const savings = estimateSavings(entries);

  async function handleGetSuggestions() {
    setSuggestionsLoading(true);
    setAiSuggestions([]);
    try {
      const res = await fetch("/api/student/neighborhood-suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ zipCode, schoolName: "EcoRoute High" }),
      });
      if (res.ok) {
        const data = (await res.json()) as { suggestions: string[] };
        setAiSuggestions(data.suggestions ?? []);
      }
    } catch {
      // ignore
    } finally {
      setSuggestionsLoading(false);
    }
  }

  function resolveNeighborhoodId(label: string): string {
    if (!label) return NEIGHBORHOODS[0].id;
    const match = NEIGHBORHOODS.find(
      (n) => n.label.toLowerCase() === label.toLowerCase(),
    );
    return match ? match.id : NEIGHBORHOODS[0].id;
  }

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Enter a name.");
      return;
    }
    setError("");
    const neighborhoodId = resolveNeighborhoodId(manualNeighborhood);
    addEntry({
      studentName: name.trim().slice(0, 60),
      neighborhoodId,
      customNeighborhoodLabel: manualNeighborhood.trim() || undefined,
      commuteMode,
      seatsAvailable: commuteMode === "solo_car" ? Number(seats) || 0 : 0,
      departureTime: departureTime || undefined,
      returnTime: returnTime || undefined,
    });
    setName("");
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
      <Card className="h-fit">
        <CardHeader>
          <CardTitle>Add a commuter</CardTitle>
          <CardDescription>
            Log where someone lives and how they get to school. We group nearby
            families into carpools automatically.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cm-name">Name</Label>
              <Input
                id="cm-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Taylor"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cm-zip">Zip code</Label>
              <Input
                id="cm-zip"
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
                placeholder="e.g. 02134"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cm-neighborhood">City / Neighborhood</Label>
              <Input
                id="cm-neighborhood"
                value={manualNeighborhood}
                onChange={(e) => setManualNeighborhood(e.target.value)}
                placeholder="e.g. Oak Street, Riverside"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full gap-1.5"
                onClick={handleGetSuggestions}
                disabled={suggestionsLoading}
              >
                <Sparkles className="h-3.5 w-3.5" />
                {suggestionsLoading ? "Loading…" : "Get AI suggestions"}
              </Button>
              {aiSuggestions.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {aiSuggestions.map((s) => (
                    <Badge
                      key={s}
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() => setManualNeighborhood(s)}
                    >
                      {s}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cm-mode">Current commute</Label>
              <select
                id="cm-mode"
                className={selectClass}
                value={commuteMode}
                onChange={(e) => setCommuteMode(e.target.value as CommuteMode)}
              >
                {MODES.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>

            {commuteMode === "solo_car" && (
              <div className="space-y-2">
                <Label htmlFor="cm-seats">Spare seats to offer</Label>
                <Input
                  id="cm-seats"
                  type="number"
                  min={0}
                  max={6}
                  value={seats}
                  onChange={(e) => setSeats(Number(e.target.value))}
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="cm-depart">Departure time</Label>
                <Input
                  id="cm-depart"
                  type="time"
                  value={departureTime}
                  onChange={(e) => setDepartureTime(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cm-return">Return time</Label>
                <Input
                  id="cm-return"
                  type="time"
                  value={returnTime}
                  onChange={(e) => setReturnTime(e.target.value)}
                />
              </div>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full">
              Add commuter
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={reset}
            >
              Reset to sample data
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard icon={Users} label="People logged" value={String(entries.length)} />
          <StatCard icon={Route} label="Carpool clusters" value={String(clusters.length)} />
          <StatCard
            icon={Leaf}
            label="Daily CO₂ if all carpool"
            value={formatCo2(savings.potentialDailyKg)}
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Logged commuters</CardTitle>
            <CardDescription>
              {hydrated
                ? `${entries.length} people across ${clusters.length} clusters.`
                : "Loading…"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {entries.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No commuters yet. Add one to start clustering.
              </p>
            )}
            {entries.map((entry) => {
              const hood = neighborhoodById(entry.neighborhoodId);
              const neighborhoodLabel =
                entry.customNeighborhoodLabel ?? hood?.label ?? "Unknown";
              return (
                <div
                  key={entry.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div>
                    <p className="font-medium">{entry.studentName}</p>
                    <p className="text-xs text-muted-foreground">
                      {neighborhoodLabel} · {hood?.distanceMiles ?? "?"} mi
                      {entry.departureTime && ` · Departs ${entry.departureTime}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">
                      {MODES.find((m) => m.value === entry.commuteMode)?.label}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeEntry(entry.id)}
                      aria-label={`Remove ${entry.studentName}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{label}</p>
          <Icon className="h-4 w-4 text-secondary" />
        </div>
        <p className="mt-2 text-2xl font-bold text-secondary">{value}</p>
      </CardContent>
    </Card>
  );
}
