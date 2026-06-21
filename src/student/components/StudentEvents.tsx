"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  loadEvents,
  loadActivities,
  subscribeToEvent,
  unsubscribeFromEvent,
  type SchoolEvent,
  type Activity,
} from "@/lib/store/events";

const STUDENT_NAME_KEY = "ecoroute_student_name";

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  const [y, m, d] = dateStr.split("-");
  return `${m}/${d}/${y}`;
}

interface EventWithActivity {
  event: SchoolEvent;
  activity: Activity | undefined;
}

export function StudentEvents() {
  const [studentName, setStudentName] = useState<string>("");
  const [nameInput, setNameInput] = useState("");
  const [events, setEvents] = useState<SchoolEvent[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [flashIds, setFlashIds] = useState<Set<string>>(new Set());
  const [showCalendar, setShowCalendar] = useState(false);

  const [myActivityNames, setMyActivityNames] = useState<string[]>([]);

  useEffect(() => {
    const saved = typeof window !== "undefined" ? (localStorage.getItem(STUDENT_NAME_KEY) ?? "") : "";
    setStudentName(saved);
    setEvents(loadEvents());
    setActivities(loadActivities());
    try {
      const stored = localStorage.getItem("ecoroute_my_activities");
      if (stored) setMyActivityNames(JSON.parse(stored));
    } catch { /* ignore */ }
  }, []);

  const refresh = useCallback(() => {
    setEvents(loadEvents());
    setActivities(loadActivities());
  }, []);

  function saveName() {
    if (!nameInput.trim()) return;
    localStorage.setItem(STUDENT_NAME_KEY, nameInput.trim());
    setStudentName(nameInput.trim());
  }

  function handleSubscribe(eventId: string) {
    subscribeToEvent(eventId, studentName);
    refresh();
    setFlashIds((prev) => new Set(prev).add(eventId));
    setTimeout(() => {
      setFlashIds((prev) => {
        const next = new Set(prev);
        next.delete(eventId);
        return next;
      });
    }, 2000);
  }

  function handleUnsubscribe(eventId: string) {
    unsubscribeFromEvent(eventId, studentName);
    refresh();
  }

  if (!studentName) {
    return (
      <Card className="max-w-sm">
        <CardHeader>
          <CardTitle className="text-base">What should we call you?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="student-name">Your name</Label>
            <Input
              id="student-name"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="e.g. Alex"
              onKeyDown={(e) => { if (e.key === "Enter") saveName(); }}
            />
          </div>
          <Button onClick={saveName} disabled={!nameInput.trim()} className="w-full">
            Save
          </Button>
        </CardContent>
      </Card>
    );
  }

  const today = todayStr();

  const allEventItems: EventWithActivity[] = events
    .map((ev) => ({
      event: ev,
      activity: activities.find((a) => a.id === ev.activityId),
    }))
    .filter(({ activity }) =>
      myActivityNames.length === 0 ||
      !activity ||
      myActivityNames.some((name) =>
        activity.name.toLowerCase().includes(name.toLowerCase()) ||
        name.toLowerCase().includes(activity.name.toLowerCase()),
      ),
    );

  // Group by activity
  const activityMap = new Map<string, { activity: Activity | undefined; events: SchoolEvent[] }>();
  for (const { event, activity } of allEventItems) {
    const key = event.activityId;
    if (!activityMap.has(key)) activityMap.set(key, { activity, events: [] });
    activityMap.get(key)!.events.push(event);
  }

  const upcoming = allEventItems.filter((x) => x.event.date >= today);
  const past = allEventItems.filter((x) => x.event.date < today);

  if (events.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-sm text-muted-foreground">
          No events yet. Check back when your coordinator adds events.
        </CardContent>
      </Card>
    );
  }

  function renderEvent({ event, activity }: EventWithActivity) {
    const isSubscribed = event.subscribedStudents.includes(studentName);
    const isFlashing = flashIds.has(event.id);
    return (
      <Card key={event.id}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              {activity && (
                <Badge variant="outline" className="mb-1 text-xs">
                  {activity.name}
                </Badge>
              )}
              <p className="font-medium">{event.title}</p>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {formatDate(event.date)}
                {event.time && ` at ${event.time}`}
                {event.location && ` · ${event.location}`}
              </p>
              {event.distanceMiles !== undefined && (
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {event.distanceMiles} miles away
                </p>
              )}
              {event.chosenVehicle && (
                <div className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-emerald-50 border border-emerald-200 px-2 py-1">
                  <span className="text-sm">🚐</span>
                  <span className="text-xs font-medium text-emerald-800">
                    Transportation: {event.chosenVehicle}
                    {event.chosenVehicleCo2Kg !== undefined && (
                      <span className="font-normal text-emerald-600"> — {event.chosenVehicleCo2Kg} kg CO₂</span>
                    )}
                  </span>
                </div>
              )}
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1">
              {isSubscribed ? (
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-xs"
                  onClick={() => handleUnsubscribe(event.id)}
                >
                  Unsubscribe
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  className="border-green-500 text-green-700 hover:bg-green-50 text-xs"
                  onClick={() => handleSubscribe(event.id)}
                >
                  Subscribe
                </Button>
              )}
              {isFlashing && (
                <span className="text-xs font-medium text-green-600">Subscribed!</span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Build month groups for calendar view
  const monthGroups: Record<string, EventWithActivity[]> = {};
  for (const item of allEventItems) {
    const key = item.event.date.slice(0, 7);
    if (!monthGroups[key]) monthGroups[key] = [];
    monthGroups[key].push(item);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Signed in as <span className="font-medium text-foreground">{studentName}</span>
          {myActivityNames.length > 0 && (
            <span className="ml-2 text-xs">
              · showing events for: {myActivityNames.join(", ")}
            </span>
          )}
        </p>
        {allEventItems.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="gap-1 text-xs"
            onClick={() => setShowCalendar((v) => !v)}
          >
            {showCalendar ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            {showCalendar ? "Hide" : "Show"} calendar view
          </Button>
        )}
      </div>

      {showCalendar && allEventItems.length > 0 && (
        <Card>
          <CardContent className="p-4 space-y-4">
            {Object.entries(monthGroups)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([month, items]) => {
                const [y, m] = month.split("-");
                const label = new Date(Number(y), Number(m) - 1).toLocaleString("default", {
                  month: "long",
                  year: "numeric",
                });
                return (
                  <div key={month}>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                      {label}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {items
                        .slice()
                        .sort((a, b) => a.event.date.localeCompare(b.event.date))
                        .map(({ event, activity }) => {
                          const isSubscribed = event.subscribedStudents.includes(studentName);
                          return (
                            <div
                              key={event.id}
                              className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs ${
                                isSubscribed
                                  ? "border-primary/40 bg-primary/5 text-primary"
                                  : "border-border bg-muted/50 text-muted-foreground"
                              }`}
                            >
                              <span className="font-medium">{event.date.slice(8)}</span>
                              <span>{event.title}</span>
                              {activity && <span className="opacity-60">· {activity.name}</span>}
                              {event.chosenVehicle && <span className="opacity-80">🚐</span>}
                            </div>
                          );
                        })}
                    </div>
                    <Separator className="mt-3" />
                  </div>
                );
              })}
          </CardContent>
        </Card>
      )}

      {upcoming.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-base font-semibold">Upcoming</h2>
          {upcoming
            .slice()
            .sort((a, b) => a.event.date.localeCompare(b.event.date))
            .map(renderEvent)}
        </div>
      )}

      {past.length > 0 && (
        <div className="space-y-3">
          {upcoming.length > 0 && <Separator />}
          <h2 className="text-base font-semibold text-muted-foreground">Past</h2>
          {past
            .slice()
            .sort((a, b) => b.event.date.localeCompare(a.event.date))
            .map(renderEvent)}
        </div>
      )}
    </div>
  );
}
