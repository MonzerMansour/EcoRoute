import { VehicleOptimizer } from "@/teacher/components/VehicleOptimizer";

export const metadata = { title: "Vehicle Load Optimizer" };

export default function TeacherOptimizerPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Vehicle Load Optimizer</h1>
        <p className="mt-2 text-muted-foreground">
          Compare buses, minibuses, vans, and carpools for any trip and see the
          exact lowest-emission configuration.
        </p>
      </div>
      <VehicleOptimizer />
    </div>
  );
}
