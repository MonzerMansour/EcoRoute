import type { RecommendationSeverity, VehicleType } from "@/lib/types";

export const SEVERITY_STYLES: Record<RecommendationSeverity, string> = {
  high: "bg-destructive/10 text-destructive border-destructive/20",
  medium: "bg-accent/15 text-accent-foreground border-accent/30",
  low: "bg-muted text-muted-foreground border-border",
};

export const TRIP_TYPE_LABELS: Record<string, string> = {
  away_game: "Away game",
  field_trip: "Field trip",
  club: "Club travel",
  scrimmage: "Scrimmage",
};

export const VEHICLE_OPTIONS: { value: VehicleType; label: string }[] = [
  { value: "school_bus", label: "School bus (48 seats)" },
  { value: "minibus", label: "Minibus (24 seats)" },
  { value: "van", label: "Passenger van (12 seats)" },
  { value: "carpool", label: "Carpool (4 seats)" },
  { value: "solo_car", label: "Solo car (1 seat)" },
];

export function formatDate(iso: string): string {
  try {
    return new Date(iso + "T00:00:00").toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}
