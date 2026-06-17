import { CommuteModeLegend } from "@/student/components/StudentShell";

export const metadata = {
  title: "Commute Modes",
};

export default function StudentCommutePage() {
  return (
    <>
      <h1 className="text-3xl font-bold text-earth-900">Neighborhoods & Commute Modes</h1>
      <p className="mt-2 text-earth-600">
        Placeholder: students and parents enter neighborhood and how they usually get to school.
      </p>
      <CommuteModeLegend />
      <form className="mt-8 max-w-xl space-y-4 rounded-2xl border border-earth-200 bg-white p-6">
        <div>
          <label className="block text-sm font-medium text-earth-700">Neighborhood</label>
          <input
            type="text"
            placeholder="Oak Street area"
            className="mt-1 w-full rounded-lg border border-earth-300 px-3 py-2 text-sm"
            disabled
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-earth-700">Commute mode</label>
          <select className="mt-1 w-full rounded-lg border border-earth-300 px-3 py-2 text-sm" disabled>
            <option>Solo car</option>
            <option>Carpool</option>
            <option>Bus</option>
          </select>
        </div>
        <p className="text-xs text-earth-500">
          Student team: wire this form to POST /api/student/commute
        </p>
      </form>
    </>
  );
}
