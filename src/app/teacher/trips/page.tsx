export const metadata = {
  title: "Sports Trips",
};

export default function TeacherTripsPage() {
  return (
    <>
      <h1 className="text-3xl font-bold text-earth-900">Sports Trips</h1>
      <p className="mt-2 text-earth-600">
        Placeholder: add trip name, opponent, distance, roster size, and trip type.
      </p>
      <form className="mt-8 max-w-xl space-y-4 rounded-2xl border border-earth-200 bg-white p-6">
        <div>
          <label className="block text-sm font-medium text-earth-700">Trip name</label>
          <input
            type="text"
            placeholder="Varsity Basketball @ Riverside"
            className="mt-1 w-full rounded-lg border border-earth-300 px-3 py-2 text-sm"
            disabled
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-earth-700">Distance (miles)</label>
          <input
            type="number"
            placeholder="24"
            className="mt-1 w-full rounded-lg border border-earth-300 px-3 py-2 text-sm"
            disabled
          />
        </div>
        <p className="text-xs text-earth-500">
          Teacher team: wire this form to POST /api/teacher/trips
        </p>
      </form>
    </>
  );
}
