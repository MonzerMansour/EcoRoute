import { calculateTripEmissions, estimateSavings } from "@/core/emissions";

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
      <h1 className="text-3xl font-bold text-earth-900">CO₂ Savings</h1>
      <p className="mt-2 text-earth-600">
        Annual estimate for a {DAILY_COMMUTE_MILES}-mile daily commute ({SCHOOL_DAYS} school days).
      </p>
      <dl className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-earth-200 bg-white p-5">
          <dt className="text-sm text-earth-600">Baseline (solo car)</dt>
          <dd className="mt-1 text-2xl font-bold text-earth-900">{solo.co2Kg} kg</dd>
        </div>
        <div className="rounded-2xl border border-earth-200 bg-white p-5">
          <dt className="text-sm text-earth-600">With carpooling</dt>
          <dd className="mt-1 text-2xl font-bold text-teal-700">{carpool.co2Kg} kg</dd>
        </div>
        <div className="rounded-2xl border border-earth-200 bg-white p-5">
          <dt className="text-sm text-earth-600">Potential savings</dt>
          <dd className="mt-1 text-2xl font-bold text-brand-600">{savings} kg</dd>
        </div>
      </dl>
    </>
  );
}
