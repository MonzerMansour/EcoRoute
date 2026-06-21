import { ActivitiesManager } from "@/teacher/components/ActivitiesManager";
export const metadata = { title: "Activities & Events" };
export default function ActivitiesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Activities & Events</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage the activities you oversee and add events for each one. Students can subscribe to events they&apos;re involved in.
        </p>
      </div>
      <ActivitiesManager />
    </div>
  );
}
