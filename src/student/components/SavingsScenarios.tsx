"use client";

import { useState } from "react";
import { estimateSavings } from "@/student/lib/carpools";
import { formatCo2, VEHICLE_SPECS, roundKg } from "@/core/emissions";
import { useCommuteStore } from "@/student/lib/useCommuteStore";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function SavingsScenarios() {
  const { entries } = useCommuteStore();
  const savings = estimateSavings(entries);

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Daily commute impact</CardTitle>
          <CardDescription>
            Based on {entries.length} logged commuters ({savings.soloDrivers}{" "}
            currently driving solo). Estimated CO₂ saved if a share of solo
            drivers joined carpools.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            {savings.scenarios.map((s) => (
              <div
                key={s.participation}
                className="rounded-xl border p-5 text-center"
              >
                <p className="text-sm text-muted-foreground">
                  {Math.round(s.participation * 100)}% carpool
                </p>
                <p className="mt-2 text-2xl font-bold text-primary">
                  {formatCo2(s.yearlyKg)}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  per school year ({formatCo2(s.dailyKg)}/day)
                </p>
              </div>
            ))}
          </div>
          {savings.potentialDailyKg === 0 && (
            <p className="mt-4 text-sm text-muted-foreground">
              Add more nearby solo drivers on the Commute page to reveal carpool
              savings.
            </p>
          )}
        </CardContent>
      </Card>

      <HomeGameCarpool />
    </div>
  );
}

const ATTENDEES_PER_CAR = 4;

function HomeGameCarpool() {
  const [attendance, setAttendance] = useState(80);
  const [distance, setDistance] = useState(6);
  const [participation, setParticipation] = useState(50);

  const fans = Math.max(0, Math.floor(attendance));
  const carpoolers = Math.floor(fans * (participation / 100));
  const soloKg = carpoolers * distance * VEHICLE_SPECS.solo_car.co2PerMile * 2;
  const carpoolCars = Math.ceil(carpoolers / ATTENDEES_PER_CAR);
  const carpoolKg = carpoolCars * distance * VEHICLE_SPECS.carpool.co2PerMile * 2;
  const saved = roundKg(Math.max(0, soloKg - carpoolKg));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Home game carpool estimator</CardTitle>
        <CardDescription>
          Estimate emissions saved when fans carpool to a home game.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="hg-att">Expected attendance</Label>
            <Input
              id="hg-att"
              type="number"
              min={0}
              value={attendance}
              onChange={(e) => setAttendance(Number(e.target.value))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hg-dist">Avg one-way miles</Label>
            <Input
              id="hg-dist"
              type="number"
              min={0}
              value={distance}
              onChange={(e) => setDistance(Number(e.target.value))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hg-part">% who carpool</Label>
            <Input
              id="hg-part"
              type="number"
              min={0}
              max={100}
              value={participation}
              onChange={(e) => setParticipation(Number(e.target.value))}
            />
          </div>
        </div>
        <div className="rounded-xl border bg-muted/40 p-5">
          <p className="text-sm text-muted-foreground">
            {carpoolers} fans carpooling in ~{carpoolCars} cars would save
          </p>
          <p className="mt-1 text-3xl font-bold text-primary">
            {formatCo2(saved)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            vs. everyone driving solo to this game
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
