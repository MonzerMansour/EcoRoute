import { calculateTripEmissions, estimateSavings } from "@/core/emissions";
import { Card, CardContent } from "@/components/ui/card";

export const metadata = {
  title: "CO₂ Savings",
};

const DAILY_COMMUTE_MILES = 5;
const SCHOOL_DAYS = 180;

export default function StudentSavingsPage() {
  const solo = calculateTripEmissions({
    distanceMiles: DAILY_COMMUTE_MILES * SCHOOL_DAYS,
    vehicleType: "solo_car",
  });
  const carpool = calculateTripEmissions({
    distanceMiles: DAILY_COMMUTE_MILES * SCHOOL_DAYS,
    vehicleType: "carpool",
  });
  const savings = estimateSavings(
    DAILY_COMMUTE_MILES * SCHOOL_DAYS,
    "solo_car",
    "carpool",
  );

  return (
    <>
      <h1 className="text-3xl font-bold">CO₂ Savings</h1>
      <p className="mt-2 text-muted-foreground">
        Annual estimate for a {DAILY_COMMUTE_MILES}-mile daily commute ({SCHOOL_DAYS} school days).
      </p>
      <dl className="mt-8 grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <dt className="text-sm text-muted-foreground">Baseline (solo car)</dt>
            <dd className="mt-1 text-2xl font-bold">{solo.co2Kg} kg</dd>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <dt className="text-sm text-muted-foreground">With carpooling</dt>
            <dd className="mt-1 text-2xl font-bold text-secondary">{carpool.co2Kg} kg</dd>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <dt className="text-sm text-muted-foreground">Potential savings</dt>
            <dd className="mt-1 text-2xl font-bold text-primary">{savings} kg</dd>
          </CardContent>
        </Card>
      </dl>
    </>
  );
}
