export const metadata = {
  title: "Away Events",
};

export default function TeacherEventsPage() {
  return (
    <>
      <h1 className="text-3xl font-bold text-earth-900">Away Events</h1>
      <p className="mt-2 text-earth-600">
        Placeholder: manage tournaments, multi-game weekends, and season travel blocks.
      </p>
      <ul className="mt-8 space-y-3">
        {["Spring Tournament — 3 days", "District Finals — single day", "Scrimmage @ North HS"].map(
          (event) => (
            <li
              key={event}
              className="rounded-xl border border-dashed border-earth-300 bg-white px-4 py-3 text-sm text-earth-600"
            >
              {event} (sample row)
            </li>
          ),
        )}
      </ul>
    </>
  );
}
