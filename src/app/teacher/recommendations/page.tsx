import { recommendVehiclesForTrip } from "@/teacher/lib/recommendations";

export const metadata = {
  title: "Vehicle Recommendations",
};

const sampleTrip = {
  id: "sample-1",
  name: "Away Game @ Riverside",
  opponent: "Riverside High",
  date: "2026-03-15",
  distanceMiles: 22,
  rosterSize: 18,
  tripType: "away_game" as const,
};

export default function TeacherRecommendationsPage() {
  const recommendations = recommendVehiclesForTrip(sampleTrip);

  return (
    <>
      <h1 className="text-3xl font-bold text-earth-900">Vehicle Recommendations</h1>
      <p className="mt-2 text-earth-600">
        Ranked options for{" "}
        <span className="font-medium text-earth-800">{sampleTrip.name}</span> using{" "}
        <code className="rounded bg-earth-100 px-1.5 py-0.5 text-sm">@/core/emissions</code>.
      </p>
      <ol className="mt-8 space-y-4">
        {recommendations.map((rec) => (
          <li
            key={rec.rank}
            className="rounded-2xl border border-earth-200 bg-white p-5"
          >
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm font-semibold text-brand-700">#{rec.rank}</span>
              <span className="font-medium capitalize text-earth-900">{rec.vehicleType}</span>
              <span className="text-sm text-earth-600">{rec.co2Kg} kg CO₂</span>
            </div>
            <p className="mt-2 text-sm text-earth-600">{rec.rationale}</p>
          </li>
        ))}
      </ol>
    </>
  );
}
