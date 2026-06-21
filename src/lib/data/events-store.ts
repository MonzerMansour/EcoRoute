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

// ── Join Requests ────────────────────────────────────────────────────────────

import type { JoinRequest } from "@/lib/store/join-requests";

interface JoinRequestStore { joinRequests: JoinRequest[] }
const gr = globalThis as unknown as { __ecoRouteJR?: JoinRequestStore };
function jrMem(): JoinRequestStore {
  if (!gr.__ecoRouteJR) gr.__ecoRouteJR = { joinRequests: [] };
  return gr.__ecoRouteJR;
}
function jrUid() { return `jr_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,6)}`; }

export async function listJoinRequests(filter?: { activityIds?: string[]; studentName?: string }): Promise<JoinRequest[]> {
  if (isSupabaseConfigured()) {
    const { getSupabase } = await import("@/lib/data/supabase-client");
    const db = getSupabase()!;
    let q = db.from("join_requests").select("*").order("created_at", { ascending: false });
    if (filter?.activityIds?.length) q = q.in("activity_id", filter.activityIds);
    if (filter?.studentName) q = q.eq("student_name", filter.studentName);
    const { data, error } = await q;
    if (error) throw error;
    return (data ?? []).map(rowToJR);
  }
  let results = jrMem().joinRequests;
  if (filter?.activityIds?.length) results = results.filter(r => filter.activityIds!.includes(r.activityId));
  if (filter?.studentName) results = results.filter(r => r.studentName === filter.studentName);
  return results;
}

export async function createJoinRequest(data: { activityId: string; studentName: string; studentEmail?: string }): Promise<JoinRequest> {
  if (isSupabaseConfigured()) {
    const { getSupabase } = await import("@/lib/data/supabase-client");
    const db = getSupabase()!;
    const { data: row, error } = await db.from("join_requests")
      .upsert({ activity_id: data.activityId, student_name: data.studentName, student_email: data.studentEmail ?? null, status: "pending", updated_at: now() }, { onConflict: "activity_id,student_name" })
      .select("*").single();
    if (error) throw error;
    return rowToJR(row);
  }
  const existing = jrMem().joinRequests.find(r => r.activityId === data.activityId && r.studentName === data.studentName);
  if (existing) { existing.status = "pending"; existing.updatedAt = now(); return existing; }
  const entry: JoinRequest = { id: jrUid(), activityId: data.activityId, studentName: data.studentName, studentEmail: data.studentEmail, status: "pending", createdAt: now(), updatedAt: now() };
  jrMem().joinRequests.unshift(entry);
  return entry;
}

export async function updateJoinRequest(id: string, status: "approved" | "denied"): Promise<JoinRequest | null> {
  if (isSupabaseConfigured()) {
    const { getSupabase } = await import("@/lib/data/supabase-client");
    const db = getSupabase()!;
    const { data: row, error } = await db.from("join_requests").update({ status, updated_at: now() }).eq("id", id).select("*").maybeSingle();
    if (error) throw error;
    return row ? rowToJR(row) : null;
  }
  const idx = jrMem().joinRequests.findIndex(r => r.id === id);
  if (idx === -1) return null;
  jrMem().joinRequests[idx] = { ...jrMem().joinRequests[idx], status, updatedAt: now() };
  return jrMem().joinRequests[idx];
}

function rowToJR(r: Record<string, unknown>): JoinRequest {
  return {
    id: r.id as string,
    activityId: r.activity_id as string,
    studentName: r.student_name as string,
    studentEmail: (r.student_email as string) ?? undefined,
    status: (r.status as "pending" | "approved" | "denied"),
    createdAt: r.created_at as string,
    updatedAt: r.updated_at as string,
  };
}
