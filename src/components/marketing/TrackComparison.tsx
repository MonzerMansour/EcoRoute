import Link from "next/link";
import {
  Bus,
  Car,
  GraduationCap,
  MapPin,
  Trophy,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button-link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function TrackComparison() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <Badge variant="secondary" className="mb-4">
            Two Tracks, One Platform
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Built for schools and families
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            EcoRoute unifies team travel optimization and daily carpool
            clustering under one shared AI engine.
          </p>
        </div>

        <div className="mt-16 grid gap-8 lg:grid-cols-2">
          <Card className="card-hover overflow-hidden p-0">
            <div className="bg-gradient-to-br from-primary to-secondary px-8 py-10 text-primary-foreground">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-foreground/20">
                  <Trophy className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-medium opacity-80">Track A</p>
                  <CardTitle className="text-2xl text-primary-foreground">
                    For Schools & Teams
                  </CardTitle>
                </div>
              </div>
              <CardDescription className="mt-4 text-primary-foreground/80">
                Coaches, athletic directors, and teachers optimize buses, vans,
                and carpools for away games, field trips, and club travel.
              </CardDescription>
            </div>
            <CardContent className="space-y-4 p-8">
              {[
                { icon: Bus, text: "Season & event travel planner with per-game emissions" },
                { icon: Users, text: "Vehicle load optimizer — bus vs. vans vs. carpools" },
                { icon: MapPin, text: "Smart recommendations based on distance & roster size" },
              ].map((item) => (
                <div key={item.text} className="flex items-start gap-3">
                  <item.icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <span className="text-sm">{item.text}</span>
                </div>
              ))}
              <ButtonLink href="/for-schools" variant="link" className="mt-2 h-auto p-0">
                Learn more about school tools →
              </ButtonLink>
            </CardContent>
          </Card>

          <Card className="card-hover overflow-hidden p-0">
            <div className="bg-gradient-to-br from-secondary to-accent px-8 py-10 text-secondary-foreground">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary-foreground/20">
                  <GraduationCap className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-medium opacity-80">Track B</p>
                  <CardTitle className="text-2xl text-secondary-foreground">
                    For Students & Parents
                  </CardTitle>
                </div>
              </div>
              <CardDescription className="mt-4 text-secondary-foreground/80">
                Students, parents, and student council form neighborhood carpool
                clusters for daily commutes and home games.
              </CardDescription>
            </div>
            <CardContent className="space-y-4 p-8">
              {[
                { icon: Car, text: "Daily commute mapper with neighborhood clustering" },
                { icon: Users, text: "2–4 person carpool groups with pickup order" },
                { icon: MapPin, text: "Home game fan carpools with shareable maps" },
              ].map((item) => (
                <div key={item.text} className="flex items-start gap-3">
                  <item.icon className="mt-0.5 h-5 w-5 shrink-0 text-secondary" />
                  <span className="text-sm">{item.text}</span>
                </div>
              ))}
              <ButtonLink href="/for-students" variant="link" className="mt-2 h-auto p-0 text-secondary">
                Learn more about student tools →
              </ButtonLink>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
