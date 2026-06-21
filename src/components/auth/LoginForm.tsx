"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { Leaf, Mail, Lock, Loader2, Search } from "lucide-react";
import type { UserRole } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
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

interface LoginFormProps {
  role: UserRole;
  title: string;
  subtitle: string;
}

const COORDINATOR_ACTIVITY_OPTIONS = [
  "Varsity Basketball",
  "JV Basketball",
  "Varsity Soccer",
  "JV Soccer",
  "Varsity Volleyball",
  "Track & Field",
  "Cross Country",
  "Swimming",
  "Drama Club",
  "Chess Club",
  "Student Council",
  "Science Club",
  "Debate Team",
  "Marching Band",
  "Baseball",
  "Softball",
];

export function LoginForm({ role, title, subtitle }: LoginFormProps) {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [name, setName] = useState("");
  const [school, setSchool] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [parentEmail, setParentEmail] = useState("");
  // Coordinator: activities they coach
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [activitySearch, setActivitySearch] = useState("");
  const [customActivity, setCustomActivity] = useState("");
  // Student: coordinator email lookup
  const [coordEmail, setCoordEmail] = useState("");
  const [coordActivities, setCoordActivities] = useState<{ id: string; name: string; coordinatorId: string }[]>([]);
  const [coordLookupState, setCoordLookupState] = useState<"idle" | "loading" | "done" | "none">("idle");
  const [selectedCoordActivityIds, setSelectedCoordActivityIds] = useState<string[]>([]);
  const [loading, setLoading] = useState<"email" | null>(null);
  const [error, setError] = useState("");

  const callbackUrl = role === "teacher" ? "/teacher" : "/student";
  const otherRole = role === "teacher" ? "student" : "teacher";
  const otherHref = `/login/${otherRole}`;
  const otherRoleLabel = role === "teacher" ? "student" : "coordinator";

  function toggleActivity(activity: string) {
    setSelectedActivities((prev) =>
      prev.includes(activity) ? prev.filter((a) => a !== activity) : [...prev, activity],
    );
  }

  function addCustomActivity() {
    const trimmed = customActivity.trim();
    if (trimmed && !selectedActivities.includes(trimmed)) {
      setSelectedActivities((prev) => [...prev, trimmed]);
    }
    setCustomActivity("");
  }

  const filteredActivities = COORDINATOR_ACTIVITY_OPTIONS.filter((a) =>
    a.toLowerCase().includes(activitySearch.toLowerCase()),
  );

  function toggleCoordActivity(id: string) {
    setSelectedCoordActivityIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  async function lookupCoordinator() {
    if (!coordEmail.trim()) return;
    setCoordLookupState("loading");
    setCoordActivities([]);
    setSelectedCoordActivityIds([]);
    try {
      const res = await fetch(`/api/events/activities?email=${encodeURIComponent(coordEmail.trim())}`);
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setCoordActivities(data);
        setCoordLookupState("done");
      } else {
        setCoordLookupState("none");
      }
    } catch {
      setCoordLookupState("none");
    }
  }

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) return;

    if (mode === "signup" && password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (mode === "signup" && parentEmail) {
      const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!EMAIL_RE.test(parentEmail)) {
        setError("Parent email address is not valid.");
        return;
      }
    }

    setLoading("email");
    setError("");

    try {
      if (mode === "signup") {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            password,
            name,
            school,
            role,
            parentEmail: parentEmail || undefined,
            activities: selectedActivities, // coordinator: activity names they coach
          }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setError(
            data.errors?.[0] ?? data.error ?? "Could not create your account.",
          );
          setLoading(null);
          return;
        }
      }

      const result = await signIn("credentials", {
        email,
        password,
        callbackUrl,
        redirect: false,
      });

      if (result?.error) {
        setError(
          mode === "signup"
            ? "Account created, but sign-in failed. Try signing in."
            : "Invalid email or password. Please try again.",
        );
      } else {
        // Verify the signed-in user's role matches this login page
        const sessionRes = await fetch("/api/auth/session");
        const session = await sessionRes.json();
        const signedInRole = session?.user?.role;

        if (signedInRole && signedInRole !== role) {
          // Wrong role — sign them out and show a helpful error
          await fetch("/api/auth/signout", { method: "POST" });
          setError(
            `This account is registered as a ${signedInRole}, not a ${role === "teacher" ? "coordinator" : "student"}. Please use the ${signedInRole} login page.`,
          );
          setLoading(null);
          return;
        }

        // Student: save followed coordinator activity IDs to localStorage
        if (mode === "signup" && role === "student" && selectedCoordActivityIds.length > 0) {
          localStorage.setItem("ecoroute_my_activity_ids", JSON.stringify(selectedCoordActivityIds));
        }
        window.location.href = result?.url ?? callbackUrl;
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="flex min-h-screen">
      <div className="hidden w-1/2 flex-col justify-between bg-gradient-to-br from-primary via-secondary to-secondary p-12 text-primary-foreground lg:flex">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-foreground/20">
            <Leaf className="h-6 w-6" />
          </div>
          <span className="text-2xl font-bold">EcoRoute</span>
        </Link>

        <div>
          <h2 className="text-4xl font-bold leading-tight">
            {role === "teacher"
              ? "Optimize every away game."
              : "Carpool smarter, every day."}
          </h2>
          <p className="mt-4 text-lg opacity-80">
            {role === "teacher"
              ? "Plan team travel, cut emissions, and get AI-powered vehicle recommendations for your entire season."
              : "Join neighborhood carpool clusters, save CO₂ on daily commutes, and coordinate home game rides."}
          </p>
        </div>

        <p className="text-sm opacity-60">
          Smarter routes. Lower emissions. Same schedule.
        </p>
      </div>

      <div className="flex w-full flex-col items-center justify-center bg-background px-4 py-12 lg:w-1/2">
        <Card className="w-full max-w-md border-0 shadow-none lg:border lg:shadow-sm">
          <CardHeader>
            <Link href="/" className="mb-2 flex items-center gap-2 lg:hidden">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Leaf className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold">EcoRoute</span>
            </Link>
            <CardTitle className="text-2xl">{title}</CardTitle>
            <CardDescription>{subtitle}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <p className="text-sm font-medium text-muted-foreground">
              Sign in with your email
            </p>

            <form onSubmit={handleEmailLogin} className="space-y-4">
              {mode === "signup" && (
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    autoComplete="name"
                  />
                </div>
              )}

              {mode === "signup" && (
                <div className="space-y-2">
                  <Label htmlFor="school">School name</Label>
                  <Input
                    id="school"
                    type="text"
                    value={school}
                    onChange={(e) => setSchool(e.target.value)}
                    placeholder="e.g. Lincoln High School"
                    required
                  />
                </div>
              )}

              {mode === "signup" && (
                <div className="space-y-2">
                  <Label htmlFor="parent-email">
                    Parent / Guardian email{" "}
                    <span className="text-muted-foreground">(optional)</span>
                  </Label>
                  <Input
                    id="parent-email"
                    type="email"
                    value={parentEmail}
                    onChange={(e) => setParentEmail(e.target.value)}
                    placeholder="parent@email.com"
                    autoComplete="email"
                  />
                </div>
              )}

              {/* COORDINATOR: pick activities they coach */}
              {mode === "signup" && role === "teacher" && (
                <div className="space-y-2">
                  <Label>
                    Activities you coach / coordinate{" "}
                    <span className="text-muted-foreground">(optional)</span>
                  </Label>
                  <Input
                    placeholder="Search activities…"
                    value={activitySearch}
                    onChange={(e) => setActivitySearch(e.target.value)}
                  />
                  <div className="max-h-36 overflow-y-auto rounded-md border p-2 space-y-1">
                    {filteredActivities.map((activity) => (
                      <label
                        key={activity}
                        className="flex items-center gap-2 cursor-pointer text-sm py-0.5"
                      >
                        <input
                          type="checkbox"
                          checked={selectedActivities.includes(activity)}
                          onChange={() => toggleActivity(activity)}
                          className="h-3.5 w-3.5"
                        />
                        {activity}
                      </label>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a custom activity…"
                      value={customActivity}
                      onChange={(e) => setCustomActivity(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCustomActivity())}
                      className="text-sm"
                    />
                    <Button type="button" variant="outline" size="sm" onClick={addCustomActivity}>
                      Add
                    </Button>
                  </div>
                  {selectedActivities.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {selectedActivities.map((a) => (
                        <Badge
                          key={a}
                          variant="secondary"
                          className="cursor-pointer text-xs"
                          onClick={() => toggleActivity(a)}
                        >
                          {a} ×
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* STUDENT: follow a coordinator by email */}
              {mode === "signup" && role === "student" && (
                <div className="space-y-2">
                  <Label>
                    Follow a coordinator{" "}
                    <span className="text-muted-foreground">(optional)</span>
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Enter your coach or teacher&apos;s email to see their activities and events.
                  </p>
                  <div className="flex gap-2">
                    <Input
                      placeholder="coach@school.edu"
                      type="email"
                      value={coordEmail}
                      onChange={(e) => { setCoordEmail(e.target.value); setCoordLookupState("idle"); }}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), lookupCoordinator())}
                      className="text-sm"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
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
                    <p className="text-xs text-muted-foreground">No activities found for that email.</p>
                  )}
                  {coordLookupState === "done" && coordActivities.length > 0 && (
                    <div className="rounded-md border p-2 space-y-1">
                      {coordActivities.map((act) => (
                        <label key={act.id} className="flex items-center gap-2 cursor-pointer text-sm py-0.5">
                          <input
                            type="checkbox"
                            checked={selectedCoordActivityIds.includes(act.id)}
                            onChange={() => toggleCoordActivity(act.id)}
                            className="h-3.5 w-3.5"
                          />
                          {act.name}
                        </label>
                      ))}
                    </div>
                  )}
                  {selectedCoordActivityIds.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {coordActivities
                        .filter((a) => selectedCoordActivityIds.includes(a.id))
                        .map((a) => (
                          <Badge
                            key={a.id}
                            variant="secondary"
                            className="cursor-pointer text-xs"
                            onClick={() => toggleCoordActivity(a.id)}
                          >
                            {a.name} ×
                          </Badge>
                        ))}
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@school.edu"
                    required
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={
                      mode === "signup"
                        ? "At least 8 characters"
                        : "Enter your password"
                    }
                    required
                    autoComplete={
                      mode === "signup" ? "new-password" : "current-password"
                    }
                    className="pl-9"
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading !== null}>
                {loading === "email" ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : mode === "signup" ? (
                  "Create account"
                ) : (
                  "Sign in"
                )}
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground">
              {mode === "signin"
                ? "Don't have an account?"
                : "Already have an account?"}{" "}
              <button
                type="button"
                onClick={() => {
                  setMode(mode === "signin" ? "signup" : "signin");
                  setError("");
                }}
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                {mode === "signin" ? "Create one" : "Sign in"}
              </button>
            </p>

            {mode === "signin" && (
              <div className="rounded-lg border border-dashed bg-muted/40 px-3 py-2 text-center text-xs text-muted-foreground">
                Demo {role} account: <code>{role}@ecoroute.app</code> /{" "}
                <code>ecoroute123</code>
              </div>
            )}

            <p className="text-center text-sm text-muted-foreground">
              {role === "teacher" ? "Are you a student?" : "Are you a coordinator?"}{" "}
              <ButtonLink href={otherHref} variant="link" className="h-auto p-0">
                Continue as {otherRoleLabel}
              </ButtonLink>
            </p>

            <p className="text-center text-xs text-muted-foreground">
              By continuing, you agree to our terms of service and privacy policy.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
