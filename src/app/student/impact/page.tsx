import { EnvironmentalImpact } from "@/student/components/EnvironmentalImpact";
export const metadata = { title: "Environmental Impact" };
export default function ImpactPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Environmental Impact</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Your commute CO2 footprint and how carpooling helps.
        </p>
      </div>
      <EnvironmentalImpact />
    </div>
  );
}
