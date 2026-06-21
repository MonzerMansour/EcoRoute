"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronDown, ChevronUp, CheckCircle2, Circle, Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { SchoolEvent, Activity } from "@/lib/store/events";
import { formatCo2 } from "@/core/emissions";

async function apiFetch(url: string, opts?: RequestInit) {
  const res = await fetch(url, { headers: { "Content-Type": "application/json" }, ...opts });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

const STUDENT_NAME_KEY = "ecoroute_student_name";
const MY_ACTIVITY_IDS_KEY = "ecoroute_my_activity_ids";

function todayStr() { return new Date().toISOString().slice(0, 10); }

function formatDate(dateStr: string) {
  if (!dateStr) return "";
  const [y, m, d] = dateStr.split("-");
  return `${m}/${d}/${y}`;
}

export function StudentEvents() {
  const [studentName, setStudentName] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [events, setEvents] = useState<SchoolEvent[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [myActivityIds, setMyActivityIds] = useState<string[]>([]);
  const [flashIds, setFlashIds] = useState<Set<string>>(new Set());
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(null);
  // Coordinator lookup
  const [coordEmail, setCoordEmail] = useState("");
  const [coordLookupState, setCoordLookupState] = useState<"idle" | "loading" | "done" | "none">("idle");
  const [coordResults, setCoordResults] = useState<Activity[]>([]);
  // Join request
  const [joinCoordEmail, setJoinCoordEmail] = useState("");
  const [joinEventName, setJoinEventName] = useState("");
  const [joinState, setJoinState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [joinMessage, setJoinMessage] = useState("");

  const refresh = useCallback(async () => {
    const [evs, acts] = await Promise.all([
      apiFetch("/api/events/events"),
      apiFetch("/api/events/activities"),
    ]);
    setEvents(evs);
    setActivities(acts);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem(STUDENT_NAME_KEY) ?? "";
    setStudentName(saved);
    refresh();
    try {
      const ids = localStorage.getItem(MY_ACTIVITY_IDS_KEY);
      if (ids) setMyActivityIds(JSON.parse(ids));
    } catch { /* ignore */ }
  }, [refresh]);

  function saveName() {
    if (!nameInput.trim()) return;
    localStorage.setItem(STUDENT_NAME_KEY, nameInput.trim());
    setStudentName(nameInput.trim());
  }

  function toggleActivity(id: string) {
    setMyActivityIds((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      localStorage.setItem(MY_ACTIVITY_IDS_KEY, JSON.stringify(next));
      return next;
    });
  }

  async function handleSubscribe(eventId: string) {
    await apiFetch(`/api/events/events/${eventId}/subscribe`, {
      method: "POST",
      body: JSON.stringify({ studentName, action: "subscribe" }),
    });
    refresh();
    setFlashIds((prev) => new Set(prev).add(eventId));
    setTimeout(() => {
      setFlashIds((prev) => { const n = new Set(prev); n.delete(eventId); return n; });
    }, 2000);
  }

  async function handleUnsubscribe(eventId: string) {
    await apiFetch(`/api/events/events/${eventId}/subscribe`, {
      method: "POST",
      body: JSON.stringify({ studentName, action: "unsubscribe" }),
    });
    refresh();
  }

  async function lookupCoordinator() {
    if (!coordEmail.trim()) return;
    setCoordLookupState("loading");
    setCoordResults([]);
    try {
      const [actData, evData] = await Promise.all([
        apiFetch(`/api/events/activities?email=${encodeURIComponent(coordEmail.trim())}`),
        apiFetch("/api/events/events"),
      ]);
      if (Array.isArray(actData) && actData.length > 0) {
        setCoordResults(actData);
        setCoordLookupState("done");
        setActivities((prev) => {
          const existingIds = new Set(prev.map((a) => a.id));
          return [...prev, ...actData.filter((a: Activity) => !existingIds.has(a.id))];
        });
        if (Array.isArray(evData)) {
          setEvents(evData);
        }
      } else {
        setCoordLookupState("none");
      }
    } catch {
      setCoordLookupState("none");
    }
  }

  async function handleJoinRequest(e: React.FormEvent) {
    e.preventDefault();
    if (!joinCoordEmail.trim() || !joinEventName.trim()) return;
    setJoinState("loading");
    setJoinMessage("");
    try {
      const res = await fetch("/api/events/join-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coordinatorEmail: joinCoordEmail.trim(), eventName: joinEventName.trim(), studentName }),
      });
      const data = await res.json();
      if (res.ok) {
        setJoinState("success");
        setJoinMessage(`Joined "${data.event?.title}"!`);
        setJoinCoordEmail("");
        setJoinEventName("");
        refresh();
      } else {
        setJoinState("error");
        setJoinMessage(data.error ?? "Something went wrong.");
      }
    } catch {
      setJoinState("error");
      setJoinMessage("Network error. Try again.");
    }
  }

  // Name prompt
  if (!studentName) {
    return (
      <Card className="max-w-sm">
        <CardHeader><CardTitle className="text-base">What should we call you?</CardTitle></CardHeader>
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
          <Button onClick={saveName} disabled={!nameInput.trim()} className="w-full">Save</Button>
        </CardContent>
      </Card>
    );
  }

  const today = todayStr();

  // All events for activities the student follows
  const myEvents = events.filter((ev) => myActivityIds.includes(ev.activityId));

  // For the selected activity in left panel
  const activeActivity = activities.find((a) => a.id === selectedActivityId) ?? null;
  const activeEvents = selectedActivityId
    ? events.filter((ev) => ev.activityId === selectedActivityId)
    : myEvents;

  // Month groups for calendar view (based on active view)
  const monthGroups: Record<string, SchoolEvent[]> = {};
  for (const ev of activeEvents) {
    const key = ev.date.slice(0, 7);
    if (!monthGroups[key]) monthGroups[key] = [];
    monthGroups[key].push(ev);
  }

  const upcoming = activeEvents.filter((ev) => ev.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date));
  const past = activeEvents.filter((ev) => ev.date < today)
    .sort((a, b) => b.date.localeCompare(a.date));

  function renderEventCard(ev: SchoolEvent) {
    const activity = activities.find((a) => a.id === ev.activityId);
    const isSubscribed = ev.subscribedStudents.includes(studentName);
    const isFlashing = flashIds.has(ev.id);
    return (
      <Card key={ev.id}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              {activity && !activeActivity && (
                <Badge variant="outline" className="mb-1 text-xs">{activity.name}</Badge>
              )}
              <p className="font-medium">{ev.title}</p>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {formatDate(ev.date)}
                {ev.time && ` at ${ev.time}`}
                {ev.location && ` · ${ev.location}`}
              </p>
              {ev.distanceMiles !== undefined && (
                <p className="mt-0.5 text-xs text-muted-foreground">{ev.distanceMiles} miles away</p>
              )}
              {ev.notes && (
                <p className="mt-0.5 text-xs text-muted-foreground">{ev.notes}</p>
              )}
              {ev.chosenVehicle ? (
                <div className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-emerald-50 border border-emerald-200 px-2 py-1">
                  <span className="text-sm">🚐</span>
                  <span className="text-xs font-medium text-emerald-800">
                    Transportation: {ev.chosenVehicle}
                    {ev.chosenVehicleCo2Kg !== undefined && (
                      <span className="font-normal text-emerald-600"> — {formatCo2(ev.chosenVehicleCo2Kg)}</span>
                    )}
                  </span>
                </div>
              ) : (
                <p className="mt-1.5 text-xs text-muted-foreground italic">
                  Transportation not yet decided by coordinator
                </p>
              )}
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1">
              {isSubscribed ? (
                <Button size="sm" variant="ghost" className="text-xs" onClick={() => handleUnsubscribe(ev.id)}>
                  Leave
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  className="border-green-500 text-green-700 hover:bg-green-50 text-xs"
                  onClick={() => handleSubscribe(ev.id)}
                >
                  Join
                </Button>
              )}
              {isSubscribed && <span className="text-xs text-green-600">✓ Going</span>}
              {isFlashing && <span className="text-xs font-medium text-green-600">Joined!</span>}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  function renderCoordLookup() {
    return (
      <div className="space-y-2 pt-2">
        <p className="text-xs font-medium text-muted-foreground">Find a coordinator by email</p>
        <div className="flex gap-2">
          <Input
            placeholder="coach@school.edu"
            type="email"
            value={coordEmail}
            onChange={(e) => { setCoordEmail(e.target.value); setCoordLookupState("idle"); }}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), lookupCoordinator())}
            className="text-xs h-8"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 px-2"
            onClick={lookupCoordinator}
            disabled={coordLookupState === "loading"}
          >
            {coordLookupState === "loading" ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Search className="h-3.5 w-3.5" />
            )}
          </Button>
        </div>
        {coordLookupState === "none" && (
          <p className="text-xs text-muted-foreground">No activities found for that coordinator.</p>
        )}
        {coordLookupState === "done" && coordResults.length > 0 && (
          <p className="text-xs text-green-700">{coordResults.length} activit{coordResults.length === 1 ? "y" : "ies"} added — check the list above.</p>
        )}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Follow a Coordinator</CardTitle>
            <CardDescription className="text-xs">
              Enter your coach or teacher&apos;s email to see their activities and events.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Input
                placeholder="coach@school.edu"
                type="email"
                value={coordEmail}
                onChange={(e) => { setCoordEmail(e.target.value); setCoordLookupState("idle"); }}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), lookupCoordinator())}
              />
              <Button
                variant="outline"
                onClick={lookupCoordinator}
                disabled={coordLookupState === "loading"}
              >
                {coordLookupState === "loading" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </Button>
            </div>
            {coordLookupState === "none" && (
              <p className="text-sm text-muted-foreground">No activities found for that coordinator.</p>
            )}
            {coordLookupState === "done" && coordResults.length > 0 && (
              <div className="space-y-1">
                <p className="text-sm font-medium">Activities found — follow them to see events:</p>
                {coordResults.map((a) => (
                  <div key={a.id} className="flex items-center justify-between rounded-md border p-2 text-sm">
                    <span>{a.name}</span>
                    <Button size="sm" variant={myActivityIds.includes(a.id) ? "secondary" : "outline"} className="h-7 text-xs" onClick={() => toggleActivity(a.id)}>
                      {myActivityIds.includes(a.id) ? "Following ✓" : "Follow"}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Quick join by coordinator email + event name */}
      <Card>
        <CardContent className="p-4">
          <form onSubmit={handleJoinRequest} className="flex flex-wrap items-end gap-3">
            <div className="flex-1 min-w-[160px] space-y-1">
              <Label className="text-xs">Coordinator email</Label>
              <Input
                type="email"
                placeholder="coach@school.edu"
                value={joinCoordEmail}
                onChange={(e) => { setJoinCoordEmail(e.target.value); setJoinState("idle"); }}
                className="h-8 text-sm"
              />
            </div>
            <div className="flex-1 min-w-[160px] space-y-1">
              <Label className="text-xs">Event name</Label>
              <Input
                placeholder="e.g. Away @ Riverside"
                value={joinEventName}
                onChange={(e) => { setJoinEventName(e.target.value); setJoinState("idle"); }}
                className="h-8 text-sm"
              />
            </div>
            <Button
              type="submit"
              size="sm"
              className="h-8"
              disabled={joinState === "loading" || !joinCoordEmail.trim() || !joinEventName.trim()}
            >
              {joinState === "loading" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Request to Join"}
            </Button>
            {joinMessage && (
              <p className={`w-full text-xs ${joinState === "success" ? "text-green-700" : "text-destructive"}`}>
                {joinMessage}
              </p>
            )}
          </form>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Signed in as <span className="font-medium text-foreground">{studentName}</span>
          {myActivityIds.length > 0 && (
            <span className="ml-2 text-xs text-muted-foreground">
              · following {myActivityIds.length} activit{myActivityIds.length === 1 ? "y" : "ies"}
            </span>
          )}
        </p>
        {activeEvents.length > 0 && (
          <Button variant="ghost" size="sm" className="gap-1 text-xs" onClick={() => setShowCalendar((v) => !v)}>
            {showCalendar ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            {showCalendar ? "Hide" : "Show"} calendar
          </Button>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        {/* Left panel — activities to follow */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">School Activities</CardTitle>
            <CardDescription className="text-xs">
              Check the ones you&apos;re part of to see their events and transportation info.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-1 p-3 pt-0">
            {activities.map((a) => {
              const isFollowing = myActivityIds.includes(a.id);
              const evCount = events.filter((e) => e.activityId === a.id).length;
              return (
                <div
                  key={a.id}
                  className={`cursor-pointer rounded-lg border p-3 transition-colors ${
                    selectedActivityId === a.id
                      ? "border-primary bg-primary/5"
                      : "hover:bg-muted/50"
                  }`}
                  onClick={() => setSelectedActivityId((prev) => prev === a.id ? null : a.id)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{a.name}</p>
                      {a.description && (
                        <p className="mt-0.5 truncate text-xs text-muted-foreground">{a.description}</p>
                      )}
                      <p className="mt-0.5 text-xs text-muted-foreground">{evCount} event{evCount !== 1 ? "s" : ""}</p>
                    </div>
                    <button
                      className="shrink-0 mt-0.5"
                      onClick={(e) => { e.stopPropagation(); toggleActivity(a.id); }}
                      title={isFollowing ? "Unfollow" : "Follow"}
                    >
                      {isFollowing ? (
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                      ) : (
                        <Circle className="h-5 w-5 text-muted-foreground/40" />
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
            {renderCoordLookup()}
          </CardContent>
        </Card>

        {/* Right panel — events */}
        <div className="space-y-4">
          {/* Calendar view */}
          {showCalendar && activeEvents.length > 0 && (
            <Card>
              <CardContent className="p-4 space-y-4">
                {Object.entries(monthGroups)
                  .sort(([a], [b]) => a.localeCompare(b))
                  .map(([month, evs]) => {
                    const [y, m] = month.split("-");
                    const label = new Date(Number(y), Number(m) - 1).toLocaleString("default", {
                      month: "long", year: "numeric",
                    });
                    return (
                      <div key={month}>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">{label}</p>
                        <div className="flex flex-wrap gap-2">
                          {evs.slice().sort((a, b) => a.date.localeCompare(b.date)).map((ev) => {
                            const isGoing = ev.subscribedStudents.includes(studentName);
                            return (
                              <div
                                key={ev.id}
                                className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs ${
                                  isGoing
                                    ? "border-primary/40 bg-primary/5 text-primary"
                                    : "border-border bg-muted/50 text-muted-foreground"
                                }`}
                              >
                                <span className="font-medium">{ev.date.slice(8)}</span>
                                <span>{ev.title}</span>
                                {ev.chosenVehicle && <span>🚐</span>}
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

          {/* Header */}
          {activeActivity ? (
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">{activeActivity.name}</h2>
              <Button variant="ghost" size="sm" className="text-xs" onClick={() => setSelectedActivityId(null)}>
                ← All my events
              </Button>
            </div>
          ) : myActivityIds.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center text-sm text-muted-foreground">
                Check the circle next to an activity on the left to follow it and see its events here.
              </CardContent>
            </Card>
          ) : null}

          {(activeActivity || myActivityIds.length > 0) && (
            <>
              {upcoming.length > 0 && (
                <div className="space-y-3">
                  <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Upcoming</h2>
                  {upcoming.map(renderEventCard)}
                </div>
              )}
              {upcoming.length === 0 && past.length === 0 && (
                <Card>
                  <CardContent className="py-10 text-center text-sm text-muted-foreground">
                    No events yet for {activeActivity ? activeActivity.name : "your activities"}.
                  </CardContent>
                </Card>
              )}
              {past.length > 0 && (
                <div className="space-y-3">
                  {upcoming.length > 0 && <Separator />}
                  <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Past</h2>
                  {past.map(renderEventCard)}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
