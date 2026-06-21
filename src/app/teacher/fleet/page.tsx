import { FleetManager } from "@/teacher/components/FleetManager";

export const metadata = { title: "Vehicle Inventory" };

export default function TeacherFleetPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Vehicle Inventory</h1>
        <p className="mt-2 text-muted-foreground">
          Define your school&apos;s vehicle inventory. The Vehicle Optimizer uses
          this information to recommend the most efficient options for each trip.
        </p>
      </div>
      <FleetManager />
    </div>
  );
}
