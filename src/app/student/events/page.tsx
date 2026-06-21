import { StudentEvents } from "@/student/components/StudentEvents";
export const metadata = { title: "My Events" };
export default function StudentEventsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Events</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          View and subscribe to events for your activities.
        </p>
      </div>
      <StudentEvents />
    </div>
  );
}
