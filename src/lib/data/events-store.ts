import type { Activity, SchoolEvent, Notification } from "@/lib/store/events";
import { isSupabaseConfigured } from "@/lib/data/supabase-client";
import * as supabase from "@/lib/data/supabase-events-repository";

function uid() { return `id_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`; }
function now() { return new Date().toISOString(); }

// ── In-memory fallback (dev / no Supabase) ──────────────────────────────────

interface MemStore {
  activities: Activity[];
  events: SchoolEvent[];
  notifications: Notification[];
}

const g = globalThis as unknown as { __ecoRouteEvents?: MemStore };
function mem(): MemStore {
  if (!g.__ecoRouteEvents) g.__ecoRouteEvents = { activities: [], events: [], notifications: [] };
  return g.__ecoRouteEvents;
}

function memSubscribe(eventId: string, studentName: string): SchoolEvent | null {
  const ev = mem().events.find((e) => e.id === eventId);
  if (!ev) return null;
  if (!ev.subscribedStudents.includes(studentName)) {
    ev.subscribedStudents = [...ev.subscribedStudents, studentName];
    mem().notifications.unshift({
      id: uid(), type: "subscription",
      message: `${studentName} subscribed to "${ev.title}"`,
      studentName, eventId, activityId: ev.activityId, read: false, createdAt: now(),
    });
  }
  return ev;
}

function memUnsubscribe(eventId: string, studentName: string): SchoolEvent | null {
  const ev = mem().events.find((e) => e.id === eventId);
  if (!ev) return null;
  ev.subscribedStudents = ev.subscribedStudents.filter((s) => s !== studentName);
  return ev;
}

// ── Public API (auto-routes to Supabase or memory) ─────────────────────────

export async function listActivities(): Promise<Activity[]> {
  return isSupabaseConfigured() ? supabase.dbListActivities() : mem().activities;
}

export async function createActivity(a: Omit<Activity, "id">): Promise<Activity> {
  if (isSupabaseConfigured()) return supabase.dbCreateActivity(a);
  const entry: Activity = { ...a, id: uid() };
  mem().activities.push(entry);
  return entry;
}

export async function updateActivity(id: string, patch: Partial<Omit<Activity, "id">>): Promise<Activity | null> {
  if (isSupabaseConfigured()) return supabase.dbUpdateActivity(id, patch);
  const idx = mem().activities.findIndex((a) => a.id === id);
  if (idx === -1) return null;
  mem().activities[idx] = { ...mem().activities[idx], ...patch };
  return mem().activities[idx];
}

export async function deleteActivity(id: string): Promise<void> {
  if (isSupabaseConfigured()) return supabase.dbDeleteActivity(id);
  mem().activities = mem().activities.filter((a) => a.id !== id);
  mem().events = mem().events.filter((e) => e.activityId !== id);
}

export async function listEvents(): Promise<SchoolEvent[]> {
  return isSupabaseConfigured() ? supabase.dbListEvents() : [...mem().events];
}

export async function createEvent(e: Omit<SchoolEvent, "id" | "createdAt" | "subscribedStudents">): Promise<SchoolEvent> {
  if (isSupabaseConfigured()) return supabase.dbCreateEvent(e);
  const entry: SchoolEvent = { ...e, id: uid(), createdAt: now(), subscribedStudents: [] };
  mem().events.push(entry);
  return entry;
}

export async function updateEvent(id: string, patch: Partial<SchoolEvent>): Promise<SchoolEvent | null> {
  if (isSupabaseConfigured()) return supabase.dbUpdateEvent(id, patch);
  const idx = mem().events.findIndex((e) => e.id === id);
  if (idx === -1) return null;
  mem().events[idx] = { ...mem().events[idx], ...patch };
  return mem().events[idx];
}

export async function deleteEvent(id: string): Promise<void> {
  if (isSupabaseConfigured()) return supabase.dbDeleteEvent(id);
  mem().events = mem().events.filter((e) => e.id !== id);
}

export async function subscribeStudent(eventId: string, studentName: string): Promise<SchoolEvent | null> {
  return isSupabaseConfigured()
    ? supabase.dbSubscribeStudent(eventId, studentName)
    : memSubscribe(eventId, studentName);
}

export async function unsubscribeStudent(eventId: string, studentName: string): Promise<SchoolEvent | null> {
  return isSupabaseConfigured()
    ? supabase.dbUnsubscribeStudent(eventId, studentName)
    : memUnsubscribe(eventId, studentName);
}

export async function listNotifications(): Promise<Notification[]> {
  return isSupabaseConfigured() ? supabase.dbListNotifications() : [...mem().notifications];
}

export async function markAllRead(): Promise<void> {
  if (isSupabaseConfigured()) return supabase.dbMarkAllRead();
  mem().notifications.forEach((n) => { n.read = true; });
}
