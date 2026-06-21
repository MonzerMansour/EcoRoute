import type { Activity, SchoolEvent, Notification } from "@/lib/store/events";
import { getSupabase } from "@/lib/data/supabase-client";

function db() {
  const c = getSupabase();
  if (!c) throw new Error("Supabase is not configured.");
  return c;
}

// ── Activities ──────────────────────────────────────────────────────────────

function rowToActivity(r: Record<string, unknown>, includePin = false): Activity {
  return {
    id: r.id as string,
    name: r.name as string,
    description: (r.description as string) ?? undefined,
    coordinatorId: r.coordinator_id as string,
    school: r.school as string,
    pin: includePin ? ((r.pin as string) ?? undefined) : undefined,
  };
}

export async function dbListActivities(includePin = false): Promise<Activity[]> {
  const { data, error } = await db().from("activities").select("*").order("created_at");
  if (error) throw error;
  return (data ?? []).map((r) => rowToActivity(r, includePin));
}

export async function dbCreateActivity(a: Omit<Activity, "id">): Promise<Activity> {
  const { data, error } = await db()
    .from("activities")
    .insert({ name: a.name, description: a.description ?? null, coordinator_id: a.coordinatorId, school: a.school, pin: a.pin ?? null })
    .select("*").single();
  if (error) throw error;
  return rowToActivity(data, true);
}

export async function dbUpdateActivity(id: string, patch: Partial<Omit<Activity, "id">>): Promise<Activity | null> {
  const row: Record<string, unknown> = {};
  if (patch.name !== undefined) row.name = patch.name;
  if (patch.description !== undefined) row.description = patch.description ?? null;
  if (patch.pin !== undefined) row.pin = patch.pin ?? null;
  const { data, error } = await db().from("activities").update(row).eq("id", id).select("*").maybeSingle();
  if (error) throw error;
  return data ? rowToActivity(data, true) : null;
}

export async function dbGetActivityWithPin(id: string): Promise<Activity | null> {
  const { data, error } = await db().from("activities").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data ? rowToActivity(data, true) : null;
}

export async function dbDeleteActivity(id: string): Promise<void> {
  const { error } = await db().from("activities").delete().eq("id", id);
  if (error) throw error;
}

// ── Events ──────────────────────────────────────────────────────────────────

async function rowToEvent(r: Record<string, unknown>): Promise<SchoolEvent> {
  const { data: subs } = await db()
    .from("event_subscribers")
    .select("student_name")
    .eq("event_id", r.id as string);
  return {
    id: r.id as string,
    activityId: r.activity_id as string,
    title: r.title as string,
    date: r.date as string,
    time: (r.time as string) ?? undefined,
    location: (r.location as string) ?? undefined,
    distanceMiles: r.distance_miles != null ? Number(r.distance_miles) : undefined,
    rosterSize: r.roster_size != null ? Number(r.roster_size) : undefined,
    notes: (r.notes as string) ?? undefined,
    chosenVehicle: (r.chosen_vehicle as string) ?? undefined,
    chosenVehicleCo2Kg: r.chosen_vehicle_co2_kg != null ? Number(r.chosen_vehicle_co2_kg) : undefined,
    includeInTrips: r.include_in_trips === true,
    subscribedStudents: (subs ?? []).map((s: Record<string, unknown>) => s.student_name as string),
    createdAt: r.created_at as string,
  };
}

export async function dbListEvents(): Promise<SchoolEvent[]> {
  const { data, error } = await db().from("events").select("*").order("date");
  if (error) throw error;
  return Promise.all((data ?? []).map(rowToEvent));
}

export async function dbCreateEvent(e: Omit<SchoolEvent, "id" | "createdAt" | "subscribedStudents">): Promise<SchoolEvent> {
  const { data, error } = await db().from("events").insert({
    activity_id: e.activityId,
    title: e.title,
    date: e.date,
    time: e.time ?? null,
    location: e.location ?? null,
    distance_miles: e.distanceMiles ?? null,
    roster_size: e.rosterSize ?? null,
    notes: e.notes ?? null,
    chosen_vehicle: e.chosenVehicle ?? null,
    chosen_vehicle_co2_kg: e.chosenVehicleCo2Kg ?? null,
    include_in_trips: e.includeInTrips ?? false,
  }).select("*").single();
  if (error) throw error;
  return rowToEvent(data);
}

export async function dbUpdateEvent(id: string, patch: Partial<SchoolEvent>): Promise<SchoolEvent | null> {
  const row: Record<string, unknown> = {};
  if (patch.title !== undefined) row.title = patch.title;
  if (patch.date !== undefined) row.date = patch.date;
  if (patch.time !== undefined) row.time = patch.time ?? null;
  if (patch.location !== undefined) row.location = patch.location ?? null;
  if (patch.distanceMiles !== undefined) row.distance_miles = patch.distanceMiles ?? null;
  if (patch.rosterSize !== undefined) row.roster_size = patch.rosterSize ?? null;
  if (patch.notes !== undefined) row.notes = patch.notes ?? null;
  if (patch.chosenVehicle !== undefined) row.chosen_vehicle = patch.chosenVehicle ?? null;
  if (patch.chosenVehicleCo2Kg !== undefined) row.chosen_vehicle_co2_kg = patch.chosenVehicleCo2Kg ?? null;
  if (patch.includeInTrips !== undefined) row.include_in_trips = patch.includeInTrips;
  const { data, error } = await db().from("events").update(row).eq("id", id).select("*").maybeSingle();
  if (error) throw error;
  return data ? rowToEvent(data) : null;
}

export async function dbDeleteEvent(id: string): Promise<void> {
  const { error } = await db().from("events").delete().eq("id", id);
  if (error) throw error;
}

export async function dbSubscribeStudent(eventId: string, studentName: string): Promise<SchoolEvent | null> {
  // Upsert — safe to call multiple times
  await db().from("event_subscribers").upsert({ event_id: eventId, student_name: studentName });
  // Notify coordinator
  const { data: ev } = await db().from("events").select("title, activity_id").eq("id", eventId).maybeSingle();
  if (ev) {
    await db().from("notifications").insert({
      message: `${studentName} subscribed to "${ev.title}"`,
      student_name: studentName,
      event_id: eventId,
      activity_id: ev.activity_id,
    });
  }
  const { data: row } = await db().from("events").select("*").eq("id", eventId).maybeSingle();
  return row ? rowToEvent(row) : null;
}

export async function dbUnsubscribeStudent(eventId: string, studentName: string): Promise<SchoolEvent | null> {
  await db().from("event_subscribers").delete().eq("event_id", eventId).eq("student_name", studentName);
  const { data: row } = await db().from("events").select("*").eq("id", eventId).maybeSingle();
  return row ? rowToEvent(row) : null;
}

// ── Notifications ────────────────────────────────────────────────────────────

function rowToNotif(r: Record<string, unknown>): Notification {
  return {
    id: r.id as string,
    type: "subscription",
    message: r.message as string,
    studentName: r.student_name as string,
    eventId: r.event_id as string,
    activityId: r.activity_id as string,
    read: r.read as boolean,
    createdAt: r.created_at as string,
  };
}

export async function dbListNotifications(): Promise<Notification[]> {
  const { data, error } = await db().from("notifications").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(rowToNotif);
}

export async function dbMarkAllRead(): Promise<void> {
  await db().from("notifications").update({ read: true }).eq("read", false);
}
