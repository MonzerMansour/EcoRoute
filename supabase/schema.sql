-- EcoRoute — Supabase schema
-- Paste this whole file into the Supabase SQL Editor and click "Run".
-- Safe to re-run: uses "if not exists" / "or replace" everywhere.

-- Needed for gen_random_uuid()
create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- USERS: one row per signed-in account (Google or email). The app upserts
-- here on every login via the NextAuth signIn event.
-- ---------------------------------------------------------------------------
create table if not exists public.users (
  id            uuid primary key default gen_random_uuid(),
  email         text unique not null,
  name          text,
  image         text,
  provider      text,
  role          text not null default 'teacher',
  password_hash text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  last_login_at timestamptz
);

-- If you created the users table before this column existed, run this once:
alter table public.users add column if not exists password_hash text;

-- ---------------------------------------------------------------------------
-- TRIPS: one row per planned trip, owned by a user's email (owner_id).
-- ---------------------------------------------------------------------------
create table if not exists public.trips (
  id                  uuid primary key default gen_random_uuid(),
  owner_id            text not null,
  name                text not null,
  opponent            text not null,
  date                date not null,
  distance_miles      numeric not null,
  roster_size         integer not null,
  trip_type           text not null default 'away_game',
  departure_time      text,
  allowed_vehicles    jsonb not null default '["school_bus","minibus","van","carpool"]',
  chosen_vehicle_type text,
  notes               text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index if not exists trips_owner_id_idx on public.trips (owner_id);
create index if not exists trips_owner_date_idx on public.trips (owner_id, date);

-- ---------------------------------------------------------------------------
-- Row Level Security.
-- The app talks to Supabase ONLY with the service-role key from the server,
-- which bypasses RLS. We still enable RLS so nothing is readable with the
-- public anon key. (If you later add client-side Supabase access, add policies.)
-- ---------------------------------------------------------------------------
alter table public.users enable row level security;
alter table public.trips enable row level security;
