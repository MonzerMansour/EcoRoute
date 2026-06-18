"use client";

import { useState } from "react";
import { Trash2, Users, Route, Leaf } from "lucide-react";
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
  const [neighborhoodId, setNeighborhoodId] = useState(NEIGHBORHOODS[0].id);
  const [commuteMode, setCommuteMode] = useState<CommuteMode>("solo_car");
  const [seats, setSeats] = useState(3);
  const [error, setError] = useState("");

  const clusters = buildClusters(entries);
  const savings = estimateSavings(entries);

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Enter a name.");
      return;
    }
    setError("");
    addEntry({
      studentName: name.trim().slice(0, 60),
      neighborhoodId,
      commuteMode,
      seatsAvailable: commuteMode === "solo_car" ? Number(seats) || 0 : 0,
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
              <Label htmlFor="cm-hood">Neighborhood</Label>
              <select
                id="cm-hood"
                className={selectClass}
                value={neighborhoodId}
                onChange={(e) => setNeighborhoodId(e.target.value)}
              >
                {NEIGHBORHOODS.map((n) => (
                  <option key={n.id} value={n.id}>
                    {n.label} ({n.distanceMiles} mi)
                  </option>
                ))}
              </select>
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
              return (
                <div
                  key={entry.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div>
                    <p className="font-medium">{entry.studentName}</p>
                    <p className="text-xs text-muted-foreground">
                      {hood?.label ?? "Unknown"} · {hood?.distanceMiles ?? "?"} mi
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
